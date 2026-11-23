// somente leitura: como as sondas do Diagnóstico (Central) se comportam na produção, vistas de uma página de araujotechsistemas.com
// (mesma origem da Central). Não entra em nenhuma conta; só lê o que é público.
const { chromium } = require('playwright');
const KEY = (require('fs').readFileSync(require('path').join(__dirname, '..', '..', 'logo.php'), 'utf8').match(/[?&]key=([A-Za-z0-9_-]+)/) || [])[1] || ''; // a mesma chave pública do site (identifica o projeto; não é segredo)
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  const p = await ctx.newPage();
  await p.goto('https://araujotechsistemas.com/robots.txt', { waitUntil: 'domcontentloaded', timeout: 40000 });
  const out = await p.evaluate(async (KEY) => {
    const R = {}; const tm = async (k, f) => { const t0 = performance.now(); try { R[k] = { ok: true, ms: Math.round(performance.now() - t0), v: await f() }; R[k].ms = Math.round(performance.now() - t0); } catch (e) { R[k] = { ok: false, ms: Math.round(performance.now() - t0), e: String(e && e.message || e).slice(0, 120) }; } };
    const to = (u, o, ms) => { const c = new AbortController(), h = setTimeout(() => c.abort(), ms || 15000); return fetch(u, Object.assign({ cache: 'no-store', signal: c.signal }, o || {})).finally(() => clearTimeout(h)); };
    const img = (u, ms) => new Promise(res => { const i = new Image(); let d = false; const fin = v => { if (d) return; d = true; clearTimeout(h); res(v); }; const h = setTimeout(() => fin('timeout'), ms || 15000); i.onload = () => fin(i.naturalWidth + 'x' + i.naturalHeight); i.onerror = () => fin('erro'); i.src = u; });
    await tm('robots', async () => { const r = await to('/robots.txt?dg=' + Date.now()); return { st: r.status, date: r.headers.get('date'), skew: r.headers.get('date') ? Math.round((Date.now() - new Date(r.headers.get('date')).getTime()) / 1000) : null }; });
    let cl = [];
    await tm('sitio', async () => { const r = await to('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=' + KEY + '&mask.fieldPaths=clientes&mask.fieldPaths=clientesAt'); const j = await r.json(); const f = (j.fields && j.fields.clientes && j.fields.clientes.arrayValue.values) || []; cl = f.map(v => { const m = v.mapValue.fields; const g = k => m[k] ? (m[k].stringValue != null ? m[k].stringValue : m[k].booleanValue) : null; return { id: g('id'), sys: g('sys'), name: g('name'), url: g('url'), dest: g('dest'), segEs: g('segEs'), logo: g('logo') }; }); return { st: r.status, n: cl.length, at: j.fields && j.fields.clientesAt && j.fields.clientesAt.stringValue, cl }; });
    const cat = cl.filter(c => c.sys === 'catalogo');
    await tm('guia_ids', async () => { const r = await to('/sitio/guia.php?ids=' + cat.map(c => c.id).join(',') + '&dg=' + Date.now()); const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { } return { st: r.status, len: t.length, keys: j ? Object.keys(j) : null, sample: j ? JSON.stringify(j[Object.keys(j)[0]]).slice(0, 300) : t.slice(0, 200) }; });
    await tm('guia_g', async () => { const r = await to('/sitio/guia.php?g=1&dg=' + Date.now()); const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { } return { st: r.status, len: t.length, keys: j ? Object.keys(j) : null }; });
    for (const c of cat.slice(0, 6)) {
      await tm('loja_get:' + c.id, async () => { const r = await to('/loja/' + c.id + '/?dg=' + Date.now()); const st = r.status; let n = 0; try { const rd = r.body.getReader(); const x = await rd.read(); n = x.value ? x.value.length : 0; rd.cancel(); } catch (e) { } return { st, first: n, len: r.headers.get('content-length'), type: r.headers.get('content-type') }; });
      await tm('loja_head:' + c.id, async () => { const r = await to('/loja/' + c.id + '/?dg=' + Date.now(), { method: 'HEAD' }); return { st: r.status, len: r.headers.get('content-length') }; });
      await tm('fav:' + c.id, () => img('https://' + c.id + '.araujotechsistemas.com/logo.php?s=favicon.png&dg=' + Date.now()));
      await tm('logo:' + c.id, () => img('https://' + c.id + '.araujotechsistemas.com/logo.php?dg=' + Date.now()));
      await tm('sub_nocors:' + c.id, async () => { const r = await to(c.url || ('https://' + c.id + '.araujotechsistemas.com/'), { mode: 'no-cors' }); return { type: r.type, st: r.status }; });
      await tm('guia_pg:' + c.id, async () => { const r = await to('https://guiadesantarita.com/' + c.id, { mode: 'no-cors' }); return { type: r.type }; });
      await tm('site:' + c.id, async () => { const r = await to('/' + c.id + '?dg=' + Date.now()); const t = r.ok ? await r.text() : ''; return { st: r.status, len: t.length, hasName: t.toLowerCase().includes(String(c.name || '').toLowerCase().slice(0, 12)) }; });
    }
    await tm('loja_inexistente', async () => { const r = await to('/loja/nao-existe-xyz/?dg=' + Date.now()); return { st: r.status }; });
    await tm('fogao_cors', async () => { const r = await to('https://fogaomineiro.araujotechsistemas.com/?dg=' + Date.now()); const t = await r.text(); return { st: r.status, len: t.length }; });
    await tm('fogao_fav', () => img('https://fogaomineiro.araujotechsistemas.com/favicon.png?dg=' + Date.now()));
    await tm('guia_icon', () => img('https://guiadesantarita.com/icon-192.png?dg=' + Date.now()));
    await tm('guia_home', async () => { const r = await to('https://guiadesantarita.com/', { mode: 'no-cors' }); return { type: r.type }; });
    await tm('home', async () => { const r = await to('/?dg=' + Date.now()); const t = await r.text(); return { st: r.status, len: t.length, has: /Ara[uú]jo Tech/.test(t) }; });
    await tm('vitrix', async () => { const r = await to('/vitrix/?dg=' + Date.now()); const t = await r.text(); return { st: r.status, len: t.length }; });
    await tm('painel', async () => { const r = await to('/painel/?dg=' + Date.now(), { method: 'HEAD' }); return { st: r.status }; });
    await tm('admin', async () => { const r = await to('/admin/?dg=' + Date.now()); const t = await r.text(); let mx = 0; t.replace(/<script>([\s\S]*?)<\/script>/g, (m, s) => { if (s.length > mx) mx = s.length; return m; }); return { st: r.status, len: t.length, maior_script: mx, enc: r.headers.get('content-encoding'), cc: r.headers.get('cache-control') }; });
    await tm('sitemap', async () => { const r = await to('/sitemap.xml?dg=' + Date.now()); return { st: r.status }; });
    await tm('osm', () => img('https://tile.openstreetmap.org/15/11367/18830.png?dg=' + Date.now()));
    await tm('gstatic', async () => { const r = await to('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js', { mode: 'no-cors' }); return { type: r.type }; });
    await tm('fonts', async () => { const r = await to('https://fonts.googleapis.com/css2?family=Figtree:wght@400&display=swap', { mode: 'no-cors' }); return { type: r.type }; });
    await tm('cdnjs', async () => { const r = await to('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', { mode: 'no-cors', method: 'HEAD' }); return { type: r.type }; });
    await tm('wame', async () => { const r = await to('https://wa.me/', { mode: 'no-cors' }); return { type: r.type }; });
    await tm('tudelivery', async () => { const r = await to('https://tudelivery.com.py/', { mode: 'no-cors' }); return { type: r.type }; });
    await tm('dominio_morto', async () => { const r = await to('https://nao-existe-de-jeito-nenhum-12345.com/', { mode: 'no-cors' }, 8000); return { type: r.type }; });
    await tm('conn', async () => { const c = navigator.connection || {}; return { type: c.effectiveType, down: c.downlink, rtt: c.rtt, save: c.saveData }; });
    return R;
  }, KEY);
  for (const [k, v] of Object.entries(out)) console.log((v.ok ? 'OK   ' : 'ERRO ') + k.padEnd(34) + String(v.ms).padStart(6) + ' ms  ' + JSON.stringify(v.ok ? v.v : v.e).slice(0, 900));
  await b.close();
})().catch(e => { console.log('FALHA ' + (e && e.stack || e)); process.exit(1); });
