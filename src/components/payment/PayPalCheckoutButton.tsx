import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { PayPalSaaSProduct } from '../../lib/paypal';

interface PayPalCheckoutButtonProps {
  product: PayPalSaaSProduct;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  product,
  onSuccess,
  onError,
  onCancel,
}) => {
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
                  value: product.price,
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
        onApprove={async (_data, actions) => {
          if (actions.order) {
            const details = await actions.order.capture();
            onSuccess(details);
          }
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
