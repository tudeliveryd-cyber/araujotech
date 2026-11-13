<?php
// Vídeo do produto: o painel do local envia o vídeo em partes de até 2 MB; aqui ele é guardado em /v/<loja>/<id>.mp4.
// Só quem está logado no painel daquela loja (ou o admin) pode enviar ou apagar — conferido com o próprio login do Firebase.
//   POST video.php?op=up&shop=<loja>&up=<id>&i=<parte>&n=<total>&off=<bytes já enviados>   (corpo = a parte)
//   POST video.php?op=del&shop=<loja>&f=<id>.mp4
@ini_set('display_errors', '0'); error_reporting(0);
const VKEY = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
const VMAX = 150 * 1024 * 1024;      // um vídeo
const VQUOTA = 2048 * 1024 * 1024;   // todos os vídeos de uma loja
const VFILES = 300;
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https://([a-z0-9-]+\.)?araujotechsistemas\.com$#', $origin)) { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); header('Access-Control-Allow-Headers: Authorization, Content-Type, X-AT-Token'); header('Access-Control-Allow-Methods: POST, OPTIONS'); }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
function vout($a, $code = 200) { http_response_code($code); echo json_encode($a); exit; }
if (($_GET['op'] ?? '') === 'ping') vout(['ok' => true, 'post' => ini_get('post_max_size'), 'curl' => function_exists('curl_init'), 'w' => is_writable(__DIR__)]);   // conferência do servidor (sem dados)
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') vout(['err' => 'method'], 405);
$IDT = getenv('AT_IDT_BASE') ?: 'https://identitytoolkit.googleapis.com';                       // nos testes: emulador
$FSB = getenv('AT_FS_BASE') ?: 'https://firestore.googleapis.com';
function vhttp($url, $body = null, $tok = '') {
  $ch = curl_init($url); $h = ['Content-Type: application/json']; if ($tok) $h[] = 'Authorization: Bearer ' . $tok;
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_HTTPHEADER => $h]);
  if ($body !== null) { curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, $body); }
  $r = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); return [$c, $r];
}
$shop = (string)($_GET['shop'] ?? '');
if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $shop)) vout(['err' => 'shop'], 400);
// ---- quem está enviando ----
$tok = ''; if (preg_match('/^Bearer\s+([A-Za-z0-9._-]{20,4096})$/', $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ('Bearer ' . ($_SERVER['HTTP_X_AT_TOKEN'] ?? '')), $m)) $tok = $m[1];
if ($tok === '') vout(['err' => 'auth'], 401);
$ck = sys_get_temp_dir() . '/at_vtok_' . md5($tok . '|' . $shop);
if (!(is_file($ck) && time() - filemtime($ck) < 600)) {
  [$c, $r] = vhttp($IDT . '/v1/accounts:lookup?key=' . VKEY, json_encode(['idToken' => $tok]));
  $u = $c === 200 ? (json_decode($r, true)['users'][0] ?? null) : null;
  if (!$u || empty($u['localId'])) vout(['err' => 'auth'], 401);
  $ok = strtolower($u['email'] ?? '') === 'admin@araujotechsistemas.com';
  if (!$ok) {
    [$c, $r] = vhttp($FSB . '/v1/projects/araujotech-catalogos/databases/(default)/documents/shopUsers/' . rawurlencode($u['localId']), null, $tok);
    $f = $c === 200 ? (json_decode($r, true)['fields'] ?? []) : [];
    $ok = ($f['shop']['stringValue'] ?? '') === $shop && ($f['role']['stringValue'] ?? 'dono') !== 'cocina';
  }
  if (!$ok) vout(['err' => 'forbidden'], 403);
  @file_put_contents($ck, '1');
}
$dir = __DIR__ . '/v/' . $shop;
$op = (string)($_GET['op'] ?? '');
if ($op === 'del') {
  $f = (string)($_GET['f'] ?? '');
  if (!preg_match('/^[a-z0-9]{16}\.mp4$/', $f)) vout(['err' => 'file'], 400);
  if (is_file("$dir/$f")) @unlink("$dir/$f");
  vout(['ok' => true]);
}
if ($op !== 'up') vout(['err' => 'op'], 400);
$up = (string)($_GET['up'] ?? ''); $i = (int)($_GET['i'] ?? -1); $n = (int)($_GET['n'] ?? 0); $off = (int)($_GET['off'] ?? -1);
if (!preg_match('/^[a-z0-9]{16}$/', $up) || $n < 1 || $n > 100 || $i < 0 || $i >= $n || $off < 0) vout(['err' => 'args'], 400);
$data = file_get_contents('php://input');
if ($data === false || strlen($data) === 0 || strlen($data) > 2 * 1024 * 1024 + 4096) vout(['err' => 'chunk'], 400);
if ($off + strlen($data) > VMAX) vout(['err' => 'big'], 413);
if (!is_dir($dir) && !@mkdir($dir, 0755, true)) vout(['err' => 'disk'], 500);
if (!is_file(__DIR__ . '/v/.htaccess')) @file_put_contents(__DIR__ . '/v/.htaccess', "Options -Indexes\nRemoveHandler .php .phtml .php5 .php7 .php8\nRemoveType .php .phtml\n<FilesMatch \"(?i)\\.(php[0-9]?|phtml|phar|htaccess|part)$\">\n  Require all denied\n</FilesMatch>\n<IfModule mod_mime.c>\n  AddType video/mp4 .mp4\n</IfModule>\n<IfModule mod_headers.c>\n  Header set Cache-Control \"public, max-age=2592000\"\n  Header set X-Content-Type-Options \"nosniff\"\n</IfModule>\n");
$part = "$dir/.$up.part";
if ($i === 0) {
  $files = glob("$dir/*.mp4") ?: []; $used = 0; foreach ($files as $x) $used += filesize($x);
  if (count($files) >= VFILES || $used >= VQUOTA) vout(['err' => 'quota'], 413);
  if (substr($data, 4, 4) !== 'ftyp') vout(['err' => 'type'], 415);                         // só MP4/MOV (iPhone e Android)
  if ($off !== 0) vout(['err' => 'args'], 400);
  foreach (glob("$dir/.*.part") ?: [] as $x) if (time() - filemtime($x) > 86400) @unlink($x); // envios abandonados
  @file_put_contents($part, '');
}
clearstatcache(true, $part);
if (!is_file($part)) vout(['err' => 'gone'], 409);
$have = filesize($part);
if ($have < $off) vout(['err' => 'gap', 'have' => $have], 409);
if ($have > $off) { $h = fopen($part, 'r+'); ftruncate($h, $off); fclose($h); }                 // repetição de uma parte
if (@file_put_contents($part, $data, FILE_APPEND) === false) vout(['err' => 'disk'], 500);
if ($i < $n - 1) vout(['ok' => true, 'have' => $off + strlen($data)]);
$name = $up . '.mp4';
if (!@rename($part, "$dir/$name")) vout(['err' => 'disk'], 500);
$host = 'https://' . $shop . '.araujotechsistemas.com';
vout(['ok' => true, 'url' => $host . '/v/' . $shop . '/' . $name, 'size' => filesize("$dir/$name")]);
