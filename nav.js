document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  const navLinks = nav ? nav.querySelectorAll('.nav-link') : [];

  const normalizePath = (value) => {
    if (!value) return '/index.html';
    const path = value.split('?')[0].split('#')[0];
    if (path === '/') return '/index.html';

    const legacyMap = {
      '/index': '/index.html',
      '/work': '/work.html',
      '/about': '/about.html',
      '/order': '/order.html',
      '/contact': '/contact.html',
      '/sample': '/sample.html',
      '/samples': '/samples/index.html'
    };

    return legacyMap[path] || path;
  };

  const currentPath = normalizePath(window.location.pathname);
  let activePath = currentPath;

  if (currentPath.startsWith('/projects/') || currentPath === '/work.html') {
    activePath = '/work.html';
  } else if (
    currentPath === '/sample.html' ||
    currentPath === '/sample-pdf.html' ||
    currentPath.startsWith('/samples/')
  ) {
    activePath = '/samples/index.html';
  } else if (currentPath === '/about.html') {
    activePath = '/about.html';
  } else if (currentPath === '/thank-you.html' || currentPath === '/contact.html') {
    activePath = '/contact.html';
  } else if (currentPath === '/order.html') {
    activePath = '/order.html';
  }

  navLinks.forEach((link) => {
    const linkPath = normalizePath(link.getAttribute('href'));
    const isActive = linkPath === activePath;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (!toggle || !nav) return;

  const setState = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('data-hidden', String(!open));
    if (open) {
      const first = nav.querySelector('a');
      if (first) first.focus();
    } else {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', function (e) {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setState(!isOpen);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setState(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) setState(false);
  });
});
