// SÓ LEITURA: abre o catálogo real da loja no tamanho de um celular, salva a foto do topo e o logo original (como o dono enviou).
const { chromium } = require('playwright'); const fs = require('fs');
const LOJA = process.env.LOJA || 'lojastatus'; fs.mkdirSync('topo', { recursive: true });
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true }); const p = await ctx.newPage();
  await p.goto('https://' + LOJA + '.araujotechsistemas.com/', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(8000);
  const info = await p.evaluate(() => { const i = document.querySelector('.chead-in .logo img'); const lg = (typeof pub !== 'undefined' && pub.store && pub.store.logo) || ''; return { lg, cls: i && i.className, nat: i && [i.naturalWidth, i.naturalHeight], box: i && [i.getBoundingClientRect().width, i.getBoundingClientRect().height], fit: i && getComputedStyle(i).objectFit, bw: i && getComputedStyle(i).borderTopWidth, bg: i && i.style.backgroundColor }; });
  const m = /^data:image\/([a-z+]+);base64,(.+)$/.exec(info.lg || ''); if (m) fs.writeFileSync('topo/logo-original.' + (m[1] === 'jpeg' ? 'jpg' : m[1].replace('+xml', '')), Buffer.from(m[2], 'base64'));
  console.log('LOGO64 ' + (m ? m[1] + ' ' + m[2] : 'sem'));
  delete info.lg; console.log(JSON.stringify(info));
  await p.screenshot({ path: 'topo/topo.png', clip: { x: 0, y: 0, width: 390, height: 460 } }); console.log('TOPO64 ' + (await p.screenshot({ type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 390, height: 460 } })).toString('base64')); await b.close(); })();
