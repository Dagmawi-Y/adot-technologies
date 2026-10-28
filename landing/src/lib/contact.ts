export interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
}
export const serviceLabels: Record<string, string> = {
  'web-development': 'Web Development', 'web-design': 'Web Design',
  'app-development': 'App Development', 'custom-software': 'Custom Software', other: 'Something else',
};
const maxBodyBytes = 24_000;
const errorMessage = 'We couldn’t send your enquiry. Your details are still here. Please try again or email contact@adotsystems.tech.';
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const isEmail = (value: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && !/[\r\n]/.test(value);

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length')) > maxBodyBytes) throw new RangeError('Body too large');
  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBodyBytes) { await reader.cancel(); throw new RangeError('Body too large'); }
    chunks.push(value);
  }
  const data = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  const text = new TextDecoder().decode(data);
  if (request.headers.get('content-type')?.includes('application/json')) {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('Invalid body');
    return parsed as Record<string, unknown>;
  }
  if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(text));
  throw new Error('Unsupported body');
}

export async function handleContact(request: Request, env: ContactEnv, send: typeof fetch = fetch): Promise<Response> {
  const wantsJSON = request.headers.get('accept')?.includes('application/json') || request.headers.get('content-type')?.includes('application/json');
  const reply = (status: number, message: string, fields?: Record<string, string>) => {
    const ok = status >= 200 && status < 300;
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (wantsJSON) return Response.json({ ok, message, ...(fields ? { fields } : {}) }, { status, headers });
    const title = ok ? 'Thanks for getting in touch.' : 'Your enquiry needs another try.';
    // Only constant messages reach this HTML response. Visitor input is never interpolated.
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Adot Technologies</title><meta name="robots" content="noindex"></head><body><main><h1>${title}</h1><p>${message}</p><p><a href="/contact/">Back to contact</a></p><p>If something went wrong, use your browser’s Back button to restore your form.</p><p><a href="mailto:contact@adotsystems.tech">contact@adotsystems.tech</a></p><p><a href="/">Adot Technologies home</a></p></main></body></html>`, { status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } });
  };
  if (request.method !== 'POST') return reply(405, 'Please use the contact form to send your enquiry.');
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply(403, 'Please submit the form from the Adot Technologies website.');
  let input: Record<string, unknown>;
  try { input = await readBody(request); }
  catch (error) { return reply(error instanceof RangeError ? 413 : 400, 'Please check your form and try again.'); }
  if (clean(input.website)) return reply(400, 'Please check your form and try again.');
  const name = clean(input.name), email = clean(input.email), phone = clean(input.phone), company = clean(input.company), service = clean(input.service), message = clean(input.message);
  const fields: Record<string, string> = {};
  if (!name || name.length > 120 || /[\r\n]/.test(name)) fields.name = 'Enter your name (up to 120 characters).';
  if (!isEmail(email) || email.length > 254) fields.email = 'Enter a valid email address.';
  if (phone.length > 40 || /[\r\n]/.test(phone)) fields.phone = 'Use up to 40 characters for your phone number.';
  if (company.length > 120 || /[\r\n]/.test(company)) fields.company = 'Use up to 120 characters for your company name.';
  if (!Object.hasOwn(serviceLabels, service)) fields.service = 'Choose a service.';
  if (!message || message.length > 5000) fields.message = 'Describe your project in up to 5,000 characters.';
  if (Object.keys(fields).length) return reply(422, 'Please check the information you entered and try again.', fields);
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !isEmail(env.CONTACT_FROM_EMAIL)) return reply(503, errorMessage);
  const requestId = clean(input.requestId);
  if (requestId && !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) return reply(422, 'Please refresh the page and try again.');
  // Stable retry keys let Resend deduplicate a submission, even across Worker instances.
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ name, email, phone, company, service, message, requestId })));
  const key = `adot-enquiry-${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
  try {
    const response = await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({ from: `Adot Technologies <${env.CONTACT_FROM_EMAIL}>`, to: ['contact@adotsystems.tech'], reply_to: email, subject: `New enquiry: ${serviceLabels[service]}`, text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nCompany: ${company || 'Not provided'}\nService: ${serviceLabels[service]}\n\n${message}` }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return reply(502, errorMessage);
    const result = await response.json() as { id?: unknown };
    if (typeof result.id !== 'string' || !result.id) return reply(502, errorMessage);
    return reply(200, 'Thanks for getting in touch. Your enquiry has been sent to Adot. We look forward to hearing more about your project.');
  } catch { return reply(502, errorMessage); }
}
