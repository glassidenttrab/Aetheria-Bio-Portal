import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, UserPlanTier, PaymentReceipt } from '../types';
import { PayPalCheckoutButton } from './payment/PayPalCheckoutButton';
import { SAAS_PAYPAL_PRODUCTS } from '../lib/paypal';
import { recordSubscriptionDB } from '../services/supabaseService';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, Sparkles, X, Zap, Crown, User, Mail, LogIn, UserPlus } from 'lucide-react';

interface AuthCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onPaymentSuccess: (newPlan: UserPlanTier, receipt: PaymentReceipt) => void;
  selectedTier: UserPlanTier;
}

export const AuthCheckoutModal: React.FC<AuthCheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  onPaymentSuccess,
  selectedTier
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useLanguage();
  
  // Tabs: 'signup' (회원가입), 'login' (로그인), 'checkout' (결제), 'success' (완료)
  const [modalTab, setModalTab] = useState<'signup' | 'login' | 'checkout' | 'success'>('signup');
  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name || '');
  const [password, setPassword] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'credit_card'>('paypal');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  if (!isOpen) return null;

  const planPrices: Record<UserPlanTier, { price: number; name: string; desc: string }> = {
    free: { price: 0, name: t('plan.free_title', 'Free Starter Tier'), desc: t('plan.free_desc', '기본 단백질 3D 뷰어 & 기초 데이터') },
    pro: { price: 490, name: t('plan.pro_title', 'Pro Neuro-Rejuve SaaS'), desc: t('plan.pro_desc', '치매 & 안티에이징 AI 정밀 타깃 분석 및 FTO 특허 리포트') },
    enterprise: { price: 2500, name: t('plan.enterprise_title', 'Enterprise Solopreneur VIP'), desc: t('plan.enterprise_desc', '무제한 38+ 사이언스 스킬 파이프라인 & B2B 감사 보고서') }
  };

  const currentPriceInfo = planPrices[selectedTier];

  // 이메일 회원가입 및 로그인 처리
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError(null);

    try {
      if (modalTab === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }

      if (selectedTier === 'free') {
        onPaymentSuccess('free', {
          transactionId: `TX-FREE-${Date.now()}`,
          planTier: 'free',
          amountUSD: 0,
          timestamp: new Date().toLocaleDateString(),
          cardLast4: 'FREE'
        });
        onClose();
      } else {
        setModalTab('checkout');
      }
    } catch (err: any) {
      setAuthError(err.message || '인증 처리에 실패했습니다. 입력 정보를 확인해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 구글 소셜 로그인 / 회원가입
  const handleGoogleAuth = async () => {
    setIsProcessing(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      if (selectedTier === 'free') {
        onPaymentSuccess('free', {
          transactionId: `TX-FREE-${Date.now()}`,
          planTier: 'free',
          amountUSD: 0,
          timestamp: new Date().toLocaleDateString(),
          cardLast4: 'FREE'
        });
        onClose();
      } else {
        setModalTab('checkout');
      }
    } catch (err: any) {
      setAuthError('Google 인증 실패: ' + (err.message || '다시 시도해주세요.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // PayPal 결제 승인 콜백
  const handlePayPalSuccess = (details: any) => {
    const newReceipt: PaymentReceipt = {
      transactionId: details.id || `PAYPAL-${Date.now()}`,
      planTier: selectedTier,
      amountUSD: currentPriceInfo.price,
      timestamp: new Date().toLocaleString(),
      cardLast4: 'PAYPAL'
    };
    setReceipt(newReceipt);
    setModalTab('success');
    onPaymentSuccess(selectedTier, newReceipt);
  };

  // 신용카드 결제 처리
  const handleCardPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const newReceipt: PaymentReceipt = {
        transactionId: `TX-AE-${Math.floor(100000 + Math.random() * 900000)}`,
        planTier: selectedTier,
        amountUSD: currentPriceInfo.price,
        timestamp: new Date().toLocaleString(),
        cardLast4: '4242'
      };
      setReceipt(newReceipt);
      setModalTab('success');
      onPaymentSuccess(selectedTier, newReceipt);
    }, 1000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '560px', background: '#0f172a',
        border: '1px solid rgba(76, 215, 246, 0.35)', borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(76, 215, 246, 0.2)',
        overflow: 'hidden', color: '#dae2fd', position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(135deg, rgba(76, 215, 246, 0.12) 0%, rgba(208, 188, 255, 0.08) 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {selectedTier === 'enterprise' ? (
              <Crown color="#ffd700" size={24} />
            ) : selectedTier === 'pro' ? (
              <Zap color="#4cd7f6" size={24} />
            ) : (
              <Sparkles color="#4edea3" size={24} />
            )}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                {modalTab === 'signup' ? t('auth.signup_title', '신규 회원가입') : modalTab === 'login' ? t('auth.login_title', '계정 로그인') : `${currentPriceInfo.name} ${t('auth.checkout_title', '결제')}`}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#bcc9cd', margin: '2px 0 0 0' }}>
                {t('auth.subtitle', '계정 인증 및 PayPal 결제')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#bcc9cd', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>

          {/* Auth Tabs: 회원가입 / 로그인 선택 스위처 */}
          {(modalTab === 'signup' || modalTab === 'login') && (
            <div style={{ display: 'flex', background: 'rgba(23, 31, 51, 0.8)', padding: '4px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => { setModalTab('signup'); setAuthError(null); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  background: modalTab === 'signup' ? '#4cd7f6' : 'transparent',
                  color: modalTab === 'signup' ? '#000' : '#bcc9cd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <UserPlus size={16} /> {t('auth.tab_signup', '신규 회원가입')}
              </button>
              <button
                type="button"
                onClick={() => { setModalTab('login'); setAuthError(null); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  background: modalTab === 'login' ? '#4cd7f6' : 'transparent',
                  color: modalTab === 'login' ? '#000' : '#bcc9cd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <LogIn size={16} /> {t('auth.tab_login', '계정 로그인')}
              </button>
            </div>
          )}

          {/* Auth Error Display */}
          {authError && (
            <div style={{ padding: '12px 16px', background: 'rgba(255, 99, 132, 0.15)', border: '1px solid rgba(255, 99, 132, 0.4)', borderRadius: '10px', color: '#ff6b81', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px' }}>
              {authError}
            </div>
          )}

          {/* 1. Google 소셜 로그인 / 회원가입 버튼 */}
          {(modalTab === 'signup' || modalTab === 'login') && (
            <div style={{ marginBottom: '24px' }}>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isProcessing}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255, 255, 255, 0.08)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                  cursor: isProcessing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {modalTab === 'signup' ? t('auth.btn_google_signup', 'Google 계정으로 1초 만에 회원가입') : t('auth.btn_google_login', 'Google 계정으로 1초 만에 로그인')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 10px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '0.75rem', color: '#bcc9cd', textTransform: 'uppercase' }}>
                  {modalTab === 'signup' ? t('auth.or_email_signup', '또는 이메일 회원가입') : t('auth.or_email_login', '또는 이메일 로그인')}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>
            </div>
          )}

          {/* 2. 이메일 회원가입 및 로그인 폼 */}
          {(modalTab === 'signup' || modalTab === 'login') && (
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modalTab === 'signup' && (
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#bcc9cd', display: 'block', marginBottom: '6px' }}>
                    {t('auth.field_name', '연구자 성함 (Full Name)')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="성함을 입력하세요 (예: 김승우 / Dr. Seung-Woo Kim)"
                      style={{
                        width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(23, 31, 51, 0.8)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#bcc9cd', display: 'block', marginBottom: '6px' }}>
                  {t('auth.field_email', '이메일 주소 (Email)')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요 (예: scientist@aetheria.bio)"
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(23, 31, 51, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#bcc9cd', display: 'block', marginBottom: '6px' }}>
                  {t('auth.field_password', '비밀번호 (Password)')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password_placeholder', '최소 6자 이상')}
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(23, 31, 51, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(23, 31, 51, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 800 }}>
                  <span>{t('auth.selected_plan_label', '선택 구독 플랜')}</span>
                  <span style={{ color: '#4cd7f6' }}>${currentPriceInfo.price} USD {t('plan.per_month', '/월')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)', color: '#000',
                  fontWeight: 800, fontSize: '1rem', cursor: isProcessing ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {isProcessing ? '처리 중...' : modalTab === 'signup' ? t('auth.btn_signup_submit', '회원가입 완료 및 결제 진행') : t('auth.btn_login_submit', '로그인 및 결제 진행')} <Zap size={18} />
              </button>
            </form>
          )}

          {/* 3. PayPal 및 카드 결제 단계 */}
          {modalTab === 'checkout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 18px', background: 'rgba(11, 19, 38, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#bcc9cd' }}>구독 인증 완료 계정</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#bcc9cd' }}>PayPal 승인 금액</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4edea3' }}>${currentPriceInfo.price} USD</div>
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                    border: paymentMethod === 'paypal' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.15)',
                    background: paymentMethod === 'paypal' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                    color: paymentMethod === 'paypal' ? '#ffd700' : '#bcc9cd'
                  }}
                >
                  PayPal Smart Checkout
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                    border: paymentMethod === 'credit_card' ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.15)',
                    background: paymentMethod === 'credit_card' ? 'rgba(76, 215, 246, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                    color: paymentMethod === 'credit_card' ? '#4cd7f6' : '#bcc9cd'
                  }}
                >
                  일반 신용카드 결제
                </button>
              </div>

              {paymentMethod === 'paypal' ? (
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#bcc9cd', marginBottom: '12px', textAlign: 'center' }}>
                    ConnectAI-LAB 템플릿의 PayPal SDK 모듈이 연결되어 결제를 진행합니다.
                  </div>
                  <PayPalCheckoutButton
                    product={selectedTier === 'enterprise' ? SAAS_PAYPAL_PRODUCTS.enterprise : SAAS_PAYPAL_PRODUCTS.pro}
                    onSuccess={handlePayPalSuccess}
                    onError={(err) => console.error(err)}
                  />
                </div>
              ) : (
                <form onSubmit={handleCardPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#bcc9cd', display: 'block', marginBottom: '6px' }}>
                      신용카드 번호
                    </label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(23, 31, 51, 0.8)',
                          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                      background: 'linear-gradient(135deg, #4cd7f6 0%, #d0bcff 100%)', color: '#000',
                      fontWeight: 800, fontSize: '1rem', cursor: isProcessing ? 'wait' : 'pointer'
                    }}
                  >
                    {isProcessing ? '결제 승인 중...' : `$${currentPriceInfo.price} USD 카드 승인`}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 4. 결제 완료 화면 */}
          {modalTab === 'success' && receipt && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(78, 222, 163, 0.15)', border: '2px solid #4edea3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <CheckCircle2 size={36} color="#4edea3" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
                Firebase 회원가입 & PayPal 결제 성공!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#bcc9cd', marginBottom: '24px' }}>
                AETHERIA Bio SaaS {selectedTier.toUpperCase()} 등급이 활성화되었습니다.
              </p>

              <div style={{ padding: '16px', background: 'rgba(11, 19, 38, 0.8)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#bcc9cd' }}>거래 승인 번호 (Order ID):</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#4cd7f6' }}>{receipt.transactionId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#bcc9cd' }}>결제 수단:</span>
                  <span style={{ color: '#ffd700', fontWeight: 700 }}>{receipt.cardLast4}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#bcc9cd' }}>승인 금액:</span>
                  <span style={{ fontWeight: 800, color: '#4edea3' }}>${receipt.amountUSD} USD</span>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                  background: '#4cd7f6', color: '#000', fontWeight: 800, fontSize: '1rem', cursor: 'pointer'
                }}
              >
                SaaS 서비스 대시보드로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
