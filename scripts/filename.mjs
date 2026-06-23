// 파일명 규칙 파서 — Google Drive 소스의 1차 메타 소스.
// 규칙: `<지역>_<테마>_<자유설명>.jpg`  (밑줄로 구분)
//   예) 제주_풍경_성산일출봉 위로 번지던 아침 바다.jpg
// 지역/테마 토큰은 config 표와 정확히 일치할 때 인식하고, 나머지는 자유설명이 된다.
// 토큰 순서는 자유롭다(지역·테마가 어디 있든 인식). 매칭 안 되면 미상/일상으로 분류된다.
import { regions, themes } from "./config.mjs";

export function parseFilename(name) {
  const base = String(name || "").replace(/\.[^./\\]+$/, "");
  const tokens = base
    .split(/_+/)
    .map(function (t) {
      return t.trim();
    })
    .filter(Boolean);

  let regionHint = null;
  let themeHint = null;
  const rest = [];

  tokens.forEach(function (tok) {
    const low = tok.toLowerCase();
    if (!regionHint && regionFor(low)) {
      regionHint = regionFor(low);
      return;
    }
    if (!themeHint && themeFor(low)) {
      themeHint = themeFor(low);
      return;
    }
    rest.push(tok);
  });

  return {
    regionHint: regionHint,
    themeHint: themeHint,
    tags: [],
    freeText: rest.join(" ").trim(),
  };
}

function regionFor(low) {
  const hit = regions.find(function (r) {
    return r.aliases.some(function (a) {
      return a.toLowerCase() === low;
    });
  });
  return hit ? hit.key : null;
}

function themeFor(low) {
  const hit = themes.find(function (t) {
    return [t.label].concat(t.keywords).some(function (k) {
      return k.toLowerCase() === low;
    });
  });
  return hit ? hit.key : null;
}
