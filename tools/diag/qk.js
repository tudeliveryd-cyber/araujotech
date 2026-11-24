// somente leitura: confere se o Registro rápido da Guía está no ar (painel e servidor da Guía).
//   node tools/diag/qk.js
(async () => {
  const a = await (await fetch('https://araujotechsistemas.com/admin/?v=' + Date.now())).text();
  console.log('PAINEL registro rápido:', /guquick/.test(a) && /qkGuess/.test(a) && /qkToggle/.test(a) && /qkMapHTML/.test(a) && /qkHomeHTML/.test(a) && /qkImpHTML/.test(a) && /qkdelok/.test(a) && /qkVxLoad/.test(a) && /tdt_dupnp/.test(a) && /qkhm/.test(a) && /b5pay/.test(a) ? 'SIM' : 'NAO');
  const g = await (await fetch('https://guiadesantarita.com/?v=' + Date.now())).text();
  console.log('GUIA responde:', g.length > 1000 ? 'SIM (' + g.length + ' bytes)' : 'NAO');
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
