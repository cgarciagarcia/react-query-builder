/**
 * Shared docs navbar.
 *
 * Each page declares its identity via `<html data-page="...">`
 * (current values: "home", "url-adapter"). The script reads it to mark
 * the active link and to decide whether anchor links (#install,
 * #quickstart, …) stay on the current page or jump to index.html.
 *
 * The page must include an empty `<div id="navbar"></div>` mount point
 * where the nav should appear, AND a `<link id="hljs-theme">` element so
 * the theme toggle can swap the highlight.js stylesheet.
 */
(function () {
  const CURRENT = document.documentElement.dataset.page || "";

  const HLJS_DARK = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
  const HLJS_LIGHT = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

  const LOGO_LARAVEL = `<svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Laravel" fill="#FF2D20"><path d="M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012-.02-.008-.042-.014-.062-.025L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034H.53L5.043.05a.375.375 0 01.375 0L9.93 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 01.024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 01.375 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033.011.02.018.04.024.06.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.51 7.75v-4.287l-2.147 1.225-6.126 3.498v4.325zM1.093 3.624v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003H5.04c-.014-.01-.025-.021-.04-.031-.011-.01-.024-.018-.035-.027l-.001-.002c-.013-.012-.021-.025-.031-.04-.01-.011-.021-.022-.028-.036h-.002c-.008-.014-.013-.031-.02-.047-.006-.016-.014-.027-.018-.043a.49.49 0 01-.008-.057c-.002-.014-.006-.027-.006-.041V5.789l-2.18-1.257zM5.23.81L1.47 2.974l3.76 2.164 3.758-2.164zm1.956 13.505l2.182-1.256V3.624l-1.58.91-2.182 1.255v9.435zm11.581-10.95l-3.76 2.163 3.76 2.163 3.759-2.164zm-.376 4.978L16.21 7.087 14.63 6.18v4.283l2.182 1.256 1.58.908zm-8.65 9.654l5.514-3.148 2.756-1.572-3.757-2.163-4.323 2.489-3.941 2.27z"/></svg>`;
  const LOGO_SPATIE = `<svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Spatie"><rect width="24" height="24" rx="4.8" fill="#197593"/><text x="12" y="17.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="16" fill="white">S</text></svg>`;
  const ICON_GITHUB = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
  const ICON_MOON = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>`;
  const ICON_SUN = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const ICON_MENU = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`;

  // Cross-page navigation only. In-page anchors (Install, Quick Start, API,
  // etc.) live in each page's local sidebar/TOC — the navbar is for
  // jumping BETWEEN pages, not within them.
  const ITEMS = [
    { label: "Home",        href: "index.html",       page: "home" },
    { label: "URL Adapter", href: "url-adapter.html", page: "url-adapter" },
  ];

  const itemLinkClass = (item) =>
    "t-nav-link" + (item.page === CURRENT ? " active" : "");

  const desktopItems = ITEMS.map(
    (i) => `<a href="${i.href}" class="${itemLinkClass(i)}">${i.label}</a>`,
  ).join("");

  const mobileItems = ITEMS.map(
    (i) =>
      `<a href="${i.href}" onclick="toggleMenu()" class="${itemLinkClass(i)} py-1">${i.label}</a>`,
  ).join("");

  const navHTML = `
<nav class="t-nav fixed top-0 left-0 right-0 z-50 backdrop-blur">
  <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
    <a href="index.html" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
      ${LOGO_LARAVEL}
      <span class="text-red-400 text-base leading-none select-none">♥</span>
      ${LOGO_SPATIE}
      <span class="font-bold text-sm tracking-tight t-heading">react-query-builder</span>
    </a>

    <div class="hidden md:flex items-center gap-6 text-sm">
      ${desktopItems}
      <a href="playground.html" class="t-nav-link font-medium text-emerald-500 hover:text-emerald-400">Playground ▶</a>
      <a href="https://github.com/cgarciagarcia/react-query-builder" target="_blank" class="t-nav-link flex items-center gap-1.5 font-medium">
        ${ICON_GITHUB} GitHub
      </a>
      <button onclick="toggleTheme()" class="theme-toggle" aria-label="Toggle theme">
        <span id="icon-moon">${ICON_MOON}</span>
        <span id="icon-sun">${ICON_SUN}</span>
      </button>
    </div>

    <div class="flex md:hidden items-center gap-2">
      <a href="https://github.com/cgarciagarcia/react-query-builder" target="_blank" class="theme-toggle" aria-label="GitHub">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>
      <button onclick="toggleTheme()" class="theme-toggle" aria-label="Toggle theme">
        <span id="icon-moon-mobile">${ICON_MOON.replace('class="w-4 h-4"', 'class="w-[1.1rem] h-[1.1rem]"')}</span>
        <span id="icon-sun-mobile" style="display:none">${ICON_SUN.replace('class="w-4 h-4"', 'class="w-[1.1rem] h-[1.1rem]"')}</span>
      </button>
      <button onclick="toggleMenu()" class="theme-toggle" aria-label="Menu">${ICON_MENU}</button>
    </div>
  </div>

  <div id="mobile-menu" class="t-nav-solid md:hidden flex-col t-border-t px-6 py-4 gap-4 text-sm">
    ${mobileItems}
    <a href="playground.html" onclick="toggleMenu()" class="py-1 font-medium text-emerald-500">Playground ▶</a>
  </div>
</nav>`;

  // Inject — replace the placeholder so we don't keep an extra wrapper.
  const mount = document.getElementById("navbar");
  if (!mount) return;
  mount.outerHTML = navHTML;

  // ─── Global handlers (attached to window so onclick="" can reach them) ───
  window.toggleTheme = function () {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    const hljs = document.getElementById("hljs-theme");
    if (hljs) hljs.href = next === "light" ? HLJS_LIGHT : HLJS_DARK;
    const sun = document.getElementById("icon-sun-mobile");
    const moon = document.getElementById("icon-moon-mobile");
    if (sun) sun.style.display = next === "light" ? "block" : "none";
    if (moon) moon.style.display = next === "dark" ? "block" : "none";
  };

  window.toggleMenu = function () {
    const m = document.getElementById("mobile-menu");
    if (m) m.classList.toggle("open");
  };

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      const m = document.getElementById("mobile-menu");
      if (m) m.classList.remove("open");
    }
  });

  // Sync mobile icons to the initial theme (set before paint by the page).
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const sun = document.getElementById("icon-sun-mobile");
  const moon = document.getElementById("icon-moon-mobile");
  if (sun) sun.style.display = isDark ? "none" : "block";
  if (moon) moon.style.display = isDark ? "block" : "none";
})();
