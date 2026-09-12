document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('main-nav');

  if (!nav) return;

  const navItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'work', label: 'Work', href: '/work' },
    { key: 'samples', label: 'Samples', href: '/samples' },
    { key: 'approach', label: 'Approach', href: '/approach' },
    { key: 'pricing', label: 'Pricing', href: '/order' },
    { key: 'about', label: 'About', href: '/about' },
    { key: 'contact', label: 'Contact', href: '/contact' }
  ];

  const normalizePath = (value) => {
    let path = value || '/';
    path = path.replace(/\/index\.html$/, '/');
    path = path.replace(/\.html$/, '');
    path = path.replace(/\/index$/, '');
    if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);
    return path || '/';
  };

  const getActiveKey = (path) => {
    if (path === '/' || path === '/index') return 'home';
    if (path === '/work' || path === '/projects' || path.startsWith('/projects/')) return 'work';
    if (path === '/samples' || path === '/sample' || path === '/sample-pdf' || path.startsWith('/samples/')) return 'samples';
    if (path === '/approach') return 'approach';
    if (path === '/order' || path === '/pricing') return 'pricing';
    if (path === '/about') return 'about';
    if (path === '/contact' || path === '/thank-you') return 'contact';
    return '';
  };

  const currentPath = normalizePath(window.location.pathname);
  const activeKey = getActiveKey(currentPath);

  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');

  const list = document.createElement('ul');
  list.className = 'nav-list';

  navItems.forEach(function (item) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = item.href;
    link.className = 'nav-link';
    link.setAttribute('data-nav', '');
    link.textContent = item.label;

    if (item.key === activeKey) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }

    li.appendChild(link);
    list.appendChild(li);
  });

  nav.replaceChildren(list);

  let toggle = document.getElementById('nav-toggle');

  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.id = 'nav-toggle';
    toggle.innerHTML = '<svg width="24" height="16" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="2" y="0"></rect><rect width="24" height="2" y="7"></rect><rect width="24" height="2" y="14"></rect></svg>';
    nav.insertAdjacentElement('afterend', toggle);
  }

  toggle.setAttribute('aria-controls', 'main-nav');
  toggle.setAttribute('aria-label', 'Open menu');

  const setState = function (open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('data-hidden', String(!open));
    if (open) {
      const first = nav.querySelector('a');
      if (first) first.focus();
    } else if (document.activeElement && nav.contains(document.activeElement)) {
      toggle.focus();
    }
  };

  setState(false);

  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setState(!isOpen);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setState(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) setState(false);
  });
});
