import { TargetAnalysisResult, SaasCategory } from '../types';

export const TARGET_PDB_MAP: Record<string, string> = {
  'P10636': '1I1E', // MAPT / Tau
  'P56817': '1FKN', // BACE1
  'P37840': '1XQ8', // SNCA Alpha-Synuclein
  'Q92820': '1CX8', // MMP13
  'P12643': '1REW', // BMP2
  'P28223': '6WHA', // HTR2A
  'Q13224': '3RSD', // GRIN2B
  'Q8NBP7': '2P4E', // PCSK9
  'Q9NZQ7': '5J89', // PD-L1
  'P43220': '6XB1', // GLP1R
  'P01375': '1TNF', // TNF-Alpha
  'P23458': '3L5N', // JAK1
  'P15692': '1FLT', // VEGFA
  'P10415': '1YSW', // BCL2
  'Q96EB6': '4IG9', // SIRT1
};

export const DEPARTMENT_DEFAULT_PROTEINS: Record<string, { pdbId: string; proteinName: string; uniprotId: string }> = {
  neurosurgery: { pdbId: 'AF-P10636-F1', proteinName: 'MAPT (Microtubule-Associated Protein Tau)', uniprotId: 'P10636' },
  neurology: { pdbId: 'AF-P37840-F1', proteinName: 'SNCA (Alpha-Synuclein Lewy Body Target)', uniprotId: 'P37840' },
  orthopedics: { pdbId: 'AF-P45452-F1', proteinName: 'MMP13 (Matrix Metalloproteinase-13)', uniprotId: 'P45452' },
  psychiatry: { pdbId: 'AF-P28223-F1', proteinName: 'HTR2A (5-Hydroxytryptamine Receptor 2A)', uniprotId: 'P28223' },
  cardiology: { pdbId: 'AF-Q8NBP7-F1', proteinName: 'PCSK9 (Proprotein Convertase Subtilisin/Kexin 9)', uniprotId: 'Q8NBP7' },
  oncology: { pdbId: 'AF-Q9NZQ7-F1', proteinName: 'CD274 / PD-L1 (Programmed Death-Ligand 1)', uniprotId: 'Q9NZQ7' },
  endocrinology: { pdbId: 'AF-P43220-F1', proteinName: 'GLP1R (Glucagon-Like Peptide 1 Receptor)', uniprotId: 'P43220' },
  immunology: { pdbId: 'AF-P01375-F1', proteinName: 'TNF-Alpha (Tumor Necrosis Factor)', uniprotId: 'P01375' },
  dermatology: { pdbId: 'AF-P02452-F1', proteinName: 'COL1A1 (Collagen Type I Alpha 1 Chain)', uniprotId: 'P02452' },
  ophthalmology: { pdbId: 'AF-P15692-F1', proteinName: 'VEGFA (Vascular Endothelial Growth Factor A)', uniprotId: 'P15692' },
  longevity: { pdbId: 'AF-Q96EB6-F1', proteinName: 'SIRT1 (Sirtuin 1 Longevity Enzyme)', uniprotId: 'Q96EB6' }
};

export const NEUROSURGERY_TARGETS: Record<string, TargetAnalysisResult> = {
  'TAU': {
    targetId: 'TAU-MAPT',
    targetName: 'Microtubule-Associated Protein Tau (MAPT)',
    geneSymbol: 'MAPT',
    diseaseCategory: '신경외과 / 뇌수술 / 치매 표적',
    description: '신경 엉킴 플라크 억제 및 뇌 손상 방지 핵심 표적.',
    uniprotId: 'P10636',
    plddtConfidence: 94.8,
    openTargetsAssociationScore: 0.98,
    knownDrugsCount: 14,
    activeClinicalTrials: 28,
    hitCandidates: [
      {
        id: 'AE-TAU-901',
        chemblId: 'CHEMBL3829101',
        smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC(=O)C4=CC=CC=N4',
        affinityIC50: '4.2 nM',
        rejuvenationOrNeuroProtectionScore: 96,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$45M (Licensing)',
        pubChemCid: 'CID-11823901'
      }
    ]
  },
  'BACE1': {
    targetId: 'BACE1-NEURO',
    targetName: 'Beta-Secretase 1 (BACE1)',
    geneSymbol: 'BACE1',
    diseaseCategory: '신경외과 / 뇌혈관 / 알츠하이머',
    description: '뇌 아밀로이드 침착 차단 분해 효소.',
    uniprotId: 'P56817',
    plddtConfidence: 96.2,
    openTargetsAssociationScore: 0.95,
    knownDrugsCount: 22,
    activeClinicalTrials: 19,
    hitCandidates: [
      {
        id: 'AE-BAC-305',
        chemblId: 'CHEMBL2109405',
        smiles: 'CC(C)C1=CC(=CC=C1)C2=C(C(=O)NC2=O)C3=CC=C(C=C3)F',
        affinityIC50: '8.1 nM',
        rejuvenationOrNeuroProtectionScore: 94,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$60M (Co-R&D)',
        pubChemCid: 'CID-5591024'
      }
    ]
  }
};

