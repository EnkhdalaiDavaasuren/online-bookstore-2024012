import { expect, it } from "vitest";
import worker from "../../src/index";
import { fetchApi } from "../apply-migrations";

const request = () => new Request("https://bookstore.test/api/health");

it("reports a successful query against the configured D1 binding", async () => {
  const response = await fetchApi("/api/health");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: "ok", database: { ok: 1 } });
});

it("returns a public error when D1 is unavailable", async () => {
  const DB = { prepare() { throw new Error("database unavailable"); } } as unknown as D1Database;
  const response = await worker.fetch(request(), { DB });
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: "Database unavailable" });
});
