// EXIF 추출 (best-effort). iCloud 공유앨범은 보통 EXIF/GPS를 제거하므로 null 허용.
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
      takenAt: takenAt ? new Date(takenAt).toISOString() : null,
      gps,
      camera,
    };
  } catch {
    return empty();
  }
}

function empty() {
  return { takenAt: null, gps: null, camera: null };
}
