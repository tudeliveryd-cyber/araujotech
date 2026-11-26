// somente leitura: quais fichas publicadas têm cidade, Portada, galeria/capa e forma de atender (para conferir se algum dado sumiu).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => (G.dir || []).map(x => [x.n, x.pr ? 'pr' : '', x.po ? 'po' : '', x.rc ? 'rc' : '', x.ci || '', x.mo || '', (x.gl || []).length, x.phh ? 'capa' : ''].join(' | ')));
  console.log('DADOS ' + r.length); r.forEach(l => console.log('F ' + l)); await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
