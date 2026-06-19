// iCloud 공유 앨범(공개 링크) 비공식 webstream API 클라이언트.
// 인증 없음. 호스트 샤딩 + 시한부 URL. 비문서 API라 변경에 취약 → 격리·soft-fail.
// 공유 링크: https://www.icloud.com/sharedalbum/#<TOKEN>

const DEFAULT_HOST = "p123-sharedstreams.icloud.com";

async function post(host, token, endpoint, body) {
  const res = await fetch(`https://${host}/${token}/sharedstreams/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8", Origin: "https://www.icloud.com" },
    body: JSON.stringify(body),
  });
  return res;
}

async function resolveHostAndStream(token) {
  let host = DEFAULT_HOST;
  let res = await post(host, token, "webstream", { streamCtag: null });
  if (res.status === 330) {
    const redirect = await res.json();
    host = redirect["X-Apple-MMe-Host"] || redirect.hostname || host;
    res = await post(host, token, "webstream", { streamCtag: null });
  }
  if (!res.ok) throw new Error(`webstream 실패: HTTP ${res.status}`);
  return { host, data: await res.json() };
}

async function fetchAssetUrls(host, token, guids) {
  const map = {};
  // API는 한 번에 다수 guid 허용. 안전하게 청크 단위로.
  for (let i = 0; i < guids.length; i += 25) {
    const chunk = guids.slice(i, i + 25);
    const res = await post(host, token, "webasseturls", { photoGuids: chunk });
    if (!res.ok) continue;
    const json = await res.json();
    for (const [checksum, loc] of Object.entries(json.items || {})) {
      map[checksum] = `https://${loc.url_location}${loc.url_path}`;
    }
  }
  return map;
}

function pickBestDerivative(derivatives) {
  let best = null;
  for (const d of Object.values(derivatives || {})) {
    const size = Number(d.fileSize || d.width || 0);
    if (!best || size > best.size) {
      best = {
        checksum: d.checksum,
        width: Number(d.width) || null,
        height: Number(d.height) || null,
        size,
      };
    }
  }
  return best;
}

// 정규화된 앨범 아이템 배열 반환.
export async function fetchAlbum(token) {
  const { host, data } = await resolveHostAndStream(token);
  const photos = data.photos || [];
  const guids = photos.map((p) => p.photoGuid);
  const urlMap = await fetchAssetUrls(host, token, guids);

  return photos.map((p) => {
    const best = pickBestDerivative(p.derivatives);
    return {
      guid: p.photoGuid,
      caption: p.caption || "",
      dateCreated: p.dateCreated || p.batchDateCreated || null,
      width: best ? best.width : null,
      height: best ? best.height : null,
      gps: null,
      camera: null,
      imageSource:
        best && urlMap[best.checksum] ? { type: "url", value: urlMap[best.checksum] } : null,
    };
  });
}
