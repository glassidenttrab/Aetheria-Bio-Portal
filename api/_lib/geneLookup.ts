/**
 * 유전자 심볼 하나로 여러 공개 생의학 데이터베이스를 실시간 조회하는 헬퍼 모음.
 *
 * 이 앱의 ".agents/skills/" 아래에는 UniProt·OpenTargets·ChEMBL·PubMed·
 * ClinicalTrials.gov 등을 실제로 호출하는 Claude Agent Skill(Python 스크립트)이
 * 이미 존재한다. 다만 그건 AI 에이전트가 터미널에서 실행하는 도구라 브라우저가
 * 직접 쓸 수 없다. 여기서는 같은 API 엔드포인트·쿼리 패턴을 그대로 참고해
 * TypeScript 서버리스 함수에서 재현한다 — SaaSPlatformView의 "실시간 표적 선택"이
 * 고정된 17개 큐레이션 표적 목록에만 갇혀 있던 문제(검색해도 없는 유전자는 그냥
 * 0건으로 나옴)를 해결하기 위함이다.
 *
 * ChEMBL·OpenTargets·ClinicalTrials.gov는 브라우저에서 직접 호출 시 CORS
 * 헤더가 없어 막히므로 서버에서 대신 호출한다(UniProt·PubMed·AlphaFold DB는
 * CORS가 열려 있지만, 한 곳에서 일관되게 처리하기 위해 전부 서버에서 조회한다).
 */

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} 응답 시간 초과(${ms}ms)`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

const TIMEOUT_MS = 8000;

// -----------------------------------------------------------------------------
// 1. UniProt — 단백질 기본 정보 (공식 명칭·기능 설명·accession)
// -----------------------------------------------------------------------------
export interface UniProtResult {
  accession: string;
  proteinName: string;
  geneName: string;
  functionSummary: string | null;
  organism: string;
}

export async function fetchUniProt(symbol: string): Promise<UniProtResult | null> {
  const url =
    `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(
      `gene:${symbol} AND organism_id:9606 AND reviewed:true`
    )}&format=json&fields=accession,protein_name,gene_names,cc_function,organism_name&size=1`;

  const res = await withTimeout(fetch(url), TIMEOUT_MS, 'UniProt');
  if (!res.ok) throw new Error(`UniProt API 오류 (HTTP ${res.status})`);

  const data = (await res.json()) as {
    results?: Array<{
      primaryAccession: string;
      proteinDescription?: { recommendedName?: { fullName?: { value?: string } } };
      genes?: Array<{ geneName?: { value?: string } }>;
      comments?: Array<{ commentType?: string; texts?: Array<{ value?: string }> }>;
      organism?: { scientificName?: string };
    }>;
  };

  const entry = data.results?.[0];
  if (!entry) return null;

  const functionComment = entry.comments?.find((c) => c.commentType === 'FUNCTION');

  return {
    accession: entry.primaryAccession,
    proteinName: entry.proteinDescription?.recommendedName?.fullName?.value || symbol,
    geneName: entry.genes?.[0]?.geneName?.value || symbol,
    functionSummary: functionComment?.texts?.[0]?.value || null,
    organism: entry.organism?.scientificName || 'Homo sapiens',
  };
}

// -----------------------------------------------------------------------------
// 2. AlphaFold DB — 3D 구조 신뢰도 (이미 Mol3DViewerModal이 클라이언트에서 쓰는
//    것과 동일한 API. 여기서는 신뢰도 점수만 가볍게 가져온다).
// -----------------------------------------------------------------------------
export interface AlphaFoldSummary {
  avgPlddt: number;
  pdbUrl: string;
}

export async function fetchAlphaFoldSummary(accession: string): Promise<AlphaFoldSummary | null> {
  const url = `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(accession)}`;
  const res = await withTimeout(fetch(url), TIMEOUT_MS, 'AlphaFold DB');
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`AlphaFold DB API 오류 (HTTP ${res.status})`);

  const data = (await res.json()) as Array<{
    uniprotAccession?: string;
    globalMetricValue?: number;
    pdbUrl?: string;
  }>;
  if (!Array.isArray(data) || data.length === 0) return null;

  const entry = data.find((e) => e.uniprotAccession === accession) ?? data[0];
  if (entry.globalMetricValue === undefined || !entry.pdbUrl) return null;

  return { avgPlddt: entry.globalMetricValue, pdbUrl: entry.pdbUrl };
}

// -----------------------------------------------------------------------------
// 3. ChEMBL — 알려진 화합물 및 IC50 결합력 데이터
// -----------------------------------------------------------------------------
export interface ChemblResult {
  targetChemblId: string;
  targetName: string;
  activities: Array<{
    moleculeChemblId: string;
    smiles: string | null;
    standardType: string;
    standardValue: string | null;
    standardUnits: string | null;
  }>;
}

export async function fetchChembl(accession: string): Promise<ChemblResult | null> {
  const targetUrl =
    `https://www.ebi.ac.uk/chembl/api/data/target.json?target_components__accession=${encodeURIComponent(accession)}&target_type=SINGLE%20PROTEIN&limit=1`;
  const targetRes = await withTimeout(fetch(targetUrl), TIMEOUT_MS, 'ChEMBL target');
  if (!targetRes.ok) throw new Error(`ChEMBL target API 오류 (HTTP ${targetRes.status})`);

  const targetData = (await targetRes.json()) as {
    targets?: Array<{ target_chembl_id: string; pref_name: string }>;
  };
  const target = targetData.targets?.[0];
  if (!target) return null;

  const activityUrl =
    `https://www.ebi.ac.uk/chembl/api/data/activity.json?target_chembl_id=${encodeURIComponent(target.target_chembl_id)}&standard_type=IC50&limit=5`;
  const activityRes = await withTimeout(fetch(activityUrl), TIMEOUT_MS, 'ChEMBL activity');
  if (!activityRes.ok) throw new Error(`ChEMBL activity API 오류 (HTTP ${activityRes.status})`);

  const activityData = (await activityRes.json()) as {
    activities?: Array<{
      molecule_chembl_id: string;
      canonical_smiles?: string | null;
      standard_type: string;
      standard_value?: string | null;
      standard_units?: string | null;
    }>;
  };

  return {
    targetChemblId: target.target_chembl_id,
    targetName: target.pref_name,
    activities: (activityData.activities || []).map((a) => ({
      moleculeChemblId: a.molecule_chembl_id,
      smiles: a.canonical_smiles ?? null,
      standardType: a.standard_type,
      standardValue: a.standard_value ?? null,
      standardUnits: a.standard_units ?? null,
    })),
  };
}

