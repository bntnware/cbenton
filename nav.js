document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const navItems = [
    { label: 'Home', route: '/' },
    { label: 'Work', route: '/work' },
    { label: 'Samples', route: '/samples' },
    { label: 'About', route: '/about' },
    { label: 'Pricing', route: '/order' },
    { label: 'Contact', route: '/contact' }
  ];

  const pagePath = decodeURIComponent(window.location.pathname);
  const pageProtocol = window.location.protocol;

  const normalizeRoute = (route) => {
    if (!route) return '/index.html';

    const cleanRoute = route.split('#')[0].split('?')[0] || '/';
    let normalized = cleanRoute.startsWith('/') ? cleanRoute : `/${cleanRoute}`;

    if (normalized === '/') return '/index.html';
    if (normalized === '/samples' || normalized === '/samples/') return '/samples/index.html';
    if (normalized === '/projects' || normalized === '/projects/') return '/work.html';
    if (normalized.endsWith('/')) return `${normalized}index.html`;

    const lastSegment = normalized.split('/').pop() || '';
    if (!/\.[a-z0-9]+$/i.test(lastSegment)) {
      normalized = `${normalized}.html`;
    }

    return normalized;
  };

  const getSiteBase = () => {
    if (pageProtocol === 'file:') {
      if (pagePath.includes('/projects/')) return pagePath.slice(0, pagePath.indexOf('/projects/'));
      if (pagePath.includes('/samples/')) return pagePath.slice(0, pagePath.indexOf('/samples/'));
      return pagePath.slice(0, pagePath.lastIndexOf('/'));
    }

    if (pagePath.includes('/projects/')) return pagePath.slice(0, pagePath.indexOf('/projects/'));
    if (pagePath.includes('/samples/')) return pagePath.slice(0, pagePath.indexOf('/samples/'));

    const topLevelMatch = pagePath.match(/^(.*)\/(?:index|work|about|approach|contact|order|sample|sample-pdf|thank-you)\.html$/);
    if (topLevelMatch) return topLevelMatch[1];

    const samplesRootMatch = pagePath.match(/^(.*)\/samples\/?$/);
    if (samplesRootMatch) return samplesRootMatch[1];

    return pagePath === '/' ? '' : pagePath.replace(/\/$/, '');
  };

  const siteBase = getSiteBase();

  const toSiteUrl = (route) => {
    const normalized = normalizeRoute(route);
    if (pageProtocol === 'file:') {
      return `file://${siteBase}${normalized}`;
    }
    return `${window.location.origin}${siteBase}${normalized}`;
  };

  const rewriteInternalUrl = (value) => {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return value;
    const suffixIndex = value.search(/[?#]/);
    const route = suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
    const suffix = suffixIndex >= 0 ? value.slice(suffixIndex) : '';
    return `${toSiteUrl(route)}${suffix}`;
  };

  const getCurrentRoute = () => {
    let route;

    if (pageProtocol === 'file:') {
      if (pagePath.includes('/projects/')) route = pagePath.slice(pagePath.indexOf('/projects/'));
      else if (pagePath.includes('/samples/')) route = pagePath.slice(pagePath.indexOf('/samples/'));
      else route = `/${pagePath.split('/').pop() || 'index.html'}`;
    } else if (siteBase && pagePath.startsWith(siteBase)) {
      route = pagePath.slice(siteBase.length) || '/';
    } else {
      route = pagePath || '/';
    }

    const normalized = normalizeRoute(route);

    if (normalized.startsWith('/projects/')) return '/work.html';
    if (normalized === '/sample.html' || normalized === '/sample-pdf.html') return '/samples/index.html';
    if (normalized === '/approach.html') return '/about.html';
    if (normalized === '/thank-you.html') return '/contact.html';
    if (normalized.startsWith('/samples/')) return '/samples/index.html';

    return normalized;
  };

  const currentRoute = getCurrentRoute();
  nav.innerHTML = `
    <ul class="nav-list">
      ${navItems.map((item) => `<li><a href="${toSiteUrl(item.route)}" class="nav-link" data-nav-route="${normalizeRoute(item.route)}">${item.label}</a></li>`).join('')}
    </ul>
  `;

  const brandLink = document.querySelector('.brand-link');
  if (brandLink) brandLink.href = toSiteUrl('/');

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const rewritten = rewriteInternalUrl(href);
    if (rewritten !== href) link.href = rewritten;
  });

  document.querySelectorAll('img[src]').forEach((image) => {
    const src = image.getAttribute('src');
    const rewritten = rewriteInternalUrl(src);
    if (rewritten !== src) image.src = rewritten;
  });

  const nextInput = document.querySelector('input[name="_next"]');
  if (nextInput) {
    const rewritten = rewriteInternalUrl(nextInput.value);
    if (rewritten !== nextInput.value) nextInput.value = rewritten;
  }

  nav.querySelectorAll('[data-nav-route]').forEach((link) => {
    const isActive = link.getAttribute('data-nav-route') === currentRoute;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const headerInner = nav.closest('.header-inner');
  let toggle = document.getElementById('nav-toggle');

  if (!toggle && headerInner) {
    toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.id = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', 'main-nav');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.innerHTML = `
      <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <rect width="24" height="2" y="0"></rect>
        <rect width="24" height="2" y="7"></rect>
        <rect width="24" height="2" y="14"></rect>
      </svg>
    `;
    headerInner.appendChild(toggle);
  }

  if (!toggle) return;

  const setState = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.setAttribute('data-hidden', String(!open));
    if (open) {
      const first = nav.querySelector('a');
      if (first) first.focus();
    } else {
      toggle.focus();
    }
  };

  setState(false);

  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setState(!isOpen);
  });

  nav.addEventListener('click', function (event) {
    if (event.target instanceof Element && event.target.closest('a')) {
      setState(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setState(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) setState(false);
  });
});
