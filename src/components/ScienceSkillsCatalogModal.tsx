import React, { useState } from 'react';
import { X, Search, Terminal, BookOpen, Dna, Box, Pill, Stethoscope, ChevronRight, Sparkles, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ScienceSkillsCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill?: (skillName: string) => void;
}

interface SkillItem {
  id: string;
  name: string;
  category: 'literature' | 'genomics' | 'protein' | 'cheminformatics' | 'clinical';
  desc: string;
  dbScale: string;
  exampleQuery: string;
}

const SCIENCE_SKILLS_DATA: SkillItem[] = [
  // Literature & Publications (6)
  { id: 'pubmed', name: 'PubMed Literature Search', category: 'literature', desc: 'PubMed 3,500만+ 생의학 논문 초록 및 PMC 전문 풀텍스트 실시간 검색 및 마이닝', dbScale: '3,500만+ 논문', exampleQuery: 'Alzheimer Tau Aggregation Inhibitors' },
  { id: 'openalex', name: 'OpenAlex Scholarly Engine', category: 'literature', desc: '전 세계 2억 5천만+ 학술 자료, 저자, 인용 네트워크 및 DOI 오픈액세스 연동', dbScale: '2억 5,000만+ 학술자료', exampleQuery: 'PCSK9 Cholesterol Clearance Pathways' },
  { id: 'biorxiv', name: 'bioRxiv & medRxiv Preprints', category: 'literature', desc: '최신 생명과학 및 의학 출판 전 프리프린트(Preprint) 실시간 모니터링', dbScale: '50만+ 최신 프리프린트', exampleQuery: 'GLP-1 Receptor Agonist Structure' },
  { id: 'arxiv', name: 'arXiv AI Science Search', category: 'literature', desc: '생물정보학, 컴퓨터 의학, AI 단백질접힘 최신 학술 논문 검색 및 PDF 파싱', dbScale: '230만+ 학술 논문', exampleQuery: 'AlphaFold 3 Diffusion Models' },
  { id: 'europepmc', name: 'Europe PMC Open Access', category: 'literature', desc: '유럽 PMC 오픈액세스 생의학 문헌 풀텍스트 XML 데이터 및 특허 인용 분석', dbScale: '4,200만+ 문헌 데이터', exampleQuery: 'MMP13 Cartilage Degradation' },
  { id: 'predictingthepast', name: 'Ancient Biomolecules Engine', category: 'literature', desc: '고대 게놈 및 바이오 에피그래프 문헌의 AI 텍스트 복원 및 텍스트 엠베딩 파이프라인', dbScale: '10만+ 고대 에피그래프', exampleQuery: 'Ancient Pathogen DNA Sequences' },

  // Protein & 3D Structure (7)
  { id: 'alphafold', name: 'AlphaFold DB 3D Fetch', category: 'protein', desc: 'UniProt ID 기준 2억+ AlphaFold predicted 3D 구조 및 pLDDT 신뢰도 분석', dbScale: '2억+ 3D 단백질 구조', exampleQuery: 'P10636 (MAPT)' },
  { id: 'pdb', name: 'RCSB PDB Structure Search', category: 'protein', desc: '실험적으로 규명된 20만+ X-ray / Cryo-EM 3D 표적 분자 구조 서치 및 메타데이터', dbScale: '21만+ 실험 3D 구조', exampleQuery: '6VXX (SARS-CoV-2 Spike)' },
  { id: 'foldseek', name: 'Foldseek Structural Search', category: 'protein', desc: '3D 구조 유사도 기반 초고속 글로벌 단백질 구조 DB 유사체 탐색', dbScale: '1억+ 3D 핑거프린트', exampleQuery: 'Target Pocket Similarity' },
  { id: 'uniprot', name: 'UniProtKB Functional Knowledge', category: 'protein', desc: '전 세계 표준 단백질 기능, 아미노산 서열, 도메인, 변이 및 번역후수식(PTM)', dbScale: '2억 5,000만+ 단백질', exampleQuery: 'P51587 (BRCA2)' },
  { id: 'interpro', name: 'InterPro Domain Architecture', category: 'protein', desc: 'Pfam, CDD 14개 DB 통합 단백질 핑거프린트, 활성 부위 및 GO 용어 주석', dbScale: '14개 통합 도메인 DB', exampleQuery: 'Kinase Domain Architecture' },
  { id: 'pymol', name: 'PyMOL Structure Renderer', category: 'protein', desc: '표적 단백질 및 리간드 결합 부위 3D 렌더링, 수소결합 측정 및 정밀 이미지 생성', dbScale: '실시간 PyMOL 파이프라인', exampleQuery: 'Binding Site Distance Measurement' },
  { id: 'msa', name: 'Clustal Omega Protein MSA', category: 'protein', desc: '다중 서열 정렬(MSA)을 통한 서열 보존성, 핵심 잔기 및 파이프라인 정밀 비교', dbScale: '최대 4,000개 서열 동시 정렬', exampleQuery: 'GLP-1 Species Conservation' },

  // Genomics & Regulation (8)
  { id: 'gnomad', name: 'gnomAD Human Population Variants', category: 'genomics', desc: '전 세계 인구 집단 변이 빈도(Allele Frequency) 및 손실 Intolerance (pLI/LOEUF)', dbScale: '80만+ 인간 게놈 변이', exampleQuery: 'PCSK9 Loss-of-Function Variants' },
  { id: 'clinvar', name: 'ClinVar Clinical Significance', category: 'genomics', desc: '인간 유전 변이의 병원성(Pathogenic), 유해성 분류 및 임상 근거 큐레이션', dbScale: '200만+ 임상 변이', exampleQuery: 'BRCA1 Pathogenic Mutations' },
  { id: 'dbsnp', name: 'NCBI dbSNP Short Genetic Variants', category: 'genomics', desc: 'rsID ↔ GRCh38 genomic coordinates ↔ HGVS 변환 및 변이 데이터 마이닝', dbScale: '10억+ rsID 변이 데이터', exampleQuery: 'rs121912651' },
  { id: 'gtex', name: 'GTEx Tissue Expression & eQTL', category: 'genomics', desc: '인체 54개 정상 조직별 정량적 RNA 발현량 데이터 및 조직 eQTL 변이', dbScale: '54개 조직 RNA-seq', exampleQuery: 'SNCA Brain Cortex Expression' },
  { id: 'ensembl', name: 'Ensembl Genome & VEP Engine', category: 'genomics', desc: '유전자 엑손 구조, 트랜스크립트, 변이 영향 예측(VEP) 및 게놈 시퀀스', dbScale: '글로벌 참조 게놈 DB', exampleQuery: 'EGFR Transcript Variants' },
  { id: 'hpa', name: 'Human Protein Atlas (HPA)', category: 'genomics', desc: '인체 조직, 세포, 장기별 단백질 공간 발현도 및 면역조직화학(IHC) 이미지', dbScale: '15,000+ 항체 발현 Atlas', exampleQuery: 'PD-L1 Tumor Tissue Localization' },
  { id: 'jaspar', name: 'JASPAR Transcription Factors', category: 'genomics', desc: '전사 인자(TF) 결합 모티프 PWM / PFM 매트릭스 및 프로모터 결합 분석', dbScale: '800+ 전사 인자 모티프', exampleQuery: 'p53 Binding Motif Matrix' },
  { id: 'quickgo', name: 'QuickGO Gene Ontology (GO)', category: 'genomics', desc: '생물학적 과정(BP), 분자 기능(MF), 세포 구성성분(CC) GO 계통 체계 탐색', dbScale: '45,000+ GO 온톨로지', exampleQuery: 'Apoptotic Signaling Pathway' },

  // Clinical & FDA Regulation (11)
  { id: 'clinicaltrials', name: 'ClinicalTrials.gov Protocol Search', category: 'clinical', desc: '45만+ 글로벌 임상시험 단계, 대상 질환, 피험자 자격요건 및 스폰서 포트폴리오 마이닝', dbScale: '45만+ 임상시험 DB', exampleQuery: 'Alzheimer Phase 3 Trials' },
  { id: 'openfda', name: 'openFDA Drug Safety & Recalls', category: 'clinical', desc: 'FDA 부작용 보고(FAERS), 라벨링, 약물 승인, 510(k) 및 리콜 실시간 연동', dbScale: '28개 FDA API 엔드포인트', exampleQuery: 'Pembrolizumab Adverse Events' },
  { id: 'clinvar_clinical', name: 'ClinVar Benchmark Controls', category: 'clinical', desc: '인간 유전 변이의 임상적 병원성 분류 및 Benchmark 양성 대조군 근거 큐레이션', dbScale: '200만+ 임상 변이', exampleQuery: 'Pathogenic Benchmark Control' },
  { id: 'pubmed_clinical', name: 'PubMed Clinical Queries', category: 'clinical', desc: '의학적 검증이 완료된 임상 연구 논문, RCT 및 systematic review 마이닝', dbScale: '3,500만+ 임상 문헌', exampleQuery: 'GLP-1 Trial Systematic Review' },
  { id: 'opentargets_safety', name: 'OpenTargets Safety & Tractability', category: 'clinical', desc: '타깃 분자의 표적 안전성, 독성 위험도 및 임상 약물 개발 가능성 평가', dbScale: '22,000+ 표적 안전성 DB', exampleQuery: 'PCSK9 Safety Assessment' },
  { id: 'alphagenome', name: 'AlphaGenome Single Variant Analysis', category: 'clinical', desc: '비코딩 유전 변이의 전사체(RNA-seq), 염색질 접근성(DNASE) 및 질환 연관도 AI 예측', dbScale: 'AI 변이 병원성 파이프라인', exampleQuery: 'chr19:45411941:T>C (APOE)' },
  { id: 'ucsc_tfbs', name: 'UCSC Conservation & TFBS', category: 'clinical', desc: '진화적 보존도 점수(phyloP, phastCons) 및 ENCODE/JASPAR 전사인자 결합 부위 분석', dbScale: 'UCSC 게놈 브라우저 DB', exampleQuery: 'Promoter Conservation Score' },
  { id: 'unibind', name: 'UniBind TF Binding Site DB', category: 'clinical', desc: '실험적으로 검증된 세포주별 전사 인자 결합 데이터셋 및 BED/FASTA 파이프라인', dbScale: 'Direct TF-DNA Datasets', exampleQuery: 'HEK293 TFBS Coordinates' },
  { id: 'encode', name: 'ENCODE Registry cCREs', category: 'clinical', desc: '인체 세포주별 cis-Regulatory Elements (cCREs) 및 ChIP-seq peak 유전체 주석', dbScale: 'ENCODE SCREEN GraphQL', exampleQuery: 'Brain Enhancer cCREs' },
  { id: 'string_ppi', name: 'STRING Clinical Interaction', category: 'clinical', desc: '임상표적 단백질 상호작용 네트워크 및 질환 신호 전달 경로 억제 파이프라인', dbScale: '14,000개 종 PPI', exampleQuery: 'PD-1 / PD-L1 PPI Complex' },
  { id: 'reactome_pathway', name: 'Reactome Clinical Pathway Enrichment', category: 'clinical', desc: '임상 유전자 리스트의 반응 경로 풍부도(Enrichment) 및 기전별 신호 전달 분석', dbScale: '2,500+ 반응 경로', exampleQuery: 'Immune Checkpoint Pathway' },

  // Drug & Target Binding (6)
  { id: 'chembl', name: 'ChEMBL Bioactivity Database', category: 'cheminformatics', desc: '화합물-표적 결합력(IC50, Ki, EC50) 생물활성 데이터 및 약물유사성 스크리닝', dbScale: '230만+ 화합물 생물활성', exampleQuery: 'Tau Aggregation IC50 Screening' },
  { id: 'pubchem', name: 'PubChem Compound & BioAssay', category: 'cheminformatics', desc: '화학구조, 물성 및 생물검정(BioAssay) 스크리닝 결과 통합 검색', dbScale: '1억+ 화합물 데이터', exampleQuery: 'PCSK9 Inhibitor Screening Assay' },
  { id: 'drugbank', name: 'DrugBank Drug-Target Interactions', category: 'cheminformatics', desc: '승인 및 실험 약물의 표적 단백질, 작용기전 및 상호작용 데이터베이스', dbScale: '1만 7,000+ 약물 프로필', exampleQuery: 'GLP-1 Receptor Agonist Drug Profile' },
  { id: 'bindingdb', name: 'BindingDB Affinity Repository', category: 'cheminformatics', desc: '실험적으로 측정된 단백질-리간드 결합 친화도(Ki, Kd, IC50) 데이터베이스', dbScale: '290만+ 결합 친화도 데이터', exampleQuery: 'BACE1 Ligand Binding Affinity' },
  { id: 'swisstarget', name: 'SwissTargetPrediction', category: 'cheminformatics', desc: '화합물 구조 유사도 기반 잠재적 단백질 표적 예측 및 약물 재창출 분석', dbScale: '60만+ 화합물-표적 예측 모델', exampleQuery: 'SIRT1 Activator Target Prediction' },
  { id: 'dgidb', name: 'DGIdb Drug-Gene Interaction DB', category: 'cheminformatics', desc: '약물-유전자 상호작용 및 druggable genome 분류 통합 데이터베이스', dbScale: '5만+ 약물-유전자 상호작용', exampleQuery: 'EGFR Druggable Interaction Category' }
];

