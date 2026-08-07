import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '840px', maxHeight: '90vh',
        borderRadius: '24px', border: '1px solid rgba(76, 215, 246, 0.3)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 16, 31, 0.99) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(76, 215, 246, 0.15)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(23, 31, 51, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(76, 215, 246, 0.15)', border: '1px solid rgba(76, 215, 246, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4cd7f6'
            }}>
              {activeTab === 'privacy' ? <ShieldCheck size={24} /> : <FileText size={24} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {activeTab === 'privacy' ? t('footer.privacy', '개인정보 처리방침') : t('footer.terms', '이용약관')}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#8899a6', margin: 0, marginTop: '2px' }}>
                Aetheria Bio SaaS Portal Compliance & Legal Framework
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#dae2fd', borderRadius: '12px', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(11, 19, 38, 0.8)', padding: '6px 20px', gap: '10px'
        }}>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              border: activeTab === 'privacy' ? '1px solid rgba(76, 215, 246, 0.5)' : '1px solid transparent',
              background: activeTab === 'privacy' ? 'rgba(76, 215, 246, 0.15)' : 'transparent',
              color: activeTab === 'privacy' ? '#4cd7f6' : '#8899a6', transition: 'all 0.2s ease'
            }}
          >
            <Lock size={16} /> {t('footer.privacy', '개인정보 처리방침')}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              border: activeTab === 'terms' ? '1px solid rgba(76, 215, 246, 0.5)' : '1px solid transparent',
              background: activeTab === 'terms' ? 'rgba(76, 215, 246, 0.15)' : 'transparent',
              color: activeTab === 'terms' ? '#4cd7f6' : '#8899a6', transition: 'all 0.2s ease'
            }}
          >
            <FileText size={16} /> {t('footer.terms', '이용약관')}
          </button>
        </div>

        {/* Legal Text Content Body */}
        <div style={{
          padding: '28px', overflowY: 'auto', flex: 1,
          color: '#dae2fd', fontSize: '0.9rem', lineHeight: 1.7
        }}>
          {activeTab === 'privacy' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(76, 215, 246, 0.08)', border: '1px solid rgba(76, 215, 246, 0.2)', color: '#4cd7f6', fontSize: '0.85rem' }}>
                💡 {t('legal.privacy_intro', 'Aetheria Bio SaaS Portal은 연구자의 개인정보보호를 매우 중요시하며, 개인정보보호법, GDPR, CCPA 등 글로벌 개인정보 규정을 엄격히 준수합니다.')}
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4cd7f6" /> {t('legal.p_sec1_title', '제1조 (개인정보의 수집 및 이용 목적)')}
                </h4>
                <p style={{ margin: 0, color: '#bcc9cd' }}>
                  {t('legal.p_sec1_content', '본 포털은 회원가입, 38개 생의학 라이브 스킬 이용, Pro/Enterprise SaaS 결제 처리, 연구 내역 저장 및 고객 문의 응대를 목적으로 최소한의 개인정보를 수집합니다.')}
                </p>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4cd7f6" /> {t('legal.p_sec2_title', '제2조 (수집하는 개인정보 항목)')}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#bcc9cd', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>{t('legal.p_sec2_item1', '필수 수집항목: 연구자 성함(Full Name), 이메일 주소(Work Email), 비밀번호(암호화 저장)')}</li>
                  <li>{t('legal.p_sec2_item2', '결제 시 수집항목: PayPal 결제 거래 ID, 거래 시각, 결제 금액 ($490 / $2,500)')}</li>
                  <li>{t('legal.p_sec2_item3', '자동 수집항목: 서비스 이용 기록, 접속 IP 주소, 브라우저 종류, 접속 언어 설정')}</li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4cd7f6" /> {t('legal.p_sec3_title', '제3조 (개인정보 보유 및 파기 기간)')}
                </h4>
                <p style={{ margin: 0, color: '#bcc9cd' }}>
                  {t('legal.p_sec3_content', '이용자의 개인정보는 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다. 단, 전자상거래법 등 관련 법령에 따라 거래 내역은 5년간 안전하게 보존됩니다.')}
                </p>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4cd7f6" /> {t('legal.p_sec4_title', '제4조 (개인정보의 제3자 제공 및 위탁)')}
                </h4>
                <p style={{ margin: 0, color: '#bcc9cd' }}>
                  {t('legal.p_sec4_content', '본 포털은 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만, 소셜 로그인(Google OAuth) 및 결제 정산(PayPal Inc.) 처리를 위해 제한된 범위 내에서 외부 전문 기관에 위탁 제공됩니다.')}
                </p>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4cd7f6" /> {t('legal.p_sec5_title', '제5조 (이용자의 권리와 행사 방법)')}
                </h4>
                <p style={{ margin: 0, color: '#bcc9cd' }}>
                  {t('legal.p_sec5_content', '이용자는 언제든지 본인의 개인정보 열람, 정정, 삭제 및 처리정지 요구권을 행사할 수 있습니다. 관련 문의는 개인정보 보호책임자(privacy@aetheriabio.com)에게 접수하실 수 있습니다.')}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(78, 222, 163, 0.08)', border: '1px solid rgba(78, 222, 163, 0.2)', color: '#4edea3', fontSize: '0.85rem' }}>
                📋 {t('legal.terms_intro', '본 약관은 Aetheria Bio SaaS Portal이 제공하는 전신 10대 의학과 생의학 스캐닝 및 38개 사이언스 스킬 이용조건을 규정합니다.')}
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4edea3" /> {t('legal.t_sec1_title', '제1조 (목적 및 서비스 정의)')}
                </h4>
                <p style={{ margin: 0, color: '#bcc9cd' }}>
                  {t('legal.t_sec1_content', '본 약관은 Aetheria Bio SaaS Portal(이하 "회사")이 연구자(이하 "회원")에게 제공하는 10대 의학과 단백질 3D 구조(AlphaFold), 질환 연관도(OpenTargets), 분자 결합력(ChEMBL), FTO 특허 스캐닝 서비스 이용에 관한 권리와 의무를 규정합니다.')}
                </p>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4edea3" /> {t('legal.t_sec2_title', '제2조 (구독 플랜 및 결제 환불 방침)')}
                </h4>
                <p style={{ margin: 0, color: '#bcc9cd' }}>
                  {t('legal.t_sec2_content', 'Pro ($490/월) 및 Enterprise VIP ($2,500/월) 구독은 월 단위 자동 갱신됩니다. 결제 후 7일 이내에 스캐닝 서비스를 이용하지 않은 경우 전액 환불이 가능합니다.')}
                </p>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4edea3" /> {t('legal.t_sec3_title', '제3조 (의학적 면책 조항 / Medical Disclaimer)')}
                </h4>
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255, 99, 132, 0.1)', border: '1px solid rgba(255, 99, 132, 0.3)', color: '#ff6b81', fontSize: '0.85rem' }}>
                  ⚠️ {t('legal.t_sec3_disclaimer', '중요: 본 포털이 제공하는 생의학 빅데이터 분석 결과는 바이오 및 의약 연구 보조 목적이며, 최종적인 임상 진단, 치료 및 의료적 결정은 전문 의료진의 판단을 따라야 합니다.')}
                </div>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#4edea3" /> {t('legal.t_sec4_title', '제4조 (지적재산권 및 서비스 변경)')}
                </h4>
                <p style={{ margin: 0, color: '#bcc9cd' }}>
                  {t('legal.t_sec4_content', '포털의 38개 사이언스 스킬 파이프라인, AI 알고리즘, 디자인 및 상표권은 회사에 귀속되며, 회원은 연구 목적으로 상용 라이선스를 이용할 권리를 갖습니다.')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.95)', display: 'flex', justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
              color: '#000000', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer'
            }}
          >
            {t('legal.confirm', '확인 및 닫기')}
          </button>
        </div>
      </div>
    </div>
  );
};
