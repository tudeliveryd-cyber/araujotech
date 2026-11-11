<?php
// Funções comuns do catálogo pelo subdomínio (catalogo.php e logo.php).
function cat_http($url) {
  if (function_exists('curl_init')) {
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 4, CURLOPT_CONNECTTIMEOUT => 3]);
    $r = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    return ($r !== false && $code >= 200 && $code < 300) ? $r : null;
  }
  $r = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 4]]));
  return $r === false ? null : $r;
}
// Lê a loja (documento público shops/<id>) e guarda por 5 minutos
function cat_shop($id) {
  $cache = sys_get_temp_dir() . '/at_cat_' . md5($id) . '.json';
  if (is_file($cache) && time() - filemtime($cache) < 300) { $d = json_decode(@file_get_contents($cache), true); if (is_array($d)) return $d ?: null; }
  $r = cat_http('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/shops/' . rawurlencode($id) . '?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U');
  $out = [];
  if ($r) {
    $j = json_decode($r, true); $f = $j['fields'] ?? [];
    $cfg = json_decode($f['cfg']['stringValue'] ?? '', true);
    if (is_array($cfg) && ($f['status']['stringValue'] ?? 'ativo') !== 'suspenso') {
      $st = $cfg['store'] ?? [];
      $sl = $st['slogan'] ?? '';
      $out = [
        'id' => $id,
        'name' => trim((string)($st['name'] ?? '')),
        'slogan' => is_array($sl) ? (string)($sl['es'] ?? ($sl['pt'] ?? '')) : (string)$sl,
        'logo' => (string)($st['logo'] ?? ''),
        'n' => (int)($f['mediaCount']['integerValue'] ?? 0),
      ];
      if ($out['name'] === '') $out = [];
    }
  }
  @file_put_contents($cache, json_encode($out));
  return $out ?: null;
}
