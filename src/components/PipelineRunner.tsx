import React, { useState } from 'react';
import { Play, Sparkles, Activity, ShieldCheck, Database, Layers, ArrowRight, DollarSign, Award, FileText, HeartPulse } from 'lucide-react';
import { PipelineResult, LongevityPipelineResult } from '../types';

interface PipelineRunnerProps {
  onComplete: (result: PipelineResult) => void;
  onLongevityComplete?: (result: LongevityPipelineResult) => void;
  mode: 'pharma' | 'longevity';
}

export const PipelineRunner: React.FC<PipelineRunnerProps> = ({ onComplete, onLongevityComplete, mode }) => {
  const [targetGene, setTargetGene] = useState(mode === 'longevity' ? 'BCL-2 (Senolytics)' : 'EGFR');
  const [disease, setDisease] = useState(mode === 'longevity' ? 'Cellular Senescence / Rejuvenation' : 'Non-Small Cell Lung Cancer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const pharmaSteps = [
    { title: 'OpenTargets & QuickGO Validation', skill: 'opentargets-database' },
    { title: 'AlphaFold 3D Structure & Binding Pocket', skill: 'alphafold-database-fetch-and-analyze' },
    { title: 'ChEMBL & PubChem Virtual Screening', skill: 'chembl-database' },
    { title: 'GTEx & OpenFDA Safety Assessment', skill: 'openfda-database' },
    { title: 'PubMed & OpenAlex Literature Mining', skill: 'pubmed-database' }
  ];

  const longevitySteps = [
    { title: 'GTEx & Human Protein Atlas Senescent Gene Expression', skill: 'gtex-database' },
    { title: 'AlphaFold 3D Anti-Apoptotic Pocket Targeting', skill: 'alphafold-database-fetch-and-analyze' },
    { title: 'ChEMBL Senolytics Selective Compound Mining', skill: 'chembl-database' },
    { title: 'Epigenetic Clock & Cell Rejuvenation Index', skill: 'jaspar-database' },
    { title: 'FTO & Novel Longevity Molecule Patent Scan', skill: 'literature-search-openalex' }
  ];

  const steps = mode === 'longevity' ? longevitySteps : pharmaSteps;

  const handleRun = () => {
    setIsRunning(true);
    setCurrentStep(0);

    let stepCounter = 0;
    const interval = setInterval(() => {
      stepCounter++;
      if (stepCounter < steps.length) {
        setCurrentStep(stepCounter);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        
        if (mode === 'longevity' && onLongevityComplete) {
          onLongevityComplete({
            target: {
              targetName: targetGene,
              pathwayCategory: 'Senolytics / Anti-Aging',
              uniprotId: 'P10415',
              senescentCellSelectivity: 94.8,
              plddtScore: 95.2
            },
            candidates: [
              {
                id: 'AETH-SENOLYTIC-01',
                smiles: 'CC1=C(C(=O)C2=C(C1=O)C(=CC=C2)O)O',
                mechanism: 'Selective Senescent Cell Apoptosis (BCL-2 Inhibitor)',
                rejuvenationIndex: 96.5,
                ic50_nM: 0.28,
                patentStatus: 'Novel / High FTO Patentable',
                estimatedValueUSD: '$85M'
              },
              {
                id: 'AETH-SENOLYTIC-02',
                smiles: 'C1=CC=C(C=C1)C2=CC(=O)C3=C(C=C(C=C3O2)O)O',
                mechanism: 'Mitochondrial Mitophagy Activator & NAD+ Enhancer',
                rejuvenationIndex: 91.2,
                ic50_nM: 0.85,
                patentStatus: 'Composition of Matter Patent Pending',
                estimatedValueUSD: '$52M'
              }
            ],
            executionTimeSec: 3.2
          });
        } else {
          onComplete({
            target: {
              gene: targetGene.toUpperCase(),
              uniprotId: 'P00533',
              associationScore: 0.96,
              pathway: 'PI3K-Akt / MAPK Signal Transduction',
              plddtScore: 93.8,
              pocketVolume: 462.5,
              bindingResidues: ['Leu718', 'Val726', 'Ala743', 'Lys745', 'Met793']
            },
            candidates: [
              {
                id: 'AETH-2026-01',
                smiles: 'COC1=C(OCC2=CC=CC=C2)C=C3C(=C1)N=CN=C3NC4=CC=C(F)C(=C4)Cl',
                ic50: 0.42,
                similarity: 0.94,
                safetyScore: 98.2,
                patentStatus: 'Novel / High Freedom-to-Operate',
                estimatedValueUSD: '$45M'
              }
            ],
            executionTimeSec: 3.4,
            monetizationEstimate: {
              saasRevenuePerRun: 1500,
              techTransferMilestoneUSD: '$120M',
              licensingRoyalty: '4.5%'
            }
          });
        }
      }
    }, 700);
  };

  return (
    <div className="glass-panel p-6 mb-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '8px', display: 'inline-block' }}>
            <HeartPulse size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {mode === 'longevity' ? 'AI Longevity & Senolytics Engine Active' : 'AI Science Engine Active'}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {mode === 'longevity' ? '역노화(Anti-Aging) 세놀리틱스 AI 파이프라인' : 'AI 파이프라인 실시간 실행 & 수익화 추정기'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'longevity'
              ? '노화 세포(Senescent Cells) 사멸 및 세포 재생 후보분자 탐색 플랫폼'
              : 'DeepMind Science Skills 기반 타깃 발굴 및 약물 가치 산출'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            {mode === 'longevity' ? '노화 타깃 유전자 (Longevity Target)' : '표적 유전자 (Target Gene)'}
          </label>
          <input
            type="text"
            value={targetGene}
            onChange={(e) => setTargetGene(e.target.value)}
            disabled={isRunning}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            {mode === 'longevity' ? '역노화 적응증 (Rejuvenation Scope)' : '적응증 질환 (Disease Context)'}
          </label>
          <input
            type="text"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            disabled={isRunning}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="glass-button"
            style={{ width: '100%', height: '48px', justifyContent: 'center' }}
          >
            {isRunning ? (
              <>
                <Activity size={18} className="pulsing-glow" />
                분석 진행 중...
              </>
            ) : (
              <>
                <Play size={18} />
                {mode === 'longevity' ? '역노화 파이프라인 실행' : '파이프라인 가동'}
              </>
            )}
          </button>
        </div>
      </div>

      {isRunning && (
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
              Step {currentStep + 1} / {steps.length}: {steps[currentStep].title}
            </span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Skill: {steps[currentStep].skill}
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
