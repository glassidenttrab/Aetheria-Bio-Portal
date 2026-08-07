import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SuperAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminDashboardModal: React.FC<SuperAdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'b2b' | 'analytics'>('overview');
  const [userFilter, setUserFilter] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  // Mock User Subscription Database
  const [users, setUsers] = useState([
    {
      id: 'USR-9001',
      name: 'Dr. Arthur Vance',
      email: 'a.vance@novartis.com',
      org: 'Novartis R&D Institute',
      plan: 'Enterprise',
      status: 'Active',
      mrr: '$2,500',
      renewal: '2026-09-01',
      apiKey: 'deeptech_ent_live_9981a3b72c',
    },
    {
      id: 'USR-8842',
      name: 'Dr. Sarah Jenkins',
      email: 's.jenkins@pfizer.org',
      org: 'Pfizer Oncology Research',
      plan: 'Enterprise',
      status: 'Active',
      mrr: '$2,500',
      renewal: '2026-08-28',
      apiKey: 'deeptech_ent_live_8842f109de',
    },
    {
      id: 'USR-7719',
      name: 'Prof. Min-Seok Kim',
      email: 'ms.kim@snu.ac.kr',
      org: 'Seoul National University BioLab',
      plan: 'Pro',
      status: 'Active',
      mrr: '$490',
      renewal: '2026-08-15',
      apiKey: 'deeptech_pro_live_7719c281aa',
    },
    {
      id: 'USR-6520',
      name: 'Dr. Elena Rostova',
      email: 'elena@charite.de',
      org: 'Charité University Hospital Berlin',
      plan: 'Pro',
      status: 'Active',
      mrr: '$490',
      renewal: '2026-08-22',
      apiKey: 'deeptech_pro_live_6520e981bc',
    },
    {
      id: 'USR-5411',
      name: 'Kenji Takahashi',
      email: 'k.takahashi@tokyo-u.ac.jp',
      org: 'University of Tokyo Genomic Center',
      plan: 'Pro',
      status: 'Active',
      mrr: '$490',
      renewal: '2026-09-05',
      apiKey: 'deeptech_pro_live_5411a773ff',
    },
    {
      id: 'USR-3201',
      name: 'Research Assistant Lee',
      email: 'lee.research@kist.re.kr',
      org: 'KIST Bio-Medical Research Center',
      plan: 'Free',
      status: 'Active',
      mrr: '$0',
      renewal: 'N/A',
      apiKey: 'deeptech_free_demo_3201',
    },
  ]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminIdInput.trim() === 'ozpix' && adminPasswordInput === 'waps!@7102') {
      setIsLoggedIn(true);
      setAuthError(null);
      setAdminIdInput('');
      setAdminPasswordInput('');
    } else {
      setAuthError('❌ 아이디 또는 비밀번호가 올바르지 않습니다. (ID: ozpix / PW: waps!@7102)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthError(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesFilter =
      userFilter === 'all' || u.plan.toLowerCase() === userFilter.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.org.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTriggerAction = (msg: string) => {
    setSystemNotice(msg);
    setTimeout(() => setSystemNotice(null), 4000);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u
      )
    );
    handleTriggerAction(t('admin.action_user_updated', '회원 상태 및 접근 권한이 변경되었습니다.'));
  };

  // IF NOT LOGGED IN: SHOW ADMIN LOGIN FORM
  if (!isLoggedIn) {
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
              {t('admin.login_subtitle', '통합 관제 콘솔에 접근하려면 최고 관리자 계정으로 로그인하세요.')}
            </p>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '18px',
                textAlign: 'center',
              }}
            >
              {authError}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                관리자 아이디 (Admin ID)
              </label>
              <input
                type="text"
                required
                placeholder="아이디를 입력하세요 (ozpix)"
                value={adminIdInput}
                onChange={(e) => setAdminIdInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                관리자 비밀번호 (Admin Password)
              </label>
              <input
                type="password"
                required
                placeholder="비밀번호를 입력하세요"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '8px',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              🔓 {t('admin.btn_login', '어드민 인증 및 관제 접속')}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
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

  // IF LOGGED IN: SHOW FULL SUPER ADMIN DASHBOARD
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
                  {t('admin.modal_title', 'Aetheria Bio Portal - 최고 관리자 통합 관제 대시보드')}
                </h2>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#4ade80',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}
                >
                  LOGGED IN: ozpix
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                {t(
                  'admin.modal_subtitle',
                  '실시간 B2B 회원 현황, MRR 매출, API 키 할당량, GPU 인스턴스 부하 및 38개 스킬 감사 로그 모니터링'
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleLogout}
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
              🔒 {t('admin.logout', '로그아웃')}
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
            <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>SYSTEM LOG UPDATED</span>
          </div>
        )}

        {/* Tab Navigation Navigation Bar */}
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
              borderBottom:
                activeTab === 'overview'
                  ? '3px solid #38bdf8'
                  : '3px solid transparent',
              color: activeTab === 'overview' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'overview' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            📊 {t('admin.tab_overview', '포털 종합 현황 & MRR 매출')}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'users'
                  ? '3px solid #38bdf8'
                  : '3px solid transparent',
              color: activeTab === 'users' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'users' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            👥 {t('admin.tab_users', '전체 회원 & 구독 현황 관리')}
          </button>

          <button
            onClick={() => setActiveTab('b2b')}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'b2b' ? '3px solid #38bdf8' : '3px solid transparent',
              color: activeTab === 'b2b' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'b2b' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            🔑 {t('admin.tab_b2b', 'B2B API 키 & VPC 단독 관제')}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'analytics'
                  ? '3px solid #38bdf8'
                  : '3px solid transparent',
              color: activeTab === 'analytics' ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === 'analytics' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            📈 {t('admin.tab_analytics', '38개 스킬 쿼리 & 감사 로그')}
          </button>
        </div>

        {/* Tab Body Content */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === 'overview' && (
            <div>
              {/* 4 Summary Stat Cards */}
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
                    {t('admin.mrr_label', '월간 반복 매출 (MRR)')}
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#38bdf8',
                      margin: '6px 0',
                    }}
                  >
                    $175,160 <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>+18.4% ↑</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Pro ($490) x 184 + Enterprise ($2,500) x 34
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
                    1,428 명
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Free 1,210 | Pro 184 | Enterprise 34
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
                    {t('admin.gpu_label', 'GPU 연산 클러스터 부하')}
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#c084fc',
                      margin: '6px 0',
                    }}
                  >
                    34% <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>NORMAL</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    NVIDIA A10G (24GB VRAM) x 4 노드 가동 중
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
                    {t('admin.sla_label', 'API 게이트웨이 SLA & 지연')}
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#4ade80',
                      margin: '6px 0',
                    }}
                  >
                    99.99% <span style={{ fontSize: '0.85rem', color: '#38bdf8' }}>42ms</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    FastAPI + Redis 캐시 미들웨어 정상 가동
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
                  ⚡ {t('admin.quick_actions_title', '관리자 긴급 시스템 제어 콘솔 (Quick Actions)')}
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() =>
                      handleTriggerAction(
                        t('admin.act_metrics_refreshed', '실시간 시스템 스펙 및 GPU 메트릭이 동기화되었습니다.')
                      )
                    }
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
                    🔄 {t('admin.btn_refresh_metrics', '실시간 메트릭 동기화')}
                  </button>

                  <button
                    onClick={() =>
                      handleTriggerAction(
                        t('admin.act_redis_flushed', 'Redis 캐시 및 토큰 버킷 쿼리가 초기화되었습니다.')
                      )
                    }
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
                    🧹 {t('admin.btn_flush_cache', 'Redis API 캐시 강제 플러시')}
                  </button>

                  <button
                    onClick={() =>
                      handleTriggerAction(
                        t('admin.act_audit_downloaded', '전체 시스템 감사 로그(JSON)가 다운로드되었습니다.')
                      )
                    }
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      background: 'rgba(168, 85, 247, 0.15)',
                      color: '#c084fc',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    📥 {t('admin.btn_download_logs', '전체 시스템 감사 로그 백업')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER & SUBSCRIPTION MANAGEMENT */}
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
                      <th style={{ padding: '14px 18px' }}>연구원 식별 ID</th>
                      <th style={{ padding: '14px 18px' }}>연구원 성명 / 이메일</th>
                      <th style={{ padding: '14px 18px' }}>소속 제약사/연구소</th>
                      <th style={{ padding: '14px 18px' }}>구독 플랜</th>
                      <th style={{ padding: '14px 18px' }}>월 결제액</th>
                      <th style={{ padding: '14px 18px' }}>상태</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>관리 제어</th>
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
                        <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#94a3b8' }}>
                          {u.id}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{u.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{u.org}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              background:
                                u.plan === 'Enterprise'
                                  ? 'rgba(234, 179, 8, 0.2)'
                                  : u.plan === 'Pro'
                                  ? 'rgba(56, 189, 248, 0.2)'
                                  : 'rgba(148, 163, 184, 0.2)',
                              border:
                                u.plan === 'Enterprise'
                                  ? '1px solid rgba(234, 179, 8, 0.4)'
                                  : u.plan === 'Pro'
                                  ? '1px solid rgba(56, 189, 248, 0.4)'
                                  : '1px solid rgba(148, 163, 184, 0.4)',
                              color:
                                u.plan === 'Enterprise'
                                  ? '#facc15'
                                  : u.plan === 'Pro'
                                  ? '#38bdf8'
                                  : '#cbd5e1',
                            }}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#4ade80' }}>
                          {u.mrr}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              color: u.status === 'Active' ? '#4ade80' : '#ef4444',
                              fontWeight: 700,
                            }}
                          >
                            ● {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            onClick={() => toggleUserStatus(u.id)}
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
                            {u.status === 'Active' ? '접근 정지' : '접근 승인'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: B2B API KEY & VPC INFRASTRUCTURE */}
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
                      🔑 Enterprise B2B 전용 API Key & VPC 서브넷 수동 제어
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                      신규 B2B 제약사 전용 API Key 생성, 유효기간 제어 및 AWS 단독 가상망 프로비저닝
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleTriggerAction(
                        t('admin.act_b2b_key_generated', '신규 B2B 라이브 API Key (deeptech_ent_live_new)가 발급되었습니다.')
                      )
                    }
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
                {users
                  .filter((u) => u.plan === 'Enterprise')
                  .map((b) => (
                    <div
                      key={b.id}
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
                          🏢 {b.org} ({b.name})
                        </div>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            color: '#38bdf8',
                            fontFamily: 'monospace',
                            margin: '4px 0',
                          }}
                        >
                          API Key: {b.apiKey}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Rate Limit: 1,000 req/min | AWS Subnet: VPC-US-EAST-88219 (ACTIVE)
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() =>
                            handleTriggerAction(
                              `${b.org}의 VPC 서브넷 재배포가 실행되었습니다.`
                            )
                          }
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🌐 VPC 재배포
                        </button>
                        <button
                          onClick={() =>
                            handleTriggerAction(
                              `${b.org}의 API Key가 폐기(Revoke)되었습니다.`
                            )
                          }
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
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: 38 SKILLS QUERY ANALYTICS & AUDIT LOGS */}
          {activeTab === 'analytics' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#38bdf8', fontWeight: 800 }}>
                📈 실시간 38개 사이언스 스킬 호출 순위 & 시스템 감사 로그
              </h3>

              {/* Skills Invocation Ranking Progress Bars */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '28px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {[
                  { name: '1. AlphaFold 3D 구조 예측', count: '14,200 reqs', pct: 90, color: '#38bdf8' },
                  { name: '2. OpenTargets 질환-표적 연관성', count: '9,850 reqs', pct: 68, color: '#facc15' },
                  { name: '3. ChEMBL IC50 결합친화도', count: '8,120 reqs', pct: 55, color: '#c084fc' },
                  { name: '4. FTO 특허 침해 정밀 감사', count: '5,400 reqs', pct: 38, color: '#4ade80' },
                  { name: '5. SenoScan™ 세포사멸 시뮬레이션', count: '3,900 reqs', pct: 28, color: '#f43f5e' },
                ].map((s) => (
                  <div key={s.name}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>{s.name}</span>
                      <span style={{ color: s.color, fontWeight: 800 }}>{s.count}</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${s.pct}%`,
                          background: s.color,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

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
                }}
              >
                <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  [SYSTEM AUDIT STREAM] Live tailing...
                </div>
                <div>[2026-08-07 02:20:01] INFO  - Admin Session Auth OK (User: ozpix)</div>
                <div>[2026-08-07 02:16:01] INFO  - API Gateway 200 OK (POST /api/v1/alphafold/3d) - 42ms</div>
                <div>[2026-08-07 02:15:44] INFO  - B2B Rate-Limiter Check Passed (Novartis R&D) - 1,000/min</div>
                <div>[2026-08-07 02:14:12] AUDIT - SenoScan Report PDF Rendered (ID: AUDIT-2026-9912)</div>
                <div>[2026-08-07 02:12:05] WARN  - Redis Cache Miss for Uniprot P00533 (Querying Ensembl DB)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
