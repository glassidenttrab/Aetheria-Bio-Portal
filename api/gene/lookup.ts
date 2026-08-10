import { headerValue, type ApiRequest, type ApiResponse } from '../_lib/http.js';
import {
  fetchUniProt,
  fetchAlphaFoldSummary,
  fetchChembl,
  fetchOpenTargets,
  fetchPubMed,
  fetchClinicalTrials,
} from '../_lib/geneLookup.js';

/**
 * GET /api/gene/lookup?symbol=IDH1
 *
 * "실시간 표적 선택" 검색창이 큐레이션된 17개 표적 목록에 없는 유전자를
 * 입력하면 그냥 0건으로 끝나버리던 문제를 해결하기 위한 엔드포인트. 여러
 * 공개 생의학 API(UniProt/AlphaFold DB/ChEMBL/Open Targets/PubMed/
 * ClinicalTrials.gov)를 병렬로 조회해 하나의 응답으로 합친다.
 *
 * ChEMBL/Open Targets/ClinicalTrials.gov는 브라우저에서 직접 호출하면 CORS로
 * 막히기 때문에(응답 헤더에 Access-Control-Allow-Origin이 없음, curl로 확인함)
 * 서버에서 대신 호출한다. 일부 소스가 실패해도 나머지 결과는 그대로 반환한다
 * (Promise.allSettled) — 외부 API 하나가 느리거나 죽었다고 검색 전체가
 * 실패하면 안 되기 때문.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const symbolRaw = headerValue(req.query.symbol) ?? '';
  const symbol = symbolRaw.trim().toUpperCase().slice(0, 40);

  if (!symbol || !/^[A-Z0-9-]+$/.test(symbol)) {
    return res.status(400).json({ error: 'invalid_symbol', message: '올바른 유전자 심볼을 입력해 주세요.' });
  }

  const sourcesUsed: string[] = [];
  const sourcesFailed: string[] = [];

  const uniprotResult = await settle(fetchUniProt(symbol), 'uniprot-database', sourcesUsed, sourcesFailed);

  // AlphaFold DB / ChEMBL은 UniProt accession이 있어야 조회 가능하므로, UniProt이
  // 실패하면 이 둘은 아예 시도하지 않는다(어차피 accession이 없어 조회 불가).
  const accession = uniprotResult?.accession ?? null;

  const [alphafoldResult, chemblResult, openTargetsResult, pubmedResult, clinicalTrialsResult] =
    await Promise.all([
      accession
        ? settle(fetchAlphaFoldSummary(accession), 'alphafold-database-fetch-and-analyze', sourcesUsed, sourcesFailed)
        : Promise.resolve(null),
      accession
        ? settle(fetchChembl(accession), 'chembl-database', sourcesUsed, sourcesFailed)
        : Promise.resolve(null),
      settle(fetchOpenTargets(symbol), 'opentargets-database', sourcesUsed, sourcesFailed),
      settle(fetchPubMed(symbol), 'pubmed-database', sourcesUsed, sourcesFailed),
      settle(fetchClinicalTrials(symbol), 'clinical-trials-database', sourcesUsed, sourcesFailed),
    ]);

  return res.status(200).json({
    symbol,
    resolved: uniprotResult !== null,
    uniprot: uniprotResult,
    alphafold: alphafoldResult,
    chembl: chemblResult,
    openTargets: openTargetsResult,
    pubmed: pubmedResult,
    clinicalTrials: clinicalTrialsResult,
    sourcesUsed,
    sourcesFailed,
  });
}

async function settle<T>(
  promise: Promise<T | null>,
  skillId: string,
  sourcesUsed: string[],
  sourcesFailed: string[]
): Promise<T | null> {
  try {
    const value = await promise;
    if (value !== null) sourcesUsed.push(skillId);
    return value;
  } catch (err) {
    console.warn(`[gene/lookup] ${skillId} 조회 실패`, err);
    sourcesFailed.push(skillId);
    return null;
  }
}
