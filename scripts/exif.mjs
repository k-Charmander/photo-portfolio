// EXIF 추출 (best-effort). EXIF가 없으면 null 허용.
import exifr from "exifr";

export async function readExif(input) {
  try {
    const data = await exifr.parse(input, { gps: true });
    if (!data) return empty();
    const takenAt = data.DateTimeOriginal || data.CreateDate || null;
    const gps =
      typeof data.latitude === "number" && typeof data.longitude === "number"
        ? { lat: data.latitude, lng: data.longitude }
        : null;
    const camera = [data.Make, data.Model].filter(Boolean).join(" ").trim() || null;
    return {
      takenAt: toWallClockIso(takenAt),
      gps,
      camera,
    };
  } catch {
    return empty();
  }
}

// EXIF 촬영시각은 타임존이 없는 '현지 벽시계'다. 러너 타임존과 무관하게 벽시계 그대로
// UTC 표기(…Z)로 보존한다 → timeOfDay가 getUTCHours로 현지 시각을 읽는다.
function toWallClockIso(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ),
  ).toISOString();
}

function empty() {
  return { takenAt: null, gps: null, camera: null };
}
