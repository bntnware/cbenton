document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

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
