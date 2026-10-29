/** Native-scroll portfolio enhancement, with cleanup on every page swap. */
export function initializeExperiments(pageSignal: AbortSignal) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 1000px) and (min-height: 760px)');
  let dispose = () => {};
  let initialPass = true;
  function configure() {
    dispose();
    const alignInitialAnchor = initialPass;
    initialPass = false;
    if (pageSignal.aborted || reduced.matches) return;
    const gallery = document.querySelector<HTMLElement>('[data-gallery]');
    if (!gallery) return;
    const controller = new AbortController();
    const { signal } = controller;
    const viewport = gallery?.querySelector<HTMLElement>('.gallery-window');
    const track = gallery?.querySelector<HTMLElement>('.gallery-track');
    const cards = Array.from(gallery?.querySelectorAll<HTMLElement>('.project-card') ?? []);
    const bar = gallery?.querySelector<HTMLElement>('.gallery-progress > span');
    const count = gallery?.querySelector<HTMLElement>('[data-gallery-index]');
    const buttons = gallery?.querySelector<HTMLElement>('.gallery-buttons');
    const previous = gallery?.querySelector<HTMLButtonElement>('[data-gallery-prev]');
    const next = gallery?.querySelector<HTMLButtonElement>('[data-gallery-next]');
    let frame: number | undefined, focusFrame: number | undefined;
    let start = 0, distance = 0, step = 0, index = 0;
    let pinned = false;
    const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    function progress(value: number) {
      const ratio = clamp(value);
      index = Math.round(ratio * Math.max(0, cards.length - 1));
      if (bar) bar.style.transform = `scaleX(${ratio})`;
      const label = String(index + 1).padStart(2, '0');
      if (count && count.textContent !== label) count.textContent = label;
      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === cards.length - 1;
    }
    function update() {
      frame = undefined;
      if (document.hidden) return;
      const y = window.scrollY;
      if (pinned && track && y + window.innerHeight > start && y < start + distance + window.innerHeight) {
        const p = clamp((y - start) / Math.max(1, distance));
        track.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
        cards.forEach((card, i) => {
          const delta = i - p * (cards.length - 1);
          card.style.transform = `perspective(1500px) rotateY(${clamp(delta * 6, -8, 8)}deg) scale(${1 - Math.min(0.04, Math.abs(delta) * 0.025)})`;
        });
        progress(p);
      }
    }
    const schedule = () => { frame ??= requestAnimationFrame(update); };
    function measure() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      pinned = wide.matches && !!track && !!viewport;
      gallery?.classList.toggle('is-pinned', pinned);
      track?.style.removeProperty('transform');
      cards.forEach(card => card.style.removeProperty('transform'));
      if (gallery && track && viewport) {
        distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
        step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
        gallery.style.height = pinned ? `${window.innerHeight + distance}px` : '';
        start = gallery.getBoundingClientRect().top + window.scrollY;
        viewport.scrollLeft = 0;
        progress(0);
      }
      update();
    }
    function go(target: number, behavior: ScrollBehavior) {
      const offset = clamp(target, 0, cards.length - 1) * step;
      if (pinned) window.scrollTo({ top: start + Math.min(distance, offset), behavior });
      else viewport?.scrollTo({ left: offset, behavior });
    }
    previous?.addEventListener('click', event => go(index - 1, event.detail ? 'smooth' : 'instant'), { signal });
    next?.addEventListener('click', event => go(index + 1, event.detail ? 'smooth' : 'instant'), { signal });
    viewport?.addEventListener('scroll', () => { if (!pinned) progress(viewport.scrollLeft / Math.max(1, distance)); }, { passive: true, signal });
    viewport?.addEventListener('focusin', event => {
      if (!pinned || !(event.target instanceof HTMLElement)) return;
      const card = event.target.closest<HTMLElement>('.project-card');
      const i = card ? cards.indexOf(card) : -1;
      if (i < 0) return;
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => { focusFrame = undefined; viewport.scrollLeft = 0; go(i, 'instant'); });
    }, { signal });
    if (buttons) buttons.hidden = false;
    window.addEventListener('scroll', schedule, { passive: true, signal });
    window.addEventListener('resize', measure, { signal });
    document.addEventListener('visibilitychange', schedule, { signal });
    measure();
    // Pinning changes document height after the browser's initial fragment jump.
    if (alignInitialAnchor && window.location.hash) {
      try {
        document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ block: 'start', behavior: 'instant' });
      } catch { /* Keep native behavior for malformed fragments. */ }
    }
    document.fonts?.ready.then(() => { if (!signal.aborted) measure(); });
    dispose = () => {
      controller.abort();
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
      gallery?.classList.remove('is-pinned');
      gallery?.style.removeProperty('height');
      track?.style.removeProperty('transform');
      cards.forEach(card => card.style.removeProperty('transform'));
      if (buttons) buttons.hidden = true;
    };
  }
  configure();
  reduced.addEventListener('change', configure, { signal: pageSignal });
  wide.addEventListener('change', configure, { signal: pageSignal });
  pageSignal.addEventListener('abort', () => dispose(), { once: true });
}
