// somente leitura: confere qual versão das regras está publicada.
// v20 deixa ler um convite pelo código (404); v21 deixa ler as fotos (gfotos) de uma conta aprovada (404 se ainda não tem fotos; v20 recusa com 403).
(async () => { const K = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U', B = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents';
  const r = await fetch(B + '/ginv/zzzzzzzzzzzzzzzzzzzzzzzz?key=' + K); console.log('GINV', r.status, r.status === 404 ? 'v20+ publicada' : '?');
  const q = await (await fetch(B + ':runQuery?key=' + K, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'gfichas' }], where: { fieldFilter: { field: { fieldPath: 'st' }, op: 'EQUAL', value: { stringValue: 'ok' } } }, limit: 1 } }) })).json();
  const id = ((q[0] || {}).document || {}).name; if (!id) { console.log('GFOTOS sem conta aprovada para testar'); return; }
  const g = await fetch(B + '/gfotos/' + id.split('/').pop() + '?key=' + K); console.log('GFOTOS', g.status, (g.status === 404 || g.status === 200) ? 'v21 publicada' : g.status === 403 ? 'ainda v20' : '?');
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