export const NEUROLOGY_TARGETS: Record<string, TargetAnalysisResult> = {
  'SNCA': {
    targetId: 'SNCA-PARKINSON',
    targetName: 'Alpha-Synuclein (SNCA)',
    geneSymbol: 'SNCA',
    diseaseCategory: '신경과 / 파킨슨병 / 루이소체 치매',
    description: '파킨슨병 독성 응집체 루이소체(Lewy Bodies) 형성을 억제하는 신경과 핵심 표적.',
    uniprotId: 'P37840',
    plddtConfidence: 95.2,
    openTargetsAssociationScore: 0.97,
    knownDrugsCount: 20,
    activeClinicalTrials: 35,
    hitCandidates: [
      {
        id: 'AE-SNC-12',
        chemblId: 'CHEMBL2298103',
        smiles: 'C1=CC=C2C(=C1)C(=O)NC2=O.CC1=CC=C(C=C1)S(=O)(=O)N',
        affinityIC50: '3.1 nM',
        rejuvenationOrNeuroProtectionScore: 96,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$80M (Neurology Licensing)',
        pubChemCid: 'CID-991023'
      }
    ]
  }
};

export const ORTHOPEDICS_TARGETS: Record<string, TargetAnalysisResult> = {
  'MMP13': {
    targetId: 'MMP13-CARTILAGE',
    targetName: 'Matrix Metallopeptidase 13 (MMP13)',
    geneSymbol: 'MMP13',
    diseaseCategory: '정형외과 / 퇴행성 관절염 / 연골 재생',
    description: '관절 연골 콜라겐 파괴 효소를 저해하여 퇴행성 관절염 파괴를 차단하는 1순위 타깃.',
    uniprotId: 'Q92820',
    plddtConfidence: 96.5,
    openTargetsAssociationScore: 0.94,
    knownDrugsCount: 19,
    activeClinicalTrials: 26,
    hitCandidates: [
      {
        id: 'AE-ORTH-101',
        chemblId: 'CHEMBL589102',
        smiles: 'C1=CC(=CC=C1C2=CC=C(C=C2)S(=O)(=O)N)NC(=O)C3=CC=NC=C3',
        affinityIC50: '2.4 nM',
        rejuvenationOrNeuroProtectionScore: 97,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$75M (Orthopedics Licensing)',
        pubChemCid: 'CID-449102'
      }
    ]
  },
  'BMP2': {
    targetId: 'BMP2-BONE',
    targetName: 'Bone Morphogenetic Protein 2 (BMP2)',
    geneSymbol: 'BMP2',
    diseaseCategory: '정형외과 / 골재생 / 골다공증',
    description: '골 결손 부위 조골세포 분화 및 뼈 재생 반응을 유도하는 강력한 바이오 타깃.',
    uniprotId: 'P12643',
    plddtConfidence: 95.8,
    openTargetsAssociationScore: 0.91,
    knownDrugsCount: 15,
    activeClinicalTrials: 38,
    hitCandidates: [
      {
        id: 'AE-BMP-30',
        chemblId: 'CHEMBL129038',
        smiles: 'CC(C)C1=C(C=CC(=C1)O)C2=NC(=CS2)C3=CC=CC=C3',
        affinityIC50: '5.6 nM',
        rejuvenationOrNeuroProtectionScore: 93,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$50M (Joint Venture)',
        pubChemCid: 'CID-109283'
      }
    ]
  }
};

