import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, UserPlus, LogIn, Mail, Lock, User, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useLanguage();

  const [modalTab, setModalTab] = useState<'signup' | 'login'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSelectingGoogle, setIsSelectingGoogle] = useState(false);

  if (!isOpen) return null;

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
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: any) {
      setAuthError(err.message || t('auth.error_generic', '인증 처리에 실패했습니다. 입력 정보를 확인해 주세요.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleAuthClick = () => {
    setAuthError(null);
    setIsSelectingGoogle(true);
  };

  const handleConfirmGoogleSelect = async (selectedEmail: string, selectedName: string) => {
    setIsSelectingGoogle(false);
    setIsProcessing(true);
    setAuthError(null);

    try {
      await signInWithGoogle();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: any) {
      setAuthError(t('auth.google_error', 'Google 인증 실패: ') + (err.message || t('auth.try_again', '다시 시도해 주세요.')));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '480px', background: '#0f172a',
        border: '1px solid rgba(76, 215, 246, 0.35)', borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(76, 215, 246, 0.2)',
        overflow: 'hidden', color: '#dae2fd', position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(135deg, rgba(76, 215, 246, 0.12) 0%, rgba(208, 188, 255, 0.08) 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSelectingGoogle ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.google_select_title', 'Choose a Google Account')}
                </>
              ) : (
                modalTab === 'signup' ? t('auth.signup_title', 'Create New Account') : t('auth.login_title', 'Account Sign In')
              )}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#bcc9cd', margin: '2px 0 0 0' }}>
              {isSelectingGoogle ? t('auth.google_select_subtitle', 'Select an account to continue to Aetheria Bio Portal.') : t('auth.subtitle_only', 'Aetheria Bio Portal Account Sign In & Sign Up')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#bcc9cd', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '26px' }}>

          {isSelectingGoogle ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {/* Account Item 1 */}
                <button
                  type="button"
                  onClick={() => handleConfirmGoogleSelect('glassidentt.rab@gmail.com', 'Aetheria Bio Lead Researcher')}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '14px',
                    background: 'rgba(23, 31, 51, 0.95)', border: '1px solid rgba(76, 215, 246, 0.4)',
                    color: '#fff', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
                      color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                    }}>
                      G
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>Aetheria Bio Lead Researcher</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>glassidentt.rab@gmail.com</div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#4cd7f6" />
                </button>

                {/* Account Item 2 */}
                <button
                  type="button"
                  onClick={() => handleConfirmGoogleSelect('partner.aetheria@gmail.com', 'Global AI Pharma Partner')}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '14px',
                    background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)',
                      color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                    }}>
                      P
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>Global AI Pharma Partner</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>partner.aetheria@gmail.com</div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#ffd700" />
                </button>

                {/* Account Item 3 */}
                <button
                  type="button"
                  onClick={() => handleConfirmGoogleSelect('user.aetheria@gmail.com', 'Bio Science Member')}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '14px',
                    background: 'rgba(23, 31, 51, 0.6)', border: '1px dashed rgba(255, 255, 255, 0.2)',
                    color: '#bcc9cd', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                    }}>
                      +
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#dae2fd' }}>
                      {t('auth.google_account_other', 'Use another Google account')}
                    </div>
                  </div>
                  <ChevronRight size={18} color="#bcc9cd" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSelectingGoogle(false)}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto'
                }}
              >
                <ArrowLeft size={16} /> {t('auth.btn_back_prev', '이전 단계로 돌아가기')}
              </button>
            </div>
          ) : isSuccess ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <CheckCircle2 color="#4edea3" size={54} style={{ margin: '0 auto 16px auto' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {modalTab === 'signup' ? t('auth.signup_success', 'Sign Up Complete!') : t('auth.login_success', 'Sign In Successful!')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>
                {t('auth.success_sub', 'You can now access all portal skills and AI features.')}
              </p>
            </div>
          ) : (
            <>
              {/* Auth Tab Switcher */}
              <div style={{
                display: 'flex', background: 'rgba(23, 31, 51, 0.8)', padding: '4px',
                borderRadius: '12px', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  type="button"
                  onClick={() => { setModalTab('login'); setAuthError(null); }}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                    background: modalTab === 'login' ? '#4cd7f6' : 'transparent',
                    color: modalTab === 'login' ? '#000' : '#bcc9cd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <LogIn size={15} /> {t('auth.tab_login', 'Sign In')}
                </button>
                <button
                  type="button"
                  onClick={() => { setModalTab('signup'); setAuthError(null); }}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                    background: modalTab === 'signup' ? '#4cd7f6' : 'transparent',
                    color: modalTab === 'signup' ? '#000' : '#bcc9cd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <UserPlus size={15} /> {t('auth.tab_signup', 'Sign Up')}
                </button>
              </div>

              {/* Error Display */}
              {authError && (
                <div style={{ padding: '10px 14px', background: 'rgba(255, 99, 132, 0.15)', border: '1px solid rgba(255, 99, 132, 0.4)', borderRadius: '10px', color: '#ff6b81', fontSize: '0.82rem', fontWeight: 700, marginBottom: '18px' }}>
                  {authError}
                </div>
              )}

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleAuthClick}
                disabled={isProcessing}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255, 255, 255, 0.08)', color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                  cursor: isProcessing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {modalTab === 'signup' ? t('auth.btn_google_signup', 'Sign up with Google in 1 second') : t('auth.btn_google_login', 'Sign in with Google in 1 second')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0 16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '0.72rem', color: '#bcc9cd', textTransform: 'uppercase' }}>
                  {modalTab === 'signup' ? t('auth.or_email_signup', 'OR Email Sign Up') : t('auth.or_email_login', 'OR Email Sign In')}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {modalTab === 'signup' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#bcc9cd', marginBottom: '6px', fontWeight: 700 }}>
                      {t('auth.label_name', 'Full Name / Organization')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('auth.placeholder_name', 'Dr. John Doe or Lab Name')}
                        style={{ width: '100%', padding: '11px 12px 11px 36px', borderRadius: '10px', background: 'rgba(23, 31, 51, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#bcc9cd', marginBottom: '6px', fontWeight: 700 }}>
                    {t('auth.label_email', 'Work Email Address')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.placeholder_email', 'researcher@bio-lab.com')}
                      style={{ width: '100%', padding: '11px 12px 11px 36px', borderRadius: '10px', background: 'rgba(23, 31, 51, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#bcc9cd', marginBottom: '6px', fontWeight: 700 }}>
                    {t('auth.label_password', 'Password')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4cd7f6' }} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.placeholder_password', '••••••••')}
                      style={{ width: '100%', padding: '11px 12px 11px 36px', borderRadius: '10px', background: 'rgba(23, 31, 51, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    width: '100%', marginTop: '6px', padding: '13px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #4cd7f6 0%, #4facfe 100%)', color: '#000', fontWeight: 900, fontSize: '0.92rem',
                    cursor: isProcessing ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(76, 215, 246, 0.3)'
                  }}
                >
                  {isProcessing ? t('auth.btn_processing', 'Authenticating...') : modalTab === 'signup' ? t('auth.btn_signup_submit', 'Create Free Account & Get Started') : t('auth.btn_login_submit', 'Complete Sign In')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
