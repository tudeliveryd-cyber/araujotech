// Só leitura: tira as telas reais da Guía Vitrix (celular) para montar o vídeo de divulgação.
// As imagens saem no log em base64 (linhas "IMG64 <nome> ...").
const { chromium } = require('playwright'); const fs = require('fs');
const U = 'https://araujotechsistemas.com';
const out = (n, f) => { const b64 = fs.readFileSync(f).toString('base64'); for (let i = 0; i < b64.length; i += 4000) console.log('IMG64 ' + n + ' ' + b64.slice(i, i + 4000)); };
(async () => {
  fs.mkdirSync('guia-video', { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-PY', timezoneId: 'America/Asuncion', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  const shot = async (n, o) => { const f = 'guia-video/' + n + '.jpg'; await p.screenshot(Object.assign({ path: f, type: 'jpeg', quality: 86 }, o || {})); out(n, f); console.log('OK ' + n); };
  await p.goto(U + '/guia/', { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(4500);
  await shot('home');
  const H = await p.evaluate(() => document.documentElement.scrollHeight); console.log('altura ' + H);
  await shot('home-long', { fullPage: true, clip: { x: 0, y: 0, width: 390, height: Math.min(H, 2400) } });
  const t = p.locator('[data-c]').filter({ hasText: /Comida/ }).first();
  if (await t.count()) { await t.click(); await p.waitForTimeout(1500); await shot('cat'); }
  await p.goto(U + '/guia/fogao-mineiro', { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(2500);
  await shot('negocio');
  await p.evaluate(() => window.scrollTo(0, 420)); await p.waitForTimeout(800); await shot('negocio2');
  await p.goto(U + '/guia/', { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(3500);
  const u = p.locator('[data-c]').filter({ hasText: /Santa Rita útil/ }).first();
  if (await u.count()) { await u.click(); await p.waitForTimeout(1500); await shot('util');
    await p.evaluate(() => { const e = [...document.querySelectorAll('.uh')].find(x => /mnibus/.test(x.textContent)); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 90); }); await p.waitForTimeout(800); await shot('bus'); }
  await b.close();
})().catch(e => { console.log('ERRO ' + e); process.exit(1); });
