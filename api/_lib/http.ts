/**
 * Vercel 서버리스 함수 핸들러용 최소 타입.
 *
 * `@vercel/node` 패키지는 타입 몇 개를 위해 111개 패키지와 다수의 취약점을
 * 함께 끌고 오므로 설치하지 않는다. 런타임은 Vercel이 제공하고, 아래 타입은
 * 로컬 타입체크에만 쓰인다.
 */
export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  status(statusCode: number): ApiResponse;
  json(body: unknown): void;
  send(body: unknown): void;
  setHeader(name: string, value: string | string[]): void;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void;

/** 헤더 값이 배열로 올 수 있으므로 단일 문자열로 정규화한다. */
export function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
