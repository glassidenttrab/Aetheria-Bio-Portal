/**
 * 서버리스 함수가 쓰는 런타임 전역의 최소 선언.
 *
 * `@types/node`를 devDependency로 추가하면 npm이 package-lock.json의
 * 플랫폼별 esbuild 바이너리 항목을 대량으로 잘라내 리눅스(Vercel) 빌드가
 * 깨질 수 있어, 타입 몇 개 때문에 의존성을 늘리지 않고 여기서 직접 선언한다.
 * 실제 구현은 Vercel의 Node 런타임이 제공한다.
 */

interface FetchLikeResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

interface FetchLikeInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

declare function fetch(input: string, init?: FetchLikeInit): Promise<FetchLikeResponse>;

declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  from(input: string, encoding?: string): { toString(encoding: string): string };
};

declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};

declare function setTimeout(callback: () => void, ms: number): number;
declare function clearTimeout(id: number): void;
