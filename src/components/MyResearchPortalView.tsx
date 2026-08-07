import React, { useState, useEffect } from 'react';
import { UserProfile, UserPlanTier, SaasCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  User, ShieldCheck, Crown, Zap, Mail, Building, Building2, Award, Star, Trash2, ArrowRight, Clock, KeyRound, Save, Check, RefreshCw
} from 'lucide-react';
import { EnterpriseB2BConsoleModal } from './EnterpriseB2BConsoleModal';
import { fetchSkillAuditLogsDB, upsertUserProfileDB, SkillAuditLogItem } from '../services/supabaseService';

interface MyResearchPortalViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigateCategory: (cat: SaasCategory) => void;
  onOpenCheckout: (tier: UserPlanTier) => void;
}

export const MyResearchPortalView: React.FC<MyResearchPortalViewProps> = ({
  user,
  onUpdateUser,
  onNavigateCategory,
  onOpenCheckout
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'vault' | 'history' | 'billing'>('profile');
  const [isB2BConsoleOpen, setIsB2BConsoleOpen] = useState(false);
  const [dbAuditLogs, setDbAuditLogs] = useState<SkillAuditLogItem[]>([]);

  // User Edit State
  const [nameInput, setNameInput] = useState(user.name);
  const [institutionInput, setInstitutionInput] = useState(user.institution || '');
  const [titleInput, setTitleInput] = useState(user.title || '');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    setNameInput(user.name);
    setInstitutionInput(user.institution || '');
    setTitleInput(user.title || '');
  }, [user]);

  // Sync Supabase Audit Logs
  useEffect(() => {
    fetchSkillAuditLogsDB().then(logs => {
      if (logs && logs.length > 0) {
        setDbAuditLogs(logs);
        console.log('Supabase Audit Logs Synced:', logs.length);
      }
    });
  }, []);

  // Saved Target Vault State
  const [vaultTargets, setVaultTargets] = useState<{ key: string; name: string; symbol: string; dept: string; deptKey: SaasCategory }[]>(() => {
    try {
      const stored = localStorage.getItem('aetheria_target_vault');
      if (!stored) return [];
      const keys: string[] = JSON.parse(stored);

      const detailMap: Record<string, { name: string; symbol: string; dept: string; deptKey: SaasCategory }> = {
        TAU: { name: 'Microtubule-Associated Protein Tau', symbol: 'MAPT', dept: '신경외과', deptKey: 'neurosurgery' },
        SNCA: { name: 'Alpha-Synuclein Lewy Body Target', symbol: 'SNCA', dept: '신경과', deptKey: 'neurology' },
        MMP13: { name: 'Matrix Metalloproteinase-13', symbol: 'MMP13', dept: '정형외과', deptKey: 'orthopedics' },
        HTR2A: { name: '5-Hydroxytryptamine Receptor 2A', symbol: 'HTR2A', dept: '정신건강의학과', deptKey: 'psychiatry' },
        PCSK9: { name: 'Proprotein Convertase Subtilisin 9', symbol: 'PCSK9', dept: '순환기내과', deptKey: 'cardiology' },
        PDL1: { name: 'Programmed Death-Ligand 1', symbol: 'CD274', dept: '종양내과', deptKey: 'oncology' },
        GLP1R: { name: 'GLP-1 Receptor Metabolic Target', symbol: 'GLP1R', dept: '내분비내과', deptKey: 'endocrinology' },
        TNF: { name: 'Tumor Necrosis Factor Alpha', symbol: 'TNF', dept: '류마티스내과', deptKey: 'immunology' },
        COL1A1: { name: 'Collagen Type I Alpha 1', symbol: 'COL1A1', dept: '피부과', deptKey: 'dermatology' },
        VEGFA: { name: 'Vascular Endothelial Growth Factor A', symbol: 'VEGFA', dept: '안과', deptKey: 'ophthalmology' },
        SIRT1: { name: 'Sirtuin 1 Longevity Enzyme', symbol: 'SIRT1', dept: '안티에이징', deptKey: 'longevity' }
      };

      return keys.map(k => ({
        key: k,
        name: detailMap[k]?.name || `${k} Protein Target`,
        symbol: detailMap[k]?.symbol || k,
        dept: detailMap[k]?.dept || '생의학',
        deptKey: detailMap[k]?.deptKey || 'neurosurgery'
      })) as any;
    } catch {
      return [];
    }
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: nameInput,
      institution: institutionInput,
      title: titleInput
    });

    // Save to Supabase PostgreSQL DB Users Table
    await upsertUserProfileDB({
      email: user.email,
      name: nameInput,
      institution: institutionInput,
      title: titleInput,
      plan: user.plan,
      queriesRemaining: user.queriesRemaining
    });

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleRemoveVaultItem = (keyToRemove: string) => {
    const updated = vaultTargets.filter(t => t.key !== keyToRemove);
    setVaultTargets(updated);
    try {
      const keys = updated.map(u => u.key);
      localStorage.setItem('aetheria_target_vault', JSON.stringify(keys));
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Header Card */}
      <div className="glass-panel p-8" style={{ border: '1px solid rgba(76, 215, 246, 0.3)', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 19, 38, 0.98) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '1.8rem'
            }}>
              {user.name ? user.name.charAt(0) : <User size={32} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  {user.name || '성함 미설정 연구자'}
                </h2>
                {user.plan === 'enterprise' ? (
                  <span className="badge badge-gold" style={{ fontWeight: 800 }}><Crown size={14} /> Enterprise VIP</span>
                ) : user.plan === 'pro' ? (
                  <span className="badge badge-cyan" style={{ fontWeight: 800 }}><Zap size={14} /> Pro Member</span>
                ) : (
                  <span className="badge badge-purple" style={{ fontWeight: 800 }}>Free Starter Tier</span>
                )}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#bcc9cd', margin: 0, marginTop: '4px' }}>
                {user.title || user.institution ? `${user.title || ''} ${user.institution ? `@ ${user.institution}` : ''}` : '프로필 탭에서 연구자 정보를 등록해 보세요'} ({user.email || '등록 이메일 없음'})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>itution || 'Aetheria BioTech Institute'} ({user.email})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {user.plan === 'free' && (
              <button
                onClick={() => onOpenCheckout('pro')}
                style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', color: '#000', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Zap size={16} /> Pro ($490) 업그레이드
              </button>
            )}
            {user.plan === 'enterprise' && (
              <button
                onClick={() => setIsB2BConsoleOpen(true)}
                style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.4)', background: 'rgba(255, 215, 0, 0.12)', color: '#ffd700', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Building2 size={16} /> Enterprise B2B 콘솔
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '28px', paddingTop: '16px', gap: '12px', flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 20px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              border: activeTab === 'profile' ? '1px solid rgba(76, 215, 246, 0.6)' : '1px solid transparent',
              background: activeTab === 'profile' ? 'rgba(76, 215, 246, 0.15)' : 'transparent',
              color: activeTab === 'profile' ? '#4cd7f6' : '#8899a6', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <User size={18} /> {t('mypage.tab_profile', '연구자 프로필 관리')}
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            style={{
              padding: '10px 20px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              border: activeTab === 'vault' ? '1px solid rgba(255, 215, 0, 0.6)' : '1px solid transparent',
              background: activeTab === 'vault' ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
              color: activeTab === 'vault' ? '#ffd700' : '#8899a6', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Star size={18} /> {t('mypage.tab_vault', '관심 표적 보관함')} ({vaultTargets.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '10px 20px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              border: activeTab === 'history' ? '1px solid rgba(78, 222, 163, 0.6)' : '1px solid transparent',
              background: activeTab === 'history' ? 'rgba(78, 222, 163, 0.15)' : 'transparent',
              color: activeTab === 'history' ? '#4edea3' : '#8899a6', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Clock size={18} /> {t('mypage.tab_history', 'AI 스캐닝 활동 기록')}
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            style={{
              padding: '10px 20px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              border: activeTab === 'billing' ? '1px solid rgba(208, 188, 255, 0.6)' : '1px solid transparent',
              background: activeTab === 'billing' ? 'rgba(208, 188, 255, 0.15)' : 'transparent',
              color: activeTab === 'billing' ? '#d0bcff' : '#8899a6', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <KeyRound size={18} /> {t('mypage.tab_billing', '구독 & 결제 관리')}
          </button>
        </div>
      </div>

      {/* Tab Content 1: Profile Edit */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-8" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.9)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={22} color="#4cd7f6" /> {t('mypage.edit_title', '연구자 인적사항 및 소속 수정')}
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                연구자 성함 (Full Name)
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="예: 김승우 박사 / Dr. Seung-Woo Kim"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(76, 215, 246, 0.3)', color: '#ffffff', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                소속 연구 기관 / 대학 / 기업명
              </label>
              <input
                type="text"
                value={institutionInput}
                onChange={e => setInstitutionInput(e.target.value)}
                placeholder="예: 서울대학교 의과대학 / Aetheria BioTech Institute"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(76, 215, 246, 0.3)', color: '#ffffff', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                연구 직책 및 전문 분야 (Title & Specialization)
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                placeholder="예: 책임연구원 / Senior Principal Researcher"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(76, 215, 246, 0.3)', color: '#ffffff', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#bcc9cd', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                등록 이메일 주소 (이메일 변경 불가)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(10, 16, 31, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#8899a6', fontSize: '0.92rem', cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 28px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
                  color: '#000', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Save size={18} /> {t('mypage.save_btn', '회원 정보 수정 저장')}
              </button>

              {isSavedSuccess && (
                <span style={{ color: '#4edea3', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={18} /> 성공적으로 저장되었습니다!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab Content 2: Saved Target Vault */}
      {activeTab === 'vault' && (
        <div className="glass-panel p-8" style={{ border: '1px solid rgba(255,215,0,0.3)', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={22} color="#ffd700" /> 관심 표적 보관함 (Target Vault)
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#8899a6' }}>
              연구자가 북마크한 유전자/단백질 3D 표적 목록입니다.
            </span>
          </div>

          {vaultTargets.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8899a6', fontSize: '0.95rem' }}>
              보관함에 저장된 관심 표적이 없습니다. 스캐너 화면에서 [⭐ 관심 타깃 저장] 버튼을 누르면 등록됩니다.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {vaultTargets.map(target => (
                <div
                  key={target.key}
                  className="glass-panel"
                  style={{
                    padding: '20px', borderRadius: '18px', border: '1px solid rgba(255, 215, 0, 0.3)',
                    background: 'rgba(23, 31, 51, 0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                        {target.dept}
                      </span>
                      <button
                        onClick={() => handleRemoveVaultItem(target.key)}
                        style={{ background: 'none', border: 'none', color: '#ff6b81', cursor: 'pointer', padding: '4px' }}
                        title="보관함에서 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 4px 0' }}>
                      {target.symbol} ({target.key})
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#bcc9cd', margin: 0 }}>
                      {target.name}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateCategory(target.deptKey)}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(76, 215, 246, 0.4)',
                      background: 'rgba(76, 215, 246, 0.15)', color: '#4cd7f6', fontWeight: 800, fontSize: '0.82rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <span>{target.dept} AI 표적 스캐너로 이동</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Scan History */}
      {activeTab === 'history' && (
        <div className="glass-panel p-8" style={{ border: '1px solid rgba(78,222,163,0.3)', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.9)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={22} color="#4edea3" /> 최근 38개 사이언스 스킬 AI 스캐닝 기록
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { time: '오늘 11:15', target: 'MAPT (Microtubule-Associated Protein Tau)', dept: '신경외과', skills: 'PubMed, AlphaFold DB, OpenTargets', result: 'AlphaFold pLDDT 94.8 / FTO Clear' },
              { time: '어제 16:40', target: 'PCSK9 (Proprotein Convertase Subtilisin 9)', dept: '순환기내과', skills: 'ChEMBL, ClinicalTrials, openFDA', result: 'ChEMBL IC50 4.2 nM / 28개 임상' },
              { time: '2026-08-04', target: 'CD274 (PD-L1 Immune Checkpoint)', dept: '종양내과', skills: 'STRING PPI, Reactome, ClinVar', result: 'PD-L1 Blockbuster Target / FTO Clear' }
            ].map((log, idx) => (
              <div key={idx} style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(23, 31, 51, 0.6)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#8899a6', fontWeight: 700 }}>{log.time}</span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>{log.dept}</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{log.target}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#bcc9cd', marginTop: '4px' }}>
                    연동 스킬: {log.skills}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4edea3' }}>
                  {log.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Subscription & Billing */}
      {activeTab === 'billing' && (
        <div className="glass-panel p-8" style={{ border: '1px solid rgba(208,188,255,0.3)', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.9)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={22} color="#d0bcff" /> SaaS 구독 및 라이선스 정산 관리
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '24px', borderRadius: '18px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(76, 215, 246, 0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#8899a6', fontWeight: 700 }}>현재 활성화된 플랜</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4cd7f6', margin: '8px 0' }}>
                {user.plan === 'enterprise' ? 'Enterprise Solopreneur VIP' : user.plan === 'pro' ? 'Pro Neuro-Rejuve SaaS' : 'Free Starter Tier'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#bcc9cd' }}>
                월 구독 결제금액: {user.plan === 'enterprise' ? '$2,500 / mo' : user.plan === 'pro' ? '$490 / mo' : '$0 Free'}
              </div>
            </div>

            <div style={{ padding: '24px', borderRadius: '18px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(78, 222, 163, 0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#8899a6', fontWeight: 700 }}>PayPal 정산 ID 및 인증 상태</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4edea3', margin: '8px 0', fontFamily: 'monospace' }}>
                PAYPAL-SUB-882901-NEURO
              </div>
              <div style={{ fontSize: '0.85rem', color: '#bcc9cd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#4edea3" /> PayPal 결제 승인 완료 및 30일 자동 갱신
              </div>
            </div>

            {user.plan === 'enterprise' && (
              <div style={{ padding: '24px', borderRadius: '18px', background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(255, 215, 0, 0.35)' }}>
                <div style={{ fontSize: '0.85rem', color: '#8899a6', fontWeight: 700 }}>Enterprise B2B 전용 관제 센터</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffd700', margin: '8px 0' }}>
                  API Key 발급 · 개발자 콘솔 · FTO 감사
                </div>
                <button
                  onClick={() => setIsB2BConsoleOpen(true)}
                  style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Building2 size={16} /> Enterprise B2B 콘솔 열기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <EnterpriseB2BConsoleModal
        isOpen={isB2BConsoleOpen}
        onClose={() => setIsB2BConsoleOpen(false)}
      />
    </div>
  );
};
