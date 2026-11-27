import { readD1Migrations } from "@cloudflare/vitest-plugin";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import { afterAll, beforeAll } from "vitest";

let runtime: Miniflare | undefined;
let databaseDirectory: string | undefined;
export let database: D1Database;

beforeAll(async () => {
  const { outputFiles } = await build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "esm",
    write: false,
  });
  const testRoot = path.resolve(".wrangler", "test");
  await mkdir(testRoot, { recursive: true });
  databaseDirectory = await mkdtemp(path.join(testRoot, "db-"));
  runtime = new Miniflare({
    ...convertV4MiniflareOptions({
      modules: [{ type: "ESModule", path: "index.js", contents: outputFiles[0].text }],
      compatibilityDate: "2026-11-19",
      d1Databases: { DB: "bookstore-integration" },
    }),
    resourcePersistencePath: databaseDirectory,
  });
  database = (await runtime.getD1Database("DB")) as unknown as D1Database;
  const migrations = await readD1Migrations("migrations");
  for (const migration of migrations) {
    await database.batch(migration.queries.map(query => database.prepare(query)));
  }
});

afterAll(async () => {
  await runtime?.dispose();
  if (databaseDirectory) await rm(databaseDirectory, { recursive: true, force: true });
});

export async function fetchApi(path: string): Promise<Response> {
  const response = await runtime!.dispatchFetch("http://bookstore.test" + path);
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: Object.fromEntries(response.headers),
  });
}
