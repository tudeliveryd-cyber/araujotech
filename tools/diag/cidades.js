// somente leitura: cidades e categorias dos negócios publicados na Guía (para organizar o início e o filtro por localização).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => { const o = { vx: (LIST || []).map(c => [c.name, c._g, c.city || '', c.vip ? 'vip' : c.dest ? 'dest' : '']), dir: dirL().map(c => [c.name, c._g, c._sub, c.td ? 'td' : '', c.pr ? 'pr' : '', c.dest ? 'rc' : '', c.a || '']), grp: GR.map(g => g[0] + ':' + g[2].es), promo: (G.promo || []).length, ads: (G.ads || []).map(a => [a.t, !!a.own]) }; return o; });
  console.log('CID ' + JSON.stringify(r)); await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
