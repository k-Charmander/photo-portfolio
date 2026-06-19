# CLAUDE.md

이 저장소는 의존성 없는 순수 정적 사이트(HTML/CSS/JS) 사진 포트폴리오다.
페이지를 고도화(개선)할 때 변경을 검증·미리보기할 수 있도록 개발 하네스가 구성되어 있다.

## 개발 명령어

```bash
npm install          # 도구 설치 (SessionStart 훅이 자동 수행)
npm run dev          # 정적 프리뷰 서버 → http://localhost:8000
npm run lint         # JS(ESLint) + CSS(Stylelint) + HTML(html-validate) 검사
npm run format       # Prettier로 전체 포맷 정리
npm run format:check # 포맷 검사만 (수정 안 함)
npm test             # format:check + lint (검증 스위트)
```

개별 린터: `npm run lint:js`, `npm run lint:css`, `npm run lint:html`

## 검증 흐름 (페이지 변경 시)

1. 변경 후 `npm run format` 으로 포맷 정리
2. `npm run lint` 로 JS/CSS/HTML 검증
3. `npm run dev` 로 띄운 `http://localhost:8000` 에서 결과 확인
4. 커밋 전 `npm test` 통과 확인

## 파일 구조

```
index.html        # 페이지 구조
css/style.css     # 스타일 (다크 테마, 반응형)
js/main.js        # 갤러리 / 필터 / 라이트박스 로직 (브라우저 전역 스크립트)
assets/photos/    # 사진 파일
```

## 참고

- `js/main.js` 는 모듈이 아닌 브라우저 전역 스크립트다 (ESLint `sourceType: "script"`).
- SessionStart 훅(`.claude/hooks/session-start.sh`)이 매 세션마다 의존성 설치 +
  프리뷰 서버 기동을 처리한다.
