export type SaasCategory =
  | 'overview_about'
  | 'my_page'
  | 'neurosurgery'
  | 'neurology'
  | 'orthopedics'
  | 'psychiatry'
  | 'cardiology'
  | 'oncology'
  | 'endocrinology'
  | 'immunology'
  | 'dermatology'
  | 'ophthalmology'
  | 'longevity';

export type UserPlanTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: UserPlanTier;
  institution?: string;
  title?: string;
  avatarUrl?: string;
  queriesRemaining: number;
}

export interface TargetAnalysisResult {
  targetId: string;
  targetName: string;
  geneSymbol: string;
  diseaseCategory: string;
  description: string;
  uniprotId: string;
  plddtConfidence: number;
  openTargetsAssociationScore: number;
  knownDrugsCount: number;
  activeClinicalTrials: number;
  pocketVolume?: number;
  gene?: string;
  plddtScore?: number;
  hitCandidates: {
    id: string;
    chemblId: string;
    smiles: string;
    affinityIC50: string;
    rejuvenationOrNeuroProtectionScore: number;
    patentFTO: 'High (Clear FTO)' | 'Moderate' | 'Restricted';
    estimatedMarketValue: string;
    pubChemCid: string;
    estimatedValueUSD?: number;
    ic50?: string;
  }[];
  [key: string]: any;
}

export type TargetData = TargetAnalysisResult;

export interface CandidateCompound {
  id: string;
  chemblId: string;
  smiles: string;
  affinityIC50: string;
  rejuvenationOrNeuroProtectionScore: number;
  patentFTO: 'High (Clear FTO)' | 'Moderate' | 'Restricted';
  estimatedMarketValue: string;
  pubChemCid: string;
  estimatedValueUSD?: number;
  ic50?: string;
  [key: string]: any;
}

export interface PaymentReceipt {
  transactionId: string;
  planTier: UserPlanTier;
  amountUSD: number;
  timestamp: string;
  cardLast4: string;
}

export interface SenoScanAuditResult {
  scanId?: string;
  organType?: string;
  senescentCellLoad?: number;
  senolyticSensitivity?: number;
  recommendedIntervention?: string;
  auditTimestamp?: string;
  client?: any;
  senolyticScore?: number;
  plddtConfidence?: number;
  ftoPatentSafety?: string;
  toxicityRisk?: string;
  recommendedDosageForm?: string;
  [key: string]: any;
}

export interface PipelineResult {
  pipelineId?: string;
  skillCountExecuted?: number;
  targetGene?: string;
  confidenceScore?: number;
  executionLog?: string[];
  monetizationEstimate?: any;
  target?: any;
  candidates?: any[];
  executionTimeSec?: number;
  [key: string]: any;
}

export type LongevityPipelineResult = PipelineResult;
