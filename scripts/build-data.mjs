// 레코드 → 사이트가 읽는 data/photos.json 생성/재정렬.
// photos.json 자체가 단일 진실원본이자 중복 처리 방지(dedup) 원장 역할을 한다.
// 네트워크 무관, 단독 실행 가능: `node scripts/build-data.mjs`
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { paths } from "./config.mjs";

export async function loadExistingRecords(file = paths.dataFile) {
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.photos || [];
  } catch {
    return [];
  }
}

export function buildData(records) {
  const photos = records.slice().sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));

  return {
    generatedAt: new Date().toISOString(),
    photos,
    regions: groupBy(photos, "region"),
    themes: groupBy(photos, "theme"),
  };
}

function groupBy(photos, field) {
  const map = new Map();
  for (const p of photos) {
    const key = p[field];
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p.id);
  }
  return [...map.entries()].map(([key, photoIds]) => ({ key, label: key, photoIds }));
}

export async function writeData(data, file = paths.dataFile) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// CLI: 기존 photos.json을 다시 정렬·그룹핑해 재생성
if (import.meta.url === `file://${process.argv[1]}`) {
  const records = await loadExistingRecords();
  await writeData(buildData(records));
  console.log(`build:data → ${records.length}장으로 ${paths.dataFile} 재생성`);
}
