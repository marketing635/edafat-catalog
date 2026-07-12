const PAGE_COUNT = 106;
const TOC_PAGE = 4;
const PAGE_DIR = "pages";
const PAGE_IMAGE_VERSION = 9;
const SHARE_URL = "https://marketing635.github.io/edafat-catalog/";

const sections = [
  { title: "Gelato & Ice Cream", page: 6, targetPage: 6, y: 33.2 },
  { title: "Bakery & Pastry", page: 28, targetPage: 28, y: 42.2 },
  { title: "Fruit Preparations & Purees", page: 44, targetPage: 44, y: 50.8 },
  { title: "Syrups & Flavours", page: 46, targetPage: 46, y: 59.3 },
  { title: "Restaurants and Hotels", page: 69, targetPage: 69, y: 68.1 },
  { title: "Contact Us", page: 106, targetPage: 106, y: 76.4 },
];

const finalPageLinks = [
  { label: "Online Store", icon: "store", url: "https://edafat.shop/" },
  { label: "Instagram", icon: "instagram", url: "https://www.instagram.com/edafatsa" },
  { label: "TikTok", icon: "tiktok", url: "https://www.tiktok.com/@edafat.sa" },
  { label: "Snapchat", icon: "snapchat", url: "https://www.snapchat.com/add/edafatsa.sa" },
  { label: "Become a Partner", icon: "partner", url: "https://marketing635.github.io/edafat/" },
];

const linkIcons = {
  store: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16l-1.2-5H5.2L4 10Z" /><path d="M6 10v9h12v-9" /><path d="M9 19v-5h6v5" /></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.2" /><path d="M16.8 7.2h.01" /></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5v9.2a4.2 4.2 0 1 1-4.2-4.2" /><path d="M14 5c.8 2.6 2.5 4.2 5 4.5" /></svg>',
  snapchat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c2.4 0 4 1.7 4 4.5v2.2c0 1.2.8 2.1 2.4 2.7-.9 1.1-1.7 1.6-2.7 1.7-.4 1.9-1.8 3.1-3.7 3.1s-3.3-1.2-3.7-3.1c-1-.1-1.8-.6-2.7-1.7 1.6-.6 2.4-1.5 2.4-2.7V8.5C8 5.7 9.6 4 12 4Z" /></svg>',
  partner: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11h4l3-3a3 3 0 0 1 4 4l-7 7a4 4 0 0 1-6 0l-1-1" /><path d="M14 13h-4l-3 3a3 3 0 0 1-4-4l7-7a4 4 0 0 1 6 0l1 1" /></svg>',
};

const book = document.getElementById("book");
const drawer = document.getElementById("drawer");
const pageStatus = document.getElementById("pageStatus");
const tocList = document.getElementById("tocList");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const toast = document.getElementById("toast");

let currentPage = readPageFromHash();
let zoom = 1;
let searchIndex = [];
let lastDirection = "next";

function readPageFromHash() {
  const match = location.hash.match(/page=(\d+)/);
  const page = match ? Number(match[1]) : 1;
  return clamp(page, 1, PAGE_COUNT);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function imageSrc(page) {
  return `${PAGE_DIR}/page-${String(page).padStart(3, "0")}.webp?v=${PAGE_IMAGE_VERSION}`;
}

function spreadPages(page) {
  if (page === 1) return [1];
  if (page === PAGE_COUNT) return [page];
  const left = page % 2 === 0 ? page : page - 1;
  return [left, left + 1 <= PAGE_COUNT ? left + 1 : null];
}

function createPage(page, side) {
  const node = document.createElement("article");
  node.className = `page ${side || ""}`;

  if (!page) {
    node.classList.add("placeholder");
    return node;
  }

  if ((side === "right" && lastDirection === "next") || (side === "left" && lastDirection === "prev")) {
    node.classList.add(lastDirection === "next" ? "turning-next" : "turning-prev");
  }

  const img = document.createElement("img");
  img.src = imageSrc(page);
  img.alt = `Catalog page ${page}`;
  img.loading = page === currentPage ? "eager" : "lazy";
  img.decoding = "async";
  node.append(img);

  if (page === TOC_PAGE) {
    addTocHotspots(node);
    addTocPageClickNavigation(node);
  }
  if (page === PAGE_COUNT) addFinalPageLinks(node);
  return node;
}

function addTocHotspots(pageNode) {
  sections.forEach((section) => {
    const link = document.createElement("a");
    link.className = "toc-hotspot";
    link.href = `#page=${section.targetPage}`;
    link.style.top = `${section.y}%`;
    link.title = `${section.title} - Page ${section.page}`;
    link.setAttribute("aria-label", `${section.title}, page ${section.page}`);
    link.textContent = section.title;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      link.classList.add("pressed");
      goToPage(section.targetPage);
    });
    pageNode.append(link);
  });
}

