// SÓ LEITURA: auditoria dos DADOS da Guía no ar (guiadesantarita.com). Não grava nada.
// Lista cada ponto do mapa (dentro de Santa Rita? repetido?), cada cliente Vitrix (página e catálogo respondem?), banners, profissionais,
// feriados que a agenda mostra, horários de ônibus, e toca em cada item do menu Más e da barra de baixo no celular.
const { chromium } = require('playwright');
const BASE = 'https://guiadesantarita.com/';
const BB = { s: -25.90, n: -25.70, w: -55.20, e: -55.00 }; // distrito de Santa Rita com folga
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'es-PY', timezoneId: 'America/Asuncion' });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(8000);
  const D = await p.evaluate(() => {
    const geo = u => { u = String(u || ''); const m = u.match(/[?&](?:q|query|ll|destination)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/) || u.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) || u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/); return m ? [+m[1], +m[2]] : null; };
    const pts = [];
    (LIST || []).forEach(c => { const i = INFO[c.id] || {}; pts.push({ k: 'vitrix', n: c.name, ll: i.lat != null ? [i.lat, i.lng] : null, tel: i.wa || '', a: i.ad || '' }); });
    dirL().forEach(c => pts.push({ k: c.bas ? 'ficha básica' : 'ficha', n: c.name, ll: c.ll || geo(c.map), tel: c.wa || c.tel || '', a: c.a || '', map: c.map || '' }));
    utilAll().forEach(u => pts.push({ k: 'público:' + u.c, n: u.n, ll: geo(u.map), tel: u.tel || '', a: u.a || '', src: u.src || '', map: u.map || '' }));
    const vx = (LIST || []).map(c => ({ id: c.id, n: c.name, dest: !!c.dest, vip: !!c.vip, url: c.url, logo: c.logo, info: INFO[c.id] ? Object.keys(INFO[c.id]).join(',') : 'SEM INFO' }));
    const ads = (G.ads || []).map(a => ({ id: a.id, t: a.t || '', from: a.from || '', to: a.to || '', u: a.u || '' }));
    const pros = (G.pros || []).map(x => ({ n: x.n, c: x.c || x.a || '', to: x.to || '', tel: x.tel || x.wa || '' }));
    const fer = (typeof ferUp === 'function' ? ferUp(20) : []).map(f => f.d + ' ' + ((TX.es.FN || {})[f.k] || f.k) + (f.m ? ' (trasladado)' : ''));
    const agenda = (typeof ferNext === 'function' ? ferNext() : []).map(e => e.d + ' ' + e.t);
    const bus = (G.bus || []).length ? 'painel: ' + G.bus.length + ' horários' : 'padrão do código (BUS_DEF): ' + BUS_DEF.length + ' horários';
    const emer = EMER.map(e => e[0] + ' ' + e[1].es);
    return { pts, vx, ads, pros, fer, agenda, bus, emer, ev: (G.ev || []).map(e => [e.d, e.t]), turno: (G.turno || []).map(t => [t.n, t.from, t.to, t.tel]), news: NEWS ? ((NEWS.items || []).length + ' notícias, ' + (NEWS.notas || []).length + ' notas') : 'nenhuma' };
  });
  console.log('== DADOS ' + new Date().toISOString());
  // pontos do mapa
  const out = D.pts.filter(x => x.ll && (x.ll[0] < BB.s || x.ll[0] > BB.n || x.ll[1] < BB.w || x.ll[1] > BB.e));
  const sem = D.pts.filter(x => !x.ll);
  const dist = (a, c) => Math.hypot((a[0] - c[0]) * 111000, (a[1] - c[1]) * 100000);
  const near = []; D.pts.forEach((x, i) => D.pts.forEach((y, j) => { if (j > i && x.ll && y.ll && dist(x.ll, y.ll) < 8 && x.n !== y.n) near.push(x.n + ' ≈ ' + y.n + ' (' + Math.round(dist(x.ll, y.ll)) + ' m)'); }));
  console.log('PONTOS total ' + D.pts.length + ' · com coordenada ' + (D.pts.length - sem.length) + ' · sem coordenada ' + sem.length + ' · fora de Santa Rita ' + out.length);
  out.forEach(x => console.log('  FORA ' + x.k + ' | ' + x.n + ' | ' + x.ll.join(',')));
  sem.forEach(x => console.log('  SEMCOORD ' + x.k + ' | ' + x.n + ' | ' + (x.map || '')));
  near.forEach(x => console.log('  COLADOS ' + x));
  D.pts.forEach(x => console.log('  PT ' + x.k + ' | ' + x.n + ' | ' + (x.ll ? x.ll.map(v => v.toFixed(5)).join(',') : '-') + ' | tel ' + (x.tel || '-') + ' | ' + (x.a || '-') + ' | ' + (x.src || '')));
  // Vitrix
  for (const v of D.vx) { let pg = '?', ct = '?'; try { pg = (await fetch(BASE + v.id, { redirect: 'manual' })).status; } catch (e) { pg = 'ERRO'; } try { ct = v.url ? (await fetch(v.url, { redirect: 'follow' })).status : 'sem url'; } catch (e) { ct = 'ERRO'; }
    console.log('VITRIX ' + v.n + ' (' + v.id + ') plano ' + (v.vip ? 'VIP' : v.dest ? 'Premium' : 'básico') + ' · página ' + pg + ' · catálogo ' + ct + ' ' + (v.url || '') + ' · dados: ' + v.info); }
  console.log('BANNERS ' + JSON.stringify(D.ads)); console.log('PROFISSIONAIS ' + JSON.stringify(D.pros));
  console.log('EVENTOS ' + JSON.stringify(D.ev)); console.log('AGENDA AUTOMÁTICA ' + JSON.stringify(D.agenda)); console.log('FERIADOS ' + JSON.stringify(D.fer));
  console.log('FARMÁCIA DE TURNO ' + JSON.stringify(D.turno)); console.log('ÔNIBUS ' + D.bus); console.log('EMERGÊNCIAS ' + JSON.stringify(D.emer)); console.log('NOTÍCIAS ' + D.news);
  // celular: menu Más e barra de baixo
  const tap = async (sel, lab) => { const e0 = errs.length; try { await p.evaluate(() => { goHome(); render(); scrollTo(0, 0); }); await p.waitForTimeout(300); if (sel.more) { await p.locator('#bnav [data-b=more]').click(); await p.waitForTimeout(500); }
      const el = p.locator(sel.s).first(); if (!(await el.count())) { console.log('TOQUE ' + lab + ' · NÃO ENCONTRADO'); return; }
      const href = await el.getAttribute('href'); if (href && /^https?:|^\//.test(href) && !(await el.getAttribute('data-go')) && !(await el.getAttribute('data-sp'))) { let st = '?'; try { st = (await fetch(new URL(href, BASE).href, { redirect: 'manual' })).status; } catch (e) { st = 'ERRO'; } console.log('TOQUE ' + lab + ' · link ' + href + ' → ' + st); return; }
      await el.click({ timeout: 5000 }); await p.waitForTimeout(900);
      const r = await p.evaluate(() => ({ spv: SPV, cat: CAT, map: MAPON, h2: ((document.querySelector('#list h2,.spv h2,#main h2') || {}).textContent || '').trim().slice(0, 50), sheet: [...document.querySelectorAll('.sheet:not([hidden]),[role=dialog]')].filter(x => x.offsetParent).length }));
      console.log('TOQUE ' + lab + ' · ' + JSON.stringify(r) + (errs.length > e0 ? ' · ERRO JS ' + errs.slice(e0).join(' | ') : '')); } catch (e) { console.log('TOQUE ' + lab + ' · FALHOU ' + e.message.split('\n')[0]); } };
  for (const k of ['home', 'cats', 'map', 'agenda']) await tap({ s: '#bnav [data-b=' + k + ']' }, 'barra ' + k);
  await p.evaluate(() => { goHome(); render(); }); await p.locator('#bnav [data-b=more]').click(); await p.waitForTimeout(600);
  const items = await p.evaluate(() => [...document.querySelectorAll('#more a, #more button')].filter(x => x.offsetParent && !x.matches('[data-close],.xbtn')).map((x, i) => ({ i, t: (x.textContent || x.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40) })));
  for (const it of items) { const e0 = errs.length; try { await p.evaluate(() => { document.querySelectorAll('.sheet').forEach(x => x.hidden = true); MAPON = false; goHome(); render(); scrollTo(0, 0); }); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('#bnav [data-b=more]').click()); await p.waitForTimeout(500);
      const info = await p.evaluate(i => { const x = [...document.querySelectorAll('#more a, #more button')].filter(x => x.offsetParent && !x.matches('[data-close],.xbtn'))[i]; if (!x) return null; const h = x.getAttribute('href'); if (h && !x.dataset.go && !x.dataset.sp && !x.dataset.a && !/^#/.test(h)) return { href: new URL(h, location.href).href }; x.click(); return { clicked: 1 }; }, it.i);
      if (!info) { console.log('TOQUE Más: ' + it.t + ' · NÃO ENCONTRADO'); continue; }
      if (info.href) { let st = '?'; try { st = (await fetch(info.href, { redirect: 'manual' })).status; } catch (e) { st = 'ERRO'; } console.log('TOQUE Más: ' + it.t + ' · link ' + info.href + ' → ' + st); continue; }
      await p.waitForTimeout(900); const r = await p.evaluate(() => ({ spv: SPV, cat: CAT, lang: L, h2: ((document.querySelector('#list h2,.spv h2') || {}).textContent || '').trim().slice(0, 50), sheet: [...document.querySelectorAll('.sheet,[role=dialog]')].filter(x => x.offsetParent && !x.hidden).map(x => x.id || x.className).join(',') }));
      console.log('TOQUE Más: ' + it.t + ' · ' + JSON.stringify(r) + (errs.length > e0 ? ' · ERRO JS ' + errs.slice(e0).join(' | ') : '')); await p.evaluate(() => { if (typeof setLang === 'function') try { setLang('es') } catch (e) {} }); } catch (e) { console.log('TOQUE Más: ' + it.t + ' · FALHOU ' + e.message.split('\n')[0]); } }
  console.log('ERROS JS: ' + (errs.length ? errs.join(' | ') : 'nenhum'));
  await b.close();
})();
