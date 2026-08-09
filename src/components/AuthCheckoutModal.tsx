import React from 'react';
import { UserProfile, UserPlanTier, PaymentReceipt } from '../types';
import { AuthModal } from './AuthModal';
import { SubscriptionCheckoutModal } from './SubscriptionCheckoutModal';

interface AuthCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onPaymentSuccess: (newPlan: UserPlanTier, receipt: PaymentReceipt) => void;
  selectedTier: UserPlanTier;
  isAnnual?: boolean;
}

export const AuthCheckoutModal: React.FC<AuthCheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  onPaymentSuccess,
  selectedTier,
  isAnnual = false
}) => {
  const [authModalOpen, setAuthModalOpen] = React.useState(false);

  if (!isOpen) return null;

  const isLoggedIn = user && user.id !== 'guest';

  // 비로그인 상태일 때는 AuthModal을 먼저 띄우고, 로그인 완료 시 결제 모달 오픈
  if (!isLoggedIn || authModalOpen) {
    return (
      <AuthModal
        isOpen={isOpen}
        onClose={() => {
          setAuthModalOpen(false);
          onClose();
        }}
        initialTab="login"
        onSuccess={() => {
          setAuthModalOpen(false);
        }}
      />
    );
  }

  // 이미 로그인 상태인 경우 순수 구독 결제 모달 띄우기
  return (
    <SubscriptionCheckoutModal
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      selectedTier={selectedTier}
      isAnnual={isAnnual}
      onPaymentSuccess={onPaymentSuccess}
      onRequireAuth={() => setAuthModalOpen(true)}
    />
  );
};