function addTocPageClickNavigation(pageNode) {
  pageNode.classList.add("toc-page");
  pageNode.addEventListener("click", (event) => {
    const rect = pageNode.getBoundingClientRect();
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    const section = sections.find((item) => yPercent >= item.y && yPercent <= item.y + 7.2);
    if (section) goToPage(section.targetPage);
  });
}

function addFinalPageLinks(pageNode) {
  const links = document.createElement("div");
  links.className = "final-links";
  links.setAttribute("aria-label", "Edafat links");

  finalPageLinks.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = item.label;
    link.setAttribute("aria-label", item.label);
    link.innerHTML = linkIcons[item.icon] || item.label;
    links.append(link);
  });

  pageNode.append(links);
}

function renderBook() {
  book.innerHTML = "";
  const spread = document.createElement("div");
  spread.className = "spread";
  const pages = spreadPages(currentPage);

  if (pages.length === 1) {
    spread.append(createPage(pages[0], "single"));
  } else {
    spread.append(createPage(pages[0], "left"));
    spread.append(createPage(pages[1], "right"));
  }

  book.append(spread);
  book.style.transform = `scale(${zoom})`;
  pageStatus.textContent = `Page ${currentPage} / ${PAGE_COUNT}`;
  preloadAround(currentPage);
  updateHash();
}

function updateHash() {
  const nextHash = `#page=${currentPage}`;
  if (location.hash !== nextHash) history.replaceState(null, "", nextHash);
}

function preloadAround(page) {
  [page - 2, page - 1, page + 1, page + 2].forEach((candidate) => {
    if (candidate < 1 || candidate > PAGE_COUNT) return;
    const img = new Image();
    img.src = imageSrc(candidate);
  });
}

function goToPage(page) {
  const nextPage = clamp(page, 1, PAGE_COUNT);
  lastDirection = nextPage >= currentPage ? "next" : "prev";
  currentPage = nextPage;
  drawer.classList.remove("open");
  renderBook();
}

function nextPage() {
  goToPage(currentPage + (currentPage === 1 ? 1 : 2));
}

function prevPage() {
  goToPage(currentPage - (currentPage <= 2 ? 1 : 2));
}

function setZoom(nextZoom) {
  zoom = clamp(nextZoom, 0.72, 1.8);
  book.style.transform = `scale(${zoom})`;
}

function renderToc() {
  tocList.innerHTML = "";
  sections.forEach((section) => {
    const button = document.createElement("button");
    button.className = "toc-item";
    button.type = "button";
    button.innerHTML = `<strong>${section.title}</strong><span>Page ${section.page}</span>`;
    button.addEventListener("click", () => goToPage(section.targetPage));
    tocList.append(button);
  });
}

function setActivePanel(panelName) {
  document.getElementById("tocTab").classList.toggle("active", panelName === "toc");
  document.getElementById("searchTab").classList.toggle("active", panelName === "search");
  document.getElementById("tocPanel").classList.toggle("active", panelName === "toc");
  document.getElementById("searchPanel").classList.toggle("active", panelName === "search");
}

function normalizeSearchTerm(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[إأآٱ]/g, "ا")
    .replace(/[ى]/g, "ي")
    .replace(/[ة]/g, "ه")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[char]);
}

function truncateText(value, length = 90) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

function isNearCodeMatch(query, code) {
  const queryDigits = query.replace(/\D/g, "");
  const codeDigits = String(code || "").replace(/\D/g, "");
  if (queryDigits.length < 5 || codeDigits.length < 5) return false;
  if (queryDigits === codeDigits) return true;
  if (Math.abs(queryDigits.length - codeDigits.length) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < queryDigits.length && j < codeDigits.length) {
    if (queryDigits[i] === codeDigits[j]) {
      i += 1;
      j += 1;
    } else {
      edits += 1;
      if (edits > 1) return false;
      if (queryDigits.length > codeDigits.length) i += 1;
      else if (codeDigits.length > queryDigits.length) j += 1;
      else {
        i += 1;
        j += 1;
      }
    }
  }
  return edits + (queryDigits.length - i) + (codeDigits.length - j) <= 1;
}

