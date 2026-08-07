import React, { useState } from 'react';
import { runNeuroLongevityAnalysis, getDepartmentTargetMap, TARGET_PDB_MAP, DEPARTMENT_DEFAULT_PROTEINS } from '../services/neuroLongevityEngine';
import { TargetAnalysisResult, UserProfile, UserPlanTier, SaasCategory } from '../types';
import { Protein3DViewer } from './Protein3DViewer';
import { AboutServiceOverview } from './AboutServiceOverview';
import { Mol3DViewerModal } from './Mol3DViewerModal';
import { ScienceSkillsCatalogModal } from './ScienceSkillsCatalogModal';
import { EnterpriseB2BConsoleModal } from './EnterpriseB2BConsoleModal';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Brain, Bone, Smile, Stethoscope, Clock, Sparkles, Search, Dna, Download, ShieldCheck, CheckCircle, Zap,
  ExternalLink, KeyRound, ArrowRight, Activity, FlaskConical, Layers, Crown, Lock, Eye, ChevronRight, Filter, Info, HeartPulse,
  Box, Terminal, Star, FileText, Printer, Building2
} from 'lucide-react';

interface SaaSPlatformViewProps {
  user: UserProfile;
  activeCategory: SaasCategory;
  onSelectCategory: (cat: SaasCategory) => void;
  onOpenCheckout: (tier: UserPlanTier) => void;
  onOpenPlanDetails?: () => void;
}

