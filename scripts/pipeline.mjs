// 파이프라인 오케스트레이터.
//   node scripts/pipeline.mjs            Google Drive 폴더에서 수집
//                                        (env GDRIVE_SA_KEY, GDRIVE_FOLDER_ID)
//   node scripts/pipeline.mjs --sample   data/sample/album.json 으로 오프라인 실행
//   node scripts/pipeline.mjs --dry-run  파일을 쓰지 않고 결과만 출력
//   node scripts/pipeline.mjs --limit 3  이번 실행에서 처리할 신규 사진 수 제한
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { paths, timeOfDay } from "./config.mjs";
import { fetchAlbum, downloadFile } from "./gdrive.mjs";
import { readExif } from "./exif.mjs";
import { parseCaption } from "./caption.mjs";
import { parseFilename } from "./filename.mjs";
import { deriveRegion, deriveTheme } from "./classify.mjs";
import { generateStory } from "./story.mjs";
import { buildHashtags } from "./hashtags.mjs";
import { buildData, writeData, loadExistingRecords } from "./build-data.mjs";
import { writePackage } from "./instagram.mjs";
import { buildIssue } from "./notify.mjs";

function parseArgs(argv) {
  const opts = { sample: false, dryRun: false, limit: Infinity };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--sample") opts.sample = true;
    else if (argv[i] === "--dry-run") opts.dryRun = true;
    else if (argv[i] === "--limit") opts.limit = Number(argv[++i]) || Infinity;
  }
  return opts;
}

async function getAlbumItems(opts) {
  if (opts.sample) {
    const raw = await readFile(paths.sampleAlbum, "utf8");
    const items = JSON.parse(raw);
    return items.map((it) => ({
      guid: it.guid,
      filename: it.filename || null,
      caption: it.caption || "",
      dateCreated: it.dateCreated || null,
      width: it.width || null,
      height: it.height || null,
      gps: it.gps || null,
      camera: it.camera || null,
      imageSource: { type: "local", value: it.sample },
    }));
  }
  return fetchAlbum();
}

// 실제 모드: Google Drive에서 받아 assets/photos/<guid>.<ext> 로 저장하고 src/버퍼 반환.
async function resolveImage(item, opts) {
  const source = item.imageSource || {};

  if (source.type === "local") {
    let buffer = null;
    try {
      buffer = await readFile(source.value);
    } catch {
      buffer = null;
    }
    return { src: source.value, localPath: source.value, buffer };
  }

  if (source.type === "drive") {
    const src = join(paths.photosDir, `${item.guid}${source.ext || ".jpg"}`);
    if (opts.dryRun) return { src: src, localPath: null, buffer: null };
    const buffer = await downloadFile(source.fileId);
    await mkdir(paths.photosDir, { recursive: true });
    await writeFile(src, buffer);
    return { src: src, localPath: src, buffer };
  }

  return { src: null, localPath: null, buffer: null };
}

async function buildRecord(item, opts) {
  const img = await resolveImage(item, opts);
  const exif = img.buffer ? await readExif(img.buffer) : { takenAt: null, gps: null, camera: null };

  const gps = exif.gps || item.gps || null;
  const camera = exif.camera || item.camera || null;
  const takenAt = exif.takenAt || item.dateCreated || new Date().toISOString();
  // 메타 소스: 파일명 규칙(Drive) 우선, 없으면 캡션(샘플/구버전 호환).
  const parsed = item.filename ? parseFilename(item.filename) : parseCaption(item.caption || "");
  const tod = timeOfDay(takenAt);

  const region = deriveRegion({ gps, regionHint: parsed.regionHint });
  const theme = deriveTheme({
    themeHint: parsed.themeHint,
    freeText: parsed.freeText,
    tags: parsed.tags,
    timeOfDay: tod,
  });
  const story = generateStory({
    id: item.guid,
    takenAt,
    region,
    theme,
    timeOfDay: tod,
    freeText: parsed.freeText,
  });
  const hashtags = buildHashtags({ region, theme, captionTags: parsed.tags });

  const record = {
    id: item.guid,
    src: img.src,
    width: item.width || null,
    height: item.height || null,
    takenAt,
    addedAt: new Date().toISOString(),
    region,
    theme,
    timeOfDay: tod,
    caption: parsed.freeText,
    story,
    hashtags,
    gps,
    camera,
    instagram: { prepared: true, posted: false },
  };
  return { record, localPath: img.localPath };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  // photos.json 자체가 dedup 원장: 기존에 처리된 사진 id는 건너뛴다.
  const existing = await loadExistingRecords();
  const existingById = new Map(existing.map((r) => [r.id, r]));

  const items = await getAlbumItems(opts);
  const fresh = items.filter((it) => it.guid && !existingById.has(it.guid));
  const targets = fresh.slice(0, opts.limit === Infinity ? fresh.length : opts.limit);

  console.log(
    `[pipeline] 앨범 ${items.length}장 · 신규 ${fresh.length}장 · 이번 처리 ${targets.length}장` +
      (opts.dryRun ? " (dry-run)" : ""),
  );

  const newRecords = [];
  for (const item of targets) {
    const { record, localPath } = await buildRecord(item, opts);
    newRecords.push(record);
    if (!opts.dryRun) await writePackage(record, localPath);
    console.log(`  + ${record.id} → ${record.region}/${record.theme} · ${record.story}`);
  }

  const records = [...existing, ...newRecords];
  const data = buildData(records);

  if (opts.dryRun) {
    console.log(
      `[pipeline] dry-run: photos.json ${records.length}장, 신규 ${newRecords.length}장 (미기록)`,
    );
  } else {
    await writeData(data);
    console.log(
      `[pipeline] ${paths.dataFile} 갱신 (총 ${records.length}장, 신규 ${newRecords.length}장)`,
    );
  }

  if (newRecords.length > 0) {
    const issue = buildIssue(newRecords);
    console.log(`\n[notify] 게시 알림 초안\n--- ${issue.title} ---\n${issue.body}`);
    if (!opts.dryRun) {
      await mkdir("out", { recursive: true });
      await writeFile("out/notify.json", JSON.stringify(issue, null, 2), "utf8");
    }
  }
}

main().catch((err) => {
  console.error("[pipeline] 실패:", err.message);
  process.exitCode = 1;
});
