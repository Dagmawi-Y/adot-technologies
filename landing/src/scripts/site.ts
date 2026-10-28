const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu]');
const mobileNavigation = document.querySelector<HTMLElement>('#mobile-navigation');
function closeMenu(restoreFocus = false) {
  if (!menuButton || !mobileNavigation) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileNavigation.hidden = true;
  if (restoreFocus) menuButton.focus();
}
menuButton?.addEventListener('click', () => {
  if (!mobileNavigation) return;
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNavigation.hidden = !open;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (menuButton?.getAttribute('aria-expanded') === 'true') closeMenu(true);
    document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown[open]').forEach(details => { details.open = false; details.querySelector('summary')?.focus(); });
  }
});
document.addEventListener('click', event => {
  if (!(event.target instanceof Node)) return;
  document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown[open]').forEach(details => { if (!details.contains(event.target as Node)) details.open = false; });
  if (!document.querySelector('.header-wrap')?.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Everything remains visible without JavaScript; entry motion is progressive enhancement.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('reveal-enter');
    observer.unobserve(entry.target);
  }), { threshold: 0.08 });
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => observer.observe(element));
}
const parallax = document.querySelector<HTMLElement>('[data-parallax]');
if (parallax) {
  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (reducedMotion.matches || document.hidden) { parallax.style.transform = ''; return; }
    const rect = parallax.parentElement?.getBoundingClientRect();
    if (rect && rect.bottom > 0 && rect.top < window.innerHeight) parallax.style.transform = `translateY(${Math.max(-22, Math.min(22, -rect.top * .045))}px)`;
  };
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
  reducedMotion.addEventListener('change', update);
  update();
}

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) {
  const service = form.querySelector<HTMLSelectElement>('select[name="service"]')!;
  const requested = new URLSearchParams(window.location.search).get('service');
  if (requested && Array.from(service.options).some(option => option.value === requested)) service.value = requested;
  const requestId = form.querySelector<HTMLInputElement>('input[name="requestId"]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const feedback = form.querySelector<HTMLElement>('.form-feedback')!;
  let pending = false;
  let lastPayload = '';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const payload = Object.fromEntries(new FormData(form).entries());
    delete payload.requestId;
    const signature = JSON.stringify(payload);
    if (!requestId.value || signature !== lastPayload) requestId.value = crypto.randomUUID();
    lastPayload = signature;
    payload.requestId = requestId.value;
    pending = true; button.disabled = true; form.setAttribute('aria-busy', 'true');
    label.textContent = 'Sending your enquiry…'; feedback.textContent = ''; delete feedback.dataset.state;
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
      const result = await response.json() as { ok?: boolean; message?: string; fields?: Record<string, string> };
      if (!response.ok || !result.ok) throw new Error(result.message || 'We couldn’t send your enquiry. Please try again or contact us directly.');
      feedback.dataset.state = 'success'; feedback.textContent = result.message || 'Thanks for getting in touch. Your enquiry is on its way to Adot.';
      form.reset(); requestId.value = ''; lastPayload = '';
    } catch (error) {
      feedback.dataset.state = 'error';
      feedback.textContent = error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Sending took too long. Your details are still here. Please try again or contact us directly.';
    } finally {
      pending = false; button.disabled = false; form.removeAttribute('aria-busy'); label.textContent = 'Send your enquiry'; feedback.focus();
    }
  });
}
