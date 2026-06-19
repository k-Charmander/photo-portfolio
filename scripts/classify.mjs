// 지역/테마 분류 — GPS(있으면) → 캡션 힌트 → 기본값 순.
import { regions, themes, defaultRegion, defaultTheme } from "./config.mjs";

export function deriveRegion({ gps, regionHint }) {
  if (gps && typeof gps.lat === "number" && typeof gps.lng === "number") {
    const hit = regions.find(
      (r) =>
        gps.lat >= r.bbox.minLat &&
        gps.lat <= r.bbox.maxLat &&
        gps.lng >= r.bbox.minLng &&
        gps.lng <= r.bbox.maxLng,
    );
    if (hit) return hit.key;
  }
  if (regionHint) return regionHint;
  return defaultRegion;
}

export function deriveTheme({ themeHint, freeText, tags, timeOfDay }) {
  if (themeHint) return themeHint;

  const haystack = ((tags || []).join(" ") + " " + (freeText || "")).toLowerCase();
  for (const t of themes) {
    const needles = [t.label, ...t.keywords].map((s) => s.toLowerCase());
    if (needles.some((n) => n && haystack.includes(n))) return t.key;
  }

  // 휴리스틱: 저녁/밤이면 야경 쪽으로 기울인다
  if (timeOfDay === "밤") return "야경";
  if (timeOfDay === "저녁") return "노을";
  return defaultTheme;
}