export const ScienceSkillsCatalogModal: React.FC<ScienceSkillsCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectSkill
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: t('skills.cat_all', '전체 (38+)'), icon: <Database size={16} /> },
    { id: 'literature', label: t('skills.cat_literature', '논문 & 문헌 (6)'), icon: <BookOpen size={16} /> },
    { id: 'protein', label: t('skills.cat_protein', '단백질 & 3D 구조 (7)'), icon: <Box size={16} /> },
    { id: 'genomics', label: t('skills.cat_genomics', '유전체 & 게놈 (8)'), icon: <Dna size={16} /> },
    { id: 'cheminformatics', label: t('skills.cat_cheminformatics', '약물 & 표적 결합 (6)'), icon: <Pill size={16} /> },
    { id: 'clinical', label: t('skills.cat_clinical', '임상 & FDA (11)'), icon: <Stethoscope size={16} /> },
  ];

  const localizedSkills = SCIENCE_SKILLS_DATA.map(skill => ({
    ...skill,
    desc: t(`skills.desc.${skill.id}`, skill.desc),
    dbScale: t(`skills.dbscale.${skill.id}`, skill.dbScale)
  }));

  const filteredSkills = localizedSkills.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesQuery = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.dbScale.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '1050px', height: '90vh',
        borderRadius: '24px', border: '1px solid rgba(76, 215, 246, 0.4)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 16, 31, 0.99) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(76, 215, 246, 0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(23, 31, 51, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000'
            }}>
              <Terminal size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {t('skills.banner_title', '38+ 생의학 라이브 빅데이터 사이언스 스킬 탐색기')}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#8899a6', margin: 0, marginTop: '2px' }}>
                {t('skills.banner_subtitle', 'PubMed, OpenAlex, AlphaFold DB, ClinicalTrials 등 글로벌 38+ 라이브 데이터베이스 파이프라인')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#dae2fd', borderRadius: '12px', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div style={{
          padding: '16px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(11, 19, 38, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  border: selectedCategory === cat.id ? '1px solid rgba(76, 215, 246, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedCategory === cat.id ? 'rgba(76, 215, 246, 0.2)' : 'transparent',
                  color: selectedCategory === cat.id ? '#4cd7f6' : '#8899a6'
                }}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8899a6' }} />
            <input
              type="text"
              placeholder={t('skills.search_placeholder', '스킬명, DB명 검색...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px',
                background: 'rgba(23, 31, 51, 0.8)', border: '1px solid rgba(76, 215, 246, 0.3)',
                color: '#ffffff', fontSize: '0.82rem'
              }}
            />
          </div>
        </div>

        {/* Skill Cards Grid Container */}
        <div style={{
          padding: '24px 28px', overflowY: 'auto', flex: 1,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', alignContent: 'start'
        }}>
          {filteredSkills.map(skill => (
            <div
              key={skill.id}
              className="glass-panel"
              style={{
                padding: '18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(23, 31, 51, 0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {skill.name}
                  </h4>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                    {skill.dbScale}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#bcc9cd', margin: 0, lineHeight: 1.5, marginBottom: '12px' }}>
                  {skill.desc}
                </p>
              </div>

              <div>
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(10, 16, 31, 0.8)', border: '1px solid rgba(76, 215, 246, 0.2)', fontSize: '0.75rem', color: '#8899a6', marginBottom: '12px' }}>
                  <span style={{ color: '#4cd7f6', fontWeight: 800 }}>Sample: </span> {skill.exampleQuery}
                </div>

                <button
                  onClick={() => {
                    if (onSelectSkill) onSelectSkill(skill.name);
                    onClose();
                  }}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(76, 215, 246, 0.4)',
                    background: 'rgba(76, 215, 246, 0.15)', color: '#4cd7f6', fontWeight: 800, fontSize: '0.8rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <span>{t('skills.scan_btn', '라이브 파이프라인 스캔')}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.82rem', color: '#8899a6', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#4cd7f6" />
            <span>{t('skills.results_count', '총 {count}개의 라이브 생의학 빅데이터 스킬 검색됨').replace('{count}', String(filteredSkills.length))}</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 22px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
              color: '#000', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            {t('legal.confirm', '확인 및 닫기')}
          </button>
        </div>
      </div>
    </div>
  );
};
