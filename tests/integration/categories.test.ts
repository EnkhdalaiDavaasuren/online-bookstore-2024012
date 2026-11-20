import { beforeEach, describe, expect, it } from "vitest";
import { addCategory, clearDatabase, fetchApi } from "../helpers/database";

const fields = ["category_id", "name", "description"];

async function getCategories(): Promise<Record<string, unknown>[]> {
  const response = await fetchApi("/api/categories");
  expect(response.status).toBe(200);
  return response.json() as Promise<Record<string, unknown>[]>;
}

describe("GET /api/categories", () => {
  beforeEach(async () => {
    await clearDatabase();
    await addCategory(9, "Computing", "Synthetic computing books");
    await addCategory(2, "Databases", null);
    await addCategory(5, "Literature", "Synthetic fiction");
  });

  it("returns every category in ascending category_id order with all approved fields", async () => {
    const categories = await getCategories();
    expect(categories.map((category) => category.category_id)).toEqual([2, 5, 9]);
    expect(Object.keys(categories[0] ?? {}).sort()).toEqual([...fields].sort());
    expect(categories[0]?.description).toBeNull();
  });

  it("has no result cap or pagination", async () => {
    await clearDatabase();
    for (let id = 15; id >= 1; id -= 1) {
      await addCategory(id, "Category " + id, null);
    }
    const categories = await getCategories();
    expect(categories).toHaveLength(15);
    expect(categories.map((category) => category.category_id)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
  });

  it("returns [] when no categories exist", async () => {
    await clearDatabase();
    expect(await getCategories()).toEqual([]);
  });
});
