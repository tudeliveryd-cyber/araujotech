<?php
// Funções comuns de prods.php e pimg.php: lê o catálogo público da loja no Firestore (com cache no servidor).
const AT_FS = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/shops/';
const AT_KEY = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
function at_get($url) {
  if (function_exists('curl_init')) {
    $c = curl_init($url); curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 3, CURLOPT_USERAGENT => 'Mozilla/5.0 (GuiaVitrix; +https://araujotechsistemas.com/guia/)']);
    $r = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE);
    return ($r !== false && $code === 200) ? $r : null;
  }
  $r = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 10]]));
  return $r === false ? null : $r;
}
function at_shop_cfg($id) {
  $cache = sys_get_temp_dir() . '/at_pcfg_' . md5($id) . '.json';
  if (is_file($cache) && time() - filemtime($cache) < 600) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d ?: null; }
  $r = at_get(AT_FS . rawurlencode($id) . '?key=' . AT_KEY . '&mask.fieldPaths=cfg&mask.fieldPaths=status&mask.fieldPaths=mediaCount');
  $out = [];
  if ($r) {
    $f = (json_decode($r, true)['fields'] ?? []);
    $cfg = json_decode((string)($f['cfg']['stringValue'] ?? ''), true);
    if (is_array($cfg)) $out = ['cfg' => $cfg, 'status' => (string)($f['status']['stringValue'] ?? ''), 'mc' => (int)($f['mediaCount']['integerValue'] ?? 0)];
  }
  @file_put_contents($cache, json_encode($out));
  return $out ?: null;
}
