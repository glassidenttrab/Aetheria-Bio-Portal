import React, { useState, useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';
import { X, RotateCw, ZoomIn, ZoomOut, Box, Eye, Tag, Database, Search, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  fetchAlphaFoldPrediction, fetchAlphaFoldPdbText, AlphaFoldPrediction, AlphaFoldNotFoundError,
  looksLikeUniProtAccession, resolveGeneSymbolToUniProtAccession
} from '../services/alphafoldService';

interface Mol3DViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  proteinName?: string;
  pdbId?: string;
  uniprotId?: string;
}

export const Mol3DViewerModal: React.FC<Mol3DViewerModalProps> = ({
  isOpen,
  onClose,
  proteinName = 'MAPT (Microtubule-Associated Protein Tau)',
  pdbId = 'AF-P10636-F1',
  uniprotId = 'P10636'
}) => {
  const { t } = useLanguage();
  const [activeStyle, setActiveStyle] = useState<'ribbon' | 'sticks' | 'spheres'>('ribbon');
  const [showSurface, setShowSurface] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [currentUniprotId, setCurrentUniprotId] = useState(uniprotId);
  const [currentProtein, setCurrentProtein] = useState(proteinName);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  const [prediction, setPrediction] = useState<AlphaFoldPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    setCurrentUniprotId(uniprotId);
    setCurrentProtein(proteinName);
  }, [uniprotId, proteinName]);

  // AlphaFold DB Live API에서 실제 pLDDT 메타데이터 + 구조 파일을 가져와 3dmol로 렌더링.
  //
  // 모달이 열리는 순간에는 CSS 레이아웃/전환이 아직 안정되지 않아 컨테이너의
  // clientWidth/clientHeight가 일시적으로 0일 수 있다. 그 상태에서 $3Dmol.createViewer를
  // 호출하면 WebGL 프레임버퍼 첨부 크기가 0이 되어(GL_INVALID_FRAMEBUFFER_OPERATION)
  // 구조가 빈 화면으로 깨져 보인다. ResizeObserver로 컨테이너가 실제 크기를 가질 때까지
  // 기다렸다가 렌더러를 생성하고, 이후 창 크기 변경 시에도 캔버스를 다시 맞춘다.
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let cancelled = false;
    let viewer: any = null;
    setIsLoading(true);
    setError(null);

    const container = containerRef.current;

    const initViewer = () => {
      if (cancelled || viewer) return;
      container.innerHTML = '';
      viewer = $3Dmol.createViewer(container, { backgroundColor: '#050a14' });
      viewerRef.current = viewer;

      (async () => {
        try {
          // "IDH1"처럼 UniProt accession(P10636 등) 형식이 아닌 유전자 심볼을 입력한
          // 경우, AlphaFold DB에 그대로 보내면 400/404가 난다. UniProt 검색으로 먼저
          // accession을 찾아 변환한다(못 찾으면 원래 입력값으로 그대로 시도).
          let lookupId = currentUniprotId;
          if (!looksLikeUniProtAccession(lookupId)) {
            const resolved = await resolveGeneSymbolToUniProtAccession(lookupId);
            if (resolved) lookupId = resolved;
          }

          const pred = await fetchAlphaFoldPrediction(lookupId);
          const pdbText = await fetchAlphaFoldPdbText(pred.pdbUrl);
          if (cancelled) return;

          viewer.addModel(pdbText, 'pdb');
          applyStyle(viewer, activeStyle, showSurface, showLabels);
          viewer.resize();
          viewer.zoomTo();
          viewer.render();
          if (isAutoRotate) viewer.spin('y', 1);

          setPrediction(pred);
        } catch (err) {
          if (cancelled) return;
          if (err instanceof AlphaFoldNotFoundError) {
            setError(err.message);
          } else {
            setError('AlphaFold API 연결에 실패했습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.');
          }
          setPrediction(null);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    };

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      if (!viewer) {
        initViewer();
      } else {
        viewer.resize();
        viewer.render();
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      viewer?.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUniprotId]);

  // 표현 양식 / 표면 / 라벨 토글 변경 시 이미 로드된 모델에 실시간 재적용
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || isLoading || error) return;
    applyStyle(viewer, activeStyle, showSurface, showLabels);
    viewer.render();
  }, [activeStyle, showSurface, showLabels]);

  // 자동 회전 토글
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || isLoading || error) return;
    if (isAutoRotate) viewer.spin('y', 1);
    else viewer.spin(false);
  }, [isAutoRotate, isLoading, error]);

  function applyStyle(viewer: any, style: 'ribbon' | 'sticks' | 'spheres', surface: boolean, labels: boolean) {
    viewer.setStyle({}, {});
    if (style === 'ribbon') {
      // AlphaFold DB 공식 컬러 컨벤션: B-factor 컬럼에 저장된 pLDDT 값을 신뢰도 색상으로 매핑
      viewer.setStyle({}, { cartoon: { colorscheme: { prop: 'b', gradient: 'roygb', min: 50, max: 90 } } });
    } else if (style === 'sticks') {
      viewer.setStyle({}, { stick: { colorscheme: { prop: 'b', gradient: 'roygb', min: 50, max: 90 } } });
    } else {
      viewer.setStyle({}, { sphere: { colorscheme: { prop: 'b', gradient: 'roygb', min: 50, max: 90 }, scale: 0.35 } });
    }
    viewer.removeAllSurfaces();
    if (surface) {
      viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.35, color: 'cyan' });
    }
    viewer.removeAllLabels();
    if (labels) {
      // 잔기(residue)별 라벨. 물 분자 등 heteroatom은 제외
      viewer.addResLabels(
        { hetflag: false },
        { font: 'Arial', fontSize: 11, fontColor: '#4cd7f6', showBackground: true, backgroundColor: '#0b1329', backgroundOpacity: 0.6, screenOffset: { x: 0, y: 0 } }
      );
    }
  }

  function handleZoom(factor: number) {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.zoom(factor, 300);
  }

  if (!isOpen) return null;

  const handleSearchUniprot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    const nextId = customQuery.trim().toUpperCase();
    setCurrentUniprotId(nextId);
    setCurrentProtein(`Protein Target (${nextId})`);
    setCustomQuery('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '980px', height: '88vh',
        borderRadius: '24px', border: '1px solid rgba(76, 215, 246, 0.4)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 16, 31, 0.99) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(76, 215, 246, 0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(23, 31, 51, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000'
            }}>
              <Box size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  {currentProtein}
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                  {prediction?.modelEntityId || pdbId}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#8899a6', margin: 0, marginTop: '2px' }}>
                AlphaFold DB Live API 실시간 연동 (alphafold.ebi.ac.uk)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#dae2fd', borderRadius: '12px', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 3D Viewer Toolbar */}
        <div style={{
          padding: '12px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(11, 19, 38, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          {/* Style Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#8899a6', fontWeight: 700, marginRight: '4px' }}>
              {t('viewer.style', '구조 양식')}:
            </span>
            {(['ribbon', 'sticks', 'spheres'] as const).map(style => (
              <button
                key={style}
                onClick={() => setActiveStyle(style)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800,
                  cursor: 'pointer', textTransform: 'capitalize',
                  border: activeStyle === style ? '1px solid rgba(76, 215, 246, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                  background: activeStyle === style ? 'rgba(76, 215, 246, 0.2)' : 'transparent',
                  color: activeStyle === style ? '#4cd7f6' : '#8899a6'
                }}
              >
                {style}
              </button>
            ))}

            <button
              onClick={() => setShowSurface(!showSurface)}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                border: showSurface ? '1px solid rgba(255, 215, 0, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                background: showSurface ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                color: showSurface ? '#ffd700' : '#8899a6'
              }}
            >
              <Eye size={14} /> {t('viewer.surface', '표면')}
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                border: showLabels ? '1px solid rgba(76, 215, 246, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                background: showLabels ? 'rgba(76, 215, 246, 0.2)' : 'transparent',
                color: showLabels ? '#4cd7f6' : '#8899a6'
              }}
              title="잔기(residue) 라벨 표시 — 서열이 긴 단백질은 라벨이 밀집될 수 있습니다"
            >
              <Tag size={14} /> {t('viewer.labels', '라벨')}
            </button>
          </div>

          {/* Action Controls (Rotate, Zoom) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                background: isAutoRotate ? 'rgba(78, 222, 163, 0.15)' : 'transparent',
                border: isAutoRotate ? '1px solid rgba(78, 222, 163, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: isAutoRotate ? '#4edea3' : '#8899a6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <RotateCw size={14} className={isAutoRotate ? 'spin' : ''} />
              {isAutoRotate ? t('viewer.auto_on', '자동 회전 ON') : t('viewer.auto_off', '자동 회전 OFF')}
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handleZoom(1.2)}
                style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#dae2fd', cursor: 'pointer' }}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => handleZoom(0.8)}
                style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#dae2fd', cursor: 'pointer' }}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
            </div>
          </div>

          {/* Direct UniProt ID Search Input */}
          <form onSubmit={handleSearchUniprot} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder={t('viewer.search_pdb', 'UniProt ID (예: P10636)')}
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              style={{
                padding: '6px 12px', borderRadius: '8px', background: 'rgba(23, 31, 51, 0.8)',
                border: '1px solid rgba(76, 215, 246, 0.3)', color: '#ffffff', fontSize: '0.8rem', width: '180px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '6px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
                border: 'none', color: '#000', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Search size={14} />
            </button>
          </form>
        </div>

        {/* 3D Viewer Area */}
        <div style={{ flex: 1, position: 'relative', background: '#050a14' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

          {isLoading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '12px', color: '#4cd7f6', background: 'rgba(5, 10, 20, 0.6)'
            }}>
              <Loader2 size={32} className="spin" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>AlphaFold DB에서 실시간 구조 데이터를 불러오는 중...</span>
            </div>
          )}

          {!isLoading && error && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '10px', color: '#ff6b81', background: 'rgba(5, 10, 20, 0.75)', padding: '24px', textAlign: 'center'
            }}>
              <AlertTriangle size={32} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, maxWidth: '380px' }}>{error}</span>
              <span style={{ fontSize: '0.78rem', color: '#8899a6' }}>UniProt ID: {currentUniprotId}</span>
            </div>
          )}

          {/* 실시간 AlphaFold 신뢰도 메타데이터 오버레이 */}
          {!isLoading && !error && prediction && (
            <div style={{
              position: 'absolute', bottom: '20px', left: '20px',
              padding: '12px 18px', borderRadius: '14px', background: 'rgba(10, 16, 31, 0.85)',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(76, 215, 246, 0.3)',
              display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '360px'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#4cd7f6', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={14} /> AlphaFold DB Confidence (pLDDT: {prediction.globalPlddt.toFixed(1)})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 700 }}>
                {prediction.organismName || 'Homo sapiens'} · Chain A [1-{prediction.sequenceLength}]
              </div>
              <div style={{ fontSize: '0.72rem', color: '#8899a6' }}>
                Very High {(prediction.fractionVeryHigh * 100).toFixed(0)}% · Confident {(prediction.fractionConfident * 100).toFixed(0)}% · Low {(prediction.fractionLow * 100).toFixed(0)}% · Very Low {(prediction.fractionVeryLow * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#8899a6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="#4cd7f6" />
            <span>Connected to AlphaFold DB (EBI) Live API</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 22px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
              color: '#000', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            {t('legal.confirm', '확인 및 닫기')}
          </button>
        </div>
      </div>
    </div>
  );
};
