const KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

const saved = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const currentTheme = () =>
  document.documentElement.dataset.theme || (media.matches ? 'dark' : 'light');

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0b0b1a' : '#7c3aed');
}

export function initTheme(button) {
  apply(saved() || currentTheme());

  // Sigue al sistema mientras el usuario no haya elegido manualmente
  media.addEventListener('change', (e) => {
    if (!saved()) apply(e.matches ? 'dark' : 'light');
  });

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(KEY, next); } catch {}
  });
}