export const PSYCHIATRY_TARGETS: Record<string, TargetAnalysisResult> = {
  'HTR2A': {
    targetId: 'HTR2A-SEROTONIN',
    targetName: '5-Hydroxytryptamine Receptor 2A (HTR2A)',
    geneSymbol: 'HTR2A',
    diseaseCategory: '정신건강의학과 / 조현병 / 우울증',
    description: '세로토닌 수용체 조절을 통한 중증 우울증 및 우울 신경 가소성 회복 표적.',
    uniprotId: 'P28223',
    plddtConfidence: 94.1,
    openTargetsAssociationScore: 0.96,
    knownDrugsCount: 52,
    activeClinicalTrials: 84,
    hitCandidates: [
      {
        id: 'AE-PSY-88',
        chemblId: 'CHEMBL489103',
        smiles: 'CCN(CC)C(=O)C1CN(C2CC3=C(NC4=CC=CC=C34)C=C21)C',
        affinityIC50: '1.2 nM',
        rejuvenationOrNeuroProtectionScore: 98,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$110M (Pharma Licensing)',
        pubChemCid: 'CID-991028'
      }
    ]
  },
  'GRIN2B': {
    targetId: 'GRIN2B-NMDA',
    targetName: 'Glutamate Ionotropic Receptor NMDA Subunit 2B (GRIN2B)',
    geneSymbol: 'GRIN2B',
    diseaseCategory: '정신건강의학과 / 난치성 우울증 / 불안장애',
    description: '신경전달물질 글루타메이트 NMDA 수용체 억제를 통한 빠른 항우울 작용 타깃.',
    uniprotId: 'Q13224',
    plddtConfidence: 93.6,
    openTargetsAssociationScore: 0.93,
    knownDrugsCount: 24,
    activeClinicalTrials: 31,
    hitCandidates: [
      {
        id: 'AE-NMD-401',
        chemblId: 'CHEMBL310291',
        smiles: 'CC1=CC=C(C=C1)C2(CCN(CC2)CCC3=CC=C(C=C3)O)O',
        affinityIC50: '4.8 nM',
        rejuvenationOrNeuroProtectionScore: 95,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$65M (Co-R&D)',
        pubChemCid: 'CID-881902'
      }
    ]
  }
};

export const CARDIOLOGY_TARGETS: Record<string, TargetAnalysisResult> = {
  'PCSK9': {
    targetId: 'PCSK9-CARDIO',
    targetName: 'Proprotein Convertase Subtilisin/Kexin Type 9 (PCSK9)',
    geneSymbol: 'PCSK9',
    diseaseCategory: '순환기내과 / 동맥경화 / 고지혈증 / 심혈관',
    description: '혈중 LDL 콜레스테롤 제거 수용체 분해를 차단하여 심근경색을 예방하는 1순위 순환기 타깃.',
    uniprotId: 'Q8NBP7',
    plddtConfidence: 97.8,
    openTargetsAssociationScore: 0.99,
    knownDrugsCount: 42,
    activeClinicalTrials: 95,
    hitCandidates: [
      {
        id: 'AE-CAR-01',
        chemblId: 'CHEMBL3109282',
        smiles: 'CC1=CC=C(C=C1)NC(=O)C2=C(N=C(S2)C3=CC=CC=C3)C4=CC=CC=C4',
        affinityIC50: '0.9 nM',
        rejuvenationOrNeuroProtectionScore: 99,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$280M (Cardiology Mega Blockbuster)',
        pubChemCid: 'CID-301928'
      }
    ]
  }
};

export const ONCOLOGY_TARGETS: Record<string, TargetAnalysisResult> = {
  'PDL1': {
    targetId: 'CD274-PDL1',
    targetName: 'Programmed Cell Death 1 Ligand 1 (CD274 / PD-L1)',
    geneSymbol: 'CD274',
    diseaseCategory: '종양내과 / 면역항암 / 암치료',
    description: '암세포의 면역 회피 기전을 차단하여 면역세포 공격을 유발하는 면역항암 표적.',
    uniprotId: 'Q9NZQ7',
    plddtConfidence: 96.9,
    openTargetsAssociationScore: 0.98,
    knownDrugsCount: 80,
    activeClinicalTrials: 210,
    hitCandidates: [
      {
        id: 'AE-PDL-11',
        chemblId: 'CHEMBL389102',
        smiles: 'CC1=CC=C(C=C1)C2=CC=C(C=C2)CN3CCN(CC3)C(=O)C4=CC=CC=N4',
        affinityIC50: '1.1 nM',
        rejuvenationOrNeuroProtectionScore: 99,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$300M (Blockbuster Tech-Out)',
        pubChemCid: 'CID-7710928'
      }
    ]
  }
};

