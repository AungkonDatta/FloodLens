import { performance } from "node:perf_hooks";
import * as os from "node:os";

/**
 * Measures response time of the city-data and drainage-points endpoints.
 * 1 warm-up request, then 50 timed requests per endpoint. Prints median and p95.
 *
 * Start the API first (pnpm start:dev), then run:  pnpm bench
 * The API limits requests per minute. Before benchmarking, set RATE_LIMIT_MAX=1000
 * in .env and restart the API, otherwise the run stops with a 429 error.
 */
const BASE_URL =
  process.env.BENCH_BASE_URL ?? `http://localhost:${process.env.PORT ?? "5001"}`;
const REPEATS = 50;

async function timeOnce(path: string): Promise<{ ms: number; body: unknown }> {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}${path}`);
  const text = await res.text();
  const ms = performance.now() - start;
  if (!res.ok) {
    throw new Error(
      `${path} answered ${res.status}. If this is 429, set RATE_LIMIT_MAX=1000 in .env, restart the API and run again.`,
    );
  }
  return { ms, body: JSON.parse(text) };
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function p95(sorted: number[]): number {
  return sorted[Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1)];
}

async function measure(path: string) {
  const warmup = await timeOnce(path); // not counted
  const samples: number[] = [];
  for (let i = 0; i < REPEATS; i++) {
    samples.push((await timeOnce(path)).ms);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    body: warmup.body,
    row: {
      endpoint: `GET ${path}`,
      repetitions: REPEATS,
      "median (ms)": Number(median(sorted).toFixed(2)),
      "p95 (ms)": Number(p95(sorted).toFixed(2)),
      "min (ms)": Number(sorted[0].toFixed(2)),
      "max (ms)": Number(sorted[sorted.length - 1].toFixed(2)),
    },
  };
}

async function main() {
  const city = await measure("/city-data");
  const drainage = await measure("/drainage-points");

  const cityBody = city.body as { intersections: unknown[]; streets: unknown[] };
  const drainageBody = drainage.body as unknown[];

  console.log("\nFloodLens API response times");
  console.log(`Base URL : ${BASE_URL}`);
  console.log(
    `Dataset  : ${cityBody.intersections.length} intersections, ${cityBody.streets.length} streets, ${drainageBody.length} drainage points`,
  );
  console.log(
    `Machine  : ${os.platform()} ${os.release()}, ${os.cpus()[0]?.model}, ${Math.round(os.totalmem() / 1024 ** 3)} GB RAM, Node ${process.version}`,
  );
  console.log(
    "Note     : time includes the HTTP round trip on this machine; it is an evaluation result, not a promise.\n",
  );
  console.table([city.row, drainage.row]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
