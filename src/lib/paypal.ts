export const PAYPAL_CONFIG = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
  currency: 'USD',
  intent: 'capture' as const,
};

export interface PayPalSaaSProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  planTier: 'pro' | 'enterprise';
}

export const SAAS_PAYPAL_PRODUCTS: Record<'pro' | 'enterprise', PayPalSaaSProduct> = {
  pro: {
    id: 'neuroaegis-pro',
    name: 'Pro Neuro-Rejuve SaaS Plan',
    description: '38 Science Skills 치매 및 안티에이징 정밀 타깃 분석 및 Executive PDF 리포트',
    price: '490.00',
    currency: 'USD',
    planTier: 'pro'
  },
  enterprise: {
    id: 'neuroaegis-enterprise',
    name: 'Enterprise Solopreneur VIP Plan',
    description: '무제한 38+ 사이언스 스킬 파이프라인 + 전용 API 및 B2B 감사 보고서',
    price: '2500.00',
    currency: 'USD',
    planTier: 'enterprise'
  }
};
