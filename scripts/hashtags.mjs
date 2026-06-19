// 해시태그 조립 — 베이스 + 지역 + 테마 + 캡션 태그, 중복 제거(대소문자 무시).
import { baseHashtags, regions, themes } from "./config.mjs";

export function buildHashtags({ region, theme, captionTags }) {
  const regionTags = (regions.find((r) => r.key === region) || {}).tags || [];
  const themeTags = (themes.find((t) => t.key === theme) || {}).tags || [];
  const all = [...baseHashtags, ...regionTags, ...themeTags, ...(captionTags || [])];

  const seen = new Set();
  const out = [];
  for (const raw of all) {
    const tag = normalize(raw);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

function normalize(raw) {
  let t = String(raw).trim().replace(/\s+/g, "");
  if (!t) return "";
  if (!t.startsWith("#")) t = "#" + t;
  return t;
}
