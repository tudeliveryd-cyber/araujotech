// somente leitura: cabeçalhos de segurança e HTTPS das páginas da Guía
(async () => { for (const u of (process.argv[2] || 'https://guiadesantarita.com/').split(/\s+/).filter(Boolean)) { const r = await fetch(u, { redirect: 'manual' });
  const h = k => r.headers.get(k) || '-'; console.log('HDR ' + u + ' ' + r.status + ' hsts=' + h('strict-transport-security') + ' nosniff=' + h('x-content-type-options') + ' xfo=' + h('x-frame-options') + ' ref=' + h('referrer-policy') + ' csp=' + (h('content-security-policy') === '-' ? '-' : 'sim')); }
  const r = await fetch('http://guiadesantarita.com/', { redirect: 'manual' }); console.log('HTTP→ ' + r.status + ' ' + (r.headers.get('location') || '')); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