export const ENDOCRINOLOGY_TARGETS: Record<string, TargetAnalysisResult> = {
  'GLP1R': {
    targetId: 'GLP1R-METABOLIC',
    targetName: 'Glucagon-Like Peptide 1 Receptor (GLP1R)',
    geneSymbol: 'GLP1R',
    diseaseCategory: '내분비내과 / 당뇨 / 비만 / 대사질환',
    description: '인슐린 분비 촉진 및 체중 조절 대사 질환 바이오 파이프라인 최고 인기 표적.',
    uniprotId: 'P43220',
    plddtConfidence: 97.4,
    openTargetsAssociationScore: 0.99,
    knownDrugsCount: 65,
    activeClinicalTrials: 140,
    hitCandidates: [
      {
        id: 'AE-GLP-90',
        chemblId: 'CHEMBL4291028',
        smiles: 'CCC(C)C(C(=O)NC(CC1=CC=CC=C1)C(=O)NC(CC(=O)O)C(=O)N)NC(=O)C',
        affinityIC50: '0.8 nM',
        rejuvenationOrNeuroProtectionScore: 99,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$250M (Global Mega Hit)',
        pubChemCid: 'CID-1290381'
      }
    ]
  }
};

export const IMMUNOLOGY_TARGETS: Record<string, TargetAnalysisResult> = {
  'TNF': {
    targetId: 'TNF-ALPHA',
    targetName: 'Tumor Necrosis Factor Alpha (TNF)',
    geneSymbol: 'TNF',
    diseaseCategory: '류마티스 / 자가면역내과 / 염증성 질환',
    description: '류마티스 관절염 및 크론병 등 전신 류마티스 자가면역 자극을 차단하는 대표 표적.',
    uniprotId: 'P01375',
    plddtConfidence: 96.1,
    openTargetsAssociationScore: 0.97,
    knownDrugsCount: 75,
    activeClinicalTrials: 180,
    hitCandidates: [
      {
        id: 'AE-TNF-05',
        chemblId: 'CHEMBL120192',
        smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)Cl)C3=CN=CC=C3',
        affinityIC50: '1.5 nM',
        rejuvenationOrNeuroProtectionScore: 98,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$220M (Immunology Licensing)',
        pubChemCid: 'CID-889103'
      }
    ]
  }
};

export const DERMATOLOGY_TARGETS: Record<string, TargetAnalysisResult> = {
  'JAK1': {
    targetId: 'JAK1-DERMA',
    targetName: 'Janus Kinase 1 (JAK1)',
    geneSymbol: 'JAK1',
    diseaseCategory: '피부과 / 아토피 / 건선 / 항염증',
    description: '아토피 피부염 및 중증 건선 세포 신호 전달 체계를 차단하는 피부과 1순위 키나아제 억제 표적.',
    uniprotId: 'P23458',
    plddtConfidence: 95.7,
    openTargetsAssociationScore: 0.95,
    knownDrugsCount: 38,
    activeClinicalTrials: 62,
    hitCandidates: [
      {
        id: 'AE-JAK-44',
        chemblId: 'CHEMBL310928',
        smiles: 'CC1CCN(CC1)C2=NC=NC3=C2C=CN3C',
        affinityIC50: '2.1 nM',
        rejuvenationOrNeuroProtectionScore: 96,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$130M (Dermatology Tech-Out)',
        pubChemCid: 'CID-551029'
      }
    ]
  }
};

