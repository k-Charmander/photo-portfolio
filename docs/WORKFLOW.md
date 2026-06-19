# 워크플로우 (단계별)

아이폰 사진이 사이트와 인스타그램까지 흘러가는 전체 자동화 흐름입니다.
설정값은 [README.md](../README.md)의 "자동화 설정", 캡션 규칙은
[CAPTION_CONVENTION.md](CAPTION_CONVENTION.md)를 참고하세요.

```
아이폰 공유앨범 ─▶ [10시 cron] pipeline ─▶ photos.json + 인스타 패키지
                                    ├─▶ 자동 커밋 ─▶ Pages 배포 ─▶ 사이트 갱신
                                    └─▶ GitHub Issue ─▶ 메일 ─▶ 직접 인스타 공유
```

## 0단계 — 최초 설정 (1회만)

- **iCloud 공유 앨범** 생성 → 공개 링크 `https://www.icloud.com/sharedalbum/#B0xxxxx`의
  `#` 뒤 토큰을 repo 시크릿 `ICLOUD_ALBUM_TOKEN`에 등록
- **GitHub Pages** 활성화 (Settings → Pages → Source: GitHub Actions)

## 1단계 — 사진 추가 (사용자, 아이폰)

- 아이폰에서 **공유 앨범에 사진 추가** + 캡션 작성
- 캡션 규칙: `지역 #테마 #태그 자유설명`
  - 예: `제주 #풍경 #노을 오늘 아침 바다`

## 2단계 — 매일 10시 자동 실행 (`.github/workflows/daily.yml`)

- `cron: "0 1 * * *"` (01:00 UTC = **10:00 KST**, 한국은 DST 없음)
- 수동 실행: Actions → **Daily photo sync** → Run workflow

## 3단계 — 파이프라인 (`npm run pipeline`)

| 스텝 | 파일                                         | 역할                                            |
| ---- | -------------------------------------------- | ----------------------------------------------- |
| 1    | `scripts/icloud.mjs`                         | 공유앨범 webstream에서 **신규 사진만** 수집     |
| 2    | `scripts/pipeline.mjs`                       | 이미지 다운로드 → `assets/photos/`              |
| 3    | `scripts/exif.mjs` · `scripts/caption.mjs`   | EXIF(있으면)·캡션 파싱                          |
| 4    | `scripts/classify.mjs`                       | **지역**(GPS→캡션→미상)·**테마** 분류           |
| 5    | `scripts/story.mjs` · `scripts/hashtags.mjs` | 템플릿 한국어 스토리·해시태그                   |
| 6    | `scripts/build-data.mjs`                     | `data/photos.json` 갱신 (id 기반 **중복 제거**) |
| 7    | `scripts/instagram.mjs`                      | `out/instagram/<id>/` 게시 패키지 생성          |

> 오프라인 점검: `npm run pipeline:sample` (네트워크 없이 `data/sample/album.json` 사용)

## 4단계 — 커밋 & 알림 (`daily.yml`)

- 변경된 `assets/photos/`·`data/photos.json`을 **자동 커밋·푸시**
- 신규분이 있으면 `out/notify.json`을 바탕으로 **GitHub Issue 생성** → GitHub가 **메일 알림**

## 5단계 — 사이트 배포 (`.github/workflows/pages.yml`)

- main 푸시 → **GitHub Pages 배포** → 사이트에 새 사진 반영

## 6단계 — 인스타그램 (반자동, 사용자)

- Issue 메일 확인 → 사진 저장 → `caption.txt`(스토리 + 해시태그) 복사 →
  **Instagram에 직접 공유**
- 자동 게시(Graph API)는 사용하지 않습니다. 마지막 공유는 사람이 합니다.

## 7단계 — 방문자 경험 (사이트)

- 지역/테마 스토리 탐색 · 메이슨리 아카이브 · 라이트박스(스토리+해시태그+게시 상태)
- 공유 퍼머링크 `?p=<사진ID>` 로 특정 사진 바로 열기

## 참고

- `data/photos.json`이 단일 진실원본이자 중복 처리 원장입니다. 사진 id가 이미 있으면
  다시 추가되지 않습니다.
- 스토리·해시태그는 결정론적이라 재실행해도 동일 결과(불필요한 git diff 없음).
- iCloud 공유앨범은 EXIF/GPS를 제거할 수 있어, 지역·테마는 **캡션 규칙**을 우선합니다.
