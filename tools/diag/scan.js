// somente leitura: roda o motor do Diagnóstico (o mesmo código da Central) contra os clientes reais, sem entrar em nenhuma conta.
// Só lê o que é público (catálogos, páginas, lista da Guía); não grava nada. Serve para conferir, com dados de verdade,
// que o scanner não quebra nem acusa problema que não existe.
//   node tools/diag/scan.js local   → usa o admin/index.html deste repositório (antes de publicar)
//   node tools/diag/scan.js         → usa o que está publicado em araujotechsistemas.com/admin/
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const LOCAL = process.argv[2] === 'local';
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'America/Asuncion', locale: 'es-PY' });
  if (LOCAL) await ctx.route(u => u.hostname === 'araujotechsistemas.com' && u.pathname === '/admin/', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fs.readFileSync(path.join(__dirname, '..', '..', 'araujo-tech-site', 'admin', 'index.html')) }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  await p.goto('https://araujotechsistemas.com/admin/', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(6000);
  console.log('ORIGEM ' + (LOCAL ? 'arquivo do repositório' : 'publicado') + ' · erros ao abrir: ' + (errs.join(' | ') || 'nenhum'));
  const out = await p.evaluate(async () => {
    const O = { tem: typeof dgRun === 'function' && typeof cgDg === 'function' && typeof dgSys === 'function', cl: [] };
    if (!O.tem) return O;
    const api = await CLOUD.init(); const sitio = await api.getSiteCfg();
    const cl = ((sitio && sitio.clientes) || []).filter(c => c && c.sys === 'catalogo');
    const pl = (PL.plans.find(x => x.site) || PL.plans[0] || {}).id;
    // clientes de mentira só nesta página (nada é salvo): os dados da conta ficam na Central, que precisa de senha
    PL.shops = cl.map(c => ({ id: c.id, name: c.name, plan: pl, due: '2027-06-30', status: 'ativo', live: c.id === 'fogao-mineiro', user: 'u', pass: 'zzzzzzzzz', wa: '595981000000', seg: { es: c.segEs || '', pt: c.segPt || '' }, gu: c.vip ? 'vip' : c.dest ? 'rec' : undefined, pays: [] }));
    for (const s of PL.shops) {
      const t0 = Date.now(); let R;
      try { R = await dgRun(s, { deep: true, sitio }); } catch (e) { O.cl.push({ id: s.id, crash: String((e && e.stack) || e).slice(0, 300) }); continue; }
      let fatos = null; try { const d = await api.getShopDoc(s.id), c = JSON.parse(d.cfg), st = c.store || {}, B = Array.isArray(st.bairros) ? st.bairros : [], ap = d.feeApproved || null;
        fatos = { delivery: !!st.delivery, pickup: !!st.pickup, mode: st.mode || '', feeMode: st.feeMode || '', feeTbd: !!st.feeTbd, useTd: !!st.useTd, feeFrom: String(st.feeFrom || '').slice(0, 12), bairros: B.length, comPreco: B.filter(b => b && b.fee != null && b.fee !== '').length, zonas: B.filter(b => b && Array.isArray(b.zone) && b.zone.length > 2).length, kmZonas: (c.zones || []).length, limTd: !!(d.lim && d.lim.td), limMax: d.lim ? d.lim.max : null, limPlan: d.lim ? d.lim.plan : null, status: d.status || '', aprov: ap ? { tbd: !!ap.feeTbd, n: (ap.bairros || []).length, comPreco: (ap.bairros || []).filter(b => b && b.fee != null).length } : null, pend: !!d.feePending, pay: Object.keys(st.pay || {}).filter(k => st.pay[k]).join(','), pixKey: !!String(st.pixKey || '').trim(), bank: !!String(st.bankInfo || '').trim(), waLen: String(st.whatsapp || '').replace(/\D/g, '').length, prods: (c.products || []).length, ativos: (c.products || []).filter(p => p && p.on !== false).length, cats: (c.cats || []).length, ocultas: (c.cats || []).filter(x => x && x.hide).length, big: !!c.big, site: d.site ? { slug: d.site.slug || '', on: d.site.on } : null, locSet: !!st.locSet, lat: +st.lat || 0, sched: !!st.allowSched, logo: String(st.logo || '').slice(0, 8), cover: String(st.cover || '').slice(0, 8), addr: !!String(st.address || '').trim() };
      } catch (e) { fatos = { erro: String(e && e.message || e).slice(0, 80) }; }
      O.cl.push({ id: s.id, fatos, ms: Date.now() - t0, n: dgCount(R), score: dgScore(R), it: R.filter(x => x.sev !== 'ok').map(x => [x.sev, x.g, x.t, String(x.d || '').slice(0, 140), x.act ? x.act.k + (x.act.auto ? '*' : '') : '']), ok: R.filter(x => x.sev === 'ok').map(x => x.t), msg: dgMsg(s, R).length, html: dgOutHTML(s, R, { at: Date.now(), ms: 1 }).length });
    }
    try { const t0 = Date.now(); await dgSys(); O.sys = DG.sys ? { ms: Date.now() - t0, n: dgCount(DG.sys.R), it: DG.sys.R.filter(x => x.sev !== 'ok').map(x => [x.sev, x.g, x.t, String(x.d || '').slice(0, 140)]), ok: DG.sys.R.filter(x => x.sev === 'ok').map(x => x.t) } : { falhou: DG.msg }; } catch (e) { O.sys = { crash: String((e && e.stack) || e).slice(0, 300) }; }
    try { const t0 = Date.now(); await dgAll(); O.all = DG.all ? { ms: Date.now() - t0, fail: !!DG.all.fail, net: DG.all.net.map(x => [x.sev, x.t]), list: DG.all.list.map(x => [x.id, x.n.e, x.n.w, x.n.fx]) } : { falhou: DG.msg }; } catch (e) { O.all = { crash: String((e && e.stack) || e).slice(0, 300) }; }
    return O;
  });
  if (!out.tem) { console.log('FALTA  esta página ainda não tem o Diagnóstico novo'); await b.close(); process.exit(1); }
  for (const c of out.cl) {
    if (c.crash) { console.log('\nQUEBROU ' + c.id + ' → ' + c.crash); continue; }
    console.log('\nCLIENTE ' + c.id + ' · ' + Math.round(c.ms / 1000) + ' s · problemas ' + c.n.e + ' · avisos ' + c.n.w + ' · em ordem ' + c.n.k + ' · saúde ' + c.score + ' · correções técnicas ' + c.n.fx + ' · mensagem ' + c.msg + ' · tela ' + c.html);
    console.log('  fatos: ' + JSON.stringify(c.fatos));
    for (const [sev, g, t, d, a] of c.it) console.log('  ' + ({ err: '[X]', warn: '[!]', info: '[i]' })[sev] + ' ' + g + ' · ' + t + (d ? ' — ' + d : '') + (a ? '  {' + a + '}' : ''));
    console.log('  [ok] ' + c.ok.join(' | '));
  }
  for (const k of ['sys', 'all']) {
    const s = out[k]; console.log('\n' + (k === 'sys' ? 'MEUS SISTEMAS' : 'TODOS') + ' ' + JSON.stringify(s && (s.crash || s.falhou) ? s : { ms: s.ms, n: s.n, fail: s.fail }));
    if (s && s.it) { for (const [sev, g, t, d] of s.it) console.log('  ' + ({ err: '[X]', warn: '[!]', info: '[i]' })[sev] + ' ' + g + ' · ' + t + (d ? ' — ' + d : '')); console.log('  [ok] ' + s.ok.join(' | ')); }
    if (s && s.net) console.log('  rede: ' + JSON.stringify(s.net) + '\n  lista: ' + JSON.stringify(s.list));
  }
  console.log('\nERROS DE JAVASCRIPT: ' + (errs.join(' | ') || 'nenhum'));
  await b.close();
})().catch(e => { console.log('FALHA ' + (e && e.stack || e)); process.exit(1); });
