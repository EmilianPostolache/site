(() => {
  'use strict';

  const storageKey = 'emilian-theme';
  const root = document.documentElement;
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  const isTheme = value => value === 'light' || value === 'dark';
  let preference = null;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (isTheme(saved)) preference = saved;
  } catch {
    // A blocked storage API must not prevent switching themes for this visit.
  }

  function applyTheme() {
    const theme = preference || (systemTheme?.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'dark' ? '#151c20' : '#f5f4ef'
    );
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  }

  // This small head script applies the preference before the page is painted.
  applyTheme();

  function bindToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try {
          window.localStorage.setItem(storageKey, preference);
        } catch {
          // Keep the in-memory choice when persistent storage is unavailable.
        }
        applyTheme();
      });
    });
    applyTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggle, { once: true });
  } else {
    bindToggle();
  }

  const onSystemChange = () => { if (!preference) applyTheme(); };
  if (systemTheme?.addEventListener) systemTheme.addEventListener('change', onSystemChange);
  else if (systemTheme?.addListener) systemTheme.addListener(onSystemChange);

  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = isTheme(event.newValue) ? event.newValue : null;
    applyTheme();
  });
})();
