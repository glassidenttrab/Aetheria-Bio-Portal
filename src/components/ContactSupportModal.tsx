import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Headset, Send, CheckCircle2, ShieldCheck, Building, User, FileText, X } from 'lucide-react';
import { saveSkillAuditLogDB } from '../services/supabaseService';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [inquiryType, setInquiryType] = useState<'technical' | 'b2b' | 'billing' | 'fto'>('technical');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Supabase DB Audit Log 저장
      await saveSkillAuditLogDB({
        skill_id: 'contact_support_inquiry',
        skill_name: `Customer Support (${inquiryType.toUpperCase()})`,
        category: 'customer_support',
        query_target: `${senderEmail} | ${subject}`,
        execution_time_ms: 100,
        is_bookmarked: true
      });

      // 2. mailto: 자동 연동 (glassidentt.rab@gmail.com)
      const targetAdminEmail = 'glassidentt.rab@gmail.com';
      const emailSubject = encodeURIComponent(`[Aetheria Bio Portal 문의] [${inquiryType.toUpperCase()}] ${subject}`);
      const emailBody = encodeURIComponent(
        `--- Aetheria Bio Portal 1:1 고객센터 문의 ---\n` +
        `연구원 성함: ${senderName}\n` +
        `회원 이메일: ${senderEmail}\n` +
        `소속 기관: ${institution || '미입력'}\n` +
        `문의 유형: ${inquiryType.toUpperCase()}\n` +
        `문의 제목: ${subject}\n\n` +
        `[문의 내용]\n${message}\n\n` +
        `----------------------------------------\n` +
        `발송 시각: ${new Date().toLocaleString()}\n`
      );

      // Open mailto link
      window.location.href = `mailto:${targetAdminEmail}?subject=${emailSubject}&body=${emailBody}`;

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="modal-container-responsive"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'linear-gradient(145deg, #0b1329 0%, #0f172a 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(76, 215, 246, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(76, 215, 246, 0.15)',
          padding: '32px 28px',
          color: '#f8fafc',
          position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto 12px auto',
              color: '#000',
              boxShadow: '0 0 20px rgba(76, 215, 246, 0.4)',
            }}
          >
            <Headset size={28} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
            {t('support.title', '고객센터 & 1:1 기술 지원 문의')}
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
            {t('support.subtitle', 'Aetheria Bio 전담 지원팀이 glassidentt.rab@gmail.com으로 빠르게 답변드립니다.')}
          </p>
        </div>

        {/* Success Banner */}
        {isSuccess ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              textAlign: 'center',
              color: '#4ade80',
            }}
          >
            <CheckCircle2 size={42} style={{ margin: '0 auto 12px auto', color: '#4ade80' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              {t('support.success_title', '문의가 성공적으로 접수되었습니다!')}
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              대표 이메일(<strong>glassidentt.rab@gmail.com</strong>)로 문의 내용이 자동 전달되었습니다. 검토 후 신속히 안내해 드리겠습니다.
            </p>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Inquiry Type Radio / Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                {t('support.label_type', '문의 유형 선택')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'technical', label: t('support.type_tech', '🛠️ 기술 / 스킬 문의') },
                  { id: 'b2b', label: t('support.type_b2b', '🏢 B2B 제약사 제휴') },
                  { id: 'billing', label: t('support.type_billing', '💳 결제 / 구독 문의') },
                  { id: 'fto', label: t('support.type_fto', '⚖️ FTO 특허 판단') },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInquiryType(item.id as any)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: inquiryType === item.id ? '1px solid #4cd7f6' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: inquiryType === item.id ? 'rgba(76, 215, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: inquiryType === item.id ? '#4cd7f6' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                  {t('support.label_name', '성함')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 김승우 박사"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(76, 215, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                  {t('support.label_email', '답변받으실 이메일')}
                </label>
                <input
                  type="email"
                  required
                  placeholder="scientist@institute.org"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(76, 215, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Institution & Subject */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                  {t('support.label_org', '소속 기관')}
                </label>
                <input
                  type="text"
                  placeholder="예: 서울대학교"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(76, 215, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                  {t('support.label_subject', '문의 제목')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('support.placeholder_subject', '문의 제목을 입력하세요')}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(76, 215, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                {t('support.label_message', '문의 상세 내용')}
              </label>
              <textarea
                required
                rows={4}
                placeholder={t('support.placeholder_message', '궁금하신 점이나 기술 지원이 필요한 내용을 자유롭게 적어주세요.')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(76, 215, 246, 0.3)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Admin Notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
              <ShieldCheck size={14} style={{ color: '#4cd7f6' }} />
              <span>수신처: <strong>glassidentt.rab@gmail.com</strong> (평일 기준 24시간 이내 순차 회신)</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '6px',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(76, 215, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? '⏳ 전송 처리 중...' : <><Send size={16} /> {t('support.btn_send', '1:1 문의 메일 발송하기')}</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
