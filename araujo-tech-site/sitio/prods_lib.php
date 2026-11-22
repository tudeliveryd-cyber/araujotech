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
// foto do produto para a Guía e o site: foto enviada no painel (m:xxx, servida pelo pimg.php) ou link https importado da planilha
function at_pimg($id, $ph) {
  $ph = (string)$ph;
  if (preg_match('/^m:([a-z0-9]{2,24})$/', $ph, $m)) return '/sitio/pimg.php?s=' . rawurlencode($id) . '&k=' . $m[1];
  if (strlen($ph) < 600 && preg_match('#^https://[^\s"\'<>`\\\\]+$#i', $ph)) return $ph;
  return null;
}
function at_shop_cfg($id) {
  $cache = sys_get_temp_dir() . '/at_pcfg3_' . md5($id) . '.json';
  if (is_file($cache) && time() - filemtime($cache) < 600) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d ?: null; }
  $r = at_get(AT_FS . rawurlencode($id) . '?key=' . AT_KEY . '&mask.fieldPaths=cfg&mask.fieldPaths=status&mask.fieldPaths=mediaCount&mask.fieldPaths=site.maps&mask.fieldPaths=site.lat&mask.fieldPaths=site.lng&mask.fieldPaths=site.ph&mask.fieldPaths=lim');
  $out = [];
  if ($r) {
    $f = (json_decode($r, true)['fields'] ?? []);
    $cfg = json_decode((string)($f['cfg']['stringValue'] ?? ''), true);
    $sf = $f['site']['mapValue']['fields'] ?? []; $num = function ($v) { return isset($v['doubleValue']) ? (float)$v['doubleValue'] : (isset($v['integerValue']) ? (float)$v['integerValue'] : null); };
    if (is_array($cfg)) $out = ['cfg' => $cfg, 'status' => (string)($f['status']['stringValue'] ?? ''), 'mc' => (int)($f['mediaCount']['integerValue'] ?? 0), 'site' => ['maps' => (string)($sf['maps']['stringValue'] ?? ''), 'lat' => $num($sf['lat'] ?? null), 'lng' => $num($sf['lng'] ?? null), 'g' => (int)($sf['ph']['mapValue']['fields']['g']['integerValue'] ?? 0), 'pv' => (string)($sf['ph']['mapValue']['fields']['v']['integerValue'] ?? ($sf['ph']['mapValue']['fields']['v']['doubleValue'] ?? ''))], 'off' => array_map(function ($v) { return (string)($v['stringValue'] ?? ''); }, $f['lim']['mapValue']['fields']['off']['arrayValue']['values'] ?? [])];
  }
  @file_put_contents($cache, json_encode($out));
  return $out ?: null;
}
