// SÓ LEITURA: lista os produtos de uma loja e imprime o logo e algumas fotos de produtos (base64) para montar flyers.
const { chromium } = require('playwright');
const LOJA = process.env.LOJA || 'fogao-mineiro', HOST = process.env.HOST || 'fogaomineiro';
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p.goto('https://' + HOST + '.araujotechsistemas.com/', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(8000);
  const info = await p.evaluate(() => { const s = pub.store || {}; const cn = id => { const c = (pub.cats || []).find(c => c.id === id); return c ? (c.n.es || c.n.pt) : id; };
    return { name: s.name, lg: s.logo || '', wa: s.whats || s.wa || '', slogan: s.slogan, cover: s.cover || '', prods: (pub.products || []).filter(x => x.on !== false).map(x => ({ n: x.n.es || x.n.pt, c: cn(x.cat), pr: x.price, ph: x.photo || x.img || '', feat: !!x.feat, best: !!x.best })) }; });
  const m = /^data:image\/([a-z+]+);base64,(.+)$/.exec(info.lg || ''); console.log('IMG64 logo.' + (m ? m[1] : 'x') + ' ' + (m ? m[2] : ''));
  delete info.lg; console.log('INFO ' + JSON.stringify({ name: info.name, wa: info.wa, slogan: info.slogan, cover: info.cover }));
  info.prods.forEach((x, i) => console.log('PROD ' + i + ' | ' + x.c + ' | ' + x.n + ' | ' + x.pr + ' | ' + (x.ph ? 'foto' : '-') + (x.feat ? ' | destaque' : '') + (x.best ? ' | mais vendido' : '')));
  if (process.env.SO_LISTA) { const r = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 3000)); return [...document.querySelectorAll('button[data-pid]')].map(b => { const n = (b.querySelector('.pname') || b).textContent.trim().slice(0, 40); const im = b.querySelector('img'); return n + ' => ' + (im ? (im.complete && im.naturalWidth ? 'foto ok ' : 'foto QUEBRADA ') + im.getAttribute('src').slice(0, 70) : 'sem foto (ícone)'); }); }); r.forEach(x => console.log('LISTA ' + x)); await b.close(); return; }
  const withPh = info.prods.map((x, i) => [x, i]).filter(([x]) => x.ph).slice(0, 40);
  for (const [x, i] of withPh) { let u = x.ph; const mm = /^m:([a-z0-9]{2,24})$/.exec(u); if (mm) u = 'https://araujotechsistemas.com/sitio/pimg.php?s=' + LOJA + '&k=' + mm[1];
    try { if (/^data:/.test(u)) { console.log('IMG64 p' + i + '.jpg ' + u.split(',')[1]); continue; } const r = await fetch(u); if (!r.ok) { console.log('ERR ' + i + ' ' + r.status); continue; } const bf = Buffer.from(await r.arrayBuffer()); const s = bf.toString('base64'); for (let k = 0; k < s.length; k += 60000) console.log('IMG64 p' + i + '.jpg ' + s.slice(k, k + 60000)); } catch (e) { console.log('ERR ' + i + ' ' + e.message); } }
  await b.close(); })().catch(e => { console.error(e); process.exit(1); });
