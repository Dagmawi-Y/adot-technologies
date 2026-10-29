import { initializeExpressiveMotion } from './motion.ts';
import { initializeExperiments } from './experiments.ts';

// Bundled scripts run once; initialize the current DOM after each Astro navigation.
let disposePage = () => {};

function initializePage() {
  disposePage();
  const controller = new AbortController();
  const { signal } = controller;
  const disposers: (() => void)[] = [];
  disposePage = () => {
    controller.abort();
    disposers.forEach(dispose => dispose());
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  initializeExpressiveMotion(signal);
  initializeExperiments(signal);
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
  }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (menuButton?.getAttribute('aria-expanded') === 'true') closeMenu(true);
      document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown[open]').forEach(details => { details.open = false; details.querySelector('summary')?.focus(); });
    }
  }, { signal });
  document.addEventListener('click', event => {
    if (!(event.target instanceof Node)) return;
    document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown[open]').forEach(details => { if (!details.contains(event.target as Node)) details.open = false; });
    if (!document.querySelector('.header-wrap')?.contains(event.target)) closeMenu();
  }, { signal });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); }, { signal });

  const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown').forEach(dropdown => {
    dropdown.addEventListener('pointerenter', event => {
      if (!hoverPointer.matches || event.pointerType === 'touch') return;
      delete dropdown.dataset.keyboard;
      dropdown.open = true;
    }, { signal });
    dropdown.addEventListener('pointerleave', () => {
      if (hoverPointer.matches && !dropdown.querySelector('.dropdown-panel')?.contains(document.activeElement)) dropdown.open = false;
    }, { signal });
    dropdown.addEventListener('keydown', () => { dropdown.dataset.keyboard = 'true'; }, { signal });
    dropdown.addEventListener('pointerdown', () => { delete dropdown.dataset.keyboard; }, { signal });
    dropdown.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (!signal.aborted && !dropdown.contains(document.activeElement)) dropdown.open = false;
      });
    }, { signal });
  });

  // Everything remains visible without JavaScript; entry motion is progressive enhancement.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.boundingClientRect.top >= 0) entry.target.classList.add('reveal-enter');
      observer.unobserve(entry.target);
    }), { threshold: 0.08 });
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => observer.observe(element));
    disposers.push(() => observer.disconnect());
  }
  const parallax = document.querySelector<HTMLElement>('[data-parallax]');
  if (parallax) {
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      if (reducedMotion.matches || document.hidden) { parallax.style.transform = ''; return; }
      const rect = parallax.parentElement?.getBoundingClientRect();
      if (!rect || rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const height = rect.bottom - rect.top;
      const progress = (window.innerHeight / 2 - (rect.top + height / 2)) / ((window.innerHeight + height) / 2);
      const travel = Math.min(72, height * 0.12);
      parallax.style.transform = `translateY(${Math.max(-1, Math.min(1, progress)) * travel}px)`;
    };
    const scheduleUpdate = () => { frame ??= requestAnimationFrame(update); };
    window.addEventListener('scroll', scheduleUpdate, { passive: true, signal });
    window.addEventListener('resize', scheduleUpdate, { signal });
    document.addEventListener('visibilitychange', scheduleUpdate, { signal });
    disposers.push(() => { if (frame !== undefined) cancelAnimationFrame(frame); });
    reducedMotion.addEventListener('change', scheduleUpdate, { signal });
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
        const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]) });
        const result = await response.json() as { ok?: boolean; message?: string; fields?: Record<string, string> };
        if (!response.ok || !result.ok) throw new Error(result.message || 'We couldn’t send your enquiry. Please try again or contact us directly.');
        feedback.dataset.state = 'success'; feedback.textContent = result.message || 'Thanks for getting in touch. Your enquiry is on its way to Adot.';
        form.reset(); requestId.value = ''; lastPayload = '';
      } catch (error) {
        if (signal.aborted) return;
        feedback.dataset.state = 'error';
        feedback.textContent = error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Sending took too long. Your details are still here. Please try again or contact us directly.';
      } finally {
        if (signal.aborted) return;
        pending = false; button.disabled = false; form.removeAttribute('aria-busy'); label.textContent = 'Send your enquiry'; feedback.focus();
      }
    }, { signal });
  }

}

document.addEventListener('astro:page-load', initializePage);
document.addEventListener('astro:before-swap', () => disposePage());
