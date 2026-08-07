import React from 'react';
import { DollarSign, Zap, TrendingUp, Layers, CheckCircle2, Building2, Crown, Sparkles } from 'lucide-react';
import { PipelineResult } from '../types';

interface MonetizationDashboardProps {
  result: PipelineResult | null;
}

export const MonetizationDashboard: React.FC<MonetizationDashboardProps> = ({ result }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
      {/* SaaS Tier */}
      <div className="glass-panel p-6" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)' }} />
        <span className="badge badge-cyan" style={{ marginBottom: '12px', display: 'inline-block' }}>
          단기 매출 (Short-term)
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>B2B AI SaaS 구독</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          제약사/연구소 대상 자동화 에이전트 구독 서비스
        </p>

        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '16px' }}>
          $1,500 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ Run</span>
        </div>

        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-cyan)" /> Target & 3D Structure Auto-Mining
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-cyan)" /> Literature & Patent FTO Scan
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-cyan)" /> 월 1,000건 가동 시 $1.5M/mo ARR
          </li>
        </ul>
      </div>

      {/* Joint R&D Tier */}
      <div className="glass-panel p-6" style={{ position: 'relative', overflow: 'hidden', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <span className="badge badge-purple" style={{ marginBottom: '12px', display: 'inline-block' }}>
          중기 매출 (Mid-term)
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>빅파마 공동 R&D</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          글로벌 제약사와 난치성 타깃 후보물질 도출 계약
        </p>

        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '16px' }}>
          {result ? result.monetizationEstimate.techTransferMilestoneUSD : '$120M+'}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}> Milestone</span>
        </div>

        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-purple)" /> Upfront 계약금 ($5M ~ $15M)
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-purple)" /> 임상 단계별 성공 마일스톤
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-purple)" /> 개발 위험 분산형 모델
          </li>
        </ul>
      </div>

      {/* Tech-Out Tier */}
      <div className="glass-panel p-6" style={{ position: 'relative', overflow: 'hidden', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
        <span className="badge badge-emerald" style={{ marginBottom: '12px', display: 'inline-block' }}>
          장기 유니콘 (Unicorn L/O)
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>기술 이관 (Tech-Out)</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          자체 확보 파이프라인 전임상/1상 진입 후 매각
        </p>

        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '16px' }}>
          $1.2B+ <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}> Valuation</span>
        </div>

        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-emerald)" /> First-in-class 파이프라인 소유
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-emerald)" /> {result ? result.monetizationEstimate.licensingRoyalty : '3~5%'} 상용화 매출 로열티
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="var(--accent-emerald)" /> NASDAQ / KOSDAQ 특례 상장
          </li>
        </ul>
      </div>
    </div>
  );
};
