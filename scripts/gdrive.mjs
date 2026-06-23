// Google Drive 폴더 소스 — 서비스 계정(JWT)으로 무인 접근.
// 필요한 환경변수:
//   GDRIVE_SA_KEY     서비스 계정 JSON 키 전체(문자열)
//   GDRIVE_FOLDER_ID  사진이 들어 있는 Drive 폴더 ID
// 폴더를 서비스 계정 이메일(client_email)과 "뷰어"로 공유해야 읽을 수 있다.
// 비공식/외부 의존성 없이 fetch + node:crypto 로 구현.
import crypto from "node:crypto";
import { extname } from "node:path";

const SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";

let cached = null; // { token, exp }

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function loadCredentials() {
  const raw = process.env.GDRIVE_SA_KEY;
  if (!raw) throw new Error("GDRIVE_SA_KEY 환경변수가 필요합니다 (서비스 계정 JSON).");
  let creds;
  try {
    creds = JSON.parse(raw);
  } catch {
    throw new Error("GDRIVE_SA_KEY 파싱 실패 — JSON 키 전체를 넣었는지 확인하세요.");
  }
  if (!creds.client_email || !creds.private_key) {
    throw new Error("서비스 계정 키에 client_email/private_key가 없습니다.");
  }
  creds.private_key = String(creds.private_key).replace(/\\n/g, "\n");
  return creds;
}

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;

  const creds = loadCredentials();
  const exp = now + 3600;
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({ iss: creds.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp }),
  );
  const signingInput = header + "." + claim;
  const signature = b64url(
    crypto.createSign("RSA-SHA256").update(signingInput).sign(creds.private_key),
  );
  const assertion = signingInput + "." + signature;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: assertion,
    }),
  });
  if (!res.ok) throw new Error("토큰 발급 실패: HTTP " + res.status + " " + (await res.text()));
  const json = await res.json();
  cached = { token: json.access_token, exp: exp };
  return json.access_token;
}

// EXIF 스타일 시각("2026:06:12 07:08:00", 타임존 없음)을 KST 기준 ISO(UTC)로 변환.
function exifTimeToIso(t) {
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(String(t));
  if (!m) {
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const utcMs = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return new Date(utcMs - 9 * 3600 * 1000).toISOString();
}

// 폴더의 이미지 파일을 정규화된 아이템 배열로 반환.
export async function fetchAlbum() {
  const folderId = process.env.GDRIVE_FOLDER_ID;
  if (!folderId) throw new Error("GDRIVE_FOLDER_ID 환경변수가 필요합니다.");
  const token = await getToken();

  const items = [];
  let pageToken = null;
  do {
    const params = new URLSearchParams({
      q: "'" + folderId + "' in parents and mimeType contains 'image/' and trashed=false",
      fields:
        "nextPageToken, files(id,name,mimeType,createdTime," +
        "imageMediaMetadata(time,width,height,cameraMake,cameraModel,location))",
      pageSize: "100",
      orderBy: "createdTime",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(DRIVE_API + "?" + params.toString(), {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) throw new Error("Drive 목록 실패: HTTP " + res.status + " " + (await res.text()));
    const json = await res.json();

    (json.files || []).forEach(function (f) {
      const meta = f.imageMediaMetadata || {};
      const loc = meta.location;
      items.push({
        guid: f.id,
        filename: f.name,
        dateCreated: meta.time ? exifTimeToIso(meta.time) : f.createdTime || null,
        width: meta.width || null,
        height: meta.height || null,
        gps:
          loc && typeof loc.latitude === "number"
            ? { lat: loc.latitude, lng: loc.longitude }
            : null,
        camera: [meta.cameraMake, meta.cameraModel].filter(Boolean).join(" ").trim() || null,
        imageSource: { type: "drive", fileId: f.id, ext: extname(f.name) || ".jpg" },
      });
    });
    pageToken = json.nextPageToken;
  } while (pageToken);

  return items;
}

// 파일 1개를 내려받아 Buffer 반환.
export async function downloadFile(fileId) {
  const token = await getToken();
  const res = await fetch(DRIVE_API + "/" + fileId + "?alt=media&supportsAllDrives=true", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) throw new Error("Drive 다운로드 실패: HTTP " + res.status);
  return Buffer.from(await res.arrayBuffer());
}
