// "실시간 표적 선택" 검색창에 큐레이션된 17개 표적 목록에 없는 유전자를 입력했을 때
// 쓰는 실시간 조회. 서버(api/gene/lookup.ts)가 UniProt/AlphaFold DB/ChEMBL/
// Open Targets/PubMed/ClinicalTrials.gov를 대신 호출해 하나로 합쳐 돌려준다.

export interface GeneLookupResult {
  symbol: string;
  resolved: boolean;
  uniprot: {
    accession: string;
    proteinName: string;
    geneName: string;
    functionSummary: string | null;
    organism: string;
  } | null;
  alphafold: { avgPlddt: number; pdbUrl: string } | null;
  chembl: {
    targetChemblId: string;
    targetName: string;
    activities: Array<{
      moleculeChemblId: string;
      smiles: string | null;
      standardType: string;
      standardValue: string | null;
      standardUnits: string | null;
    }>;
  } | null;
  openTargets: {
    ensemblId: string;
    approvedSymbol: string;
    approvedName: string;
    associatedDiseases: { count: number; rows: Array<{ score: number; diseaseName: string }> };
  } | null;
  pubmed: {
    totalCount: number;
    topArticles: Array<{ pmid: string; title: string; source: string }>;
  } | null;
  clinicalTrials: {
    totalCount: number;
    topTrials: Array<{ nctId: string; briefTitle: string; status: string }>;
  } | null;
  sourcesUsed: string[];
  sourcesFailed: string[];
}

export async function fetchLiveGeneLookup(symbol: string): Promise<GeneLookupResult> {
  const res = await fetch(`/api/gene/lookup?symbol=${encodeURIComponent(symbol)}`);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (payload as { message?: string } | null)?.message || '실시간 데이터베이스 조회에 실패했습니다.';
    throw new Error(message);
  }

  return payload as GeneLookupResult;
}
