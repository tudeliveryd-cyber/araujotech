<?php
@ini_set('display_errors', '0'); error_reporting(0);
// POST t=<login do Firebase>&q=<texto> → até 30 fotos {t: título, th: miniatura, u: foto original, w, h, s: site}
// GET ?cfg=1 → {on: true/false} (o painel só mostra a busca interna quando a chave está configurada)
require __DIR__ . '/img_lib.php'; img_cors();
$key = img_key();
if (isset($_GET['cfg'])) img_out(['on' => $key !== '']);
if ($key === '') img_out(['ok' => false, 'e' => 'off']);
$uid = img_uid((string)($_POST['t'] ?? '')); if ($uid === '') img_out(['ok' => false, 'e' => 'login'], 401);
$q = trim(preg_replace('/\s+/u', ' ', (string)($_POST['q'] ?? '')));
if (mb_strlen($q) < 2 || mb_strlen($q) > 120) img_out(['ok' => false, 'e' => 'q']);
$cf = __DIR__ . '/datos/imgq/' . md5(mb_strtolower($q)) . '.json';
if (is_file($cf) && time() - filemtime($cf) < 30 * 86400) { $j = json_decode((string)@file_get_contents($cf), true); if ($j) img_out(['ok' => true, 'r' => $j, 'c' => 1]); }
if (!img_quota($uid, true)) img_out(['ok' => false, 'e' => 'quota']);
$u = (getenv('IMG_API_BASE') ?: 'https://api.search.brave.com') . '/res/v1/images/search?' . http_build_query(['q' => $q, 'count' => 30, 'country' => 'ALL', 'search_lang' => 'es', 'safesearch' => 'strict']);
$c = curl_init($u);
curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 12, CURLOPT_HTTPHEADER => ['Accept: application/json', 'X-Subscription-Token: ' . $key]]);
$raw = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE);
if ($code !== 200) img_out(['ok' => false, 'e' => $code === 429 ? 'quota' : 'api']);
$r = [];
foreach ((json_decode((string)$raw, true)['results'] ?? []) as $x) {
  $full = (string)($x['properties']['url'] ?? ''); $th = (string)($x['thumbnail']['src'] ?? '');
  if ($th === '' || !preg_match('#^https?://#', $full)) continue;
  $r[] = ['t' => mb_substr(trim((string)($x['title'] ?? '')), 0, 140), 'th' => $th, 'u' => $full, 'w' => (int)($x['properties']['width'] ?? 0), 'h' => (int)($x['properties']['height'] ?? 0), 's' => (string)($x['meta_url']['hostname'] ?? ($x['source'] ?? ''))];
}
@mkdir(__DIR__ . '/datos/imgq', 0755, true); @file_put_contents($cf, json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
img_out(['ok' => true, 'r' => $r]);
