/**
 * Tests for the "Sito in costruzione" edge function (netlify/edge-functions/coming-soon.ts)
 * with a mocked Netlify runtime. Run: npm test
 */
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

const env: Record<string, string | undefined> = {};
const fetched: string[] = [];
const g = globalThis as Record<string, unknown>;
g.Netlify = { env: { get: (key: string) => env[key] } };
g.fetch = async (url: URL) => {
  fetched.push(String(url));
  return new Response('<h1>In costruzione</h1>', { headers: { 'cache-control': 'public,max-age=0' } });
};

const { default: comingSoon, config } = await import('../netlify/edge-functions/coming-soon.ts');

const SECRET = 'a-very-long-secret-1234';
const TOKEN = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SECRET)))]
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('');

const request = (path: string) => new Request(`https://site.example${path}`);
const context = (cookie?: string) =>
  ({
    cookies: { get: (name: string) => (name === 'anteprima' ? cookie : undefined) },
    next: async () => new Response('REAL SITE', { headers: { 'content-type': 'text/html' } }),
  }) as never;
const run = async (path: string, cookie?: string) => (await comingSoon(request(path), context(cookie))) as Response | undefined;

beforeEach(() => {
  env.COMING_SOON = 'true';
  env.PREVIEW_SECRET = SECRET;
});

test('site is public when COMING_SOON is not "true"', async () => {
  env.COMING_SOON = undefined;
  assert.equal(await run('/'), undefined);
  env.COMING_SOON = 'false';
  assert.equal(await run('/'), undefined);
});

test('visitors get the under-construction page with 503 and noindex', async () => {
  const response = await run('/chi-sono/');
  assert.equal(response?.status, 503);
  assert.match(await response!.text(), /costruzione/);
  assert.equal(fetched.at(-1), 'https://site.example/in-costruzione/');
  assert.equal(response?.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(response?.headers.get('retry-after'), '86400');
});

test('responses created by the function carry the security headers', async () => {
  for (const response of [await run('/'), await run('/robots.txt'), await run(`/?anteprima=${SECRET}`)]) {
    assert.equal(response?.headers.get('x-frame-options'), 'DENY');
    assert.equal(response?.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response?.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.equal(response?.headers.get('content-security-policy'), "frame-ancestors 'none'");
  }
  assert.equal((await run('/'))?.headers.get('cache-control'), 'no-store');
});

test('a wrong secret does not unlock', async () => {
  assert.equal((await run('/?anteprima=wrong'))?.status, 503);
});

test('the secret link sets a hashed cookie and redirects without the secret', async () => {
  const response = await run(`/progetti/?x=1&anteprima=${SECRET}`);
  const cookie = response?.headers.get('set-cookie') ?? '';
  assert.equal(response?.status, 302);
  assert.equal(response?.headers.get('location'), '/progetti/?x=1');
  assert.ok(cookie.includes(`anteprima=${TOKEN}`));
  assert.ok(!cookie.includes(SECRET));
  assert.ok(cookie.includes('HttpOnly') && cookie.includes('Secure'));
});

test('an unlocked browser sees the real site, still noindex', async () => {
  const response = await run('/servizi/', TOKEN);
  assert.equal(await response?.text(), 'REAL SITE');
  assert.equal(response?.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('a cookie containing the raw secret is rejected', async () => {
  assert.equal((await run('/', SECRET))?.status, 503);
});

test('?anteprima=esci removes the cookie', async () => {
  const response = await run('/?anteprima=esci', TOKEN);
  assert.equal(response?.status, 302);
  assert.ok((response?.headers.get('set-cookie') ?? '').includes('Max-Age=0'));
});

test('robots.txt disallows everything', async () => {
  assert.match((await (await run('/robots.txt'))!.text()), /Disallow: \//);
});

test('a secret shorter than 16 characters never unlocks', async () => {
  env.PREVIEW_SECRET = 'short';
  assert.equal((await run('/?anteprima=short'))?.status, 503);
});

test('assets and the page itself are excluded from the function', () => {
  assert.deepEqual(config.excludedPath, [
    '/_astro/*',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/in-costruzione/',
    '/anteprima/*',
    '/api/*',
    '/richiesta-aggiornamento/',
  ]);
});
