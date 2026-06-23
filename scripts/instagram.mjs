// 반자동 인스타 핸드오프 — 게시 패키지(이미지 + caption.txt) 생성.
// out/ 은 커밋하지 않고 워크플로 아티팩트로만 보관.
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { paths } from "./config.mjs";

export async function writePackage(record, imageSourcePath) {
  const dir = join(paths.outDir, record.id);
  await mkdir(dir, { recursive: true });

  const ext = extname(imageSourcePath || record.src) || ".jpg";
  const imageOut = join(dir, `image${ext}`);
  try {
    await copyFile(imageSourcePath || record.src, imageOut);
  } catch {
    // 이미지 복사 실패는 치명적이지 않음 — 캡션은 그대로 생성
  }

  const captionText = record.story + "\n\n" + record.hashtags.join(" ") + "\n";
  await writeFile(join(dir, "caption.txt"), captionText, "utf8");

  return { id: record.id, dir, caption: captionText };
}
