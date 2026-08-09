import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  fetchSubscriptionsDB,
  fetchApiKeysDB,
  fetchSkillAuditLogsDB,
  createApiKeyDB,
  deleteApiKeyDB,
  SubscriptionItem,
  ApiKeyItem,
  SkillAuditLogItem
} from '../services/supabaseService';

interface SuperAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 실제 Supabase Auth 로그인 세션에서 확인된 이메일. 관리자 화이트리스트(VITE_ADMIN_EMAILS)에
  // 포함된 계정으로 로그인한 경우에만 마스터 콘솔 접근이 허용된다 (하드코딩 ID/PW 완전 제거).
  adminEmail: string | null;
}

export const SuperAdminDashboardModal: React.FC<SuperAdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminEmail,
}) => {
  const { t } = useLanguage();

  const allowedAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAuthorized = Boolean(adminEmail && allowedAdminEmails.includes(adminEmail.toLowerCase()));

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'b2b' | 'analytics'>('overview');
  const [userFilter, setUserFilter] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  // Live Supabase DB State
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbSubscriptions, setDbSubscriptions] = useState<SubscriptionItem[]>([]);
  const [dbApiKeys, setDbApiKeys] = useState<ApiKeyItem[]>([]);
  const [dbAuditLogs, setDbAuditLogs] = useState<SkillAuditLogItem[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState<boolean>(false);

  // Load Real Supabase DB Data
  const loadSuperAdminData = async () => {
    setIsLoadingDB(true);
    try {
      // 1. Fetch Users
      const { data: usersData, error: usersErr } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!usersErr && usersData) {
        setDbUsers(usersData);
      }

      // 2. Fetch Subscriptions
      const subs = await fetchSubscriptionsDB();
      setDbSubscriptions(subs);

      // 3. Fetch API Keys
      const keys = await fetchApiKeysDB();
      setDbApiKeys(keys);

      // 4. Fetch Skill Audit Logs
      const logs = await fetchSkillAuditLogsDB();
      setDbAuditLogs(logs);
    } catch (err) {
      console.error('[SuperAdmin DB Sync Error]', err);
    } finally {
      setIsLoadingDB(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthorized) {
      loadSuperAdminData();
    }
  }, [isOpen, isAuthorized]);

  if (!isOpen) return null;

  const handleTriggerAction = (msg: string) => {
    setSystemNotice(msg);
    setTimeout(() => setSystemNotice(null), 4000);
  };

  const toggleUserStatus = async (id: string, currentPlan: string) => {
    try {
      const nextPlan = currentPlan === 'suspended' ? 'free' : 'suspended';
      await supabase.from('users').update({ plan: nextPlan }).eq('id', id);
      await loadSuperAdminData();
      handleTriggerAction(t('admin.action_user_updated', '회원 상태 및 접근 권한이 최신 반영되었습니다.'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewApiKey = async () => {
    const orgName = prompt('B2B 제약사/기관명을 입력하세요:', 'Aetheria Bio Partner Institute');
    if (!orgName) return;
    const newKey = await createApiKeyDB({
      company_name: orgName,
      key_name: `${orgName} Live Key`,
      api_key_hash: `deeptech_live_key_${Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')}`,
      rate_limit_per_min: 1000,
      allowed_ip_range: '0.0.0.0/0'
    });
    if (newKey) {
      await loadSuperAdminData();
      handleTriggerAction(`신규 B2B API Key (${newKey.key_name})가 Supabase DB에 실시간 생성되었습니다.`);
    }
  };

  const handleDeleteApiKey = async (id: string, name: string) => {
    if (!confirm(`${name} API Key를 정말 폐기하시겠습니까?`)) return;
    await deleteApiKeyDB(id);
    await loadSuperAdminData();
    handleTriggerAction(`${name} API Key가 폐기(Revoke)되었습니다.`);
  };

  // Calculating Live DB Metrics
  const calculatedMRR = dbSubscriptions.reduce((sum, s) => sum + (Number(s.amount_usd) || 0), 0);
  const totalUserCount = dbUsers.length;
  const proUserCount = dbUsers.filter((u) => (u.plan || '').toLowerCase() === 'pro').length;
  const entUserCount = dbUsers.filter((u) => (u.plan || '').toLowerCase() === 'enterprise').length;
  const freeUserCount = Math.max(0, totalUserCount - proUserCount - entUserCount);

  const filteredUsers = dbUsers.filter((u) => {
    const userPlan = (u.plan || 'free').toLowerCase();
    const matchesFilter = userFilter === 'all' || userPlan === userFilter.toLowerCase();
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.institution || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // IF NOT AN AUTHORIZED ADMIN ACCOUNT: SHOW ACCESS-DENIED / GUIDANCE SCREEN
  if (!isAuthorized) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 10, 20, 0.92)',
          backdropFilter: 'blur(16px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'linear-gradient(145deg, #0b1329 0%, #0f172a 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.2)',
            padding: '32px 28px',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Login Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 14px auto',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
              }}
            >
              🛡️
            </div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              {t('admin.login_title', 'Aetheria Bio Portal - 최고 관리자 인증')}
            </h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
              {t('admin.login_subtitle', '마스터 콘솔은 관리자로 등록된 계정으로 로그인한 경우에만 접근할 수 있습니다.')}
            </p>
          </div>

          {/* Access Denied Banner */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '18px',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {adminEmail
              ? `❌ 현재 로그인된 계정(${adminEmail})은 관리자 권한이 없습니다.`
              : '❌ 로그인이 필요합니다. 관리자로 등록된 계정으로 먼저 로그인해주세요.'}
          </div>

          <div style={{ marginTop: '4px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ✕ {t('admin.cancel', '취소하고 포털로 돌아가기')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // IF LOGGED IN: SHOW FULL SUPER ADMIN DASHBOARD WITH LIVE SUPABASE DB
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="modal-container-responsive"
        style={{
          width: '100%',
          maxWidth: '1320px',
          maxHeight: '92vh',
          background: 'linear-gradient(145deg, #0b1329 0%, #0f172a 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '20px 28px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
              }}
            >
              🛡️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t('admin.modal_title', 'Aetheria Bio Portal - 마스터 콘솔 (Master Console)')}
                </h2>
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                  LIVE DB OK
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Supabase PostgreSQL 4대 마스터 테이블 실시간 통신 동기화 완료
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={loadSuperAdminData}
              disabled={isLoadingDB}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              {isLoadingDB ? '⏳ DB 로딩 중...' : '🔄 DB 새로고침'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              🔒 {t('admin.close_console', '콘솔 닫기')}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                borderRadius: '10px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease',
              }}
            >
              ✕ {t('admin.close', '닫기')}
            </button>
          </div>
        </div>

        {/* System Action Notice Banner */}
        {systemNotice && (
          <div
            style={{
              padding: '10px 24px',
              background: 'rgba(34, 197, 94, 0.15)',
              borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>✅ {systemNotice}</span>
            <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>SUPABASE DB LOG UPDATED</span>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div
          className="modal-tab-header-responsive"
          style={{
            padding: '0 28px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '3px solid #38bdf8' : '3px solid transparent',
              color: activeTab === 'overview' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'overview' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📊 {t('admin.tab_overview', '포털 실시간 현황 & MRR 매출')}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #38bdf8' : '3px solid transparent',
              color: activeTab === 'users' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'users' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            👥 {t('admin.tab_users', '실시간 DB 회원 목록')} ({totalUserCount})
          </button>

          <button
            onClick={() => setActiveTab('b2b')}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'b2b' ? '3px solid #38bdf8' : '3px solid transparent',
              color: activeTab === 'b2b' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'b2b' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🔑 {t('admin.tab_b2b', 'B2B API Key 연동')} ({dbApiKeys.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'analytics' ? '3px solid #38bdf8' : '3px solid transparent',
              color: activeTab === 'analytics' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'analytics' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📈 {t('admin.tab_analytics', '스킬 감사 로그')} ({dbAuditLogs.length})
          </button>
        </div>

        {/* Tab Body Content */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === 'overview' && (
            <div>
              {/* 4 Summary Stat Cards with Real DB Values */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '18px',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                    {t('admin.mrr_label', '실시간 정기구독 매출 (MRR)')}
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#38bdf8',
                      margin: '6px 0',
                    }}
                  >
                    ${calculatedMRR.toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>LIVE DB</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    PayPal 승인 영수증 {dbSubscriptions.length}건 합산
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                    {t('admin.members_label', '전체 가입 연구진 수')}
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#facc15',
                      margin: '6px 0',
                    }}
                  >
                    {totalUserCount} 명
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Free {freeUserCount} | Pro {proUserCount} | Enterprise {entUserCount}
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                    {t('admin.gpu_label', '발급된 B2B API Key 수')}
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#c084fc',
                      margin: '6px 0',
                    }}
                  >
                    {dbApiKeys.length} 개 <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>ACTIVE</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Supabase api_keys 테이블 연동
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                    {t('admin.sla_label', 'AI 스캐닝 감사 로그')}
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#4ade80',
                      margin: '6px 0',
                    }}
                  >
                    {dbAuditLogs.length} 건 <span style={{ fontSize: '0.85rem', color: '#38bdf8' }}>LOGGED</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    skill_audit_logs DB 실시간 연동
                  </div>
                </div>
              </div>

              {/* Infrastructure Control Panel */}
              <div
                style={{
                  padding: '22px',
                  borderRadius: '18px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '24px',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 16px 0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                  }}
                >
                  ⚡ {t('admin.quick_actions_title', '관리자 시스템 제어 및 DB 수동 동기화')}
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={loadSuperAdminData}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    🔄 Supabase DB 실시간 최신화
                  </button>

                  <button
                    onClick={handleCreateNewApiKey}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      background: 'rgba(234, 179, 8, 0.15)',
                      color: '#facc15',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    🔑 신규 B2B API Key 발급
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div>
              {/* Filter & Search Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['all', 'free', 'pro', 'enterprise'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setUserFilter(f)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border:
                          userFilter === f
                            ? '1px solid #38bdf8'
                            : '1px solid rgba(255, 255, 255, 0.15)',
                        background:
                          userFilter === f
                            ? 'rgba(56, 189, 248, 0.2)'
                            : 'rgba(15, 23, 42, 0.6)',
                        color: userFilter === f ? '#38bdf8' : '#cbd5e1',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {f === 'all'
                        ? '전체 회원'
                        : f === 'free'
                        ? 'Free Starter'
                        : f === 'pro'
                        ? 'Pro ($490)'
                        : 'Enterprise ($2,500)'}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder={t('admin.search_placeholder', '연구원 이름, 소속기관, 이메일 검색...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    width: '280px',
                  }}
                />
              </div>

              {/* Users Data Table */}
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(15, 23, 42, 0.6)',
                }}
              >
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    등록된 유저 데이터가 존재하지 않거나 조건에 맞는 회원이 없습니다.
                  </div>
                ) : (
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: 'rgba(30, 41, 59, 0.9)',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#94a3b8',
                        }}
                      >
                        <th style={{ padding: '14px 18px' }}>연구원 ID</th>
                        <th style={{ padding: '14px 18px' }}>성함 / 이메일</th>
                        <th style={{ padding: '14px 18px' }}>소속기관 / 직함</th>
                        <th style={{ padding: '14px 18px' }}>구독 플랜</th>
                        <th style={{ padding: '14px 18px' }}>잔여 쿼리</th>
                        <th style={{ padding: '14px 18px' }}>상태</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right' }}>권한 제어</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background 0.2s ease',
                          }}
                        >
                          <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.75rem' }}>
                            {u.id.substring(0, 8)}...
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>{u.name || '미등록 연구원'}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                            <div>{u.institution || '소속 미입력'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.title || '-'}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                background:
                                  u.plan === 'enterprise'
                                    ? 'rgba(234, 179, 8, 0.2)'
                                    : u.plan === 'pro'
                                    ? 'rgba(56, 189, 248, 0.2)'
                                    : 'rgba(148, 163, 184, 0.2)',
                                border:
                                  u.plan === 'enterprise'
                                    ? '1px solid rgba(234, 179, 8, 0.4)'
                                    : u.plan === 'pro'
                                    ? '1px solid rgba(56, 189, 248, 0.4)'
                                    : '1px solid rgba(148, 163, 184, 0.4)',
                                color:
                                  u.plan === 'enterprise'
                                    ? '#facc15'
                                    : u.plan === 'pro'
                                    ? '#38bdf8'
                                    : '#cbd5e1',
                              }}
                            >
                              {u.plan || 'free'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 800, color: '#4ade80' }}>
                            {u.queries_remaining ?? 3} 회
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                color: u.plan !== 'suspended' ? '#4ade80' : '#ef4444',
                                fontWeight: 700,
                              }}
                            >
                              ● {u.plan !== 'suspended' ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <button
                              onClick={() => toggleUserStatus(u.id, u.plan)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: '#cbd5e1',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              {u.plan !== 'suspended' ? '접근 정지' : '접근 승인'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: B2B API KEY MANAGEMENT */}
          {activeTab === 'b2b' && (
            <div>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#facc15', fontWeight: 800 }}>
                      🔑 Enterprise B2B 전용 API Key 관리 (Supabase api_keys 연동)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                      B2B 제약사 API Key 발급, Rate Limit 할당 및 폐기 CRUD
                    </p>
                  </div>
                  <button
                    onClick={handleCreateNewApiKey}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                      color: '#0f172a',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)',
                    }}
                  >
                    ➕ 신규 B2B API Key 발급
                  </button>
                </div>
              </div>

              {/* Active B2B Enterprise Client List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {dbApiKeys.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    현재 생성된 B2B API Key가 없습니다. 상단 [신규 B2B API Key 발급] 버튼을 눌러 생성하세요.
                  </div>
                ) : (
                  dbApiKeys.map((key) => (
                    <div
                      key={key.id}
                      style={{
                        padding: '18px 22px',
                        borderRadius: '14px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                          🏢 {key.company_name} ({key.key_name})
                        </div>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            color: '#38bdf8',
                            fontFamily: 'monospace',
                            margin: '4px 0',
                          }}
                        >
                          Key ID: {key.id}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Rate Limit: {key.rate_limit_per_min || 1000} req/min | Allowed IP: {key.allowed_ip_range || '0.0.0.0/0'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleDeleteApiKey(key.id || '', key.key_name)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#fca5a5',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🚫 Key 폐기
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS STREAM */}
          {activeTab === 'analytics' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#38bdf8', fontWeight: 800 }}>
                📈 Supabase DB 실시간 감사 로그 (skill_audit_logs Stream)
              </h3>

              {/* System Audit Trail Stream */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: '#090d16',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#4ade80',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  maxHeight: '420px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  [SUPABASE AUDIT STREAM] Tailing latest entries ({dbAuditLogs.length} total)...
                </div>

                {dbAuditLogs.length === 0 ? (
                  <div style={{ color: '#64748b' }}>[NOTICE] No audit logs recorded yet in Supabase DB.</div>
                ) : (
                  dbAuditLogs.map((log) => (
                    <div key={log.id} style={{ marginBottom: '6px' }}>
                      <span style={{ color: '#94a3b8' }}>[{new Date(log.created_at || Date.now()).toLocaleString()}]</span>{' '}
                      <span style={{ color: '#38bdf8' }}>[{log.category || 'SKILL'}]</span>{' '}
                      <span style={{ color: '#facc15' }}>{log.skill_name}</span> - Target: {log.query_target} ({log.execution_time_ms}ms)
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
