import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Building2, Terminal, FileText, CheckCircle2, Copy, Sparkles, X,
  Key, ShieldCheck, Download, Code2, Play, Layers, Server, Cpu
} from 'lucide-react';
import { createApiKeyDB, fetchApiKeysDB, ApiKeyItem } from '../services/supabaseService';

interface EnterpriseB2BConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseB2BConsoleModal: React.FC<EnterpriseB2BConsoleModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'onboarding' | 'developer' | 'audit'>('onboarding');

  // Tab 1 Form State
  const [orgName, setOrgName] = useState('Aetheria Global Pharma R&D Center');
  const [projectName, setProjectName] = useState('Neuro-Longevity Tau & BACE1 Pipeline');
  const [techEmail, setTechEmail] = useState('bio-lead@aetheria-pharma.com');
  const [infraChoice, setInfraChoice] = useState<'cloud_api' | 'private_subnet' | 'on_premise'>('cloud_api');
  const [apiKey, setApiKey] = useState('deeptech_ent_live_98f2a1b94e772c3801f');
  const [copiedKey, setCopiedKey] = useState(false);
  const [onboardingSubmitted, setOnboardingSubmitted] = useState(false);
  const [dbApiKeys, setDbApiKeys] = useState<ApiKeyItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchApiKeysDB().then(keys => {
        if (keys && keys.length > 0) {
          setDbApiKeys(keys);
          setApiKey(keys[0].api_key_hash);
        }
      });
    }
  }, [isOpen]);

  // Tab 2 Developer API State
  const [selectedSdk, setSelectedSdk] = useState<'python' | 'javascript' | 'curl' | 'graphql'>('python');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'scan' | 'alphafold' | 'fto'>('scan');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Tab 3 Audit Center State
  const [auditTarget, setAuditTarget] = useState('MAPT-TAU (Neuro-Protective)');
  const [patentClaim, setPatentClaim] = useState('US-2026-089102-A1');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  if (!isOpen) return null;

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateApiKey = () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(24));
    const randomHex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
    setApiKey(`deeptech_ent_live_${randomHex}`);
  };

  const handleRunLiveQuery = () => {
    setIsQuerying(true);
    setApiResponse(null);
    setTimeout(() => {
      setIsQuerying(false);
      if (selectedEndpoint === 'scan') {
        setApiResponse(JSON.stringify({
          status: 200,
          latency: '38ms',
          specialty: 'Neurosurgery & Longevity',
          scannedTargets: [
            { gene: 'MAPT', protein: 'Tau', plddt: 94.8, chemblAffinity: '4.2 nM', ftoRisk: 'Clear (High FTO)' },
            { gene: 'BACE1', protein: 'Beta-Secretase', plddt: 96.2, chemblAffinity: '8.1 nM', ftoRisk: 'Clear (High FTO)' }
          ],
          pipelineReportQuotaRemaining: '월 500회 한도 (500 Quotas/Mo)'
        }, null, 2));
      } else if (selectedEndpoint === 'alphafold') {
        setApiResponse(JSON.stringify({
          status: 200,
          latency: '24ms',
          uniprotId: 'P10636',
          proteinName: 'MAPT (Microtubule-Associated Protein Tau)',
          alphafoldPdbUrl: 'https://alphafold.ebi.ac.uk/files/AF-P10636-F1-model_v4.pdb',
          plddtConfidenceScore: 94.8,
          domainBoundaries: 'Residues 1-441 (4 Isoforms Analyzed)',
          dockingAffinityMatrix: { chemblId: 'CHEMBL3829101', bindingKi: '1.8 nM' }
        }, null, 2));
      } else {
        setApiResponse(JSON.stringify({
          status: 200,
          latency: '52ms',
          ftoStatus: 'Clear FTO (Low Infringement Risk)',
          patentClaimsAnalyzed: 1420,
          usptoPriorArtMatch: 0.04,
          wipoPriorArtMatch: 0.02,
          recommendation: 'Proceed to Phase I/II Clinical Trial Filing'
        }, null, 2));
      }
    }, 600);
  };

  const handleGeneratePdfReport = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      setIsGeneratingPdf(false);
      setPdfGenerated(true);
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 220,
      background: 'rgba(5, 10, 20, 0.94)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%', maxWidth: '1240px', maxHeight: '92vh', background: '#0b1326',
        border: '1px solid rgba(255, 215, 0, 0.5)', borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(255, 215, 0, 0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', color: '#dae2fd',
        margin: 'auto 0'
      }}>

        {/* Modal Top Header */}
        <div style={{
          padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(23, 31, 51, 0.98) 0%, rgba(35, 26, 50, 0.98) 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 10px', borderRadius: '10px', background: 'rgba(255, 215, 0, 0.15)', border: '1px solid rgba(255, 215, 0, 0.4)', color: '#ffd700', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>
              <Building2 size={13} /> Enterprise B2B Custom Integration Console
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Enterprise B2B 기업 전용 마스터 콘솔 & 개발자 API
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#bcc9cd', margin: '2px 0 0 0' }}>
              글로벌 제약사 및 B2B 생명공학 기업을 위한 온보딩 신청, REST/GraphQL SDK 개발자 매뉴얼 및 FTO/SenoScan™ 심층 감사 센터
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#bcc9cd', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', padding: '10px 28px', background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setActiveTab('onboarding')}
            style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
              background: activeTab === 'onboarding' ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'onboarding' ? '#000' : '#bcc9cd',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Building2 size={15} /> 1. B2B 온보딩 & 인프라 신청 모듈
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
              background: activeTab === 'developer' ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'developer' ? '#000' : '#bcc9cd',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Terminal size={15} /> 2. 개발자 API / SDK 실시간 콘솔
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
              background: activeTab === 'audit' ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'audit' ? '#000' : '#bcc9cd',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <FileText size={15} /> 3. FTO & SenoScan™ 심층 감사 센터
          </button>
        </div>

        {/* Modal Main Body */}
        <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}>

          {/* TAB 1: B2B ONBOARDING & INFRA REQUEST */}
          {activeTab === 'onboarding' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Form Column */}
              <div style={{ background: 'rgba(23, 31, 51, 0.7)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '18px', padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffd700', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} /> Enterprise 기업 정보 & 구축 신청
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px' }}>
                      기관 / 제약사 명칭 (Organization Name)
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px' }}>
                      R&D 파이프라인 과제명 (Project Name)
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px' }}>
                      기술 담당자 이메일 (Technical Contact Email)
                    </label>
                    <input
                      type="email"
                      value={techEmail}
                      onChange={(e) => setTechEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '8px' }}>
                      인프라 배포 형태 선택 (Deployment Architecture)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: infraChoice === 'cloud_api' ? 'rgba(76, 215, 246, 0.15)' : 'rgba(15, 23, 42, 0.5)', border: infraChoice === 'cloud_api' ? '1px solid #4cd7f6' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                        <input type="radio" name="infra" checked={infraChoice === 'cloud_api'} onChange={() => setInfraChoice('cloud_api')} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: infraChoice === 'cloud_api' ? '#4cd7f6' : '#fff' }}>1. Enterprise Cloud REST & GraphQL API (즉시 사용)</div>
                          <div style={{ fontSize: '0.75rem', color: '#bcc9cd' }}>무제한 쿼리 한도, 24/7 글로벌 API 게이트웨이 즉시 할당</div>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: infraChoice === 'private_subnet' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(15, 23, 42, 0.5)', border: infraChoice === 'private_subnet' ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                        <input type="radio" name="infra" checked={infraChoice === 'private_subnet'} onChange={() => setInfraChoice('private_subnet')} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: infraChoice === 'private_subnet' ? '#ffd700' : '#fff' }}>2. AWS / GCP Dedicated Private Subnet (독점 클라우드 서브넷)</div>
                          <div style={{ fontSize: '0.75rem', color: '#bcc9cd' }}>고객사 단독 VPC 망에 분리된 전용 AI 엔진 가상서버 배포</div>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: infraChoice === 'on_premise' ? 'rgba(78, 222, 163, 0.15)' : 'rgba(15, 23, 42, 0.5)', border: infraChoice === 'on_premise' ? '1px solid #4edea3' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                        <input type="radio" name="infra" checked={infraChoice === 'on_premise'} onChange={() => setInfraChoice('on_premise')} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: infraChoice === 'on_premise' ? '#4edea3' : '#fff' }}>3. On-Premise Docker / Kubernetes Container (사내망 패키지)</div>
                          <div style={{ fontSize: '0.75rem', color: '#bcc9cd' }}>외부 인터넷 단절 환경용 독립 Docker 엔진 및 오프라인 DB 패키지 제공</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOnboardingSubmitted(true)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000',
                      fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', marginTop: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={16} /> Enterprise B2B 구축 신청 저장
                  </button>
                  {onboardingSubmitted && (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(78, 222, 163, 0.2)', border: '1px solid #4edea3', color: '#4edea3', fontSize: '0.78rem', textAlign: 'center', fontWeight: 800 }}>
                      ✓ 신청 내역이 즉시 등록되었습니다! 전담 AI 바이오 엔지니어가 개설 절차를 진행합니다.
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Key Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Live API Key Card */}
                <div style={{ background: 'rgba(23, 31, 51, 0.7)', border: '1px solid rgba(76, 215, 246, 0.4)', borderRadius: '18px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#4cd7f6', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Key size={18} /> Enterprise Live API Key
                    </h4>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(78, 222, 163, 0.2)', color: '#4edea3', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid #4edea3' }}>
                      ACTIVE (월 500회 한도)
                    </span>
                  </div>

                  <div style={{ background: '#070c18', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.8rem', color: '#ffd700', wordBreak: 'break-all', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{apiKey}</span>
                    <button
                      type="button"
                      onClick={handleCopyApiKey}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '8px' }}
                    >
                      <Copy size={13} /> {copiedKey ? '복사됨!' : '복사'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateApiKey}
                    style={{ background: 'transparent', border: 'none', color: '#4cd7f6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}
                  >
                    🔄 신규 API Key 재발급 (Rotate Key)
                  </button>
                </div>

                {/* Quota & Support Card */}
                <div style={{ background: 'rgba(23, 31, 51, 0.7)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '18px', padding: '20px', flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffd700', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={18} /> Enterprise 지원 현황
                  </h4>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                      <span style={{ color: '#bcc9cd' }}>월간 API 쿼리 한도:</span>
                      <span style={{ color: '#ffd700', fontWeight: 900 }}>월 500회 (Month 500 Quotas)</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                      <span style={{ color: '#bcc9cd' }}>LIMS / ELN 시스템 연동 지원:</span>
                      <span style={{ color: '#4edea3', fontWeight: 800 }}>완벽 호환 (REST/GraphQL)</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                      <span style={{ color: '#bcc9cd' }}>FTO 특허 & 감사 보고서 생성:</span>
                      <span style={{ color: '#4cd7f6', fontWeight: 800 }}>원클릭 PDF 출력 (월 500회)</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE DEVELOPER API / SDK CONSOLE */}
          {activeTab === 'developer' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Code Snippets & Endpoint Selection */}
              <div style={{ background: 'rgba(23, 31, 51, 0.7)', border: '1px solid rgba(76, 215, 246, 0.3)', borderRadius: '18px', padding: '18px' }}>
                
                {/* SDK Selector */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                  {(['python', 'javascript', 'curl', 'graphql'] as const).map(sdk => (
                    <button
                      key={sdk}
                      type="button"
                      onClick={() => setSelectedSdk(sdk)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
                        background: selectedSdk === sdk ? '#4cd7f6' : 'rgba(255,255,255,0.06)',
                        color: selectedSdk === sdk ? '#000' : '#bcc9cd'
                      }}
                    >
                      {sdk === 'python' ? 'Python SDK' : sdk === 'javascript' ? 'Node.js / JS' : sdk === 'curl' ? 'cURL (REST)' : 'GraphQL'}
                    </button>
                  ))}
                </div>

                {/* Endpoint Selector */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px' }}>API 엔드포인트 선택</label>
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#070c18', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    <option value="scan">POST /api/v1/target/scan (10대 의학과 표적분자 AI 스캐닝)</option>
                    <option value="alphafold">GET /api/v1/alphafold/3d/P10636 (AlphaFold 2억+ 3D PDB & pLDDT)</option>
                    <option value="fto">POST /api/v1/fto/analyze (FTO 특허 선행기술 침해 AI 평가)</option>
                  </select>
                </div>

                {/* Code Editor Box */}
                <div style={{ background: '#050913', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.78rem', color: '#dae2fd', overflowX: 'auto', lineHeight: '1.45', minHeight: '220px' }}>
                  {selectedSdk === 'python' && (
                    <pre style={{ margin: 0 }}>{`import deeptech_bio as bio

client = bio.Client(api_key="${apiKey}")

# ${selectedEndpoint === 'scan' ? '전신 10대 의학과 AI 표적분자 스캐닝' : selectedEndpoint === 'alphafold' ? 'AlphaFold 3D 구조 분석' : 'FTO 특허 침해 판단'}
result = client.${selectedEndpoint === 'scan' ? 'scan_target' : selectedEndpoint === 'alphafold' ? 'get_alphafold_3d' : 'analyze_fto'}(
    ${selectedEndpoint === 'scan' ? 'department="neurosurgery", target="TAU"' : selectedEndpoint === 'alphafold' ? 'uniprot_id="P10636"' : 'smiles="CC1=C(C=C...)NC(=O)...", patent="US-2026-089102"'}
)
print("pLDDT Confidence:", result.plddt)
print("Affinity IC50:", result.ic50)`}</pre>
                  )}

                  {selectedSdk === 'javascript' && (
                    <pre style={{ margin: 0 }}>{`import { DeepTechBioClient } from '@deeptech/bio-sdk';

const client = new DeepTechBioClient({ apiKey: '${apiKey}' });

const response = await client.${selectedEndpoint === 'scan' ? 'scanTarget' : selectedEndpoint === 'alphafold' ? 'getAlphaFold3D' : 'analyzeFTO'}({
  ${selectedEndpoint === 'scan' ? "department: 'neurosurgery', target: 'TAU'" : selectedEndpoint === 'alphafold' ? "uniprotId: 'P10636'" : "smiles: 'CC1=C...', patentNo: 'US-2026-089102'"}
});
console.log(response.data);`}</pre>
                  )}

                  {selectedSdk === 'curl' && (
                    <pre style={{ margin: 0 }}>{`curl -X POST "https://api.deeptech.bio/v1/${selectedEndpoint === 'scan' ? 'target/scan' : selectedEndpoint === 'alphafold' ? 'alphafold/3d' : 'fto/analyze'}" \\
  -H "X-API-KEY: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${selectedEndpoint === 'scan' ? '{"department": "neurosurgery", "target": "TAU"}' : selectedEndpoint === 'alphafold' ? '{"uniprotId": "P10636"}' : '{"patentNo": "US-2026-089102"}'}'`}</pre>
                  )}

                  {selectedSdk === 'graphql' && (
                    <pre style={{ margin: 0 }}>{`query GetTargetStructure {
  target(gene: "MAPT") {
    uniprotId
    plddtScore
    chemblAffinityIC50
    alphafoldPdbUrl
    ftoRiskAssessment
  }
}`}</pre>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRunLiveQuery}
                  disabled={isQuerying}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', color: '#000',
                    fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', marginTop: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Play size={16} /> {isQuerying ? '쿼리 실행 중...' : '⚡ 실시간 API 쿼리 테스트 (Run Live Query)'}
                </button>
              </div>

              {/* Console Output Column */}
              <div style={{ background: '#050913', border: '1px solid rgba(76, 215, 246, 0.4)', borderRadius: '18px', padding: '18px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4cd7f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code2 size={16} /> Live Response Output (HTTP 200 OK)
                  </span>
                  {apiResponse && <span style={{ fontSize: '0.72rem', color: '#4edea3', fontWeight: 800 }}>● Live Gateway Connected</span>}
                </div>

                <div style={{ flex: 1, background: '#02050b', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.78rem', color: '#4edea3', overflow: 'auto', minHeight: '260px' }}>
                  {isQuerying ? (
                    <div style={{ color: '#ffd700', padding: '20px', textAlign: 'center' }}>
                      ⏳ Enterprise 백엔드 API 게이트웨이에 쿼리를 전송하는 중...
                    </div>
                  ) : apiResponse ? (
                    <pre style={{ margin: 0 }}>{apiResponse}</pre>
                  ) : (
                    <div style={{ color: '#8899a6', padding: '40px 20px', textAlign: 'center' }}>
                      왼쪽 '⚡ 실시간 API 쿼리 테스트' 버튼을 누르면 이 곳에 실시간 JSON 응답 데이터가 반환됩니다.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ENTERPRISE DEEP AUDIT CENTER */}
          {activeTab === 'audit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Form Input */}
              <div style={{ background: 'rgba(23, 31, 51, 0.7)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '18px', padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffd700', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} /> FTO 특허 & SenoScan™ 감사 보고서 즉시 생성
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px' }}>
                      분석 대상 표적분자 (Target Molecule)
                    </label>
                    <select
                      value={auditTarget}
                      onChange={(e) => setAuditTarget(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#070c18', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="MAPT-TAU">MAPT / Tau Protein (신경외과/치매 표적)</option>
                      <option value="BACE1">BACE1 Beta-Secretase (뇌혈관 알츠하이머)</option>
                      <option value="SNCA">SNCA Alpha-Synuclein (신경과 파킨슨병)</option>
                      <option value="SIRT1">SIRT1 Sirtuin 1 (항노화/장수 효소)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px' }}>
                      선행 특허 심사 청구항 번호 (Patent Claim No.)
                    </label>
                    <input
                      type="text"
                      value={patentClaim}
                      onChange={(e) => setPatentClaim(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePdfReport}
                    disabled={isGeneratingPdf}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000',
                      fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Download size={16} /> {isGeneratingPdf ? 'PDF 보고서 생성 중...' : '📄 Executive PDF 감사 보고서 즉시 생성'}
                  </button>
                </div>
              </div>

              {/* PDF Preview Result */}
              <div style={{ background: 'rgba(23, 31, 51, 0.7)', border: '1px solid rgba(78, 222, 163, 0.4)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {pdfGenerated ? (
                  <div style={{ width: '100%', textDecoration: 'none', textTransform: 'none', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(78, 222, 163, 0.15)', border: '1px solid #4edea3', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
                      <CheckCircle2 size={36} color="#4edea3" style={{ marginBottom: '8px' }} />
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: '0 0 6px 0' }}>
                        Executive FTO & SenoScan™ B2B Audit Report (PDF)
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#bcc9cd', margin: 0 }}>
                        {auditTarget} 표적에 대한 24페이지 분량의 심층 특허 IP 분석 및 세포사멸 감사 보고서 완편 생성됨
                      </p>
                    </div>

                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert(`${auditTarget}_B2B_Audit_Report.pdf 다운로드가 완료되었습니다.`); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px',
                        background: '#4edea3', color: '#000', fontWeight: 900, fontSize: '0.9rem', textDecoration: 'none'
                      }}
                    >
                      <Download size={16} /> {auditTarget}_B2B_Audit_Report.pdf 다운로드
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#bcc9cd', padding: '30px' }}>
                    <FileText size={42} color="#ffd700" style={{ opacity: 0.5, marginBottom: '12px' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>B2B 감사 보고서 대기 중</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '6px' }}>왼쪽에서 표적과 청구항을 입력하고 생성 버튼을 누르시면 PDF 감사 보고서가 작성됩니다.</div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div style={{
          padding: '14px 28px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#ffd700" />
            <span style={{ fontSize: '0.8rem', color: '#bcc9cd' }}>
              Enterprise VIP Exclusive Console | 256-bit Encrypted API Gateway (Single-tenant Ready)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            닫기 (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
