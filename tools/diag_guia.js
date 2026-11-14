// Diagnóstico da Guía Vitrix: tempo de cada arquivo, cabeçalhos de cache e quando a lista aparece (celular). Só leitura.
const { chromium, devices } = require('playwright');
const { execSync } = require('child_process');
const U = 'https://araujotechsistemas.com';
const sh = c => { try { return execSync(c, { encoding: 'utf8', timeout: 60000 }); } catch (e) { return 'ERRO ' + (e.stdout || e.message); } };
(async () => {
  for (const p of ['/guia/', '/clientes.js?v=3', '/sitio/guia.php?g=1', '/img/guia/tu-delivery.jpg?v=5']) {
    console.log('==== ' + p);
    console.log(sh(`curl -sS -o /dev/null -D - --max-time 40 -w 'TEMPO total=%{time_total}s ttfb=%{time_starttransfer}s bytes=%{size_download}\\n' '${U}${p}' | grep -iE '^(HTTP|cache-control|expires|last-modified|etag|age|x-|cf-|server|content-encoding|TEMPO)'`));
  }
  console.log('==== clientes publicados (platform/sitio)');
  try { const r = await fetch('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U&mask.fieldPaths=clientes&mask.fieldPaths=clientesAt'); const j = await r.json(); const f = j.fields || {};
    console.log('clientesAt', (f.clientesAt || {}).stringValue);
    ((f.clientes || {}).arrayValue || {}).values?.forEach(v => { const m = v.mapValue.fields || {}; const g = k => m[k] ? (m[k].stringValue ?? m[k].booleanValue) : undefined; console.log(' ', g('id'), '|', g('name'), '| dest', g('dest'), '| vip', g('vip'), '| since', g('since')); });
  } catch (e) { console.log('erro', e.message); }
  const b = await chromium.launch();
  for (let run = 1; run <= 2; run++) {
    const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
    const reqs = []; const t0 = Date.now();
    p.on('requestfinished', async r => { const t = r.timing(); reqs.push([Math.round(t.responseEnd), r.url().replace(U, '').slice(0, 110)]); });
    p.on('requestfailed', r => reqs.push(['FALHOU ' + (r.failure() || {}).errorText, r.url().slice(0, 110)]));
    p.on('pageerror', e => console.log('ERRO JS', e.message));
    await p.goto(U + '/guia/', { waitUntil: 'domcontentloaded' });
    const dom = Date.now() - t0;
    await p.waitForSelector('#list .grp, #list .empty:not([data-t])', { timeout: 30000 }).catch(() => {});
    const lst = Date.now() - t0;
    await p.waitForFunction(() => !document.getElementById('sl').hidden, null, { timeout: 30000 }).catch(() => {});
    const sld = Date.now() - t0;
    await p.waitForTimeout(6000);
    const st = await p.evaluate(() => ({ cards: document.querySelectorAll('#list .card').length, slides: document.querySelectorAll('#sl .sd').length, info: Object.keys(INFO || {}).length, order: [...document.querySelectorAll('.hero > .wrap > *')].map(e => e.className || e.tagName).join(' > ') }));
    console.log(`\n#### Abertura ${run} (celular): página ${dom} ms · lista ${lst} ms · slider ${sld} ms · ${JSON.stringify(st)}`);
    reqs.sort((a, b) => (typeof b[0] === 'number' ? b[0] : 1e9) - (typeof a[0] === 'number' ? a[0] : 1e9)).slice(0, 14).forEach(r => console.log('  ', r[0], r[1]));
    await ctx.close();
  }
  { const fs = require('fs'); fs.mkdirSync('guia-telas', { recursive: true });
    { const ctx = await b.newContext({ ...devices['iPhone 13'], geolocation: { latitude: -25.795, longitude: -55.088 }, permissions: ['geolocation'] }); const p = await ctx.newPage();
      await p.goto(U + '/guia/', { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(3000);
      await p.click('.fl[data-f="near"]').catch(() => {}); await p.waitForTimeout(1500); await p.click('.fl[data-f="map"]').catch(() => {}); await p.waitForTimeout(5000);
      console.log('MAPA', JSON.stringify(await p.evaluate(() => ({ leaflet: !!(window.L && window.L.map), tiles: document.querySelectorAll('#gmap .leaflet-tile-loaded').length, pins: document.querySelectorAll('#gmap .mpin').length, cerca: [...document.querySelectorAll('#cerca .card h3')].map(x => x.textContent) }))));
      await p.evaluate(() => document.getElementById('gmw').scrollIntoView()); await p.waitForTimeout(500);
      const f = 'guia-telas/guia-mapa.jpg'; await p.screenshot({ path: f, type: 'jpeg', quality: 80 }); const b64 = fs.readFileSync(f).toString('base64'); for (let i = 0; i < b64.length; i += 4000) console.log('IMG64 mapa ' + b64.slice(i, i + 4000)); await ctx.close(); }
    for (const [n, o] of [['pc', { viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 }], ['cel', { ...devices['iPhone 13'] }]]) {
      const ctx = await b.newContext(o); const p = await ctx.newPage(); await p.goto(U + '/guia/', { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(4000);
      await p.evaluate(() => { try { SL.hold = true; slGo(0); } catch (e) {} }); await p.waitForTimeout(800);
      const f = 'guia-telas/guia-' + n + '.jpg'; await p.screenshot({ path: f, type: 'jpeg', quality: 88 }); const b64 = fs.readFileSync(f).toString('base64'); for (let i = 0; i < b64.length; i += 4000) console.log('IMG64 ' + n + ' ' + b64.slice(i, i + 4000)); await ctx.close(); }
    console.log('telas salvas'); }
  await b.close();
})();
