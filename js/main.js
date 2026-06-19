// Photofolio — 데이터 기반 갤러리 / 스토리 / 라이트박스 (브라우저 전역 스크립트)
// data/photos.json 을 읽어 지역·테마 스토리와 아카이브를 렌더링한다.
(function () {
  "use strict";

  var state = { photos: [], byId: {}, regions: [], themes: [], filter: { type: "all", value: "" } };

  var el = {
    heroStats: document.getElementById("hero-stats"),
    regionStories: document.getElementById("region-stories"),
    themeStories: document.getElementById("theme-stories"),
    filters: document.getElementById("archive-filters"),
    grid: document.getElementById("archive-grid"),
    empty: document.getElementById("empty-state"),
    lightbox: document.getElementById("lightbox"),
    lbImg: document.getElementById("lightbox-img"),
    lbMeta: document.getElementById("lightbox-meta"),
    lbStory: document.getElementById("lightbox-story"),
    lbTags: document.getElementById("lightbox-tags"),
    lbStatus: document.getElementById("lightbox-status"),
    lbClose: document.getElementById("lightbox-close"),
  };

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var p = function (n) {
      return String(n).padStart(2, "0");
    };
    return d.getFullYear() + "." + p(d.getMonth() + 1) + "." + p(d.getDate());
  }

  function photosOf(ids) {
    return ids.map(function (id) {
      return state.byId[id];
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function renderHeroStats() {
    var stats = [
      { n: state.photos.length, label: "PHOTOS" },
      { n: state.regions.length, label: "REGIONS" },
      { n: state.themes.length, label: "THEMES" },
    ];
    el.heroStats.innerHTML = stats
      .map(function (s) {
        return "<li><strong>" + s.n + "</strong><span>" + s.label + "</span></li>";
      })
      .join("");
  }

  function renderRegionStories() {
    el.regionStories.innerHTML = state.regions
      .map(function (r) {
        var cover = photosOf(r.photoIds)[0];
        if (!cover) return "";
        return (
          '<div class="story-card" data-type="region" data-value="' +
          escapeHtml(r.key) +
          '">' +
          '<img src="' +
          escapeHtml(cover.src) +
          '" alt="' +
          escapeHtml(r.label) +
          '" loading="lazy" />' +
          '<div class="overlay"><h3>' +
          escapeHtml(r.label) +
          "</h3><p>" +
          r.photoIds.length +
          "장의 기록</p></div></div>"
        );
      })
      .join("");
  }

  function renderThemeStories() {
    el.themeStories.innerHTML = state.themes
      .map(function (t) {
        var cover = photosOf(t.photoIds)[0];
        if (!cover) return "";
        return (
          '<div class="theme-card" data-type="theme" data-value="' +
          escapeHtml(t.key) +
          '">' +
          '<img src="' +
          escapeHtml(cover.src) +
          '" alt="' +
          escapeHtml(t.label) +
          '" loading="lazy" />' +
          '<div class="label">' +
          escapeHtml(t.label) +
          "<small>" +
          t.photoIds.length +
          "장</small></div></div>"
        );
      })
      .join("");
  }

  function renderFilters() {
    var btns = [{ type: "all", value: "", label: "전체" }];
    state.regions.forEach(function (r) {
      btns.push({ type: "region", value: r.key, label: r.label });
    });
    state.themes.forEach(function (t) {
      btns.push({ type: "theme", value: t.key, label: "#" + t.label });
    });
    el.filters.innerHTML = btns
      .map(function (b) {
        var active = b.type === state.filter.type && b.value === state.filter.value;
        return (
          '<button class="filter-btn' +
          (active ? " is-active" : "") +
          '" data-type="' +
          b.type +
          '" data-value="' +
          escapeHtml(b.value) +
          '">' +
          escapeHtml(b.label) +
          "</button>"
        );
      })
      .join("");
  }

  function filteredPhotos() {
    var f = state.filter;
    var list = state.photos.filter(function (p) {
      if (f.type === "all") return true;
      if (f.type === "region") return p.region === f.value;
      if (f.type === "theme") return p.theme === f.value;
      return true;
    });
    return list.slice().sort(function (a, b) {
      return new Date(b.takenAt) - new Date(a.takenAt);
    });
  }

  function renderGrid() {
    var list = filteredPhotos();
    el.empty.hidden = list.length > 0;
    el.grid.innerHTML = list
      .map(function (p) {
        return (
          '<article class="photo-card" data-id="' +
          escapeHtml(p.id) +
          '">' +
          '<div class="thumb"><img src="' +
          escapeHtml(p.src) +
          '" alt="' +
          escapeHtml(p.caption || p.theme) +
          '" loading="lazy" />' +
          '<div class="pin"><span class="chip">' +
          escapeHtml(p.region) +
          '</span><span class="chip accent">' +
          escapeHtml(p.theme) +
          "</span></div></div>" +
          '<div class="body"><p class="date">' +
          formatDate(p.takenAt) +
          '</p><p class="caption">' +
          escapeHtml(p.caption || p.story) +
          "</p></div></article>"
        );
      })
      .join("");
  }

  function setFilter(type, value) {
    state.filter = { type: type, value: value };
    renderFilters();
    el.grid.classList.add("is-fading");
    window.setTimeout(function () {
      renderGrid();
      el.grid.classList.remove("is-fading");
    }, 220);
  }

  function openLightbox(id) {
    var p = state.byId[id];
    if (!p) return;
    el.lbImg.src = p.src;
    el.lbImg.alt = p.caption || p.theme;
    el.lbMeta.innerHTML =
      '<span class="chip">' +
      escapeHtml(formatDate(p.takenAt)) +
      '</span><span class="chip">' +
      escapeHtml(p.region) +
      '</span><span class="chip accent">' +
      escapeHtml(p.theme) +
      "</span>";
    el.lbStory.textContent = p.story || p.caption || "";
    el.lbTags.innerHTML = (p.hashtags || [])
      .map(function (h) {
        return '<span class="tag">' + escapeHtml(h) + "</span>";
      })
      .join("");
    var posted = p.instagram && p.instagram.posted;
    var prepared = p.instagram && p.instagram.prepared;
    el.lbStatus.className = "badge " + (posted ? "posted" : prepared ? "pending" : "");
    el.lbStatus.textContent = posted
      ? "인스타그램 게시 완료"
      : prepared
        ? "게시 대기 중"
        : "준비 전";
    el.lightbox.classList.add("is-open");
    el.lightbox.setAttribute("aria-hidden", "false");
    updateUrl(id);
  }

  function closeLightbox() {
    el.lightbox.classList.remove("is-open");
    el.lightbox.setAttribute("aria-hidden", "true");
    el.lbImg.src = "";
    clearUrl();
  }

  function updateUrl(id) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "?p=" + encodeURIComponent(id));
    }
  }

  function clearUrl() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  function openFromUrl() {
    var id = new URLSearchParams(window.location.search).get("p");
    if (id && state.byId[id]) openLightbox(id);
  }

  function initObserver() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (n) {
        n.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach(function (n) {
      io.observe(n);
    });
  }

  function bindEvents() {
    document.getElementById("regions").addEventListener("click", onStoryClick);
    document.getElementById("themes").addEventListener("click", onStoryClick);
    el.filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      setFilter(btn.dataset.type, btn.dataset.value);
    });
    el.grid.addEventListener("click", function (e) {
      var card = e.target.closest(".photo-card");
      if (card) openLightbox(card.dataset.id);
    });
    el.lbClose.addEventListener("click", closeLightbox);
    el.lightbox.addEventListener("click", function (e) {
      if (e.target === el.lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  function onStoryClick(e) {
    var card = e.target.closest("[data-type]");
    if (!card) return;
    setFilter(card.dataset.type, card.dataset.value);
    document.getElementById("archive").scrollIntoView({ behavior: "smooth" });
  }

  function render() {
    renderHeroStats();
    renderRegionStories();
    renderThemeStories();
    renderFilters();
    renderGrid();
    initObserver();
  }

  function init(data) {
    state.photos = data.photos || [];
    state.regions = data.regions || [];
    state.themes = data.themes || [];
    state.byId = {};
    state.photos.forEach(function (p) {
      state.byId[p.id] = p;
    });
    render();
    bindEvents();
    openFromUrl();
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  fetch("data/photos.json")
    .then(function (res) {
      if (!res.ok) throw new Error("데이터를 불러오지 못했습니다: " + res.status);
      return res.json();
    })
    .then(init)
    .catch(function (err) {
      console.error(err);
      if (el.empty) {
        el.empty.hidden = false;
        el.empty.textContent = "사진 데이터를 불러오지 못했습니다.";
      }
    });
})();
