// AlphaFold Protein Structure Database (EBI) 실시간 연동.
// 공개 REST API로 별도 API 키가 필요 없다. https://alphafold.ebi.ac.uk/api-docs
const ALPHAFOLD_API_BASE = 'https://alphafold.ebi.ac.uk/api/prediction';

// UniProt 정식 accession 형식(예: P10636, O75874, A0A0B4J2F0). 이 형식이 아니면
// "IDH1", "EGFR" 같은 유전자 심볼로 보고 UniProt 검색으로 먼저 accession을 찾는다.
const UNIPROT_ACCESSION_PATTERN =
  /^([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2})$/i;

export function looksLikeUniProtAccession(value: string): boolean {
  return UNIPROT_ACCESSION_PATTERN.test(value.trim());
}

/**
 * 유전자 심볼("IDH1" 등)을 UniProt accession("O75874")으로 변환한다. UniProt REST API는
 * CORS가 열려 있어 브라우저에서 직접 호출 가능(AlphaFold DB와 동일한 패턴).
 * 못 찾으면 null을 반환한다(예외를 던지지 않음 — 호출부가 원래 입력값으로 폴백할 수 있도록).
 */
export async function resolveGeneSymbolToUniProtAccession(geneSymbol: string): Promise<string | null> {
  const query = encodeURIComponent(`gene:${geneSymbol.trim()} AND organism_id:9606 AND reviewed:true`);
  const res = await fetch(
    `https://rest.uniprot.org/uniprotkb/search?query=${query}&format=json&fields=accession&size=1`
  );
  if (!res.ok) return null;

  const data = (await res.json()) as { results?: Array<{ primaryAccession?: string }> };
  return data.results?.[0]?.primaryAccession ?? null;
}

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