export const OPHTHALMOLOGY_TARGETS: Record<string, TargetAnalysisResult> = {
  'VEGFA': {
    targetId: 'VEGFA-EYE',
    targetName: 'Vascular Endothelial Growth Factor A (VEGFA)',
    geneSymbol: 'VEGFA',
    diseaseCategory: '안과 / 황반변성 / 당뇨망막병증',
    description: '노인성 황반변성 안구 신생혈관 증식을 억제하여 시력을 보호하는 안과 핵심 표적.',
    uniprotId: 'P15692',
    plddtConfidence: 97.1,
    openTargetsAssociationScore: 0.98,
    knownDrugsCount: 45,
    activeClinicalTrials: 110,
    hitCandidates: [
      {
        id: 'AE-EYE-09',
        chemblId: 'CHEMBL509182',
        smiles: 'C1=CC=C(C=C1)C2=NC(=C(O2)C3=CC=CC=C3)C4=CC=CC=C4',
        affinityIC50: '0.9 nM',
        rejuvenationOrNeuroProtectionScore: 99,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$210M (Ophthalmology Licensing)',
        pubChemCid: 'CID-901827'
      }
    ]
  }
};

export const LONGEVITY_TARGETS: Record<string, TargetAnalysisResult> = {
  'BCL2': {
    targetId: 'BCL2-SENOLYTIC',
    targetName: 'B-Cell Lymphoma 2 (BCL-2)',
    geneSymbol: 'BCL2',
    diseaseCategory: '안티에이징 / 세놀리틱스 / 노화 사멸',
    description: '노화세포 사멸 저항성을 깨뜨리는 핵심 안티에이징 표적.',
    uniprotId: 'P10415',
    plddtConfidence: 95.4,
    openTargetsAssociationScore: 0.92,
    knownDrugsCount: 35,
    activeClinicalTrials: 42,
    hitCandidates: [
      {
        id: 'AE-SENO-77',
        chemblId: 'CHEMBL3545120',
        smiles: 'CC1(CCC(=C(C1)C2=CC=C(C=C2)Cl)C3=CN=C(C=C3)NS(=O)(=O)C4=CC(=C(C=C4)S(=O)(=O)C(F)(F)F)[N+](=O)[O-])C',
        affinityIC50: '1.8 nM',
        rejuvenationOrNeuroProtectionScore: 98,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$120M (Tech-Out)',
        pubChemCid: 'CID-9182377'
      }
    ]
  },
  'SIRT1': {
    targetId: 'SIRT1-REJUV',
    targetName: 'Sirtuin 1 (SIRT1 deacetylase)',
    geneSymbol: 'SIRT1',
    diseaseCategory: '안티에이징 / 장수 유전자 / 세포 대사',
    description: '세포 장수 유전자 회복 1순위 액티베이터 표적.',
    uniprotId: 'Q96EB6',
    plddtConfidence: 93.1,
    openTargetsAssociationScore: 0.89,
    knownDrugsCount: 18,
    activeClinicalTrials: 15,
    hitCandidates: [
      {
        id: 'AE-SRT-019',
        chemblId: 'CHEMBL509821',
        smiles: 'C1=CC(=CC=C1C2=C(C(=O)C3=C(C=C(C=C3O2)O)O)O)O',
        affinityIC50: '15.4 nM',
        rejuvenationOrNeuroProtectionScore: 92,
        patentFTO: 'High (Clear FTO)',
        estimatedMarketValue: '$55M (Co-R&D)',
        pubChemCid: 'CID-5280343'
      }
    ]
  }
};

export const getDepartmentTargetMap = (cat: SaasCategory): Record<string, TargetAnalysisResult> => {
  switch (cat) {
    case 'neurosurgery': return NEUROSURGERY_TARGETS;
    case 'neurology': return NEUROLOGY_TARGETS;
    case 'orthopedics': return ORTHOPEDICS_TARGETS;
    case 'psychiatry': return PSYCHIATRY_TARGETS;
    case 'cardiology': return CARDIOLOGY_TARGETS;
    case 'oncology': return ONCOLOGY_TARGETS;
    case 'endocrinology': return ENDOCRINOLOGY_TARGETS;
    case 'immunology': return IMMUNOLOGY_TARGETS;
    case 'dermatology': return DERMATOLOGY_TARGETS;
    case 'ophthalmology': return OPHTHALMOLOGY_TARGETS;
    case 'longevity': return LONGEVITY_TARGETS;
    default: return NEUROSURGERY_TARGETS;
  }
};

export const runNeuroLongevityAnalysis = async (
  category: SaasCategory,
  targetKey: string
): Promise<TargetAnalysisResult> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const map = getDepartmentTargetMap(category);
  const keys = Object.keys(map);
  return map[targetKey] || map[keys[0]];
};