function renderSearchResults(query) {
  const normalized = String(query || "").trim().toLowerCase();
  const compactQuery = normalizeSearchTerm(query);
  searchResults.innerHTML = "";

  if (!normalized && !compactQuery) {
    searchResults.innerHTML = `<p class="empty">اكتب كلمة للبحث داخل الصفحات.</p>`;
    return;
  }

  const matches = searchIndex
    .map((entry) => {
      const text = entry.text || "";
      const lower = text.toLowerCase();
      const compact = entry.normalized || normalizeSearchTerm(text);
      const directIndex = lower.indexOf(normalized);
      const compactIndex = compactQuery ? compact.indexOf(compactQuery) : -1;
      const nearCode = isNearCodeMatch(query, entry.code);
      const matched = directIndex !== -1 || compactIndex !== -1 || nearCode;
      const score = entry.type === "product" && (directIndex !== -1 || compactIndex !== -1) ? 0 : directIndex !== -1 ? 1 : compactIndex !== -1 ? 2 : 3;
      return { ...entry, text, lower, directIndex, matched, score };
    })
    .filter((entry) => entry.matched)
    .sort((a, b) => {
      const typeRank = (entry) => entry.type === "product" ? 0 : 1;
      return a.score - b.score || typeRank(a) - typeRank(b) || a.page - b.page;
    })
    .slice(0, 18);

  if (!matches.length) {
    searchResults.innerHTML = `<p class="empty">لا توجد نتائج مطابقة.</p>`;
    return;
  }

  matches.forEach((entry) => {
    const item = document.createElement("button");
    const hitIndex = Math.max(0, entry.directIndex);
    const snippet = entry.type === "product"
      ? [entry.brand, entry.description, entry.code, entry.pcs, entry.unit].filter(Boolean).join(" | ")
      : entry.text.slice(Math.max(0, hitIndex - 48), hitIndex + normalized.length + 90);
    const title = entry.type === "product" ? truncateText([entry.code, entry.brand || entry.description].filter(Boolean).join(" - "), 80) : `Page ${entry.page}`;
    item.className = "result-item";
    item.type = "button";
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>Page ${entry.page}</span><p>${escapeHtml(truncateText(snippet || entry.text.slice(0, 130) || "Matching page", 160))}</p>`;
    item.addEventListener("click", () => goToPage(entry.page));
    searchResults.append(item);
  });
}

async function shareCatalog() {
  const url = SHARE_URL;
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      showToast("تم نسخ الرابط.");
    }
  } catch {
    showToast("لم تكتمل المشاركة.");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function wireEvents() {
  document.getElementById("homeButton").addEventListener("click", () => goToPage(1));
  document.getElementById("prevButton").addEventListener("click", prevPage);
  document.getElementById("nextButton").addEventListener("click", nextPage);
  document.getElementById("zoomInButton").addEventListener("click", () => setZoom(zoom + 0.14));
  document.getElementById("zoomOutButton").addEventListener("click", () => setZoom(zoom - 0.14));
  document.getElementById("shareButton").addEventListener("click", shareCatalog);
  document.getElementById("backToTocButton").addEventListener("click", () => goToPage(TOC_PAGE));
  document.getElementById("tocButton").addEventListener("click", () => {
    setActivePanel("toc");
    drawer.classList.toggle("open");
  });
  document.getElementById("searchButton").addEventListener("click", () => {
    setActivePanel("search");
    drawer.classList.add("open");
    window.setTimeout(() => searchInput.focus(), 80);
  });
  document.getElementById("tocTab").addEventListener("click", () => setActivePanel("toc"));
  document.getElementById("searchTab").addEventListener("click", () => setActivePanel("search"));
  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") prevPage();
    if (event.key === "ArrowLeft") nextPage();
    if (event.key === "Escape") drawer.classList.remove("open");
  });

  window.addEventListener("hashchange", () => {
    const page = readPageFromHash();
    if (page !== currentPage) goToPage(page);
  });

  window.addEventListener("resize", () => renderBook());
}

async function loadSearchIndex() {
  if (Array.isArray(window.SEARCH_INDEX)) {
    searchIndex = window.SEARCH_INDEX;
    return;
  }

  try {
    const response = await fetch("data/search-index.json?v=11", { cache: "no-store" });
    searchIndex = await response.json();
  } catch {
    searchIndex = [];
  }
}

renderToc();
wireEvents();
renderBook();
loadSearchIndex().then(() => renderSearchResults(""));
