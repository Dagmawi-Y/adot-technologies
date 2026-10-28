import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../src/lib/contact.ts';
const valid = { name: 'A visitor', email: 'visitor@example.com', phone: '', company: 'Example', service: 'web-development', message: 'We would like to discuss a website.', requestId: '123e4567-e89b-42d3-a456-426614174000', website: '' };
const env = { RESEND_API_KEY: 'test-only-key', CONTACT_FROM_EMAIL: 'website@example.com' };
function request(data = valid, extras = {}) { return new Request('https://www.adotsystems.tech/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: 'https://www.adotsystems.tech', ...extras }, body: JSON.stringify(data) }); }
const noSend = async () => { throw new Error('Should not contact provider'); };
test('valid submissions reach the configured recipient with reply-to and stable retry keys', async () => {
  const calls = [];
  const send = async (_url, init) => { calls.push({ url: _url, init }); return Response.json({ id: 'accepted-id' }); };
  for (let i=0; i<2; i++) assert.equal((await handleContact(request(), env, send)).status, 200);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  const payload = JSON.parse(calls[0].init.body);
  assert.deepEqual(payload.to, ['contact@adotsystems.tech']);
  assert.equal(payload.reply_to, valid.email);
  assert.equal(calls[0].init.headers['Idempotency-Key'], calls[1].init.headers['Idempotency-Key']);
  assert.ok(payload.text.includes(valid.message));
});
test('changed content produces a different deduplication key', async () => {
  const keys=[]; const send=async (_url, init)=>{ keys.push(init.headers['Idempotency-Key']);return Response.json({id:'id'}); };
  await handleContact(request(),env,send);await handleContact(request({...valid,message:'A different project.'}),env,send);
  assert.notEqual(keys[0],keys[1]);
});
test('invalid fields and unsupported services are rejected before sending', async () => {
  for (const data of [{...valid,email:'invalid'},{...valid,service:'__proto__'},{...valid,name:' '},{...valid,message:'a'.repeat(5001)},{...valid,email:'x@example.com\r\nBcc: other@example.com'}]) {
    const response = await handleContact(request(data), env, noSend);
    assert.equal(response.status,422);assert.equal((await response.json()).ok,false);
  }
});
test('honeypot and foreign origins are rejected', async () => {
  assert.equal((await handleContact(request({...valid,website:'spam'}),env,noSend)).status,400);
  assert.equal((await handleContact(request(valid,{Origin:'https://other.example'}),env,noSend)).status,403);
});
test('missing credentials return an honest failure', async () => {
  const response=await handleContact(request(),{},noSend);assert.equal(response.status,503);assert.equal((await response.json()).ok,false);
});
test('provider errors, network errors, and missing acceptance IDs never report success', async () => {
  for(const send of [async()=>Response.json({error:'failed'},{status:429}),async()=>{throw new Error('offline')},async()=>Response.json({})]) {
    const response=await handleContact(request(),env,send);assert.equal(response.status,502);assert.equal((await response.json()).ok,false);
  }
});
test('malformed JSON and oversized bodies are rejected', async () => {
  const bad = new Request('https://www.adotsystems.tech/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
  assert.equal((await handleContact(bad,env,noSend)).status,400);
  assert.equal((await handleContact(request({...valid,message:'a'.repeat(25000)}),env,noSend)).status,413);
});
test('ordinary HTML form submissions work without JavaScript', async () => {
  const body=new URLSearchParams({...valid,requestId:''});
  const req=new Request('https://www.adotsystems.tech/api/contact',{method:'POST',body});
  const response=await handleContact(req,env,async()=>Response.json({id:'id'}));
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);assert.match(await response.text(),/Thanks for getting in touch/);
});
test('GET does not send email', async () => { const response=await handleContact(new Request('https://www.adotsystems.tech/api/contact'),env,noSend); assert.equal(response.status,405); });
