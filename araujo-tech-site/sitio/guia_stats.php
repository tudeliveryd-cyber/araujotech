<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Números da Guía Vitrix para o Panel Araújo Tech (últimos 30 dias). Só o admin: confere o login do Firebase do pedido.
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
$o = $_SERVER['HTTP_ORIGIN'] ?? ''; if (preg_match('#^https://([a-z0-9-]+\.)?araujotechsistemas\.com$#', $o)) { header('Access-Control-Allow-Origin: ' . $o); header('Vary: Origin'); header('Access-Control-Allow-Headers: Content-Type'); }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') exit;
require __DIR__ . '/prods_lib.php';
$in = json_decode((string)file_get_contents('php://input'), true) ?: []; $tk = (string)($in['t'] ?? ''); $shop = strtolower((string)($in['shop'] ?? ''));
if ($shop !== '' && !preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $shop)) { echo '{"ok":false}'; exit; }
if ($tk === '' || strlen($tk) > 4000) { echo '{"ok":false}'; exit; }
$c = curl_init('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . AT_KEY);
curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode(['idToken' => $tk]), CURLOPT_HTTPHEADER => ['Content-Type: application/json']]);
$r = json_decode((string)curl_exec($c), true);
$mail = strtolower((string)($r['users'][0]['email'] ?? ''));
$admin = $mail === 'admin@araujotechsistemas.com';
if (!$admin) { // dono do local: só os números da própria loja (confere em shopUsers/<uid> com o login dele)
  $uid = (string)($r['users'][0]['localId'] ?? '');
  if ($shop === '' || !preg_match('/^[A-Za-z0-9]{6,64}$/', $uid)) { echo '{"ok":false}'; exit; }
  $c2 = curl_init('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/shopUsers/' . $uid);
  curl_setopt_array($c2, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $tk]]);
  $u = json_decode((string)curl_exec($c2), true);
  if ((string)($u['fields']['shop']['stringValue'] ?? '') !== $shop) { echo '{"ok":false}'; exit; }
}
$tz = new DateTimeZone('America/Asuncion'); $now = new DateTime('now', $tz); $from = (clone $now)->modify('-29 days');
$out = ['ok' => true, 'v' => 0, 'c' => [], 's' => [], 'q' => [], 'vd' => []];
foreach (array_unique([$from->format('Y-m'), $now->format('Y-m')]) as $m) {
  $d = json_decode((string)@file_get_contents(__DIR__ . '/datos/hits-' . $m . '.json'), true); if (!is_array($d)) continue;
  // visitas: conta só os dias dentro dos 30 dias; toques e slider: o mês inteiro (aproximado)
  foreach (($d['vd'] ?? []) as $day => $n) { $dt = $m . '-' . $day; if ($dt >= $from->format('Y-m-d')) $out['v'] += (int)$n; }
  foreach (['c', 's', 'q'] as $k) foreach (($d[$k] ?? []) as $id => $n) $out[$k][$id] = ($out[$k][$id] ?? 0) + (int)$n;
  foreach (($d['vd'] ?? []) as $day => $n) { $dt = $m . '-' . $day; if ($dt >= $from->format('Y-m-d')) $out['vd'][$dt] = (int)$n; }
}
if ($shop !== '') { echo json_encode(['ok' => true, 'shop' => $shop, 'c' => (int)($out['c'][$shop] ?? 0), 's' => (int)($out['s']['c-' . $shop] ?? 0)]); exit; }
if (!$admin) { echo '{"ok":false}'; exit; }
echo json_encode($out);
