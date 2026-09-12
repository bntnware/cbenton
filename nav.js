const SITE_CONFIG = {
  siteName: 'CBenton',
  siteUrl: 'https://cbenton.art',
  nav: [
    { label: 'Work', href: '/work' },
    { label: 'Samples', href: '/samples' },
    { label: 'Approach', href: '/approach' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ],
  footerText: 'CBenton builds coded visual systems rather than isolated graphics.'
};

function normalizePath(pathname) {
  if (!pathname) return '/';
  const path = pathname.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
  if (path === '') return '/';
  return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
}

function getActiveNavHref(path) {
  if (path === '/work' || path.startsWith('/projects/')) return '/work';
  if (path === '/samples' || path === '/sample' || path === '/sample-pdf') return '/samples';
  if (path === '/order') return '/pricing';
  return SITE_CONFIG.nav.find((item) => item.href === path)?.href || null;
}

function renderHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const activeHref = getActiveNavHref(normalizePath(window.location.pathname));
  const navLinks = SITE_CONFIG.nav
    .map((item) => {
      const isActive = item.href === activeHref;
      return `<li><a href="${item.href}" class="nav-link${isActive ? ' active' : ''}" ${isActive ? 'aria-current="page"' : ''}>${item.label}</a></li>`;
    })
    .join('');

  header.innerHTML = `
    <div class="container header-inner">
      <div class="brand">
        <a href="/" aria-label="Homepage" class="brand-link">CBenton</a>
      </div>
      <button class="nav-toggle" id="nav-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle menu">
        <span class="nav-toggle-line"></span>
        <span class="nav-toggle-line"></span>
        <span class="nav-toggle-line"></span>
      </button>
      <nav id="main-nav" class="site-nav" role="navigation" aria-label="Main navigation" data-hidden="true">
        <ul class="nav-list">${navLinks}</ul>
      </nav>
    </div>
  `;
}

function renderFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="container footer-inner">
      <p>${SITE_CONFIG.footerText}</p>
      <p>© 2026 CBenton</p>
    </div>
  `;
}

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  const setState = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('data-hidden', String(!open));
    if (open) {
      const first = nav.querySelector('a');
      if (first) first.focus();
    }
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setState(!isOpen);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setState(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setState(false);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  initMobileNav();
  window.cbentonSite = { SITE_CONFIG, normalizePath };
});