// -----------------------------------------------------------------------------
// 4. Open Targets — 질환 연관도 (target-disease association score)
// -----------------------------------------------------------------------------
export interface OpenTargetsResult {
  ensemblId: string;
  approvedSymbol: string;
  approvedName: string;
  associatedDiseases: {
    count: number;
    rows: Array<{ score: number; diseaseName: string }>;
  };
}

async function queryOpenTargets(query: string, variables: Record<string, unknown>): Promise<any> {
  const res = await withTimeout(
    fetch('https://api.platform.opentargets.org/api/v4/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    }),
    TIMEOUT_MS,
    'Open Targets'
  );
  if (!res.ok) throw new Error(`Open Targets API 오류 (HTTP ${res.status})`);
  const payload = (await res.json()) as { data?: any; errors?: Array<{ message: string }> };
  if (payload.errors?.length) throw new Error(`Open Targets GraphQL 오류: ${payload.errors[0].message}`);
  return payload.data;
}

export async function fetchOpenTargets(symbol: string): Promise<OpenTargetsResult | null> {
  const searchData = await queryOpenTargets(
    `query Search($q: String!) {
      search(queryString: $q, entityNames: ["target"], page: {index: 0, size: 1}) {
        hits { id entity name }
      }
    }`,
    { q: symbol }
  );
  const ensemblId = searchData?.search?.hits?.[0]?.id;
  if (!ensemblId) return null;

  const targetData = await queryOpenTargets(
    `query TargetInfo($id: String!) {
      target(ensemblId: $id) {
        id
        approvedSymbol
        approvedName
        associatedDiseases(page: {index: 0, size: 5}) {
          count
          rows { score disease { name } }
        }
      }
    }`,
    { id: ensemblId }
  );
  const target = targetData?.target;
  if (!target) return null;

  return {
    ensemblId: target.id,
    approvedSymbol: target.approvedSymbol,
    approvedName: target.approvedName,
    associatedDiseases: {
      count: target.associatedDiseases?.count ?? 0,
      rows: (target.associatedDiseases?.rows || []).map((r: { score: number; disease: { name: string } }) => ({
        score: r.score,
        diseaseName: r.disease?.name,
      })),
    },
  };
}

// -----------------------------------------------------------------------------
// 5. PubMed — 관련 논문 수 및 최신 논문 제목
// -----------------------------------------------------------------------------
export interface PubMedResult {
  totalCount: number;
  topArticles: Array<{ pmid: string; title: string; source: string }>;
}

export async function fetchPubMed(symbol: string): Promise<PubMedResult | null> {
  const searchUrl =
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(`${symbol}[Gene]`)}&retmode=json&retmax=3&sort=relevance`;
  const searchRes = await withTimeout(fetch(searchUrl), TIMEOUT_MS, 'PubMed esearch');
  if (!searchRes.ok) throw new Error(`PubMed esearch API 오류 (HTTP ${searchRes.status})`);

  const searchData = (await searchRes.json()) as {
    esearchresult?: { count?: string; idlist?: string[] };
  };
  const ids = searchData.esearchresult?.idlist || [];
  const totalCount = Number(searchData.esearchresult?.count || '0');
  if (ids.length === 0) return { totalCount, topArticles: [] };

  const summaryUrl =
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
  const summaryRes = await withTimeout(fetch(summaryUrl), TIMEOUT_MS, 'PubMed esummary');
  if (!summaryRes.ok) throw new Error(`PubMed esummary API 오류 (HTTP ${summaryRes.status})`);

  const summaryData = (await summaryRes.json()) as {
    result?: Record<string, { title?: string; source?: string }>;
  };

  const topArticles = ids
    .map((pmid) => {
      const entry = summaryData.result?.[pmid];
      if (!entry?.title) return null;
      return { pmid, title: entry.title, source: entry.source || '' };
    })
    .filter((v): v is { pmid: string; title: string; source: string } => v !== null);

  return { totalCount, topArticles };
}

// -----------------------------------------------------------------------------
// 6. ClinicalTrials.gov — 관련 임상시험 수 및 대표 시험
// -----------------------------------------------------------------------------
export interface ClinicalTrialsResult {
  totalCount: number;
  topTrials: Array<{ nctId: string; briefTitle: string; status: string }>;
}

export async function fetchClinicalTrials(symbol: string): Promise<ClinicalTrialsResult | null> {
  const url =
    `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(symbol)}&fields=NCTId,BriefTitle,OverallStatus&pageSize=3&countTotal=true`;
  const res = await withTimeout(fetch(url), TIMEOUT_MS, 'ClinicalTrials.gov');
  if (!res.ok) throw new Error(`ClinicalTrials.gov API 오류 (HTTP ${res.status})`);

  const data = (await res.json()) as {
    totalCount?: number;
    studies?: Array<{
      protocolSection?: {
        identificationModule?: { nctId?: string; briefTitle?: string };
        statusModule?: { overallStatus?: string };
      };
    }>;
  };

  const topTrials = (data.studies || [])
    .map((s) => {
      const nctId = s.protocolSection?.identificationModule?.nctId;
      const briefTitle = s.protocolSection?.identificationModule?.briefTitle;
      if (!nctId || !briefTitle) return null;
      return { nctId, briefTitle, status: s.protocolSection?.statusModule?.overallStatus || '' };
    })
    .filter((v): v is { nctId: string; briefTitle: string; status: string } => v !== null);

  return { totalCount: data.totalCount ?? 0, topTrials };
}
