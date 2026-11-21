import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { validateDatabase } from "../app/js/store.js";
import { sourceLinks } from "../app/js/ui.js";

const { selectSample } = createRequire(import.meta.url)(
  "../scripts/build_sample.cjs",
);
const full = JSON.parse(
  fs.readFileSync(
    new URL("../app/data/database.json", import.meta.url),
    "utf8",
  ),
);

test("La muestra conserva todas las relaciones y referencias de las prácticas elegidas", () => {
  const before = JSON.stringify(full);
  const sample = selectSample(full);
  validateDatabase(sample);
  assert.equal(sample.practices.length, 3);
  assert.equal(sample.tools.length, 9);
  assert.equal(sample.diagrams.length, 3);
  assert.equal(sample.usages.length, 9);
  for (const p of sample.practices)
    assert.deepEqual(
      sample.usages.filter((u) => u.practiceId === p.id),
      full.usages.filter((u) => u.practiceId === p.id),
    );
  assert.ok(
    sample.tools.every((t) => sample.usages.some((u) => u.toolId === t.id)),
  );
  assert.deepEqual(sample.categories, full.categories);
  assert.deepEqual(sample.prices, full.prices);
  assert.equal(JSON.stringify(full), before);
});

function withExcerpt() {
  const sample = selectSample(full);
  // La práctica de pruebas cita la página 6; el extracto conserva solo esa página.
  sample.sources.find((s) => s.id === "P04").pageMap = { 6: 1 };
  return sample;
}

test("El extracto abre la página compacta y conserva la cita original", () => {
  const db = withExcerpt();
  validateDatabase(db);
  const p = db.practices.find((p) => p.id === "PR10");
  const html = sourceLinks(p.references, db.sources);
  assert.match(html, /P04\.pdf#page=1/);
  assert.match(html, /P04 · p\. 6 \(extracto\)/);
  const unchanged = sourceLinks(p.references, full.sources);
  assert.match(unchanged, /P04\.pdf#page=6/);
  assert.ok(!unchanged.includes("extracto"));
});

test("Los mapas incompletos o con destinos ambiguos se rechazan antes de restaurar", () => {
  for (const pageMap of [
    { 7: 1 },
    {},
    { 6: 0 },
    { 6: 2 },
    { 6: 1, 7: 1 },
    { "06": 1 },
    [],
  ]) {
    const db = withExcerpt();
    db.sources.find((s) => s.id === "P04").pageMap = pageMap;
    assert.throws(() => validateDatabase(db), /extracto/);
  }
});
