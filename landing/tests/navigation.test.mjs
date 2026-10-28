import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the real browser script across Astro lifecycle events without sending mail.
test('page behavior is reinitialized and cleaned up across client-side navigation', async t => {
  const originalGlobals = new Map();
  const expose = (name, value) => {
    originalGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  };
  t.after(() => {
    for (const [name, descriptor] of originalGlobals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });

  class Element extends EventTarget {
    attributes = new Map();
    hidden = true;
    value = '';
    textContent = '';
    dataset = {};
    style = {};
    focused = false;
    children = new Map();
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    querySelector(selector) { return this.children.get(selector) ?? null; }
    contains(node) { return node === this || [...this.children.values()].includes(node); }
    focus() { this.focused = true; }
    click() { this.dispatchEvent(new Event('click')); }
  }
  const document = new Element();
  document.querySelectorAll = () => [];
  const window = new EventTarget();
  const media = new Map();
  window.matchMedia = query => {
    if (!media.has(query)) media.set(query, Object.assign(new EventTarget(), { matches: false }));
    return media.get(query);
  };
  window.location = { search: '' };
  window.innerHeight = 800;
  const observers = [];
  class Observer {
    disconnected = false;
    constructor() { observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  window.IntersectionObserver = Observer;
  const frames = new Map();
  let frameId = 0;
  expose('window', window);
  expose('document', document);
  expose('Node', Element);
  expose('IntersectionObserver', Observer);
  expose('requestAnimationFrame', callback => { frames.set(++frameId, callback); return frameId; });
  expose('cancelAnimationFrame', id => frames.delete(id));
  const requests = [];
  expose('fetch', async (...args) => {
    requests.push(args);
    return { ok: false, json: async () => ({ message: 'Please try again.' }) };
  });
  expose('FormData', class {
    constructor(form) { this.form = form; }
    entries() { return Object.entries(this.form.values); }
  });

  await import('../src/scripts/site.ts');
  const lifecycle = name => document.dispatchEvent(new Event(`astro:${name}`));
  const createPage = () => {
    const button = new Element();
    const navigation = new Element();
    const header = new Element();
    header.children.set('menu', button);
    document.children = new Map([
      ['[data-menu]', button], ['#mobile-navigation', navigation], ['.header-wrap', header],
    ]);
    return { button, navigation };
  };

  const home = createPage();
  const parallax = new Element();
  parallax.parentElement = { getBoundingClientRect: () => ({ top: -100, bottom: 500 }) };
  document.children.set('[data-parallax]', parallax);
  lifecycle('page-load');
  home.button.click();
  assert.equal(home.navigation.hidden, false, 'initial menu opens');
  window.dispatchEvent(new Event('scroll'));
  assert.equal(frames.size, 1);
  lifecycle('before-swap');
  assert.equal(frames.size, 0, 'queued animation work is cancelled');
  assert.ok(observers.every(observer => observer.disconnected));
  home.button.click();
  assert.equal(home.navigation.hidden, false, 'detached menu no longer has listeners');

  for (const serviceId of ['web-development', 'custom-software']) {
    const page = createPage();
    const form = new Element();
    const service = Object.assign(new Element(), { options: [{ value: 'web-development' }, { value: 'custom-software' }] });
    const feedback = new Element();
    const submit = new Element();
    form.values = { name: 'Navigation test', email: 'test@example.com', message: 'Keep this draft.', service: serviceId };
    form.reportValidity = () => true;
    form.reset = () => assert.fail('an unsuccessful enquiry must retain its fields');
    form.children = new Map([
      ['select[name="service"]', service], ['input[name="requestId"]', new Element()],
      ['button[type="submit"]', submit], ['[data-submit-label]', new Element()], ['.form-feedback', feedback],
    ]);
    document.children.set('[data-contact-form]', form);
    window.location.search = `?service=${serviceId}`;
    lifecycle('page-load');
    // Reinitializing must replace existing listeners rather than duplicate them.
    lifecycle('page-load');
    page.button.click();
    assert.equal(page.navigation.hidden, false, 'new menu toggles exactly once');
    assert.equal(service.value, serviceId, 'service query prefill works on each arrival');

    const before = requests.length;
    const event = new Event('submit', { cancelable: true });
    form.dispatchEvent(event);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(event.defaultPrevented, true, 'JSON submission still intercepts the native form');
    assert.equal(requests.length, before + 1, 'there is only one active submit handler');
    assert.equal(feedback.dataset.state, 'error');
    assert.equal(feedback.textContent, 'Please try again.');
    assert.equal(submit.disabled, false);
    assert.equal(form.values.message, 'Keep this draft.');
    lifecycle('before-swap');
  }

  window.matchMedia('(prefers-reduced-motion: reduce)').matches = true;
  createPage();
  const count = observers.length;
  lifecycle('page-load');
  assert.equal(observers.length, count, 'reduced motion skips entrance observers');
  lifecycle('before-swap');
});
