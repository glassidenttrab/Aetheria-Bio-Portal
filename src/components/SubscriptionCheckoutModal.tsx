import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, UserPlanTier, PaymentReceipt } from '../types';
import { PayPalCheckoutButton } from './payment/PayPalCheckoutButton';
import { SAAS_PAYPAL_PRODUCTS } from '../lib/paypal';
import { captureAndVerifyPayPalOrder } from '../services/paymentService';
import { CheckCircle2, X, Zap, Crown, AlertTriangle } from 'lucide-react';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTier(selectedTier);
      setLocalIsAnnual(isAnnual);
      setReceipt(null);
      setIsVerifying(false);
      setErrorMessage(null);
    }
  }, [isOpen, selectedTier, isAnnual]);

  if (!isOpen) return null;

  const isLoggedIn = user && user.id !== 'guest';

  // Pro → Enterprise 일할 차액 정산(Proration)은 제거했다. 기존 구현은 실제
  // 구독 시작일과 무관하게 잔여 20일을 상수로 가정해 항상 $326.67을 깎아줬고,
  // 서버 가격표에 없는 임의 금액이라 결제 검증 자체가 불가능하다. 정확한
  // 비례 정산은 PayPal 정기구독 도입 시 함께 다룬다.
  const effectiveTier: UserPlanTier = tier;
  const effectiveIsAnnual = localIsAnnual;

  const planInfo: Record<UserPlanTier, { name: string; desc: string }> = {
    free: { name: t('plan.free_title', 'Free Starter Tier'), desc: t('plan.free_desc', '기본 단백질 3D 뷰어 & 기초 데이터') },
    pro: { name: t('plan.pro_title', 'Pro Neuro-Rejuve SaaS'), desc: t('plan.pro_desc', '치매 & 안티에이징 AI 정밀 타깃 분석 및 FTO 특허 리포트') },
    enterprise: { name: t('plan.enterprise_title', 'Enterprise Solopreneur VIP'), desc: t('plan.enterprise_desc', '무제한 38+ 사이언스 스킬 파이프라인 & B2B 감사 보고서') }
  };
  const currentPlanInfo = planInfo[effectiveTier];
  const isPaidTier = effectiveTier === 'pro' || effectiveTier === 'enterprise';
  const displayPrice = isPaidTier ? (effectiveIsAnnual ? ANNUAL_TOTAL[effectiveTier] : MONTHLY_PRICE[effectiveTier]) : 0;

  const paypalProduct = isPaidTier ? SAAS_PAYPAL_PRODUCTS[effectiveTier] : SAAS_PAYPAL_PRODUCTS.pro;
  const finalPayablePrice = displayPrice;

  /**
   * PayPal이 주문을 승인하면 orderId만 서버로 넘긴다. 실제 캡처·금액 검증·
   * 플랜 부여는 서버가 수행하며, 서버가 성공을 돌려준 뒤에만 화면을 유료
   * 상태로 바꾼다. 검증에 실패하면 플랜은 그대로 두고 오류만 표시한다.
   */
  const handleApproveOrder = async (orderId: string) => {
    if (!isPaidTier) return;
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const verified = await captureAndVerifyPayPalOrder({
        orderId,
        tier: effectiveTier,
        isAnnual: effectiveIsAnnual
      });

      const newReceipt: PaymentReceipt = {
        transactionId: verified.transactionId,
        planTier: verified.plan,
        amountUSD: verified.amountUSD,
        timestamp: new Date().toLocaleString(),
        cardLast4: 'PAYPAL',
        isAnnual: verified.isAnnual,
        expiresAt: verified.expiresAt,
        queriesRemaining: verified.queriesRemaining
      };
      setReceipt(newReceipt);
      onPaymentSuccess(verified.plan, newReceipt);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '결제 검증에 실패했습니다. 고객지원에 문의해 주세요.'
      );
    } finally {
      setIsVerifying(false);
    }
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

              {/* 플랜 선택 (Pro/Enterprise) */}
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

              {/* 결제 주기 선택 (월간 / 연간 15% 할인) */}
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

              {/* 주문 요약 카드 */}
              <div style={{ background: 'rgba(23, 31, 51, 0.8)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(76, 215, 246, 0.3)', marginBottom: '22px' }}>
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

              {errorMessage && (
                <div style={{
                  background: 'rgba(255, 99, 99, 0.1)',
                  border: '1px solid rgba(255, 99, 99, 0.45)',
                  borderRadius: '14px',
                  padding: '14px',
                  marginBottom: '18px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={18} color="#ff6363" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div style={{ fontSize: '0.8rem', color: '#ffc9c9', lineHeight: 1.45 }}>{errorMessage}</div>
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
                {isLoggedIn ? (
                  <>
                    <PayPalCheckoutButton
                      product={paypalProduct}
                      overridePrice={finalPayablePrice.toFixed(2)}
                      disabled={isVerifying}
                      onApproveOrder={handleApproveOrder}
                      onError={() =>
                        setErrorMessage('PayPal 결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
                      }
                    />
                    {isVerifying && (
                      <div style={{ fontSize: '0.78rem', color: '#4cd7f6', textAlign: 'center', marginTop: '10px' }}>
                        결제를 서버에서 검증하는 중입니다. 창을 닫지 말아 주세요.
                      </div>
                    )}
                  </>
                ) : (
                  // 비로그인 상태에서 결제가 승인되면 권한을 붙일 계정이 없어
                  // "돈은 빠져나갔는데 아무것도 받지 못하는" 상태가 된다.
                  // 따라서 결제 버튼 자체를 렌더링하지 않는다.
                  <button
                    type="button"
                    onClick={onRequireAuth}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                      background: '#ffd700', color: '#000', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer'
                    }}
                  >
                    {t('checkout.btn_login_to_pay', '로그인하고 결제 진행하기')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
