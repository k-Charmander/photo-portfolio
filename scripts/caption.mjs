// 앨범 캡션 파싱 — iCloud 공유앨범은 EXIF/GPS를 제거하므로 캡션이 1차 메타 소스다.
// 예: "제주 성산일출봉 #풍경 #일출 성산일출봉 위로 번지던 아침 바다"
import { regions, themes } from "./config.mjs";

const HASHTAG_RE = /#[\p{L}\d_]+/gu;

export function parseCaption(caption) {
  const text = String(caption || "").trim();
  const tags = text.match(HASHTAG_RE) || [];
  const noTags = text.replace(HASHTAG_RE, " ").replace(/\s+/g, " ").trim();

  const regionHint = matchRegion(noTags);
  const themeHint = matchTheme(tags, noTags);

  // freeText: 해시태그와 지역 토큰을 제거한 나머지
  let freeText = noTags;
  if (regionHint) {
    const region = regions.find((r) => r.key === regionHint);
    for (const alias of region.aliases) {
      freeText = freeText.replace(new RegExp("(^|\\s)" + escapeRe(alias) + "(\\s|$)", "i"), " ");
    }
    freeText = freeText.replace(/\s+/g, " ").trim();
  }

  return { regionHint, themeHint, tags, freeText };
}

function matchRegion(text) {
  const lower = text.toLowerCase();
  for (const r of regions) {
    if (r.aliases.some((a) => lower.includes(a.toLowerCase()))) return r.key;
  }
  return null;
}

function matchTheme(tags, text) {
  // 1) 해시태그를 우선한다 (#음식 이 본문의 "골목"보다 우선).
  const tagStr = tags.join(" ").toLowerCase();
  for (const t of themes) {
    const needles = [t.label, ...t.tags.map((x) => x.replace("#", "")), ...t.keywords].map((s) =>
      s.toLowerCase(),
    );
    if (needles.some((n) => n && tagStr.includes(n))) return t.key;
  }
  // 2) 그다음 자유 텍스트의 키워드.
  const lower = String(text).toLowerCase();
  for (const t of themes) {
    const needles = [t.label, ...t.keywords].map((s) => s.toLowerCase());
    if (needles.some((n) => n && lower.includes(n))) return t.key;
  }
  return null;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
