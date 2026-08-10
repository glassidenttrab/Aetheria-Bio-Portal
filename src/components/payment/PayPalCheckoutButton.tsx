import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { PayPalSaaSProduct } from '../../lib/paypal';

interface PayPalCheckoutButtonProps {
  product: PayPalSaaSProduct;
  overridePrice?: number | string;
  /**
   * 결제 승인(orderID 확보) 시점에 호출된다. 캡처는 브라우저가 아니라 서버가
   * 수행하므로, 이 콜백 안에서 서버 검증을 끝낸 뒤 resolve해야 한다.
   */
  onApproveOrder: (orderId: string) => Promise<void>;
  onError?: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  product,
  overridePrice,
  onApproveOrder,
  onError,
  onCancel,
  disabled = false,
}) => {
  const finalPriceValue = overridePrice !== undefined ? String(overridePrice) : product.price;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#ffc107',
        background: 'rgba(255, 193, 7, 0.12)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        padding: '3px 8px',
        borderRadius: '6px',
        marginBottom: '10px'
      }}>
        <span>🧪</span> Sandbox Test Environment Active (가상 테스트 결제)
      </div>
      <PayPalButtons
        disabled={disabled}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
          tagline: false,
        }}
        createOrder={(_data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                description: product.description,
                custom_id: product.id,
                amount: {
                  currency_code: product.currency,
                  value: finalPriceValue,
                },
              },
            ],
            application_context: {
              brand_name: 'Aetheria Bio SaaS Platform',
              shipping_preference: 'NO_SHIPPING' as const,
              user_action: 'PAY_NOW' as const,
            },
          });
        }}
        onApprove={async (data) => {
          // actions.order.capture()를 브라우저에서 호출하지 않는다. 캡처와 금액
          // 검증, 플랜 부여는 모두 서버에서 이뤄져야 위변조가 불가능하다.
          if (!data.orderID) {
            throw new Error('PayPal 주문 번호를 확인할 수 없습니다.');
          }
          await onApproveOrder(data.orderID);
        }}
        onError={(err) => {
          console.error('[PayPal] Error:', err);
          onError?.(err);
        }}
        onCancel={() => {
          onCancel?.();
        }}
      />
    </div>
  );
};
