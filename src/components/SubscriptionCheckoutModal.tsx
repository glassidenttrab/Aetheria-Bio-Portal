import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, UserPlanTier, PaymentReceipt } from '../types';
import { PayPalCheckoutButton } from './payment/PayPalCheckoutButton';
import { SAAS_PAYPAL_PRODUCTS } from '../lib/paypal';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, Sparkles, X, Zap, Crown } from 'lucide-react';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  selectedTier: UserPlanTier;
  onPaymentSuccess: (newPlan: UserPlanTier, receipt: PaymentReceipt) => void;
  onRequireAuth?: () => void;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  selectedTier,
  onPaymentSuccess,
  onRequireAuth
}) => {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'credit_card'>('paypal');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  if (!isOpen) return null;

  const isLoggedIn = user && user.id !== 'guest';

  const planPrices: Record<UserPlanTier, { price: number; name: string; desc: string }> = {
    free: { price: 0, name: t('plan.free_title', 'Free Starter Tier'), desc: t('plan.free_desc', '기본 단백질 3D 뷰어 & 기초 데이터') },
    pro: { price: 490, name: t('plan.pro_title', 'Pro Neuro-Rejuve SaaS'), desc: t('plan.pro_desc', '치매 & 안티에이징 AI 정밀 타깃 분석 및 FTO 특허 리포트') },
    enterprise: { price: 2500, name: t('plan.enterprise_title', 'Enterprise Solopreneur VIP'), desc: t('plan.enterprise_desc', '무제한 38+ 사이언스 스킬 파이프라인 & B2B 감사 보고서') }
  };

  const currentPriceInfo = planPrices[selectedTier];
  const paypalProduct = (selectedTier === 'pro' || selectedTier === 'enterprise')
    ? SAAS_PAYPAL_PRODUCTS[selectedTier]
    : SAAS_PAYPAL_PRODUCTS.pro;

  // PayPal 승인 성공
  const handlePayPalSuccess = (details: any) => {
    const newReceipt: PaymentReceipt = {
      transactionId: details.id || `PAYPAL-${Date.now()}`,
      planTier: selectedTier,
      amountUSD: currentPriceInfo.price,
      timestamp: new Date().toLocaleString(),
      cardLast4: 'PAYPAL'
    };
    setReceipt(newReceipt);
    onPaymentSuccess(selectedTier, newReceipt);
  };

  // 신용카드 승인 처리
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
      onPaymentSuccess(selectedTier, newReceipt);
    }, 1000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '520px', background: '#0f172a',
        border: '1px solid rgba(76, 215, 246, 0.35)', borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(76, 215, 246, 0.2)',
        overflow: 'hidden', color: '#dae2fd', position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(135deg, rgba(76, 215, 246, 0.12) 0%, rgba(208, 188, 255, 0.08) 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {selectedTier === 'enterprise' ? (
              <Crown color="#ffd700" size={24} />
            ) : (
              <Zap color="#4cd7f6" size={24} />
            )}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                {currentPriceInfo.name} {t('checkout.title_suffix', '구독 결제')}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#bcc9cd', margin: '2px 0 0 0' }}>
                {t('checkout.subtitle', '안전한 결제 수단 선택 및 즉시 플랜 적용')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#bcc9cd', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '26px' }}>

          {receipt ? (
            /* 결제 성공 영수증 */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <CheckCircle2 color="#4edea3" size={54} style={{ margin: '0 auto 16px auto' }} />
              <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                {t('checkout.success_title', '구독 결제가 완료되었습니다! 🎉')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#bcc9cd', margin: '8px 0 20px 0' }}>
                {t('checkout.success_desc', '선택하신 혜택이 계정에 즉시 활성화되었습니다.')}
              </p>

              <div style={{ background: 'rgba(23, 31, 51, 0.8)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.82rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#bcc9cd' }}>{t('checkout.tx_id', '거래 번호:')}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4cd7f6' }}>{receipt.transactionId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#bcc9cd' }}>{t('checkout.amount', '결제 금액:')}</span>
                  <span style={{ fontWeight: 800, color: '#ffd700' }}>${receipt.amountUSD} {t('plan.per_month', '/월')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#bcc9cd' }}>{t('checkout.date', '결제 일시:')}</span>
                  <span>{receipt.timestamp}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                  background: '#4cd7f6', color: '#000', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer'
                }}
              >
                {t('checkout.btn_use_service', '서비스 이용하러 가기 →')}
              </button>
            </div>
          ) : (
            <>
              {/* 비로그인 사용자인 경우 로그인 유도 */}
              {!isLoggedIn && (
                <div style={{ padding: '14px', background: 'rgba(255, 215, 0, 0.12)', border: '1px solid rgba(255, 215, 0, 0.4)', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffd700' }}>{t('checkout.requires_login', '로그인이 필요합니다')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#bcc9cd' }}>{t('checkout.requires_login_desc', '결제를 진행하기 위해 로그인해 주세요.')}</div>
                  </div>
                  {onRequireAuth && (
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#ffd700', color: '#000', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      {t('checkout.btn_login', '로그인하기')}
                    </button>
                  )}
                </div>
              )}

              {/* 주문 요약 카드 */}
              <div style={{ background: 'rgba(23, 31, 51, 0.8)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(76, 215, 246, 0.3)', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{currentPriceInfo.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#bcc9cd', marginTop: '2px' }}>{currentPriceInfo.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffd700' }}>${currentPriceInfo.price}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8899a6' }}>{t('checkout.monthly_auto', '월간 자동결제')}</div>
                  </div>
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#bcc9cd', marginBottom: '10px' }}>
                  {t('checkout.method_select', '결제 수단 선택 (Select Payment Method)')}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                      border: paymentMethod === 'paypal' ? '2px solid #0070ba' : '1px solid rgba(255,255,255,0.15)',
                      background: paymentMethod === 'paypal' ? 'rgba(0, 112, 186, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                      color: paymentMethod === 'paypal' ? '#0070ba' : '#bcc9cd', fontWeight: 800, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    {t('checkout.paypal_label', 'PayPal (글로벌 간편 결제)')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                      border: paymentMethod === 'credit_card' ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.15)',
                      background: paymentMethod === 'credit_card' ? 'rgba(76, 215, 246, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                      color: paymentMethod === 'credit_card' ? '#4cd7f6' : '#bcc9cd', fontWeight: 800, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <CreditCard size={16} /> {t('checkout.card_label', '신용카드')}
                  </button>
                </div>
              </div>

              {/* PayPal / 신용카드 입력 폼 */}
              {paymentMethod === 'paypal' ? (
                <div style={{ marginTop: '16px' }}>
                  <PayPalCheckoutButton
                    product={paypalProduct}
                    onSuccess={handlePayPalSuccess}
                    onError={(err) => alert('PayPal 결제 실패: ' + err)}
                  />
                </div>
              ) : (
                <form onSubmit={handleCardPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#bcc9cd', marginBottom: '4px', fontWeight: 700 }}>
                      {t('checkout.card_number', '카드 번호')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(23, 31, 51, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing || !isLoggedIn}
                    style={{
                      width: '100%', marginTop: '6px', padding: '13px', borderRadius: '12px', border: 'none',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000', fontWeight: 900, fontSize: '0.9rem',
                      cursor: isProcessing ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    {isProcessing ? t('checkout.btn_processing', '결제 승인 중...') : `$${currentPriceInfo.price} ${t('checkout.btn_submit', '구독 승인 및 결제')}`}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
