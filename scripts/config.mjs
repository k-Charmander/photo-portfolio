// 파이프라인 설정 — 경로, 지역/테마 규칙, 해시태그, 스토리 템플릿.
// 비밀값(서비스 계정 키 등)은 여기 두지 않는다. 환경변수 GDRIVE_SA_KEY / GDRIVE_FOLDER_ID 사용.

export const paths = {
  photosDir: "assets/photos",
  dataFile: "data/photos.json",
  outDir: "out/instagram",
  sampleAlbum: "data/sample/album.json",
};

export const baseHashtags = ["#사진", "#photography", "#일상기록"];

// 구체적인 지역을 먼저 검사하도록 순서 유지(서울/인천을 경기보다 앞에).
export const regions = [
  {
    key: "제주",
    label: "제주",
    aliases: ["제주", "제주도", "jeju"],
    tags: ["#제주", "#jeju"],
    bbox: { minLat: 33.1, maxLat: 33.6, minLng: 126.1, maxLng: 127.0 },
  },
  {
    key: "서울",
    label: "서울",
    aliases: ["서울", "seoul"],
    tags: ["#서울", "#seoul"],
    bbox: { minLat: 37.42, maxLat: 37.72, minLng: 126.76, maxLng: 127.18 },
  },
  {
    key: "인천",
    label: "인천",
    aliases: ["인천", "incheon"],
    tags: ["#인천", "#incheon"],
    bbox: { minLat: 37.34, maxLat: 37.6, minLng: 126.36, maxLng: 126.78 },
  },
  {
    key: "부산",
    label: "부산",
    aliases: ["부산", "busan"],
    tags: ["#부산", "#busan"],
    bbox: { minLat: 35.0, maxLat: 35.4, minLng: 128.9, maxLng: 129.3 },
  },
  {
    key: "강원",
    label: "강원",
    aliases: ["강원", "강원도", "gangwon"],
    tags: ["#강원", "#gangwon"],
    bbox: { minLat: 37.0, maxLat: 38.6, minLng: 127.7, maxLng: 129.4 },
  },
  {
    key: "경주",
    label: "경주",
    aliases: ["경주", "gyeongju"],
    tags: ["#경주", "#gyeongju"],
    bbox: { minLat: 35.7, maxLat: 36.0, minLng: 129.0, maxLng: 129.4 },
  },
  // 해외 — GPS bbox 없이 파일명 별칭으로만 인식.
  {
    key: "도쿄",
    label: "도쿄",
    aliases: ["도쿄", "일본", "tokyo", "japan"],
    tags: ["#도쿄", "#tokyo", "#일본"],
  },
  {
    key: "뉴욕",
    label: "뉴욕",
    aliases: ["뉴욕", "미국", "newyork", "usa"],
    tags: ["#뉴욕", "#newyork", "#미국"],
  },
  {
    key: "파리",
    label: "파리",
    aliases: ["파리", "paris"],
    tags: ["#파리", "#paris"],
  },
  {
    key: "런던",
    label: "런던",
    aliases: ["런던", "london"],
    tags: ["#런던", "#london"],
  },
  {
    key: "유럽",
    label: "유럽",
    aliases: ["유럽", "europe"],
    tags: ["#유럽", "#europe"],
  },
  {
    key: "해외",
    label: "해외",
    aliases: ["해외", "overseas", "abroad", "travel"],
    tags: ["#해외", "#travel"],
  },
];

// 테마 — 라벨/키워드 매칭. 더 구체적인 테마(노을/야경)를 풍경보다 앞에 둔다.
export const themes = [
  {
    key: "노을",
    label: "노을",
    tags: ["#노을", "#sunset"],
    keywords: ["노을", "일몰", "석양", "sunset"],
  },
  {
    key: "야경",
    label: "야경",
    tags: ["#야경", "#nightview"],
    keywords: ["야경", "nightview", "야간"],
  },
  {
    key: "거리",
    label: "거리",
    tags: ["#거리", "#street"],
    keywords: ["거리", "골목", "street", "도시"],
  },
  {
    key: "인물",
    label: "인물",
    tags: ["#인물", "#portrait"],
    keywords: ["인물", "초상", "portrait", "미소"],
  },
  {
    key: "음식",
    label: "음식",
    tags: ["#음식", "#foodie"],
    keywords: ["음식", "맛집", "food", "foodie", "한끼"],
  },
  {
    key: "풍경",
    label: "풍경",
    tags: ["#풍경", "#landscape"],
    keywords: ["풍경", "바다", "산", "호수", "능선", "landscape", "nature"],
  },
  { key: "일상", label: "일상", tags: ["#일상", "#daily"], keywords: ["일상", "daily"] },
];

export const defaultRegion = "미상";
export const defaultTheme = "일상";

// 스토리에서 미상 지역은 자연스럽게 치환
export const unknownRegionText = "어딘가";

// 시간대 구간 — 사진의 '현지 벽시계' 시각 기준.
// takenAt은 벽시계 시각을 UTC로 표기(…Z)하므로 getUTCHours()가 곧 촬영지 현지 시각이다.
export function timeOfDay(date) {
  const h = new Date(date).getUTCHours();
  if (h >= 4 && h < 6) return "새벽";
  if (h >= 6 && h < 11) return "아침";
  if (h >= 11 && h < 16) return "낮";
  if (h >= 16 && h < 18) return "오후";
  if (h >= 18 && h < 20) return "저녁";
  return "밤";
}

// 테마별 기본 문장 (캡션 자유 텍스트가 없을 때)
export const themeDefaultText = {
  풍경: "오래 바라보게 되는 풍경.",
  노을: "하루를 물들이는 빛.",
  야경: "잠들지 않는 도시의 밤.",
  거리: "스쳐가는 거리의 표정.",
  인물: "한 사람의 분위기.",
  음식: "기억에 남는 한 끼.",
  일상: "평범해서 더 소중한 순간.",
};

// 스토리 템플릿 3종 — {date, region, theme, timeOfDay, text}
export const storyTemplates = [
  (v) => `${v.date}, ${v.region}에서 마주한 ${v.theme}의 순간. ${v.text}`,
  (v) => `${v.timeOfDay}의 ${v.region}. ${v.theme} 한 장면을 담았다. ${v.text}`,
  (v) => `${v.region}에서 보낸 ${v.timeOfDay}. ${v.theme}, 그리고 ${v.text}`,
];
