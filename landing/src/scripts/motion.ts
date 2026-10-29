/** Pointer feedback keeps the hit area steady and cleans up on every page swap. */
export function initializeExpressiveMotion(pageSignal: AbortSignal) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let dispose = () => {};

  function configure() {
    dispose();
    if (pageSignal.aborted || reduced.matches || !pointer.matches) return;
    const controller = new AbortController();
    const { signal } = controller;
    const cleanups: (() => void)[] = [];
    dispose = () => {
      controller.abort();
      cleanups.forEach(cleanup => cleanup());
    };

    function track(surface: HTMLElement, move: (x: number, y: number, rect: DOMRect) => void, reset: () => void) {
      let rect: DOMRect | undefined;
      let frame: number | undefined;
      let x = 0, y = 0;
      function clear() {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        rect = undefined;
        reset();
      }
      function update() {
        frame = undefined;
        if (rect) move(x, y, rect);
      }
      surface.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        rect = surface.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        update();
      }, { signal });
      surface.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;
        rect ??= surface.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        frame ??= requestAnimationFrame(update);
      }, { signal });
      surface.addEventListener('pointerleave', clear, { signal });
      surface.addEventListener('pointercancel', clear, { signal });
      surface.addEventListener('pointerdown', clear, { signal });
      (surface.closest<HTMLElement>('a, button') ?? surface).addEventListener('keydown', clear, { signal });
      // Scroll invalidates the cached rectangle; the next move measures once.
      window.addEventListener('scroll', clear, { passive: true, signal });
      window.addEventListener('resize', clear, { passive: true, signal });
      cleanups.push(clear);
    }

    document.querySelectorAll<HTMLElement>('.button').forEach(button => {
      const label = button.querySelector<HTMLElement>('.button-label');
      const icon = button.querySelector<HTMLElement>('.button-icon');
      if (!label || !icon) return;
      track(button, (x, y, rect) => {
        const dx = Math.max(-1, Math.min(1, x / rect.width * 2 - 1));
        const dy = Math.max(-1, Math.min(1, y / rect.height * 2 - 1));
        label.style.translate = `${dx * 2}px ${dy * 2}px`;
        icon.style.translate = `${dx * 7}px ${dy * 5}px`;
      }, () => {
        label.style.removeProperty('translate');
        icon.style.removeProperty('translate');
      });
    });

    document.querySelectorAll<HTMLElement>('.project-image').forEach(surface => {
      const cue = surface.querySelector<HTMLElement>('.project-cursor');
      const image = surface.querySelector('img');
      if (!cue || !image) return;
      surface.classList.add('has-pointer-cue');
      cleanups.push(() => surface.classList.remove('has-pointer-cue'));
      track(surface, (x, y, rect) => {
        // Keep the cue within the image, including narrow tablet cards.
        const inset = Math.min(78, rect.width / 2);
        const px = Math.max(inset, Math.min(rect.width - inset, x));
        const py = Math.max(30, Math.min(rect.height - 30, y));
        cue.style.translate = `${px}px ${py}px`;
        surface.classList.add('pointer-inside');
        image.style.translate = `${(0.5 - x / rect.width) * 8}px ${(0.5 - y / rect.height) * 8}px`;
      }, () => {
        surface.classList.remove('pointer-inside');
        image.style.removeProperty('translate');
      });
    });
  }

  configure();
  reduced.addEventListener('change', configure, { signal: pageSignal });
  pointer.addEventListener('change', configure, { signal: pageSignal });
  pageSignal.addEventListener('abort', () => dispose(), { once: true });
}
