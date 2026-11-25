// somente leitura: a Central publicada já tem o logo em boa resolução? (cabeçalhos de cache e marcas no código)
(async () => { for (const u of ['https://araujotechsistemas.com/admin/', 'https://araujotechsistemas.com/admin/index.html']) {
  const r = await fetch(u + '?v=' + Date.now()); const t = await r.text(); const r2 = await fetch(u); 
  console.log('ADM', u, r.status, t.length, 'lgh=' + t.includes('ui.qk.lgh=u'), 'aviso=' + t.includes('Logo en baja'), 'cc=' + r2.headers.get('cache-control'), 'age=' + r2.headers.get('age'), 'x-cache=' + (r2.headers.get('x-litespeed-cache') || r2.headers.get('x-cache') || ''), 'sem-v-lgh=' + (await r2.text()).includes('ui.qk.lgh=u')); }
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
