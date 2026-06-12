import { browser } from '$app/environment';

export type ThemePref = 'light' | 'dark' | 'system';

let _pref = $state<ThemePref>(
  browser ? ((localStorage.getItem('popup_theme') as ThemePref) ?? 'system') : 'system'
);

function resolve(pref: ThemePref): 'light' | 'dark' {
  if (pref !== 'system') return pref;
  if (!browser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(pref: ThemePref) {
  if (!browser) return;
  document.documentElement.setAttribute('data-theme', resolve(pref));
}

if (browser) {
  // React to system changes while in 'system' mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (_pref === 'system') apply('system');
  });
}

export const theme = {
  get pref() { return _pref; },
  get resolved() { return resolve(_pref); },
  set(pref: ThemePref) {
    _pref = pref;
    if (browser) localStorage.setItem('popup_theme', pref);
    apply(pref);
  },
};
