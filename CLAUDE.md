# CLAUDE.md

이 저장소는 아이폰 사진을 지역·테마별 스토리로 아카이빙하는 사진 저널이다.
사이트는 의존성 없는 정적 HTML/CSS/JS이고, 데이터는 Node 파이프라인이 `data/photos.json`을
생성하며, 자동화는 GitHub Actions(cron + Pages)로 서버 없이 동작한다.

## 개발 명령어

```bash
npm install            # 도구 설치 (SessionStart 훅이 자동 수행)
npm run dev            # 정적 프리뷰 서버 → http://localhost:8000
npm run lint           # JS(ESLint) + CSS(Stylelint) + HTML(html-validate) 검사
npm run format         # Prettier로 전체 포맷 정리
npm test               # format:check + lint (검증 스위트)
npm run pipeline:sample # 샘플 앨범으로 파이프라인 실행 (네트워크 불필요)
npm run pipeline       # 실제 Google Drive 폴더 수집 (env GDRIVE_SA_KEY, GDRIVE_FOLDER_ID)
npm run build:data     # data/photos.json 재정렬·재생성
```

개별 린터: `npm run lint:js`, `npm run lint:css`, `npm run lint:html`

## 검증 흐름 (페이지 변경 시)

1. 변경 후 `npm run format` 으로 포맷 정리
2. `npm run lint` 로 JS/CSS/HTML 검증
3. `npm run dev` 로 띄운 `http://localhost:8000` 에서 결과 확인
4. 커밋 전 `npm test` 통과 확인

## 파일 구조

```
index.html         # 페이지 구조
css/style.css      # 스타일 (라이트/파스텔 컬러블록, 메이슨리, 반응형)
js/main.js         # data/photos.json 렌더링 (브라우저 전역 스크립트)
data/photos.json   # 단일 진실원본 (파이프라인 생성 + dedup 원장)
scripts/           # Node 파이프라인 (ESM) — gdrive/filename/classify/story/...
.github/workflows/ # daily(cron 10시 KST) + pages 배포
docs/FILENAME_CONVENTION.md  # Drive 파일명 규칙
```

## 참고

- `js/main.js` 는 모듈이 아닌 브라우저 전역 스크립트다 (ESLint `sourceType: "script"`).
  `scripts/**/*.mjs` 는 Node ESM(`sourceType: "module"`) 으로 별도 설정된다.
- `data/photos.json`·`data/sample`·`out/` 은 Prettier 검사 대상이 아니다(.prettierignore).
  `out/` 은 커밋하지 않는다(.gitignore) — 워크플로 아티팩트로만 보관.
- 스토리/해시태그는 결정론적이라 재실행해도 동일 결과(git diff 최소). photos.json의 사진
  id가 dedup 키이므로 같은 사진은 중복 추가되지 않는다.
- SessionStart 훅(`.claude/hooks/session-start.sh`)이 매 세션마다 의존성 설치 +
  프리뷰 서버 기동을 처리한다.
- 자동화/운영 설정은 README.md 의 "자동화 설정" 참고.

## 다음 작업 (TODO)

- **디자인을 핀터레스트 스타일로 재작업** 예정 (폰트·레이아웃 포함). 상세·방향은
  [docs/DESIGN_TODO.md](docs/DESIGN_TODO.md) 참고. 현재는 Figma 라이트/파스텔 컬러블록
  시스템(docs/DESIGN.md).
