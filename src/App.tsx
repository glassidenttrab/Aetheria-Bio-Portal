import React, { useState, useRef, useEffect } from 'react';
import { SaaSPlatformView } from './components/SaaSPlatformView';
import { AuthCheckoutModal } from './components/AuthCheckoutModal';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';
import { PlanPricingDetailsModal } from './components/PlanPricingDetailsModal';
import { MyResearchPortalView } from './components/MyResearchPortalView';
import { SuperAdminDashboardModal } from './components/SuperAdminDashboardModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { UserProfile, UserPlanTier, PaymentReceipt, SaasCategory } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  Brain, Bone, Smile, Stethoscope, Clock, ShieldCheck, Sparkles, User, Zap, Crown, CheckCircle2,
  DollarSign, ArrowRight, HelpCircle, Lock, KeyRound, Database, Server, Home, Info, Layers, Activity, HeartPulse, Eye, Dna,
  Globe, ChevronDown, Star, Menu, X, Headset
} from 'lucide-react';

import { useAuth } from './contexts/AuthContext';
import { fetchUserProfileDB, upsertUserProfileDB, recordSubscriptionDB } from './services/supabaseService';

const AppInner: React.FC = () => {
  const { language, setLanguage, t, supportedLanguages, currentLanguageObj } = useLanguage();
  const { user: authUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState<SaasCategory>('overview_about');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    id: 'guest',
    name: '',
    email: '',
    plan: 'free',
    institution: '',
    title: '',
    queriesRemaining: 3
  });

  // 1. Supabase DB & Auth 마운트 시 실시간 로그인 유저 프로필 동기화
  useEffect(() => {
    const syncDbUser = async () => {
      if (authUser && authUser.email) {
        const dbProfile = await fetchUserProfileDB(authUser.email);
        if (dbProfile) {
          setUser(dbProfile);
        } else {
          const defaultName = authUser.displayName || authUser.email.split('@')[0] || '';
          const newProfile: UserProfile = {
            id: authUser.uid,
            name: defaultName,
            email: authUser.email,
            plan: 'free',
            institution: '',
            title: '',
            queriesRemaining: 3
          };
          setUser(newProfile);
          await upsertUserProfileDB(newProfile);
        }
      }
    };
    syncDbUser();
  }, [authUser]);

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser(prev => {
      const nextUser = { ...prev, ...updated };
      upsertUserProfileDB({ email: nextUser.email, ...updated });
      return nextUser;
    });
  };

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCheckoutTier, setSelectedCheckoutTier] = useState<UserPlanTier>('pro');
  const [lastReceipt, setLastReceipt] = useState<PaymentReceipt | null>(null);

  const [isPrivacyTermsOpen, setIsPrivacyTermsOpen] = useState(false);
  const [privacyTermsInitialTab, setPrivacyTermsInitialTab] = useState<'privacy' | 'terms'>('privacy');

  const handleOpenPrivacyTerms = (tab: 'privacy' | 'terms') => {
    setPrivacyTermsInitialTab(tab);
    setIsPrivacyTermsOpen(true);
  };

  const handleOpenCheckout = (tier: UserPlanTier) => {
    setSelectedCheckoutTier(tier);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (newPlan: UserPlanTier, receipt: PaymentReceipt) => {
    const remaining = newPlan === 'enterprise' ? 99999 : newPlan === 'pro' ? 100 : 3;
    setUser((prev) => ({
      ...prev,
      plan: newPlan,
      queriesRemaining: remaining
    }));
    setLastReceipt(receipt);
    recordSubscriptionDB({
      email: user.email,
      tier: newPlan,
      amountUSD: receipt.amountUSD,
      isAnnual: false
    });
  };

  const categoryHeaderMeta: Record<SaasCategory, { icon: React.ReactNode; label: string }> = {
    overview_about: { icon: <Info size={16} />, label: t('nav.overview', '포털 소개 & 개요') },
    my_page: { icon: <User size={16} />, label: t('nav.mypage', '마이페이지 & 관심 보관함') },
    neurosurgery: { icon: <Brain size={16} />, label: `🧠 ${t('dept.neurosurgery', '1. 신경외과')}` },
    neurology: { icon: <Activity size={16} />, label: `⚡ ${t('dept.neurology', '2. 신경과')}` },
    orthopedics: { icon: <Bone size={16} />, label: `🦴 ${t('dept.orthopedics', '3. 정형외과')}` },
    psychiatry: { icon: <Smile size={16} />, label: `😊 ${t('dept.psychiatry', '4. 정신건강의학과')}` },
    cardiology: { icon: <HeartPulse size={16} />, label: `❤️ ${t('dept.cardiology', '5. 순환기내과')}` },
    oncology: { icon: <Stethoscope size={16} />, label: `🩺 ${t('dept.oncology', '6. 종양내과')}` },
    endocrinology: { icon: <Dna size={16} />, label: `🧬 ${t('dept.endocrinology', '7. 내분비내과')}` },
    immunology: { icon: <ShieldCheck size={16} />, label: `🛡️ ${t('dept.immunology', '8. 류마티스/면역내과')}` },
    dermatology: { icon: <Sparkles size={16} />, label: `✨ ${t('dept.dermatology', '9. 피부과')}` },
    ophthalmology: { icon: <Eye size={16} />, label: `👁️ ${t('dept.ophthalmology', '10. 안과')}` },
    longevity: { icon: <Clock size={16} />, label: `⏳ ${t('dept.longevity', '11. 안티에이징')}` }
  };
  const activeHeaderMeta = categoryHeaderMeta[activeCategory];

  const selectCategoryMobile = (cat: SaasCategory) => {
    setActiveCategory(cat);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0b1326', color: '#dae2fd', fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="app-sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${isMobileSidebarOpen ? 'open' : 'closed'}`} style={{ width: '280px', borderRight: '1px solid rgba(255, 255, 255, 0.12)', background: 'rgba(11, 19, 38, 0.95)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 1000 }}>
        
        {/* Brand Header */}
        <div style={{ padding: '20px 20px 12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(76, 215, 246, 0.12)', border: '1px solid rgba(76, 215, 246, 0.4)', color: '#4cd7f6', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
              {t('nav.badge_skills', '38 Skills Bio Portal')}
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              {t('nav.brand', 'Aetheria Bio Portal')}
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#bcc9cd', marginTop: '2px', fontFamily: 'monospace' }}>
              {t('nav.tagline', 'ALL MEDICAL SPECIALTIES AI')}
            </p>
          </div>

          <button
            className="mobile-menu-toggle-btn"
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Global Navigation Menu */}
        <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>

          <button
            onClick={() => selectCategoryMobile('overview_about')}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', whiteSpace: 'nowrap', flexShrink: 0,
              border: activeCategory === 'overview_about' ? '1px solid #4cd7f6' : '1px solid transparent',
              background: activeCategory === 'overview_about' ? 'rgba(76, 215, 246, 0.15)' : 'rgba(23, 31, 51, 0.5)',
              color: activeCategory === 'overview_about' ? '#4cd7f6' : '#dae2fd'
            }}
          >
            <Info size={16} />
            <span>{t('nav.overview', '포털 소개 & 개요')}</span>
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bcc9cd', padding: '0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('nav.dept_header', '전신 10대 의학과별 스캐너')}
          </div>

          <button onClick={() => selectCategoryMobile('neurosurgery')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'neurosurgery' ? '1px solid #4cd7f6' : '1px solid transparent', background: activeCategory === 'neurosurgery' ? 'rgba(76, 215, 246, 0.15)' : 'transparent', color: activeCategory === 'neurosurgery' ? '#4cd7f6' : '#bcc9cd', whiteSpace: 'nowrap' }}><Brain size={15} /> 🧠 {t('dept.neurosurgery', '1. 신경외과')}</button>
          <button onClick={() => selectCategoryMobile('neurology')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'neurology' ? '1px solid #4edea3' : '1px solid transparent', background: activeCategory === 'neurology' ? 'rgba(78, 222, 163, 0.15)' : 'transparent', color: activeCategory === 'neurology' ? '#4edea3' : '#bcc9cd', whiteSpace: 'nowrap' }}><Activity size={15} /> ⚡ {t('dept.neurology', '2. 신경과')}</button>
          <button onClick={() => selectCategoryMobile('orthopedics')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'orthopedics' ? '1px solid #d0bcff' : '1px solid transparent', background: activeCategory === 'orthopedics' ? 'rgba(208, 188, 255, 0.15)' : 'transparent', color: activeCategory === 'orthopedics' ? '#d0bcff' : '#bcc9cd', whiteSpace: 'nowrap' }}><Bone size={15} /> 🦴 {t('dept.orthopedics', '3. 정형외과')}</button>
          <button onClick={() => selectCategoryMobile('psychiatry')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'psychiatry' ? '1px solid #ffd700' : '1px solid transparent', background: activeCategory === 'psychiatry' ? 'rgba(255, 215, 0, 0.15)' : 'transparent', color: activeCategory === 'psychiatry' ? '#ffd700' : '#bcc9cd', whiteSpace: 'nowrap' }}><Smile size={15} /> 😊 {t('dept.psychiatry', '4. 정신건강의학과')}</button>
          <button onClick={() => selectCategoryMobile('cardiology')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'cardiology' ? '1px solid #ff6b81' : '1px solid transparent', background: activeCategory === 'cardiology' ? 'rgba(255, 99, 132, 0.15)' : 'transparent', color: activeCategory === 'cardiology' ? '#ff6b81' : '#bcc9cd', whiteSpace: 'nowrap' }}><HeartPulse size={15} /> ❤️ {t('dept.cardiology', '5. 순환기내과')}</button>
          <button onClick={() => selectCategoryMobile('oncology')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'oncology' ? '1px solid #4cd7f6' : '1px solid transparent', background: activeCategory === 'oncology' ? 'rgba(76, 215, 246, 0.15)' : 'transparent', color: activeCategory === 'oncology' ? '#4cd7f6' : '#bcc9cd', whiteSpace: 'nowrap' }}><Stethoscope size={15} /> 🩺 {t('dept.oncology', '6. 종양내과')}</button>
          <button onClick={() => selectCategoryMobile('endocrinology')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'endocrinology' ? '1px solid #4edea3' : '1px solid transparent', background: activeCategory === 'endocrinology' ? 'rgba(78, 222, 163, 0.15)' : 'transparent', color: activeCategory === 'endocrinology' ? '#4edea3' : '#bcc9cd', whiteSpace: 'nowrap' }}><Dna size={15} /> 🧬 {t('dept.endocrinology', '7. 내분비내과')}</button>
          <button onClick={() => selectCategoryMobile('immunology')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'immunology' ? '1px solid #d0bcff' : '1px solid transparent', background: activeCategory === 'immunology' ? 'rgba(208, 188, 255, 0.15)' : 'transparent', color: activeCategory === 'immunology' ? '#d0bcff' : '#bcc9cd', whiteSpace: 'nowrap' }}><ShieldCheck size={15} /> 🛡️ {t('dept.immunology', '8. 류마티스/면역내과')}</button>
          <button onClick={() => selectCategoryMobile('dermatology')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'dermatology' ? '1px solid #ffd700' : '1px solid transparent', background: activeCategory === 'dermatology' ? 'rgba(255, 215, 0, 0.15)' : 'transparent', color: activeCategory === 'dermatology' ? '#ffd700' : '#bcc9cd', whiteSpace: 'nowrap' }}><Sparkles size={15} /> ✨ {t('dept.dermatology', '9. 피부과')}</button>
          <button onClick={() => selectCategoryMobile('ophthalmology')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'ophthalmology' ? '1px solid #4cd7f6' : '1px solid transparent', background: activeCategory === 'ophthalmology' ? 'rgba(76, 215, 246, 0.15)' : 'transparent', color: activeCategory === 'ophthalmology' ? '#4cd7f6' : '#bcc9cd', whiteSpace: 'nowrap' }}><Eye size={15} /> 👁️ {t('dept.ophthalmology', '10. 안과')}</button>
          <button onClick={() => selectCategoryMobile('longevity')} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', border: activeCategory === 'longevity' ? '1px solid #4edea3' : '1px solid transparent', background: activeCategory === 'longevity' ? 'rgba(78, 222, 163, 0.15)' : 'transparent', color: activeCategory === 'longevity' ? '#4edea3' : '#bcc9cd', whiteSpace: 'nowrap' }}><Clock size={15} /> ⏳ {t('dept.longevity', '11. 안티에이징')}</button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bcc9cd', padding: '0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('nav.plan_header', 'SaaS 구독 플랜')}
          </div>

          <button
            onClick={() => handleOpenCheckout('pro')}
            style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(76, 215, 246, 0.3)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>Pro ($490{t('plan.per_month', '/월')})</span>
            <Zap size={14} color="#4cd7f6" />
          </button>

          <button
            onClick={() => handleOpenCheckout('enterprise')}
            style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(208, 188, 255, 0.3)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>Enterprise ($2,500{t('plan.per_month', '/월')})</span>
            <Crown size={14} color="#ffd700" />
          </button>
        </div>

        {/* User Account & Footer Section */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)' }}>
          <button
            onClick={() => setIsPlanDetailsOpen(true)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(76, 215, 246, 0.15)', border: '1px solid rgba(76, 215, 246, 0.5)', color: '#4cd7f6', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}
          >
            <Sparkles size={14} />
            <span>{t('nav.plan_details', '구독 혜택 & 서비스 상세')}</span>
          </button>

          <button
            onClick={() => handleOpenCheckout(user.plan === 'free' ? 'pro' : 'enterprise')}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(23, 31, 51, 0.9)', color: '#dae2fd', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px', whiteSpace: 'nowrap' }}
          >
            <KeyRound size={13} /> {t('auth.signup_checkout_cta', '회원가입 & 결제')}
          </button>
          
          <div style={{ fontSize: '0.72rem', color: '#bcc9cd', textAlign: 'center', fontWeight: 700 }}>
            Powered By <span style={{ color: '#4cd7f6', fontWeight: 900 }}>Linked Ai Oz</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="app-main-content" style={{ width: 'calc(100% - 280px)', marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <header className="header-responsive" style={{ minHeight: '64px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', background: 'rgba(11, 19, 38, 0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '16px', padding: '12px 36px', overflow: 'visible', whiteSpace: 'nowrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <button
              className="mobile-menu-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{ display: 'none', background: 'rgba(76, 215, 246, 0.15)', border: '1px solid rgba(76, 215, 246, 0.4)', color: '#4cd7f6', borderRadius: '8px', padding: '6px', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Menu size={20} />
            </button>

            <div style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(76, 215, 246, 0.4)', background: 'rgba(76, 215, 246, 0.15)', color: '#4cd7f6', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {activeHeaderMeta.icon} {activeHeaderMeta.label}
            </div>

            {activeCategory === 'overview_about' && (
              <span style={{ fontSize: '0.82rem', color: '#bcc9cd', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {t('nav.header_tagline', '전신 10대 의학과 38개 사이언스 스킬 연동 포털')}
              </span>
            )}
          </div>

          <div className="header-right-buttons" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap', justifyContent: 'flex-end', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'visible', position: 'relative' }}>

            {/* 8개 다국어 선택 Dropdown Selector (맨 앞 최상단 출력) */}
            <div ref={langDropdownRef} style={{ position: 'relative', flexShrink: 0, zIndex: 99999 }}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                style={{
                  padding: '7px 12px', borderRadius: '10px',
                  border: '1px solid rgba(76, 215, 246, 0.6)',
                  background: 'rgba(23, 31, 51, 0.95)', color: '#4cd7f6',
                  fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 14px rgba(76, 215, 246, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Globe size={15} />
                <span>{currentLanguageObj.flag} {currentLanguageObj.label}</span>
                <ChevronDown size={14} />
              </button>

              {isLangDropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: '170px',
                  background: '#0f172a', border: '1px solid rgba(76, 215, 246, 0.5)',
                  borderRadius: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(76, 215, 246, 0.25)',
                  overflow: 'hidden', zIndex: 99999, padding: '4px'
                }}>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px',
                        background: language === lang.code ? 'rgba(76, 215, 246, 0.25)' : 'transparent',
                        border: 'none', color: language === lang.code ? '#4cd7f6' : '#dae2fd',
                        fontSize: '0.85rem', fontWeight: language === lang.code ? 800 : 600,
                        textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSupportOpen(true)}
              style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(78, 222, 163, 0.5)', background: 'rgba(78, 222, 163, 0.15)', color: '#4edea3', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <Headset size={15} /> <span className="header-btn-text" style={{ whiteSpace: 'nowrap' }}>{t('support.nav_btn', '🎧 고객센터 & 1:1 문의')}</span>
            </button>

            <button
              onClick={() => setIsPlanDetailsOpen(true)}
              style={{ padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(76, 215, 246, 0.4)', background: 'rgba(76, 215, 246, 0.15)', color: '#4cd7f6', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <Sparkles size={15} /> <span className="header-btn-text" style={{ whiteSpace: 'nowrap' }}>{t('nav.plan_details', '구독 혜택 & 서비스 상세')}</span>
            </button>

            <button
              onClick={() => handleOpenCheckout('pro')}
              style={{ padding: '7px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', color: '#000', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <Zap size={15} /> <span className="header-btn-text" style={{ whiteSpace: 'nowrap' }}>{t('auth.checkout_title', '결제 및 요금제 연동')}</span>
            </button>

            <button
              onClick={() => selectCategoryMobile('my_page')}
              style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(255, 215, 0, 0.5)', background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <User size={15} /> <span className="header-btn-text" style={{ whiteSpace: 'nowrap' }}>{t('nav.mypage', '마이페이지')}</span>
            </button>
          </div>
        </header>

        <main className="app-main-padding" style={{ padding: '36px 40px', flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {activeCategory === 'my_page' ? (
            <MyResearchPortalView
              user={user}
              onUpdateUser={handleUpdateUser}
              onNavigateCategory={setActiveCategory}
              onOpenCheckout={handleOpenCheckout}
            />
          ) : (
            <SaaSPlatformView
              user={user}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onOpenCheckout={handleOpenCheckout}
              onOpenPlanDetails={() => setIsPlanDetailsOpen(true)}
            />
          )}
          
          <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: '0.85rem', color: '#bcc9cd', fontWeight: 700 }}>
            <div className="footer-links-responsive" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => setIsSupportOpen(true)} style={{ background: 'none', border: 'none', color: '#4edea3', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Headset size={14} /> {t('footer.support', '고객센터 (glassidentt.rab@gmail.com)')}
              </button>
              <span>|</span>
              <button onClick={() => handleOpenPrivacyTerms('privacy')} style={{ background: 'none', border: 'none', color: '#4cd7f6', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>{t('footer.privacy', '개인정보 처리방침')}</button>
              <span>|</span>
              <button onClick={() => handleOpenPrivacyTerms('terms')} style={{ background: 'none', border: 'none', color: '#bcc9cd', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>{t('footer.terms', '이용약관')}</button>
              <span>|</span>
              <button onClick={() => setIsSuperAdminOpen(true)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> {t('nav.admin_btn', '🛡️ 최고 관리자 관제 (Super Admin)')}
              </button>
            </div>
            {t('footer.rights', 'All Rights Reserved. Aetheria Bio Portal.')} | Powered By <span style={{ color: '#4cd7f6', fontWeight: 900 }}>Linked Ai Oz</span>
          </footer>
        </main>
      </div>

      <AuthCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        user={user}
        selectedTier={selectedCheckoutTier}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <PrivacyTermsModal
        isOpen={isPrivacyTermsOpen}
        onClose={() => setIsPrivacyTermsOpen(false)}
        initialTab={privacyTermsInitialTab}
      />

      <PlanPricingDetailsModal
        isOpen={isPlanDetailsOpen}
        onClose={() => setIsPlanDetailsOpen(false)}
        onSelectPlan={(tier) => handleOpenCheckout(tier)}
        currentPlan={user.plan}
      />

      <SuperAdminDashboardModal
        isOpen={isSuperAdminOpen}
        onClose={() => setIsSuperAdminOpen(false)}
      />

      <ContactSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
};

export default App;
