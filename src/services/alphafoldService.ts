// AlphaFold Protein Structure Database (EBI) 실시간 연동.
// 공개 REST API로 별도 API 키가 필요 없다. https://alphafold.ebi.ac.uk/api-docs
const ALPHAFOLD_API_BASE = 'https://alphafold.ebi.ac.uk/api/prediction';

export interface AlphaFoldPrediction {
  uniprotAccession: string;
  modelEntityId: string;
  globalPlddt: number; // 0-100
  fractionVeryLow: number;
  fractionLow: number;
  fractionConfident: number;
  fractionVeryHigh: number;
  sequenceLength: number;
  organismName?: string;
  modelCreatedDate?: string;
  cifUrl: string;
  pdbUrl: string;
  paeImageUrl?: string;
}

export class AlphaFoldNotFoundError extends Error {}

export async function fetchAlphaFoldPrediction(uniprotIdRaw: string): Promise<AlphaFoldPrediction> {
  const uniprotId = uniprotIdRaw.trim().toUpperCase();
  const res = await fetch(`${ALPHAFOLD_API_BASE}/${uniprotId}`);

  if (res.status === 404) {
    throw new AlphaFoldNotFoundError(`AlphaFold DB에 '${uniprotId}' 항목이 없습니다.`);
  }
  if (!res.ok) {
    throw new Error(`AlphaFold API 호출 실패 (HTTP ${res.status})`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new AlphaFoldNotFoundError(`AlphaFold DB에 '${uniprotId}' 항목이 없습니다.`);
  }

  // 동일 UniProt ID에 여러 isoform 항목이 반환될 수 있어 정확히 일치하는 canonical 항목을 우선 사용
  const entry = data.find((e: any) => e.uniprotAccession === uniprotId) ?? data[0];

  return {
    uniprotAccession: entry.uniprotAccession,
    modelEntityId: entry.modelEntityId,
    globalPlddt: entry.globalMetricValue,
    fractionVeryLow: entry.fractionPlddtVeryLow ?? 0,
    fractionLow: entry.fractionPlddtLow ?? 0,
    fractionConfident: entry.fractionPlddtConfident ?? 0,
    fractionVeryHigh: entry.fractionPlddtVeryHigh ?? 0,
    sequenceLength: entry.sequenceEnd ?? entry.uniprotEnd ?? 0,
    organismName: entry.organismScientificName,
    modelCreatedDate: entry.modelCreatedDate,
    cifUrl: entry.cifUrl,
    pdbUrl: entry.pdbUrl,
    paeImageUrl: entry.paeImageUrl,
  };
}

export async function fetchAlphaFoldPdbText(pdbUrl: string): Promise<string> {
  const res = await fetch(pdbUrl);
  if (!res.ok) {
    throw new Error(`AlphaFold 구조 파일 다운로드 실패 (HTTP ${res.status})`);
  }
  return res.text();
}
