// 템플릿 기반 한국어 스토리 생성 (AI/LLM 없음). guid 해시로 결정론적 선택.
import {
  storyTemplates,
  themeDefaultText,
  defaultTheme,
  unknownRegionText,
  defaultRegion,
} from "./config.mjs";

export function generateStory({ id, takenAt, region, theme, timeOfDay, freeText }) {
  const idx = hashString(String(id)) % storyTemplates.length;
  const regionText = region === defaultRegion ? unknownRegionText : region;
  const text = freeText
    ? ensurePeriod(freeText)
    : themeDefaultText[theme] || themeDefaultText[defaultTheme];
  return storyTemplates[idx]({
    date: formatKoreanDate(takenAt),
    region: regionText,
    theme,
    timeOfDay,
    text,
  });
}

export function formatKoreanDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function ensurePeriod(s) {
  const t = s.trim();
  return /[.!?…]$/.test(t) ? t : t + ".";
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
