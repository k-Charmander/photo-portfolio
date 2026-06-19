# Photo Portfolio

빛과 순간을 담는 사진 포트폴리오 정적 웹사이트입니다. 의존성 없이 순수
HTML / CSS / JavaScript로 만들어졌습니다.

## 기능

- 반응형 갤러리 그리드 (자동 열 배치)
- 카테고리 필터 (전체 / 풍경 / 인물 / 거리)
- 클릭 시 라이트박스 확대 보기 (ESC 또는 배경 클릭으로 닫기)
- 다크 테마, 모바일 대응

## 폴더 구조

```
photo-portfolio/
├── index.html        # 페이지 구조
├── css/
│   └── style.css     # 스타일
├── js/
│   └── main.js       # 갤러리 / 필터 / 라이트박스 로직
└── assets/
    └── photos/       # 사진 파일을 여기에 넣으세요
```

## 로컬에서 실행

별도 빌드 과정이 없습니다. 파일을 브라우저로 열거나 간단한 정적 서버를 사용하세요.

```bash
# 방법 1) npm (포맷터·린터 포함)
npm install
npm run dev   # http://localhost:8000 접속

# 방법 2) Python 3 (도구 없이 빠르게)
python3 -m http.server 8000
# 이후 http://localhost:8000 접속
```

## 개발 도구

페이지 개선 시 변경을 검증할 수 있도록 포맷터·린터가 구성되어 있습니다.

```bash
npm run format   # Prettier 포맷 정리
npm run lint     # ESLint(JS) + Stylelint(CSS) + html-validate(HTML)
npm test         # 포맷 검사 + 린트
```

## 사진 교체 방법

1. 사진 파일을 `assets/photos/` 에 넣습니다.
2. `js/main.js` 의 `photos` 배열에서 `src` 를 로컬 경로로 바꾸고,
   `category` 와 `title` 을 채웁니다.

```js
{ id: 1, category: "landscape", title: "안개 낀 산", src: "assets/photos/mountain.jpg" },
```

> 현재는 데모용으로 `picsum.photos` 플레이스홀더 이미지를 사용합니다.
