// 사진 데이터 — 실제 이미지로 교체하세요 (예: assets/photos/...).
// 지금은 picsum.photos 플레이스홀더를 사용합니다.
const photos = [
  { id: 1, category: "landscape", title: "안개 낀 산", src: "https://picsum.photos/seed/land1/800/600" },
  { id: 2, category: "portrait",  title: "창가의 빛",  src: "https://picsum.photos/seed/port1/800/600" },
  { id: 3, category: "street",    title: "비 오는 골목", src: "https://picsum.photos/seed/street1/800/600" },
  { id: 4, category: "landscape", title: "해 질 녘 해변", src: "https://picsum.photos/seed/land2/800/600" },
  { id: 5, category: "portrait",  title: "흑백 초상",   src: "https://picsum.photos/seed/port2/800/600" },
  { id: 6, category: "street",    title: "도시의 밤",   src: "https://picsum.photos/seed/street2/800/600" },
  { id: 7, category: "landscape", title: "겨울 호수",   src: "https://picsum.photos/seed/land3/800/600" },
  { id: 8, category: "street",    title: "지하철",     src: "https://picsum.photos/seed/street3/800/600" },
  { id: 9, category: "portrait",  title: "웃음",       src: "https://picsum.photos/seed/port3/800/600" },
];

const grid = document.getElementById("gallery-grid");
const filters = document.getElementById("filters");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

let currentFilter = "all";

function render() {
  const items = photos.filter(
    (p) => currentFilter === "all" || p.category === currentFilter
  );

  grid.innerHTML = items
    .map(
      (p) => `
      <figure class="gallery-item" data-src="${p.src}" data-title="${p.title}">
        <img src="${p.src}" alt="${p.title}" loading="lazy" />
        <figcaption class="caption">${p.title}</figcaption>
      </figure>`
    )
    .join("");
}

// 필터 클릭
filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.toggle("is-active", b === btn));
  render();
});

// 라이트박스 열기
grid.addEventListener("click", (e) => {
  const item = e.target.closest(".gallery-item");
  if (!item) return;
  lightboxImg.src = item.dataset.src;
  lightboxImg.alt = item.dataset.title;
  lightboxCaption.textContent = item.dataset.title;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
});

// 라이트박스 닫기
function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// 푸터 연도
document.getElementById("year").textContent = new Date().getFullYear();

render();
