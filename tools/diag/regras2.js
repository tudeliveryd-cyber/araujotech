// somente leitura: depois de publicar regras, confere que as leituras públicas de sempre continuam funcionando.
(async () => { const K = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U', B = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents';
  for (const p of ['platform/sitio', 'shops/fogaomineiro', 'gfotos/zzzz', 'billing/x']) { const r = await fetch(B + '/' + p + '?key=' + K + '&mask.fieldPaths=n'); console.log('RG', p, r.status); }
  const g = await fetch('https://guiadesantarita.com/?v=' + Date.now()); console.log('RG guia', g.status);
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
