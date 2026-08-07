import React, { useState } from 'react';
import { DollarSign, Zap, TrendingUp, Layers, CheckCircle2, Building2, Crown, Sparkles, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { SenoScanAuditResult } from '../types';

interface B2BSenoScanProps {
  onScanComplete: (result: SenoScanAuditResult) => void;
}

export const B2BSenoScanService: React.FC<B2BSenoScanProps> = ({ onScanComplete }) => {
  const [companyName, setCompanyName] = useState('Nuchido Longevity Corp.');
  const [targetMolecule, setTargetMolecule] = useState('Fisetin-NAD+ Enhancer Complex (AETH-S01)');
  const [tier, setTier] = useState<'Standard' | 'Enterprise' | 'Exclusive IP'>('Enterprise');
  const [isScanning, setIsScanning] = useState(false);

  const tierPrices = {
    'Standard': 3000,
    'Enterprise': 5000,
    'Exclusive IP': 15000
  };

  const handleRunAudit = () => {
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      const auditResult: SenoScanAuditResult = {
        client: {
          companyName,
          targetMolecule,
          reportTier: tier,
          priceUSD: tierPrices[tier]
        },
        senolyticScore: 97.4,
        plddtConfidence: 96.8,
        ftoPatentSafety: 'High Freedom to Operate (Clean FTO)',
        toxicityRisk: 'Low',
        recommendedDosageForm: 'Oral Sublingual Bio-Liposome',
        reportDownloadUrl: '#',
        revenueGeneratedUSD: tierPrices[tier]
      };
      onScanComplete(auditResult);
    }, 2000);
  };

  return (
    <div className="glass-panel p-6 mb-8" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 78, 59, 0.2) 100%)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '8px', display: 'inline-block' }}>
            <Zap size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Fastest Revenue B2B Engine (1~3일 현금 창출)
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AETHERIA SENO-SCAN™ B2B 리포트 발주 & 감사 서비스</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            글로벌 항노화/웰니스 제약사 대상 "10초 AI 노화세포 사멸 검증 & 3D 분자 구조 특허 FTO 보고서" 판매
          </p>
        </div>

        {/* 3D Visual Card in B2B Panel */}
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.5)', height: '110px' }}>
          <img src="/alphafold_3d.jpg" alt="Senolytics 3D Target Pocket" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', padding: '6px 10px', fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ImageIcon size={14} /> 3D BCL-2 Binding Pocket
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 180px', gap: '16px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            고객사 기업명 (B2B Client)
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isScanning}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            검증할 항노화 표적/분자 (Target Molecule)
          </label>
          <input
            type="text"
            value={targetMolecule}
            onChange={(e) => setTargetMolecule(e.target.value)}
            disabled={isScanning}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            보고서 등급 (B2B Tier)
          </label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as any)}
            disabled={isScanning}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Standard">Standard ($3,000)</option>
            <option value="Enterprise">Enterprise ($5,000)</option>
            <option value="Exclusive IP">Exclusive IP ($15,000)</option>
          </select>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isScanning}
          className="glass-button"
          style={{ width: '100%', height: '46px', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-cyan) 100%)', border: 'none' }}
        >
          {isScanning ? 'AI 검증 중...' : 'B2B 리포트 생성 & 청구'}
        </button>
      </div>
    </div>
  );
};
