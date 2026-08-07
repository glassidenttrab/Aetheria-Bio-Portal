import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface WhyChooseUsSectionProps {
  onOpenPricingModal?: () => void;
}

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ onOpenPricingModal }) => {
  const { t } = useLanguage();

  return (
    <section
      style={{
        marginTop: '40px',
        marginBottom: '40px',
        padding: '32px 28px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(234, 179, 8, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#facc15',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
            letterSpacing: '0.5px',
          }}
        >
          <span>{t('whyus.badge_top', '🏆 COMPETITIVE ADVANTAGE MOAT')}</span>
        </div>
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
          }}
        >
          {t('whyus.title', 'Why Choose Aetheria Bio Portal?')}
        </h2>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8' }}>
          {t('whyus.subtitle', '글로벌 레거시 AI 바이오 플랫폼 대비 4대 독점 차별화 경쟁 우위')}
        </p>
      </div>

      {/* 4 Feature Badges */}
      <div
        className="whyus-grid-responsive"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🧬</span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>
              {t('whyus.badge1', '🧬 올인원 38+ 스킬')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {t('whyus.badge1_sub', '3D + FTO + SenoScan 통합')}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>💳</span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#facc15' }}>
              {t('whyus.badge2', '💳 파격적 투명 구독')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {t('whyus.badge2_sub', 'Pro $490 / Ent $2,500')}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🌐</span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c084fc' }}>
              {t('whyus.badge3', '🌐 8개 국어 글로벌')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {t('whyus.badge3_sub', '한·영·일·중·스·독·이·불')}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>💻</span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4ade80' }}>
              {t('whyus.badge4', '💻 개발자 API 샌드박스')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {t('whyus.badge4_sub', '10분 만에 LIMS/ELN 연동')}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.85rem',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <th style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: 700, width: '22%' }}>
                {t('whyus.col_feature', '비교 항목 (Feature)')}
              </th>
              <th style={{ padding: '14px 16px', color: '#f87171', fontWeight: 700, width: '38%' }}>
                ❌ {t('whyus.col_legacy', '기존 글로벌 레거시 AI 플랫폼 (Insilico, Schrödinger 등)')}
              </th>
              <th style={{ padding: '14px 16px', color: '#4ade80', fontWeight: 700, width: '40%', background: 'rgba(234, 179, 8, 0.1)' }}>
                ⚡ {t('whyus.col_aetheria', 'Aetheria Bio Portal (우리의 혁신)')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f8fafc' }}>
                {t('whyus.row1_title', '가격 정책 & 계약 방식')}
              </td>
              <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                {t('whyus.row1_legacy', '연 $5만~$30만 (수억 원) 비공개 견적 및 3개월 영업 미팅 소요')}
              </td>
              <td style={{ padding: '14px 16px', color: '#facc15', fontWeight: 700, background: 'rgba(234, 179, 8, 0.05)' }}>
                {t('whyus.row1_aetheria', 'Free / Pro ($490) / Enterprise ($2,500) 투명 구독 (연간 15% 추가 할인)')}
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f8fafc' }}>
                {t('whyus.row2_title', '기능 통합성 (Workflow Integration)')}
              </td>
              <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                {t('whyus.row2_legacy', '파편화된 개별 도구 (3D 도킹 / 논문 검색 / LIMS 이중 구매)')}
              </td>
              <td style={{ padding: '14px 16px', color: '#38bdf8', fontWeight: 700, background: 'rgba(234, 179, 8, 0.05)' }}>
                {t('whyus.row2_aetheria', '올인원 38+ 스킬 & AlphaFold 3D & FTO 특허 & SenoScan 감사 일체형')}
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f8fafc' }}>
                {t('whyus.row3_title', '다국어 & 글로벌 접근성')}
              </td>
              <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                {t('whyus.row3_legacy', '영문(EN) 단독 인터페이스 지원')}
              </td>
              <td style={{ padding: '14px 16px', color: '#c084fc', fontWeight: 700, background: 'rgba(234, 179, 8, 0.05)' }}>
                {t('whyus.row3_aetheria', '8개 대륙별 언어 (한/영/일/중/스/독/이/불) 실시간 동적 전환')}
              </td>
            </tr>

            <tr>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f8fafc' }}>
                {t('whyus.row4_title', '개발자 연동 & API 샌드박스')}
              </td>
              <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                {t('whyus.row4_legacy', '수개월 간의 기술 컨설팅 및 추가 구축비 발생')}
              </td>
              <td style={{ padding: '14px 16px', color: '#4ade80', fontWeight: 700, background: 'rgba(234, 179, 8, 0.05)' }}>
                {t('whyus.row4_aetheria', '웹 브라우저 상의 10분 만에 끝나는 실시간 개발자 API 샌드박스 콘솔')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA Button */}
      {onOpenPricingModal && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={onOpenPricingModal}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(234, 179, 8, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {t('whyus.btn_compare', '💳 요금제 플랜 & 상세 혜택 비교하기 →')}
          </button>
        </div>
      )}
    </section>
  );
};
