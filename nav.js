document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  const setOpen = (open, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.dataset.hidden = String(!open);
    if (open) nav.querySelector('a')?.focus();
    if (!open && restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  nav.addEventListener('click', event => {
    if (event.target.matches('a') && window.innerWidth <= 820) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
});
