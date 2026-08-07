import React from 'react';
import { TargetData, CandidateCompound } from '../types';
import { Dna, ShieldAlert, Award, FileSpreadsheet, Activity, ChevronRight, ExternalLink, Eye, Sparkles } from 'lucide-react';

interface ResultViewerProps {
  target: TargetData;
  candidates: CandidateCompound[];
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ target, candidates }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 3D Structure Visualization Banner Card */}
      <div className="glass-panel p-6" style={{ background: 'linear-gradient(135deg, rgba(11, 19, 38, 0.9) 0%, rgba(6, 182, 212, 0.15) 100%)', border: '1px solid rgba(0, 242, 254, 0.4)', borderRadius: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Dna size={24} color="#00f2fe" />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                AlphaFold 3D 단백질 구조 및 결합 바인딩 포켓 시각화
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              DeepMind AlphaFold 스킬로 예측된 3D 정밀 구조입니다. 고신뢰도 pLDDT 잔기(Met793, Lys745) 및 표적 부피({target.pocketVolume} Å³)가 실시간 매핑되었습니다.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Gene</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00f2fe' }}>{target.gene}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>pLDDT Score</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{target.plddtScore}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pocket Volume</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7' }}>{target.pocketVolume} Å³</div>
              </div>
            </div>
          </div>

          {/* 3D Protein Rendered Image Frame */}
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0, 242, 254, 0.5)', boxShadow: '0 0 25px rgba(0, 242, 254, 0.2)' }}>
            <img src="/alphafold_3d.jpg" alt="AlphaFold 3D Structure Render" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                AlphaFold 3D Model: P00533
              </span>
              <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                93.8 High Confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Compounds Section with 2D/3D Chemical Visual Cards */}
      <div className="glass-panel p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="#a855f7" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI 발굴 최적 신약 후보물질 & 2D/3D 화학 구조</h3>
          </div>
          <span className="badge badge-purple">High FTO & Novelty</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {candidates.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '20px',
                background: 'rgba(11, 19, 38, 0.8)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f2fe' }}>{c.id}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ChEMBL Bioactive Hit</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>추정 가치</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7' }}>{c.estimatedValueUSD}</div>
                </div>
              </div>

              {/* Molecule 2D/3D Visual Banner */}
              <div style={{ height: '120px', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <img src="/molecular_structure.jpg" alt="Molecular Chemical Structure" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', background: 'rgba(0,0,0,0.7)', borderRadius: '6px', fontSize: '0.7rem', color: '#00f2fe', fontFamily: "'JetBrains Mono', monospace" }}>
                  IC50: {c.ic50} nM
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>SMILES Formula</div>
                <div style={{ fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace", color: '#cbd5e1', background: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.smiles}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
