<?php
// Converte um link do Google Maps (inclusive o curto maps.app.goo.gl que o iPhone compartilha) em coordenadas.
// Usado pelo painel do local para marcar a ubicación do negócio e dos barrios. Só segue endereços do Google.
@ini_set('display_errors', '0'); error_reporting(0);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https://([a-z0-9-]+\.)?araujotechsistemas\.com$#', $origin)) { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); }
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function out($a) { echo json_encode($a); exit; }
function coords($s) {
  $s = urldecode($s);
  $pats = ['#!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)#', '#@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)#', '#[?&](?:q|query|ll|center|destination)=(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)#', '#/(?:search|place|dir)/(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)#'];
  foreach ($pats as $p) if (preg_match($p, $s, $m)) { $la = (float)$m[1]; $ln = (float)$m[2]; if (abs($la) <= 90 && abs($ln) <= 180) return ['lat' => $la, 'lng' => $ln]; }
  return null;
}
function google_host($u) { $h = strtolower((string)parse_url($u, PHP_URL_HOST)); return (bool)preg_match('#^(maps\.app\.goo\.gl|goo\.gl|(www\.|maps\.)?google\.[a-z.]{2,8})$#', $h) && strtolower((string)parse_url($u, PHP_URL_SCHEME)) === 'https'; }
$u = trim((string)($_GET['u'] ?? ''));
if (preg_match('#https?://\S+#', $u, $mm)) $u = $mm[0];      // aceita o texto inteiro compartilhado ("Local X https://maps.app.goo.gl/...")
if ($c = coords($u)) out($c);
if (!google_host($u)) out(['err' => 'host']);
for ($i = 0; $i < 6; $i++) {
  $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_HEADER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', CURLOPT_HTTPHEADER => ['Accept-Language: es-PY,es;q=0.9']]);
  $r = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); $loc = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
  if ($r === false) out(['err' => 'net']);
  if ($code >= 300 && $code < 400 && $loc) {
    if ($c = coords($loc)) out($c);
    if (!google_host($loc)) out(['err' => 'host']);
    $u = $loc; continue;
  }
  if ($c = coords($r)) out($c);                         // a página final do Maps traz as coordenadas no conteúdo
  out(['err' => 'nocoords']);
}
out(['err' => 'loop']);
