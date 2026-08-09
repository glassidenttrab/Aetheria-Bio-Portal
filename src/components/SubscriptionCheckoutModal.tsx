import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, UserPlanTier, PaymentReceipt } from '../types';
import { PayPalCheckoutButton } from './payment/PayPalCheckoutButton';
import { SAAS_PAYPAL_PRODUCTS } from '../lib/paypal';
import { CheckCircle2, X, Zap, Crown } from 'lucide-react';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  selectedTier: UserPlanTier;
  isAnnual?: boolean;
  onPaymentSuccess: (newPlan: UserPlanTier, receipt: PaymentReceipt) => void;
  onRequireAuth?: () => void;
}

// 월간 정가 및 연간 1회 결제 시 총액(15% 할인 적용) — PlanPricingDetailsModal의 표시가와 동일 기준
const MONTHLY_PRICE: Record<'pro' | 'enterprise', number> = { pro: 490, enterprise: 2500 };
const ANNUAL_TOTAL: Record<'pro' | 'enterprise', number> = { pro: 4998, enterprise: 25500 };

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  selectedTier,
  isAnnual = false,
  onPaymentSuccess,
  onRequireAuth
}) => {
  const { t } = useLanguage();
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [tier, setTier] = useState<UserPlanTier>(selectedTier);
  const [localIsAnnual, setLocalIsAnnual] = useState(isAnnual);

  useEffect(() => {
    if (isOpen) {
      setTier(selectedTier);
      setLocalIsAnnual(isAnnual);
      setReceipt(null);
    }
  }, [isOpen, selectedTier, isAnnual]);

  if (!isOpen) return null;

  const isLoggedIn = user && user.id !== 'guest';

  // Pro 구독자가 Enterprise로 업그레이드하는 특수 흐름에서는 플랜/결제주기 선택 없이
  // 기존의 일할 차액 정산(Proration) 계산만 그대로 적용한다.
  const isProToEnterpriseUpgrade = Boolean(user && user.plan === 'pro');
  const effectiveTier: UserPlanTier = isProToEnterpriseUpgrade ? 'enterprise' : tier;
  const effectiveIsAnnual = isProToEnterpriseUpgrade ? false : localIsAnnual;

  const planInfo: Record<UserPlanTier, { name: string; desc: string }> = {
    free: { name: t('plan.free_title', 'Free Starter Tier'), desc: t('plan.free_desc', '기본 단백질 3D 뷰어 & 기초 데이터') },
    pro: { name: t('plan.pro_title', 'Pro Neuro-Rejuve SaaS'), desc: t('plan.pro_desc', '치매 & 안티에이징 AI 정밀 타깃 분석 및 FTO 특허 리포트') },
    enterprise: { name: t('plan.enterprise_title', 'Enterprise Solopreneur VIP'), desc: t('plan.enterprise_desc', '무제한 38+ 사이언스 스킬 파이프라인 & B2B 감사 보고서') }
  };
  const currentPlanInfo = planInfo[effectiveTier];
  const isPaidTier = effectiveTier === 'pro' || effectiveTier === 'enterprise';
  const displayPrice = isPaidTier ? (effectiveIsAnnual ? ANNUAL_TOTAL[effectiveTier] : MONTHLY_PRICE[effectiveTier]) : 0;

  const paypalProduct = isPaidTier ? SAAS_PAYPAL_PRODUCTS[effectiveTier] : SAAS_PAYPAL_PRODUCTS.pro;

  // Pro ➔ Enterprise 일할 차액 정산 (Proration) 산출
  const proDaysRemaining = 20; // 30일 주기 중 미사용 잔여 20일 가정
  const proDailyRate = 490 / 30; // $16.333/일
  const proUnusedCredit = isProToEnterpriseUpgrade ? Math.round(proDailyRate * proDaysRemaining * 100) / 100 : 0; // $326.67
  const finalPayablePrice = isProToEnterpriseUpgrade ? Math.round((2500 - proUnusedCredit) * 100) / 100 : displayPrice;

  // PayPal 승인 성공
  const handlePayPalSuccess = (details: any) => {
    const newReceipt: PaymentReceipt = {
      transactionId: details.id || `PAYPAL-${Date.now()}`,
      planTier: effectiveTier,
      amountUSD: finalPayablePrice,
      timestamp: new Date().toLocaleString(),
      cardLast4: 'PAYPAL',
      isAnnual: effectiveIsAnnual
    };
    setReceipt(newReceipt);
    onPaymentSuccess(effectiveTier, newReceipt);
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
            {effectiveTier === 'enterprise' ? (
              <Crown color="#ffd700" size={24} />
            ) : (
              <Zap color="#4cd7f6" size={24} />
            )}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                {t('checkout.modal_title', 'Aetheria Bio Portal')} {t('checkout.title_suffix', '구독 결제')}
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
                  <span style={{ fontWeight: 800, color: '#ffd700' }}>
                    ${receipt.amountUSD} {receipt.isAnnual ? t('checkout.period_annual', '(연간 1회 결제)') : t('plan.per_month', '/월')}
                  </span>
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

              {/* 플랜 선택 (Pro/Enterprise) — 기존 Pro 구독자의 Enterprise 업그레이드 흐름에서는 고정 */}
              {!isProToEnterpriseUpgrade && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#bcc9cd', marginBottom: '10px' }}>
                    {t('checkout.plan_select', '플랜 선택 (Select Plan)')}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setTier('pro')}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                        border: tier === 'pro' ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.15)',
                        background: tier === 'pro' ? 'rgba(76, 215, 246, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                        color: tier === 'pro' ? '#4cd7f6' : '#bcc9cd', fontWeight: 800, fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <Zap size={15} /> Pro (${MONTHLY_PRICE.pro})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTier('enterprise')}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                        border: tier === 'enterprise' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.15)',
                        background: tier === 'enterprise' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                        color: tier === 'enterprise' ? '#ffd700' : '#bcc9cd', fontWeight: 800, fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <Crown size={15} /> Enterprise (${MONTHLY_PRICE.enterprise})
                    </button>
                  </div>
                </div>
              )}

              {/* 결제 주기 선택 (월간 / 연간 15% 할인) */}
              {!isProToEnterpriseUpgrade && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#bcc9cd', marginBottom: '10px' }}>
                    {t('checkout.billing_cycle', '결제 주기 (Billing Cycle)')}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setLocalIsAnnual(false)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer',
                        border: !localIsAnnual ? '2px solid #4cd7f6' : '1px solid rgba(255,255,255,0.15)',
                        background: !localIsAnnual ? 'rgba(76, 215, 246, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                        color: !localIsAnnual ? '#4cd7f6' : '#bcc9cd', fontWeight: 800, fontSize: '0.82rem'
                      }}
                    >
                      {t('checkout.monthly', '월간')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalIsAnnual(true)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer',
                        border: localIsAnnual ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.15)',
                        background: localIsAnnual ? 'rgba(255, 215, 0, 0.15)' : 'rgba(23, 31, 51, 0.6)',
                        color: localIsAnnual ? '#ffd700' : '#bcc9cd', fontWeight: 800, fontSize: '0.82rem'
                      }}
                    >
                      {t('checkout.annual_discount', '연간 (15% 할인)')}
                    </button>
                  </div>
                </div>
              )}

              {/* 주문 요약 카드 */}
              <div style={{ background: 'rgba(23, 31, 51, 0.8)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(76, 215, 246, 0.3)', marginBottom: isProToEnterpriseUpgrade ? '14px' : '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{currentPlanInfo.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#bcc9cd', marginTop: '2px' }}>{currentPlanInfo.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffd700' }}>${displayPrice.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8899a6' }}>
                      {effectiveIsAnnual ? t('checkout.annual_once', '연간 1회 결제') : t('checkout.monthly_auto', '월간 결제')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro ➔ Enterprise 일할 차액 정산 (Prorated Breakdown) 명세서 카드 */}
              {isProToEnterpriseUpgrade && (
                <div style={{
                  background: 'rgba(255, 215, 0, 0.08)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffd700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🧾</span> Pro ➔ Enterprise 업그레이드 차액 정산 명세서 (Prorated)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bcc9cd' }}>
                      <span>Enterprise VIP 정상 월 구독료:</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>$2,500.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4edea3' }}>
                      <span>기존 Pro 미사용 잔여 20일 공제 (환불 반영):</span>
                      <span style={{ fontWeight: 800 }}>- ${proUnusedCredit.toFixed(2)}</span>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 900, color: '#ffd700' }}>
                      <span>💳 오늘 실결제 차액 금액:</span>
                      <span>${finalPayablePrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8899a6', marginTop: '8px', lineHeight: '1.35' }}>
                    * 이중 결제가 발생하지 않도록 기존 Pro 구독의 미사용 남은 기간 가치가 정확히 일할 계산(Proration)되어 차감 승인됩니다.
                  </div>
                </div>
              )}

              {/* 결제 수단: PayPal 단독 (실제 결제 승인이 확인 가능한 유일한 경로) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#bcc9cd', marginBottom: '10px' }}>
                  {t('checkout.method_select', '결제 수단 (Payment Method)')}
                </div>
                <div style={{
                  padding: '12px', borderRadius: '12px', border: '2px solid #0070ba',
                  background: 'rgba(0, 112, 186, 0.15)', color: '#0070ba', fontWeight: 800, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                  {t('checkout.paypal_label', 'PayPal (글로벌 간편 결제)')}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <PayPalCheckoutButton
                  product={paypalProduct}
                  overridePrice={finalPayablePrice.toFixed(2)}
                  onSuccess={handlePayPalSuccess}
                  onError={(err) => alert('PayPal 결제 실패: ' + err)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
