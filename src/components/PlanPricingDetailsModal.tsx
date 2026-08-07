import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserPlanTier } from '../types';
import {
  Zap, Crown, Sparkles, CheckCircle2, HelpCircle, X, ShieldCheck,
  FileText, Layers
} from 'lucide-react';

interface PlanPricingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (tier: UserPlanTier) => void;
  currentPlan?: UserPlanTier;
}

export const PlanPricingDetailsModal: React.FC<PlanPricingDetailsModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  currentPlan = 'free'
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'cards' | 'comparison' | 'faq'>('cards');
  const [isAnnual, setIsAnnual] = useState<boolean>(true); // 기본값: 연간 결제 15% 할인 적용

  if (!isOpen) return null;

  // 가격 계산 (15% 할인 적용)
  const proPrice = isAnnual ? '$416' : '$490';
  const entPrice = isAnnual ? '$2,125' : '$2,500';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(5, 10, 20, 0.92)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%', maxWidth: '1280px', maxHeight: '94vh', background: '#0b1326',
        border: '1px solid rgba(76, 215, 246, 0.4)', borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(76, 215, 246, 0.15)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', color: '#dae2fd', position: 'relative'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(11, 19, 38, 0.95) 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(76, 215, 246, 0.15)', border: '1px solid rgba(76, 215, 246, 0.4)', color: '#4cd7f6', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
              <Sparkles size={13} /> Subscription Plan Services & Benefits
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              {t('pmodal.title', '요금제별 제공 서비스 및 혜택 상세 안내')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#bcc9cd', margin: '2px 0 0 0' }}>
              {t('pmodal.subtitle', 'Pro($490/월) 및 Enterprise($2,500/월) 플랜 구독 시 제공되는 38+ 사이언스 스킬 및 AI 기능 비교')}
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

        {/* Navigation Tabs & Billing Cycle Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 28px', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, position: 'relative', zIndex: 210, flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              style={{
                padding: '7px 16px', borderRadius: '9px', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                background: activeTab === 'cards' ? '#4cd7f6' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'cards' ? '#000' : '#bcc9cd',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Layers size={14} /> {t('pmodal.tab_cards', '요금제 카드 비교 (Plans Overview)')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              style={{
                padding: '7px 16px', borderRadius: '9px', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                background: activeTab === 'comparison' ? '#4cd7f6' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'comparison' ? '#000' : '#bcc9cd',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <FileText size={14} /> {t('pmodal.tab_matrix', '상세 기능 비교표 (Feature Matrix)')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              style={{
                padding: '7px 16px', borderRadius: '9px', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                background: activeTab === 'faq' ? '#4cd7f6' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'faq' ? '#000' : '#bcc9cd',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <HelpCircle size={14} /> {t('pmodal.tab_faq', '자주 묻는 질문 (FAQ)')}
            </button>
          </div>

          {/* Billing Cycle Toggle Switch (월간 vs 연간 15% 할인) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.35)', padding: '3px 6px', borderRadius: '12px', border: '1px solid rgba(76, 215, 246, 0.3)' }}>
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              style={{
                padding: '5px 12px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
                background: !isAnnual ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: !isAnnual ? '#fff' : '#8899a6', transition: 'all 0.2s ease'
              }}
            >
              {t('pmodal.billing_monthly', '월간 결제')}
            </button>

            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              style={{
                padding: '5px 14px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '0.78rem', cursor: 'pointer',
                background: isAnnual ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : 'transparent',
                color: isAnnual ? '#000' : '#8899a6',
                display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease',
                boxShadow: isAnnual ? '0 2px 10px rgba(255, 215, 0, 0.3)' : 'none'
              }}
            >
              <Zap size={13} /> {t('pmodal.billing_annual', '연간 결제 (15% 할인 🔥)')}
            </button>
          </div>
        </div>

        {/* Scrollable Main Content (No scrollbars in normal views) */}
        <div style={{ padding: '16px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* TAB 1: CARDS OVERVIEW */}
          {activeTab === 'cards' && (
            <div>
              {/* Competitive Advantage Highlights Banner */}
              <div style={{
                marginBottom: '12px', padding: '8px 14px', borderRadius: '12px',
                background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.15) 0%, rgba(76, 215, 246, 0.15) 100%)',
                border: '1px solid rgba(234, 179, 8, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 800, color: '#facc15' }}>
                  <span>🏆 WHY US:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{t('whyus.subtitle', '글로벌 레거시 AI 바이오 플랫폼 대비 4대 독점 차별화 경쟁 우위')}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', fontWeight: 700 }}>{t('whyus.badge1', '🧬 올인원 38+ 스킬')}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', fontWeight: 700 }}>{t('whyus.badge2', '💳 파격적 투명 구독')}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.4)', fontWeight: 700 }}>{t('whyus.badge3', '🌐 8개 국어 글로벌')}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.4)', fontWeight: 700 }}>{t('whyus.badge4', '💻 개발자 API 샌드박스')}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', alignItems: 'stretch' }}>
              
              {/* CARD 1: FREE */}
              <div style={{
                background: 'rgba(23, 31, 51, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '18px', padding: '18px 18px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4edea3', background: 'rgba(78, 222, 163, 0.15)', padding: '3px 8px', borderRadius: '7px', border: '1px solid rgba(78, 222, 163, 0.3)' }}>
                      {t('pmodal.free_title', 'Free Starter')}
                    </span>
                    {currentPlan === 'free' && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#bcc9cd' }}>{t('pmodal.current_active', '현재 적용 중')}</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                    Free <span style={{ fontSize: '0.85rem', color: '#bcc9cd', fontWeight: 600 }}>/ $0</span>
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#bcc9cd', margin: '4px 0 10px 0', minHeight: '28px', lineHeight: '1.35' }}>
                    {t('pmodal.free_desc', '기초 연구자 및 포털 기본 기능을 둘러보기 위한 체험용 무료 요금제')}
                  </p>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '12px' }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4edea3" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.free_f1', '기본 단백질 3D 분자 뷰어 체험 (3Dmol)')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4edea3" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.free_f2', '전신 10대 의학과 기초 스캐닝 (일 3회 한도)')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4edea3" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.free_f3', 'PubMed 논문 3,500만 건 기본 검색')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#8899a6', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <X size={15} color="#8899a6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ textDecoration: 'line-through' }}>{t('pmodal.free_f4', 'Pro/Enterprise 정밀 AI 파이프라인 미제공')}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => { onSelectPlan('free'); onClose(); }}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255, 255, 255, 0.06)', color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                    cursor: 'pointer', marginTop: '16px'
                  }}
                >
                  {t('pmodal.free_btn', '기초 플랜 이용하기')}
                </button>
              </div>

              {/* CARD 2: PRO ($490/월 ↔ $416/월 연간할인) */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(23, 31, 51, 0.95) 0%, rgba(15, 28, 48, 0.98) 100%)',
                border: '2px solid #4cd7f6', borderRadius: '18px', padding: '18px 18px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 0 25px rgba(76, 215, 246, 0.25)', minWidth: 0
              }}>
                <div>
                  {/* Top Badge Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4cd7f6', background: 'rgba(76, 215, 246, 0.15)', padding: '3px 8px', borderRadius: '7px', border: '1px solid rgba(76, 215, 246, 0.4)' }}>
                      {t('pmodal.pro_title', 'Pro Professional')}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#000', background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', padding: '3px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Zap size={11} /> {isAnnual ? t('pmodal.save_badge', '15% 할인') : t('pmodal.pro_badge', '인기 추천')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    Pro <span style={{ fontSize: '0.9rem', color: '#4cd7f6', fontWeight: 800 }}>({proPrice} {t('plan.per_month', '/월')})</span>
                    {isAnnual && <span style={{ fontSize: '0.7rem', color: '#1bbd85', textDecoration: 'line-through' }}>$490</span>}
                  </h3>

                  <p style={{ fontSize: '0.78rem', color: '#bcc9cd', margin: '4px 0 10px 0', minHeight: '28px', lineHeight: '1.35' }}>
                    {t('pmodal.pro_desc', '개인 연구자, 대학 연구실 및 바이오 스타트업을 위한 정밀 AI 스캐닝 전문 플랜')}
                  </p>

                  <div style={{ height: '1px', background: 'rgba(76, 215, 246, 0.2)', marginBottom: '12px' }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#fff', fontWeight: 700, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4cd7f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.pro_f1', '전신 10대 의학과 AI 표적분자 정밀 스캐닝')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#fff', fontWeight: 700, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4cd7f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.pro_f2', 'AlphaFold 2억+ 3D 구조 & pLDDT 신뢰도 계산')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#fff', fontWeight: 700, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4cd7f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.pro_f3', 'ChEMBL IC50 결합력 & OpenTargets 질환 연관도')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#fff', fontWeight: 700, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4cd7f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.pro_f4', 'FTO 특허 선행 기술 침해여부 AI 심층 분석')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4cd7f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.pro_f5', '월 100회 AI 자동 분석 파이프라인 리포트 생성')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4cd7f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.pro_f6', 'OpenAlex (2.5억+) & ClinicalTrials 라이브 연동')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#4cd7f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.pro_f7', '우선 이메일 & 데이터 마이그레이션 기술 지원')}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => { onSelectPlan('pro'); onClose(); }}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', color: '#000', fontWeight: 900, fontSize: '0.9rem',
                    cursor: 'pointer', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: '0 4px 15px rgba(76, 215, 246, 0.4)'
                  }}
                >
                  <Zap size={16} /> Pro ({proPrice}{t('plan.per_month', '/월')}) {isAnnual ? t('pmodal.annual_suffix', '(연간결제)') : ''}
                </button>
              </div>

              {/* CARD 3: ENTERPRISE ($2,500/월 ↔ $2,125/월 연간할인) */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(23, 31, 51, 0.95) 0%, rgba(35, 26, 50, 0.98) 100%)',
                border: '2px solid #ffd700', borderRadius: '18px', padding: '18px 18px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 0 25px rgba(255, 215, 0, 0.2)', minWidth: 0
              }}>
                <div>
                  {/* Top Badge Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffd700', background: 'rgba(255, 215, 0, 0.15)', padding: '3px 8px', borderRadius: '7px', border: '1px solid rgba(255, 215, 0, 0.4)' }}>
                      {t('pmodal.ent_title', 'Enterprise VIP')}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#000', background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', padding: '3px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Crown size={11} /> {isAnnual ? t('pmodal.save_badge', '15% 할인') : t('pmodal.ent_badge', 'B2B 전용')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    Enterprise <span style={{ fontSize: '0.9rem', color: '#ffd700', fontWeight: 800 }}>({entPrice} {t('plan.per_month', '/월')})</span>
                    {isAnnual && <span style={{ fontSize: '0.7rem', color: '#ffaa00', textDecoration: 'line-through' }}>$2,500</span>}
                  </h3>

                  <p style={{ fontSize: '0.78rem', color: '#bcc9cd', margin: '4px 0 10px 0', minHeight: '28px', lineHeight: '1.35' }}>
                    {t('pmodal.ent_desc', '글로벌 제약사, 대형 연구소 및 B2B 생명공학 기업을 위한 최우선 맞춤 솔루션')}
                  </p>

                  <div style={{ height: '1px', background: 'rgba(255, 215, 0, 0.2)', marginBottom: '12px' }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#ffd700', fontWeight: 800, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <Crown size={15} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.ent_f0', 'Pro 플랜의 모든 기능 100% 무제한 이용')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#fff', fontWeight: 700, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.ent_f1', '무제한(99,999회+) 38+ 사이언스 스킬 파이프라인')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#fff', fontWeight: 700, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.ent_f2', '기업 전용 REST API / GraphQL SDK 엔드포인트')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#fff', fontWeight: 700, lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.ent_f3', 'SenoScan™ 항노화 및 장기 세포사멸 감사 보고서')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.ent_f4', '독점 보안 클라우드 서브넷 및 온프레미스 연동')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.ent_f5', '1:1 전담 AI 바이오 컨설턴트 및 24/7 핫라인 지원')}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#dae2fd', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      <CheckCircle2 size={15} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('pmodal.ent_f6', '맞춤형 질환/표적 데이터베이스 파이프라인 커스텀 구축')}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => { onSelectPlan('enterprise'); onClose(); }}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000', fontWeight: 900, fontSize: '0.9rem',
                    cursor: 'pointer', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                  }}
                >
                  <Crown size={16} /> Enterprise ({entPrice}{t('plan.per_month', '/월')}) {isAnnual ? t('pmodal.annual_suffix', '(연간결제)') : ''}
                </button>
              </div>

              </div>
            </div>
          )}

          {/* TAB 2: DETAILED FEATURE MATRIX */}
          {activeTab === 'comparison' && (
            <div style={{ background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                    <th style={{ padding: '12px 16px', width: '35%', color: '#fff', fontSize: '0.88rem' }}>{t('pmodal.m_h_feature', '기능 및 제공 서비스 스펙')}</th>
                    <th style={{ padding: '12px 16px', width: '20%', color: '#4edea3', textTransform: 'uppercase' }}>Free Starter ($0)</th>
                    <th style={{ padding: '12px 16px', width: '22%', color: '#4cd7f6', textTransform: 'uppercase' }}>Pro ({proPrice}) ⭐</th>
                    <th style={{ padding: '12px 16px', width: '23%', color: '#ffd700', textTransform: 'uppercase' }}>Enterprise ({entPrice}) 👑</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Category 1 */}
                  <tr style={{ background: 'rgba(76, 215, 246, 0.08)' }}>
                    <td colSpan={4} style={{ padding: '8px 16px', fontWeight: 800, color: '#4cd7f6', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('pmodal.m_cat1', '1. AI 표적분자 스캐닝 & 10대 의학과 분석')}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row1', '전신 10대 의학과 표적분자 탐색')}</td>
                    <td style={{ padding: '10px 16px', color: '#bcc9cd' }}>{t('pmodal.m_r1_free', '기초 3개 과')}</td>
                    <td style={{ padding: '10px 16px', color: '#4cd7f6', fontWeight: 800 }}>{t('pmodal.m_r1_pro', '전신 10개 과 전체')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 800 }}>{t('pmodal.m_r1_ent', '전신 10개 과 전체 + 커스텀 과')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row2', 'AlphaFold DB (2억+) 3D 구조 및 pLDDT 점수')}</td>
                    <td style={{ padding: '10px 16px', color: '#bcc9cd' }}>{t('pmodal.m_r2_free', '기본 점수만')}</td>
                    <td style={{ padding: '10px 16px', color: '#4cd7f6', fontWeight: 800 }}>{t('pmodal.m_r2_pro', '실시간 3D 정밀 시뮬레이션')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 800 }}>{t('pmodal.m_r2_ent', '고해상도 3D & 도메인 도킹')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row3', 'ChEMBL IC50 결합 친화도 예측')}</td>
                    <td style={{ padding: '10px 16px', color: '#bcc9cd' }}>{t('pmodal.m_r3_free', '제한적 상위 1개')}</td>
                    <td style={{ padding: '10px 16px', color: '#4cd7f6', fontWeight: 800 }}>{t('pmodal.m_r3_pro', '전체 억제제 결합력 계산')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 800 }}>{t('pmodal.m_r3_ent', '무제한 스크리닝 & 약물 재창출')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row4', '월 파이프라인 리포트 생성 한도')}</td>
                    <td style={{ padding: '10px 16px', color: '#bcc9cd' }}>{t('pmodal.m_r4_free', '월 3회')}</td>
                    <td style={{ padding: '10px 16px', color: '#4cd7f6', fontWeight: 800 }}>{t('pmodal.m_r4_pro', '월 100회')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 900 }}>{t('pmodal.m_r4_ent', '무제한 (99,999회+)')}</td>
                  </tr>

                  {/* Category 2 */}
                  <tr style={{ background: 'rgba(208, 188, 255, 0.08)' }}>
                    <td colSpan={4} style={{ padding: '8px 16px', fontWeight: 800, color: '#d0bcff', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('pmodal.m_cat2', '2. 라이브 빅데이터 & 특허 FTO 평가')}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row5', 'PubMed (3,500만+) & OpenAlex (2.5억+) 학술 DB')}</td>
                    <td style={{ padding: '10px 16px', color: '#bcc9cd' }}>{t('pmodal.m_r5_free', '기초 검색')}</td>
                    <td style={{ padding: '10px 16px', color: '#4cd7f6', fontWeight: 800 }}>{t('pmodal.m_r5_pro', '실시간 API 풀 연동')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 800 }}>{t('pmodal.m_r5_ent', '실시간 API 풀 연동 + 자동 요약')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row6', 'FTO (Free To Operate) 특허 침해 여부 판별')}</td>
                    <td style={{ padding: '10px 16px', color: '#8899a6' }}>{t('pmodal.m_r6_free', '미지원')}</td>
                    <td style={{ padding: '10px 16px', color: '#4cd7f6', fontWeight: 800 }}>{t('pmodal.m_r6_pro', 'AI 특허 침해 리스크 판별 포함')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 800 }}>{t('pmodal.m_r6_ent', '특허 전문 보고서 & IP 보호 가이드')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row7', 'SenoScan™ 장기 세포사멸 감사 보고서')}</td>
                    <td style={{ padding: '10px 16px', color: '#8899a6' }}>{t('pmodal.m_r7_free', '미지원')}</td>
                    <td style={{ padding: '10px 16px', color: '#bcc9cd' }}>{t('pmodal.m_r7_pro', '기본 보고서')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 800 }}>{t('pmodal.m_r7_ent', '심층 B2B 감사 보고서 무제한')}</td>
                  </tr>

                  {/* Category 3 */}
                  <tr style={{ background: 'rgba(255, 215, 0, 0.08)' }}>
                    <td colSpan={4} style={{ padding: '8px 16px', fontWeight: 800, color: '#ffd700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('pmodal.m_cat3', '3. B2B 기업 연동 & 전담 고객 지원')}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row8', '기업 전용 REST API & GraphQL SDK')}</td>
                    <td style={{ padding: '10px 16px', color: '#8899a6' }}>{t('pmodal.m_r8_free', '미지원')}</td>
                    <td style={{ padding: '10px 16px', color: '#8899a6' }}>{t('pmodal.m_r8_pro', '미지원')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 900 }}>{t('pmodal.m_r8_ent', '무제한 API 접근 제공')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row9', '보안 클라우드 서브넷 및 온프레미스 구축')}</td>
                    <td style={{ padding: '10px 16px', color: '#8899a6' }}>{t('pmodal.m_r9_free', '미지원')}</td>
                    <td style={{ padding: '10px 16px', color: '#8899a6' }}>{t('pmodal.m_r9_pro', '미지원')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 800 }}>{t('pmodal.m_r9_ent', '단독 서브넷 & 온프레미스 지원')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 16px', color: '#dae2fd' }}>{t('pmodal.m_row10', '고객 지원 (Customer Support)')}</td>
                    <td style={{ padding: '10px 16px', color: '#bcc9cd' }}>{t('pmodal.m_r10_free', '커뮤니티 지원')}</td>
                    <td style={{ padding: '10px 16px', color: '#4cd7f6', fontWeight: 800 }}>{t('pmodal.m_r10_pro', '우선 이메일 지원 (24h)')}</td>
                    <td style={{ padding: '10px 16px', color: '#ffd700', fontWeight: 900 }}>{t('pmodal.m_r10_ent', '1:1 전담 컨설턴트 & 24/7 핫라인')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'rgba(23, 31, 51, 0.8)', borderRadius: '14px', border: '1px solid rgba(76, 215, 246, 0.3)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4cd7f6', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={16} /> {t('pmodal.faq_q1', 'Q1. Pro($490/월) 결제 즉시 어떤 기능이 활성화되나요?')}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#dae2fd', margin: 0, lineHeight: '1.5' }}>
                  {t('pmodal.faq_a1', '결제가 승인되는 즉시 계정이 Pro 플랜으로 업그레이드되며, 전신 10대 의학과 AI 표적분자 정밀 스캐너, AlphaFold 3D 구조 분석, FTO 특허 판단 및 월 100회 파이프라인 리포트 생성 권한이 즉각 제공됩니다.')}
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(23, 31, 51, 0.8)', borderRadius: '14px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffd700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={16} /> {t('pmodal.faq_q2', 'Q2. Enterprise($2,500/월) 플랜의 B2B API 연동은 어떻게 진행되나요?')}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#dae2fd', margin: 0, lineHeight: '1.5' }}>
                  {t('pmodal.faq_a2', 'Enterprise 구독 후 1:1 전담 바이오 AI 엔지니어가 배정되어 24시간 이내에 기업 전용 API/GraphQL 키를 발행해 드립니다. 제약사 내부 연구 시스템이나 LIMS/ELN과의 온프레미스 커스텀 연동도 적극 지원합니다.')}
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(23, 31, 51, 0.8)', borderRadius: '14px', border: '1px solid rgba(78, 222, 163, 0.3)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4edea3', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={16} /> {t('pmodal.faq_q3', 'Q3. 환불 기준 및 무상 취소 정책은 어떻게 되나요?')}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#dae2fd', margin: 0, lineHeight: '1.5' }}>
                  {t('pmodal.faq_a3', '결제 후 7일 이내에 AI 정밀 스캐닝 및 파이프라인 크레딧을 사용하지 않은 경우 조건 없이 100% 전액 환불받으실 수 있습니다. 마이페이지에서 언제든지 매월 구독을 해지하거나 플랜을 변경할 수 있습니다.')}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Banner Action */}
        <div style={{
          padding: '14px 28px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#4edea3" />
            <span style={{ fontSize: '0.8rem', color: '#bcc9cd' }}>
              {t('pmodal.security_text', 'PayPal SSL 256-bit 암호화 결제 지원 | 7일 이내 스캔 미이용 시 100% 환불 보장')}
              {isAnnual && <span style={{ color: '#1bbd85', fontWeight: 800, marginLeft: '8px' }}>({t('pmodal.billed_annually_note', '연간 결제 시 15% 할인 적용')})</span>}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => { onSelectPlan('pro'); onClose(); }}
              style={{
                padding: '9px 18px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', color: '#000',
                fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Zap size={15} /> Pro ({proPrice}{t('plan.per_month', '/월')})
            </button>

            <button
              type="button"
              onClick={() => { onSelectPlan('enterprise'); onClose(); }}
              style={{
                padding: '9px 18px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000',
                fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Crown size={15} /> Enterprise ({entPrice}{t('plan.per_month', '/월')})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
