// Teste de navegação da Guía (somente leitura): clica em cada menu/atalho, confere se abriu algo e se "voltar" retorna ao início.
const { chromium, devices } = require('playwright');
(async () => {
  const URL0 = process.argv[2] || 'https://guiadesantarita.com/';
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices[process.env.DEV || 'Pixel 5'], geolocation: { latitude: -25.79765, longitude: -55.0967 }, permissions: ['geolocation'] }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  const st = () => p.evaluate(() => ({ cat: CAT, spv: SPV, q: document.getElementById('q').value, map: MAPON, fav: F_FAV, open: F_OPEN, del: F_DEL, home: document.body.classList.contains('home'), y: Math.round(scrollY), sheet: !document.getElementById('more').hidden, h: history.length, url: location.pathname + location.hash }));
  const isHome = s => s.cat === 'home' && !s.spv && !s.q && !s.map && !s.fav && s.home && !s.sheet;
  const home = async () => { await p.goto(URL0, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => typeof LIST !== 'undefined' && LIST && document.querySelector('#atl .tt'), null, { timeout: 30000 }); await p.waitForTimeout(1200); };
  let ok = 0, bad = 0; const R = (good, name, det) => { if (good) ok++; else bad++; console.log((good ? 'OK    ' : 'FALHA ') + name + (det ? ' => ' + det : '')); };
  await home();
  // lista de alvos: (seletor, nome)
  const targets = await p.evaluate(() => { const out = [], seen = new Set(); const add = (sel, name) => { if (seen.has(sel)) return; seen.add(sel); out.push([sel, name]); };
    document.querySelectorAll('[data-go]').forEach(e => add(`[data-go="${e.dataset.go}"]`, 'ir: ' + e.dataset.go));
    document.querySelectorAll('[data-tt]').forEach(e => add(`[data-tt="${e.dataset.tt}"]`, 'quadro: ' + e.dataset.tt));
    document.querySelectorAll('#bnav [data-b]').forEach(e => add(`#bnav [data-b="${e.dataset.b}"]`, 'barra de baixo: ' + e.dataset.b));
    document.querySelectorAll('#atl [data-a]').forEach(e => add(`#atl [data-a="${e.dataset.a}"]`, 'atalho: ' + (e.textContent || '').trim().slice(0, 24)));
    document.querySelectorAll('#atl [data-sp]').forEach(e => add(`#atl [data-sp="${e.dataset.sp}"]`, 'oportunidade: ' + e.dataset.sp));
    document.querySelectorAll('#atl [data-pk]').forEach(e => add(`#atl [data-pk="${e.dataset.pk}"]`, 'info pública: ' + e.dataset.pk));
    document.querySelectorAll('#atl .tiles [data-c]').forEach(e => add(`#atl .tiles [data-c="${e.dataset.c}"]`, 'categoria: ' + e.dataset.c));
    document.querySelectorAll('#sug button,[data-tq]').forEach((e, i) => { if (i < 3) add(e.dataset.tq ? `[data-tq="${e.dataset.tq}"]` : `#sug button:nth-of-type(${i + 1})`, 'sugestão: ' + (e.textContent || '').trim()); });
    return out; });
  console.log('ALVOS ' + targets.length);
  for (const [sel, name] of targets) {
    try {
      let s0 = await st(); if (!isHome(s0) || s0.y > 5) { await home(); s0 = await st(); }
      const el = p.locator(sel).first(); if (!(await el.count())) { console.log('PULA  ' + name + ' (não está na tela)'); continue; }
      const vis = await el.evaluate(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
      if (!vis) { console.log('PULA  ' + name + ' (escondido no celular)'); continue; }
      await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150);
      const y0 = (await st()).y;
      await el.click({ timeout: 4000 }); await p.waitForTimeout(900);
      const path0 = new (require('url').URL)(URL0).pathname; const pnow = new (require('url').URL)(p.url()).pathname;
      if (pnow !== path0) { const u = p.url(); await p.goBack({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => { }); await p.waitForFunction(() => typeof LIST !== 'undefined' && LIST, null, { timeout: 20000 }).catch(() => { }); await p.waitForTimeout(800); const okb = new (require('url').URL)(p.url()).pathname === path0; R(okb, name, okb ? 'abre a página ' + u.replace(/^https?:\/\/[^/]+/, '') + ' e voltar retorna à Guía' : 'abriu ' + u + ' e voltar não retornou'); continue; }
      const s1 = await st(); const changed = !isHome(s1) || Math.abs(s1.y - y0) > 40 || s1.url !== s0.url;
      const leftSite = !/guiadesantarita\.com|127\.0\.0\.1/.test(p.url());
      if (leftSite) { R(true, name, 'abre outra página: ' + p.url().slice(0, 60)); await home(); continue; }
      if (name === 'ir: share' || name === 'ir: home' || /barra de baixo: (home|find)/.test(name)) { R(true, name, 'ação sem tela nova'); continue; }
      if (!changed) { R(false, name, 'clicou e nada mudou'); continue; }
      const stateChanged = !isHome(s1);
      if (!stateChanged) { R(true, name, 'rola até a seção (y ' + y0 + ' → ' + s1.y + ')'); continue; }
      await p.goBack({ waitUntil: 'commit', timeout: 8000 }).catch(() => { }); await p.waitForTimeout(900);
      const still = /guiadesantarita\.com|127\.0\.0\.1/.test(p.url()) && !/about:blank/.test(p.url());
      if (!still) { R(false, name, 'VOLTAR SAIU DA GUÍA (' + p.url().slice(0, 50) + ')'); await home(); continue; }
      const s2 = await st();
      R(isHome(s2), name, isHome(s2) ? 'abriu (' + [s1.cat, s1.spv, s1.q, s1.map ? 'mapa' : '', s1.sheet ? 'menú' : ''].filter(Boolean).join(',') + ') e voltar retornou ao início' : 'voltar não retornou ao início: ' + JSON.stringify(s2));
    } catch (e) { R(false, name, 'erro: ' + String(e.message).slice(0, 90)); try { await home(); } catch (x) { } }
  }
  // dois níveis: categoria → busca → voltar → voltar
  try { await home(); await p.evaluate(() => go('all')); await p.waitForTimeout(600); await p.fill('#q', 'pizza'); await p.waitForTimeout(700); await p.fill('#q', 'pizzer'); await p.waitForTimeout(700);
    const a = await st(); await p.goBack().catch(() => { }); await p.waitForTimeout(700); const b1 = await st(); await p.goBack().catch(() => { }); await p.waitForTimeout(700); const c = await st();
    R(a.q === 'pizzer' && b1.cat === 'all' && !b1.q && isHome(c), 'dois níveis: todos → busca → voltar → voltar', JSON.stringify([a.q, b1.cat + '/' + b1.q, c.cat])); } catch (e) { R(false, 'dois níveis', String(e.message).slice(0, 80)); }
  // página de negócio e voltar: a Guía reabre na mesma tela e altura
  try { await home(); await p.evaluate(() => go('all')); await p.waitForTimeout(900);
    const link = p.locator('#list a[href]:not([target])').first();
    if (await link.count()) { await link.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(400); const a = await st(); const href = await link.getAttribute('href'); await link.click(); await p.waitForLoadState('domcontentloaded'); await p.waitForTimeout(1200); const u = p.url();
      await p.goBack({ waitUntil: 'domcontentloaded' }).catch(() => { }); await p.waitForFunction(() => typeof LIST !== 'undefined' && LIST, null, { timeout: 20000 }).catch(() => { }); await p.waitForTimeout(1500); const c = await st();
      R(c.cat === 'all' && Math.abs(c.y - a.y) < 250, 'abrir um negócio (' + href + ') e voltar: mesma lista e altura', JSON.stringify({ antes: [a.cat, a.y], depois: [c.cat, c.y], pagina: u.slice(0, 60) }));
    } else console.log('PULA  página de negócio (sem link na lista)'); } catch (e) { R(false, 'negócio e voltar', String(e.message).slice(0, 80)); }
  // menú "Más": voltar fecha o menú sem sair
  try { await home(); await p.locator('#bnav [data-b="more"]').click(); await p.waitForTimeout(500); const a = await st(); await p.goBack().catch(() => { }); await p.waitForTimeout(600); const c = await st();
    R(a.sheet && !c.sheet && isHome(c) && /guiadesantarita|127\.0/.test(p.url()), 'menú "Más": voltar fecha o menú e fica na Guía', JSON.stringify([a.sheet, c.sheet])); } catch (e) { R(false, 'menú Más', String(e.message).slice(0, 80)); }
  console.log('ERROS JS ' + (errs.length ? [...new Set(errs)].join(' | ') : 'nenhum'));
  console.log('RESULTADO ' + ok + ' ok, ' + bad + ' falha(s)');
  await b.close();
})();