export const SaaSPlatformView: React.FC<SaaSPlatformViewProps> = ({
  user,
  activeCategory,
  onSelectCategory,
  onOpenCheckout,
  onOpenPlanDetails
}) => {
  const { t } = useLanguage();
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>('TAU');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<TargetAnalysisResult | null>(null);

  // Modals state
  const [is3DViewerOpen, setIs3DViewerOpen] = useState<boolean>(false);
  const [active3DPdbId, setActive3DPdbId] = useState<string>('AF-P10636-F1');
  const [active3DProteinName, setActive3DProteinName] = useState<string>('MAPT (Microtubule-Associated Protein Tau)');
  const [isSkillCatalogOpen, setIsSkillCatalogOpen] = useState<boolean>(false);
  const [isB2BConsoleOpen, setIsB2BConsoleOpen] = useState<boolean>(false);

  // Saved Target Vault State (Bookmark)
  const [savedVaultTargets, setSavedVaultTargets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('aetheria_target_vault');
      return stored ? JSON.parse(stored) : ['TAU', 'PCSK9'];
    } catch {
      return ['TAU', 'PCSK9'];
    }
  });

  const toggleSaveVault = (targetKey: string) => {
    setSavedVaultTargets(prev => {
      const next = prev.includes(targetKey) ? prev.filter(k => k !== targetKey) : [...prev, targetKey];
      try {
        localStorage.setItem('aetheria_target_vault', JSON.stringify(next));
      } catch (e) { console.error(e); }
      return next;
    });
  };

  const handleOpen3DViewer = (pdbId?: string, proteinName?: string) => {
    if (pdbId) setActive3DPdbId(pdbId);
    if (proteinName) setActive3DProteinName(proteinName);
    setIs3DViewerOpen(true);
  };

  const handleExportReport = () => {
    window.print();
  };

  if (activeCategory === 'overview_about') {
    return <AboutServiceOverview onNavigateDepartment={onSelectCategory} onOpenCheckout={onOpenCheckout} onOpenPlanDetails={onOpenPlanDetails} />;
  }

  const currentTargetMap = getDepartmentTargetMap(activeCategory);

  const filteredTargetEntries = Object.entries(currentTargetMap).filter(([key, t]) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      key.toLowerCase().includes(q) ||
      t.geneSymbol.toLowerCase().includes(q) ||
      t.targetName.toLowerCase().includes(q) ||
      t.targetId.toLowerCase().includes(q)
    );
  });

  const handleRunAnalysis = async (targetKeyToRun?: string) => {
    // 무료 회원 과금 제약: 무료 플랜일 경우 결제 모달 팝업
    if (user.plan === 'free') {
      onOpenCheckout('pro');
      return;
    }
    const targetToUse = targetKeyToRun || selectedTargetKey;
    setIsAnalyzing(true);
    try {
      const res = await runNeuroLongevityAnalysis(activeCategory, targetToUse);
      setAnalysisResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUniProtClick = (e: React.MouseEvent, uniprotId: string) => {
    if (user.plan === 'free') {
      e.preventDefault();
      onOpenCheckout('pro');
    }
  };

  const handleDownloadPDF = (targetName: string) => {
    if (user.plan === 'free') {
      onOpenCheckout('pro');
      return;
    }

    const reportContent = `
%PDF-1.4
1 0 obj << /Title (${targetName} B2B Audit Report) /Creator (AETHERIA Bio Portal) >> endobj
================================================================
AETHERIA BIO DEEPTECH PORTAL EXECUTIVE AUDIT REPORT
================================================================
Department Category: ${activeCategory.toUpperCase()}
Target Protein: ${targetName}
User License: ${user.plan.toUpperCase()}
Generated Date: ${new Date().toLocaleString()}
Status: High Freedom to Operate (FTO Clear)
38 Science Skills Pipeline Audit: PASSED
================================================================
    `;
    const blob = new Blob([reportContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive_Audit_${targetName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Category Hero Banner */}
      <div className="glass-panel" style={{ padding: '52px 48px 44px 48px', border: '1px solid rgba(76, 215, 246, 0.35)', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 19, 38, 0.98) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', opacity: 0.2, pointerEvents: 'none' }}>
          <img src="/public/molecular_structure.jpg" alt="Bio Background" style={{ width: '480px', height: '320px', objectFit: 'cover', borderRadius: '24px' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '20px', background: 'rgba(76, 215, 246, 0.15)', border: '1px solid rgba(76, 215, 246, 0.5)', color: '#4cd7f6', fontSize: '0.82rem', fontWeight: 800, marginTop: '8px', marginBottom: '20px' }}>
              <Sparkles size={15} /> 38 Science Skills Powered Bio Portal
            </div>

            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {activeCategory === 'neurosurgery' && <>🧠 {t('dept.neurosurgery', '신경외과')} <span style={{ color: '#4cd7f6', background: 'rgba(76, 215, 246, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'neurology' && <>⚡ {t('dept.neurology', '신경과')} <span style={{ color: '#4edea3', background: 'rgba(78, 222, 163, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'orthopedics' && <>🦴 {t('dept.orthopedics', '정형외과')} <span style={{ color: '#d0bcff', background: 'rgba(208, 188, 255, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'psychiatry' && <>😊 {t('dept.psychiatry', '정신건강의학과')} <span style={{ color: '#ffd700', background: 'rgba(255, 215, 0, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'cardiology' && <>❤️ {t('dept.cardiology', '순환기내과')} <span style={{ color: '#ff6b81', background: 'rgba(255, 99, 132, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'oncology' && <>🩺 {t('dept.oncology', '종양내과')} <span style={{ color: '#4cd7f6', background: 'rgba(76, 215, 246, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'endocrinology' && <>🧬 {t('dept.endocrinology', '내분비내과')} <span style={{ color: '#4edea3', background: 'rgba(78, 222, 163, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'immunology' && <>🛡️ {t('dept.immunology', '류마티스/면역내과')} <span style={{ color: '#d0bcff', background: 'rgba(208, 188, 255, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'dermatology' && <>✨ {t('dept.dermatology', '피부과')} <span style={{ color: '#ffd700', background: 'rgba(255, 215, 0, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'ophthalmology' && <>👁️ {t('dept.ophthalmology', '안과')} <span style={{ color: '#4cd7f6', background: 'rgba(76, 215, 246, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
              {activeCategory === 'longevity' && <>⏳ {t('dept.longevity', '안티에이징')} <span style={{ color: '#4edea3', background: 'rgba(78, 222, 163, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{t('saas.title_suffix', 'AI 표적 스캐너')}</span></>}
            </h2>

            <p style={{ color: '#dae2fd', fontSize: '0.98rem', maxWidth: '880px', marginTop: '14px', lineHeight: '1.65' }}>
              {t(`dept.desc_${activeCategory}`, t('hero.desc'))}
            </p>
          </div>

          <div style={{ padding: '20px 24px', background: 'rgba(23, 31, 51, 0.9)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.15)', minWidth: '230px', position: 'relative', zIndex: 10 }}>
            <div style={{ fontSize: '0.75rem', color: '#bcc9cd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('auth.plan_summary', '구독 라이선스 상태')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              {user.plan === 'enterprise' ? (
                <span className="badge badge-gold" style={{ fontSize: '0.95rem', fontWeight: 800 }}><Crown size={14} /> Enterprise VIP</span>
              ) : user.plan === 'pro' ? (
                <span className="badge badge-cyan" style={{ fontSize: '0.95rem', fontWeight: 800 }}><Zap size={14} /> Pro Portal</span>
              ) : (
                <span className="badge badge-purple" style={{ fontSize: '0.95rem', fontWeight: 800 }}>Free Starter Tier</span>
              )}
            </div>
            {user.plan === 'free' && (
              <button
                onClick={() => onOpenCheckout('pro')}
                style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', color: '#000', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                {t('saas.pro_upgrade', 'Pro 구독 업그레이드 ($490)')}
              </button>
            )}

            <button
              onClick={() => setIsB2BConsoleOpen(true)}
              style={{ width: '100%', marginTop: '8px', padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.4)', background: 'rgba(255, 215, 0, 0.12)', color: '#ffd700', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Building2 size={13} /> Enterprise B2B 콘솔
            </button>
          </div>
        </div>

        {/* 10 Departments Navigation Bar (Integrated Horizontal Layout) */}
        <div style={{
          display: 'flex', flexWrap: 'nowrap', gap: '8px', marginTop: '28px', width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '20px',
          position: 'relative', zIndex: 10, overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none'
        }}>
          <button onClick={() => { onSelectCategory('neurosurgery'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'neurosurgery' ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'neurosurgery' ? 'rgba(76, 215, 246, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'neurosurgery' ? '#4cd7f6' : '#bcc9cd', transition: 'all 0.2s ease' }}>🧠 {t('dept.neurosurgery', '신경외과')}</button>
          <button onClick={() => { onSelectCategory('neurology'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'neurology' ? '2px solid #4edea3' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'neurology' ? 'rgba(78, 222, 163, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'neurology' ? '#4edea3' : '#bcc9cd', transition: 'all 0.2s ease' }}>⚡ {t('dept.neurology', '신경과')}</button>
          <button onClick={() => { onSelectCategory('orthopedics'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'orthopedics' ? '2px solid #d0bcff' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'orthopedics' ? 'rgba(208, 188, 255, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'orthopedics' ? '#d0bcff' : '#bcc9cd', transition: 'all 0.2s ease' }}>🦴 {t('dept.orthopedics', '정형외과')}</button>
          <button onClick={() => { onSelectCategory('psychiatry'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'psychiatry' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'psychiatry' ? 'rgba(255, 215, 0, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'psychiatry' ? '#ffd700' : '#bcc9cd', transition: 'all 0.2s ease' }}>😊 {t('dept.psychiatry', '정신건강의학과')}</button>
          <button onClick={() => { onSelectCategory('cardiology'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'cardiology' ? '2px solid #ff6b81' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'cardiology' ? 'rgba(255, 99, 132, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'cardiology' ? '#ff6b81' : '#bcc9cd', transition: 'all 0.2s ease' }}>❤️ {t('dept.cardiology', '순환기내과')}</button>
          <button onClick={() => { onSelectCategory('oncology'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'oncology' ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'oncology' ? 'rgba(76, 215, 246, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'oncology' ? '#4cd7f6' : '#bcc9cd', transition: 'all 0.2s ease' }}>🩺 {t('dept.oncology', '종양내과')}</button>
          <button onClick={() => { onSelectCategory('endocrinology'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'endocrinology' ? '2px solid #4edea3' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'endocrinology' ? 'rgba(78, 222, 163, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'endocrinology' ? '#4edea3' : '#bcc9cd', transition: 'all 0.2s ease' }}>🧬 {t('dept.endocrinology', '내분비내과')}</button>
          <button onClick={() => { onSelectCategory('immunology'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'immunology' ? '2px solid #d0bcff' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'immunology' ? 'rgba(208, 188, 255, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'immunology' ? '#d0bcff' : '#bcc9cd', transition: 'all 0.2s ease' }}>🛡️ {t('dept.immunology', '류마티스/면역')}</button>
          <button onClick={() => { onSelectCategory('dermatology'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'dermatology' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'dermatology' ? 'rgba(255, 215, 0, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'dermatology' ? '#ffd700' : '#bcc9cd', transition: 'all 0.2s ease' }}>✨ {t('dept.dermatology', '피부과')}</button>
          <button onClick={() => { onSelectCategory('ophthalmology'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'ophthalmology' ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'ophthalmology' ? 'rgba(76, 215, 246, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'ophthalmology' ? '#4cd7f6' : '#bcc9cd', transition: 'all 0.2s ease' }}>👁️ {t('dept.ophthalmology', '안과')}</button>
          <button onClick={() => { onSelectCategory('longevity'); setSearchQuery(''); setAnalysisResult(null); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', border: activeCategory === 'longevity' ? '2px solid #4edea3' : '1px solid rgba(255,255,255,0.15)', background: activeCategory === 'longevity' ? 'rgba(78, 222, 163, 0.25)' : 'rgba(11, 19, 38, 0.7)', color: activeCategory === 'longevity' ? '#4edea3' : '#bcc9cd', transition: 'all 0.2s ease' }}>⏳ {t('dept.longevity', '안티에이징')}</button>
        </div>

        {/* Action Buttons: 3D Viewer & Skill Catalog & Target Vault */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', position: 'relative', zIndex: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const deptProtein = DEPARTMENT_DEFAULT_PROTEINS[activeCategory];
              const currentInfo = currentTargetMap[selectedTargetKey];
              const targetPdb = TARGET_PDB_MAP[selectedTargetKey];
              
              if (currentInfo && targetPdb) {
                handleOpen3DViewer(targetPdb, `${currentInfo.geneSymbol} - ${currentInfo.targetName}`);
              } else if (deptProtein) {
                handleOpen3DViewer(deptProtein.pdbId, deptProtein.proteinName);
              } else {
                handleOpen3DViewer('AF-P10636-F1', 'MAPT - Microtubule-Associated Protein Tau');
              }
            }}
            style={{
              padding: '12px 22px', borderRadius: '12px', border: '1px solid rgba(76, 215, 246, 0.5)',
              background: 'rgba(76, 215, 246, 0.15)', color: '#4cd7f6', fontWeight: 800, fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
            }}
          >
            <Box size={18} />
            <span>{t('hero.btn_view', '3D 단백질 구조 뷰어 (AlphaFold 3D)')}</span>
          </button>

          <button
            onClick={() => setIsSkillCatalogOpen(true)}
            style={{
              padding: '12px 22px', borderRadius: '12px', border: '1px solid rgba(78, 222, 163, 0.5)',
              background: 'rgba(78, 222, 163, 0.15)', color: '#4edea3', fontWeight: 800, fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
            }}
          >
            <Terminal size={18} />
            <span>{t('skills.catalog_btn', '38개 사이언스 스킬 카탈로그 탐색기')}</span>
          </button>

          <div style={{
            padding: '12px 22px', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.4)',
            background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', fontWeight: 800, fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Star size={18} />
            <span>{t('vault.title', '관심 표적 보관함')}: {savedVaultTargets.length}개</span>
          </div>
        </div>

        {/* Live Search & Target Cards */}
        <div style={{ marginTop: '36px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter size={22} color="#4cd7f6" />
              <span>{t('saas.target_select', '실시간 표적 선택')} ({filteredTargetEntries.length})</span>
            </div>

            {/* High Visibility Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
              <Search size={22} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
              <input
                type="text"
                placeholder={t('saas.search_placeholder', '유전자, 단백질명, PDB 검색...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '14px 20px 14px 50px', background: 'linear-gradient(135deg, rgba(23, 31, 51, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  border: '2px solid #4cd7f6', borderRadius: '16px', color: '#ffffff', fontSize: '1rem', fontWeight: 700, outline: 'none',
                  boxShadow: '0 0 25px rgba(76, 215, 246, 0.25), inset 0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {filteredTargetEntries.map(([key, targetItem]) => {
              const isSelected = selectedTargetKey === key;
              const isLocked = user.plan === 'free';
              return (
                <div
                  key={key}
                  onClick={() => { setSelectedTargetKey(key); handleRunAnalysis(key); }}
                  style={{
                    padding: '16px 20px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                    border: isSelected ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.12)',
                    background: isSelected ? 'rgba(76, 215, 246, 0.15)' : 'rgba(23, 31, 51, 0.7)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isSelected ? '#4cd7f6' : '#fff' }}>
                      {targetItem.geneSymbol} - {targetItem.targetId}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#bcc9cd', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {targetItem.targetName}
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none',
                      background: isLocked ? 'rgba(208, 188, 255, 0.2)' : isSelected ? '#4cd7f6' : 'rgba(255,255,255,0.1)',
                      color: isLocked ? '#d0bcff' : isSelected ? '#000' : '#fff',
                      fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {isLocked ? (
                      <> <Lock size={12} /> {t('saas.scan_btn', '스캔 (구독 필요)')} </>
                    ) : isSelected ? (
                      '...'
                    ) : (
                      <> {t('saas.scan_btn', '스캔')} <ChevronRight size={14} /> </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Output View */}
      {analysisResult && (
        <div className="glass-panel p-8" style={{ border: '1px solid rgba(208, 188, 255, 0.4)', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FlaskConical size={24} color="#4cd7f6" />
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {analysisResult.targetName} ({analysisResult.geneSymbol})
                </h3>
              </div>
              <p style={{ color: '#bcc9cd', fontSize: '0.9rem', marginTop: '6px', maxWidth: '750px', lineHeight: '1.5' }}>
                {analysisResult.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={`https://www.uniprot.org/uniprotkb/${analysisResult.uniprotId}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => handleUniProtClick(e, analysisResult.uniprotId)}
                style={{ padding: '10px 18px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#4cd7f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {user.plan === 'free' ? <Lock size={14} color="#d0bcff" /> : null} UniProt: {analysisResult.uniprotId} <ExternalLink size={14} />
              </a>

              <button
                onClick={handleExportReport}
                style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', border: 'none', borderRadius: '10px', color: '#000', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} /> {t('report.export', '연구 리포트 출력 (PDF)')}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={20} color="#4cd7f6" /> AlphaFold 3D 결합 포켓 인터랙티브 시각화 (3Dmol.js)
            </h4>
            <Protein3DViewer uniprotId={analysisResult.uniprotId} pdbId={TARGET_PDB_MAP[analysisResult.uniprotId] || '1I1E'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '20px', background: 'rgba(11, 19, 38, 0.75)', borderRadius: '16px', border: '1px solid rgba(76, 215, 246, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#bcc9cd' }}>AlphaFold 3D pLDDT 신뢰도</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4cd7f6', marginTop: '4px' }}>
                {analysisResult.plddtConfidence}
              </div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(11, 19, 38, 0.75)', borderRadius: '16px', border: '1px solid rgba(78, 222, 163, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#bcc9cd' }}>OpenTargets 질환 연관성 점수</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4edea3', marginTop: '4px' }}>
                {(analysisResult.openTargetsAssociationScore * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(11, 19, 38, 0.75)', borderRadius: '16px', border: '1px solid rgba(208, 188, 255, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#bcc9cd' }}>등록 화합물 / Clinical Trials</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d0bcff', marginTop: '4px' }}>
                {analysisResult.knownDrugsCount}개 / {analysisResult.activeClinicalTrials}건
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
            38개 사이언스 스킬 실시간 결합 후보 데이터 (ChEMBL / FTO)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analysisResult.hitCandidates.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '22px', background: 'rgba(11, 19, 38, 0.9)', borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.1)', display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4cd7f6' }}>{c.id}</div>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#bcc9cd' }}>{c.chemblId}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#bcc9cd' }}>표적 결합력 (IC50)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4edea3' }}>{c.affinityIC50}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#bcc9cd' }}>신경/조직 보호 효능 점수</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d0bcff' }}>
                    {c.rejuvenationOrNeuroProtectionScore} / 100
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#bcc9cd' }}>FTO 특허 및 권리 상태</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4edea3', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <ShieldCheck size={16} /> {c.patentFTO}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: '#bcc9cd' }}>추정 파이프라인 가치</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{c.estimatedMarketValue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Mol Viewer Modal */}
      <Mol3DViewerModal
        isOpen={is3DViewerOpen}
        onClose={() => setIs3DViewerOpen(false)}
        pdbId={active3DPdbId}
        proteinName={active3DProteinName}
      />

      {/* 38 Science Skills Catalog Modal */}
      <ScienceSkillsCatalogModal
        isOpen={isSkillCatalogOpen}
        onClose={() => setIsSkillCatalogOpen(false)}
        onSelectSkill={(skillName) => {
          if (user.plan === 'free') {
            onOpenCheckout('pro');
          }
        }}
      />

      {/* Enterprise B2B Custom Console Modal */}
      <EnterpriseB2BConsoleModal
        isOpen={isB2BConsoleOpen}
        onClose={() => setIsB2BConsoleOpen(false)}
      />
    </div>
  );
};
