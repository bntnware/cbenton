/*
  nav.js — canonical navigation builder
  - Loads /data/nav.json if available; falls back to inline config.
  - Renders the same nav content into any element with id="main-nav".
  - Ensures aria-current and .active are applied consistently.
  - Preserves & improves existing mobile toggle behavior (Escape, resize).
  - Non-destructive: pages keep their header markup; this script overwrites the .nav-list content.
*/

(function () {
  'use strict';

  // Inline fallback nav (keeps the repo independent if /data/nav.json is missing)
  const FALLBACK_NAV = {
    brand: { label: 'CBenton', href: '/' },
    items: [
      { label: 'Work', href: '/work' },
      { label: 'Samples', href: '/samples' },
      { label: 'Approach', href: '/approach' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ],
    options: { projectDetailActivates: '/work', useAriaCurrent: true, mobileBreakpointPx: 768 }
  };

  const NAV_JSON_PATH = '/data/nav.json';

  function pathEquals(a, b) {
    // normalize and compare without trailing slash (except root)
    if (!a) return false;
    if (!b) return false;
    const norm = (p) => (p === '/' ? '/' : p.replace(/\/+$/, ''));
    return norm(a) === norm(b);
  }

  function shouldMarkActive(itemHref, locationPath, options) {
    // Exact match
    if (pathEquals(itemHref, locationPath)) return true;

    // If on a project detail (/projects/*), activate the configured parent (e.g. /work)
    if (locationPath.startsWith('/projects/') && options && options.projectDetailActivates) {
      if (pathEquals(itemHref, options.projectDetailActivates)) return true;
    }

    // For routes like /work/... consider prefix match only for allowed parents (exact or documented prefixes)
    // Avoid "contains" brittle matching; only check that route startsWith(itemHref + '/')
    try {
      const itemN = itemHref === '/' ? '/' : itemHref.replace(/\/+$/, '');
      if (itemN !== '/' && locationPath.startsWith(itemN + '/')) return true;
    } catch (e) { /* ignore */ }

    return false;
  }

  function createNavList(navConfig) {
    const ul = document.createElement('ul');
    ul.className = 'nav-list';
    ul.setAttribute('role', 'menubar');

    const currentPath = window.location.pathname || '/';
    const options = navConfig.options || {};

    navConfig.items.forEach(item => {
      const li = document.createElement('li');
      li.setAttribute('role', 'none');

      const a = document.createElement('a');
      a.className = 'nav-link';
      a.setAttribute('data-nav', '');
      a.href = item.href;
      a.textContent = item.label;
      a.setAttribute('role', 'menuitem');

      // Active/aria-current handling
      const isActive = shouldMarkActive(item.href, currentPath, options);
      if (isActive) {
        a.classList.add('active');
        if (options.useAriaCurrent) a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
        a.classList.remove('active');
      }

      li.appendChild(a);
      ul.appendChild(li);
    });

    return ul;
  }

  function replaceNavContents(navElement, navConfig) {
    // Remove any existing nav list(s) and insert canonical list
    const existing = navElement.querySelectorAll('.nav-list');
    existing.forEach(node => node.remove());

    const list = createNavList(navConfig);
    navElement.appendChild(list);
  }

  function wireToggleBehavior(toggleEl, navEl, options) {
    const breakpoint = (options && options.mobileBreakpointPx) || 768;

    if (!toggleEl || !navEl) return;

    const setState = (open) => {
      toggleEl.setAttribute('aria-expanded', String(open));
      navEl.setAttribute('data-hidden', String(!open));
      if (open) {
        const first = navEl.querySelector('a');
        if (first) first.focus();
      } else {
        toggleEl.focus();
      }
    };

    toggleEl.addEventListener('click', function () {
      const isOpen = toggleEl.getAttribute('aria-expanded') === 'true';
      setState(!isOpen);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setState(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > breakpoint) setState(false);
    });

    // Ensure initial collapsed state for small screens
    if (window.innerWidth <= breakpoint) {
      setState(false);
    } else {
      // Desktop: nav should be visible (data-hidden=false)
      navEl.setAttribute('data-hidden', 'false');
      toggleEl.setAttribute('aria-expanded', 'false');
    }
  }

  function initNavigation(navConfig) {
    // Find all nav elements with id main-nav (pages use the same id)
    const navElements = document.querySelectorAll('#main-nav');
    if (!navElements || navElements.length === 0) return;

    navElements.forEach(navEl => {
      // Ensure we have a toggle nearby with id nav-toggle in the same header (if present)
      const header = navEl.closest('.site-header') || document;
      const toggle = header.querySelector('#nav-toggle');

      // Replace nav contents (ul.nav-list)
      replaceNavContents(navEl, navConfig);

      // Ensure the toggle behavior (if a toggle exists on the page)
      if (toggle) wireToggleBehavior(toggle, navEl, navConfig.options || {});
    });
  }

  // Try to fetch remote nav config; fall back to inline constant
  function loadNav() {
    if (!window.fetch) {
      initNavigation(FALLBACK_NAV);
      return;
    }

    fetch(NAV_JSON_PATH, { cache: 'no-store' })
      .then(resp => {
        if (!resp.ok) throw new Error('No nav.json');
        return resp.json();
      })
      .then(config => {
        // Basic validation
        if (!config || !Array.isArray(config.items)) throw new Error('Invalid nav config');
        initNavigation(config);
      })
      .catch(() => {
        // Use fallback if fetch fails or format invalid
        initNavigation(FALLBACK_NAV);
      });
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNav);
  } else {
    loadNav();
  }
})();
