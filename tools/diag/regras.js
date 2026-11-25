// somente leitura: confere qual versão das regras está publicada (v20 deixa ler um convite pelo código; v19 recusa). node tools/diag/regras.js
(async () => {
  const u = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/ginv/zzzzzzzzzzzzzzzzzzzzzzzz?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
  const r = await fetch(u); console.log('GINV', r.status, r.status === 404 ? 'v20 publicada' : r.status === 403 ? 'ainda v19' : '?');
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
