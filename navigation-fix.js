/* Resilient page navigation fallback for Richie Hub. */
(function () {
  'use strict';
  function openPage(id) {
    const target = document.getElementById(id);
    if (!target || !target.classList.contains('page')) return false;
    document.querySelectorAll('main .page').forEach(function (page) {
      page.classList.toggle('active', page === target);
      page.setAttribute('aria-hidden', page === target ? 'false' : 'true');
    });
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
    return true;
  }
  window.show = openPage;
  document.addEventListener('click', function (event) {
    const button = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!button) return;
    const handler = button.getAttribute('onclick') || '';
    const match = handler.match(/show\(\s*['"]([a-z-]+)['"]\s*\)/i);
    if (match) {
      event.preventDefault();
      openPage(match[1]);
    }
  }, true);
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('main .page').forEach(function (page) {
      page.setAttribute('aria-hidden', page.classList.contains('active') ? 'false' : 'true');
    });
  });
})();