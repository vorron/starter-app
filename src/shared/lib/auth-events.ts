export function setupAuthEventListeners() {
  if (typeof window === 'undefined') return;

  window.addEventListener('auth-logout', () => {
    // Координируем логику логаута через события
    window.dispatchEvent(new CustomEvent('force-logout'));

    // Редирект с задержкой для гарантии обработки store
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  });
}
