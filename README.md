# Photofolio

아이폰으로 담은 순간을 **지역·테마별 스토리**로 자동 정리하고, 매일 인스타그램 게시
초안을 만들며, 블로그처럼 아카이빙하는 인터랙티브 사진 저널입니다. 사이트는 의존성 없는
순수 HTML / CSS / JavaScript이고, 자동화는 GitHub Actions로 서버 없이 동작합니다.

## 기능

- iCloud 공유 앨범에서 신규 사진 자동 수집 (매일 오전 10시 KST)
- 캡션·EXIF 기반 지역/테마 자동 분류 + 템플릿 한국어 스토리·해시태그 생성
- 메이슨리 갤러리 + 지역/테마 스토리 + 라이트박스 + 공유 퍼머링크(`?p=ID`)
- 인스타그램 반자동: 게시 패키지(이미지+캡션) 생성 후 GitHub Issue로 알림
- 다크 에디토리얼 테마, 반응형, scroll-reveal 인터랙션

## 폴더 구조

```
photofolio/
├── index.html              # 페이지 구조
├── css/style.css           # 스타일 (다크 테마, 반응형)
├── js/main.js              # data/photos.json을 읽어 렌더링 (브라우저 전역 스크립트)
├── data/photos.json        # 단일 진실원본 (파이프라인이 생성)
├── data/sample/album.json  # 오프라인 검증용 샘플 앨범
├── scripts/                # Node 파이프라인 (ESM)
├── assets/photos/          # 사진 파일
├── docs/CAPTION_CONVENTION.md
└── .github/workflows/      # daily(cron) + pages 배포
```

## 로컬에서 실행

```bash
npm install
npm run dev              # http://localhost:8000
npm run pipeline:sample  # 샘플 앨범으로 파이프라인 실행 (네트워크 불필요)
npm test                 # 포맷 검사 + 린트(JS/CSS/HTML)
```

개별 명령: `npm run format`, `npm run lint`, `npm run build:data`

## 자동화 설정 (운영 시작하기)

1. **iCloud 공유 앨범 만들기** — 아이폰 사진 앱에서 공유 앨범 생성 → 공개 링크 켜기.
   링크 `https://www.icloud.com/sharedalbum/#B0xxxxxxx` 의 `#` 뒤 토큰을 복사.
2. **저장소 시크릿 등록** — GitHub → Settings → Secrets and variables → Actions →
   `ICLOUD_ALBUM_TOKEN` 에 위 토큰 저장.
3. **GitHub Pages 활성화** — Settings → Pages → Source: **GitHub Actions**.
4. **캡션 규칙** — 사진에 `제주 #풍경 #노을 오늘 아침 바다` 형식으로 캡션을 적습니다.
   자세한 규칙은 [docs/CAPTION_CONVENTION.md](docs/CAPTION_CONVENTION.md).
5. **인스타그램(반자동)** — 매일 10시 워크플로가 게시 초안 Issue를 만들고 GitHub가 메일로
   알립니다. 휴대폰에서 사진을 저장하고 Issue의 캡션을 복사해 직접 공유하세요.

> 수동 실행: Actions → **Daily photo sync** → Run workflow.

## 운영 전환 시 (샘플 데이터 정리)

데모용 샘플(8장)이 들어 있습니다. 실제 운영을 시작할 때:

```bash
echo '{ "generatedAt": "", "photos": [], "regions": [], "themes": [] }' > data/photos.json
rm -rf assets/photos/sample
```

이후 첫 파이프라인 실행부터 실제 사진만 쌓입니다.

## 동작 방식

```
iCloud 공유앨범 ──(webstream)──▶ scripts/pipeline.mjs
   신규 사진 수집 → 캡션/EXIF 파싱 → 지역·테마 분류 → 템플릿 스토리·해시태그
   → data/photos.json 갱신 → out/instagram 패키지 → GitHub Issue 알림
                                   │
                                   └─▶ GitHub Pages 배포 (사이트가 photos.json 렌더)
```
