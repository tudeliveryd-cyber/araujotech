<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Números da Guía Vitrix para o Panel Araújo Tech (últimos 30 dias). Só o admin: confere o login do Firebase do pedido.
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
$o = $_SERVER['HTTP_ORIGIN'] ?? ''; if (preg_match('#^https://([a-z0-9-]+\.)?araujotechsistemas\.com$#', $o)) { header('Access-Control-Allow-Origin: ' . $o); header('Vary: Origin'); header('Access-Control-Allow-Headers: Content-Type'); }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') exit;
require __DIR__ . '/prods_lib.php';
$tk = (string)((json_decode((string)file_get_contents('php://input'), true) ?: [])['t'] ?? '');
if ($tk === '' || strlen($tk) > 4000) { echo '{"ok":false}'; exit; }
$c = curl_init('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . AT_KEY);
curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode(['idToken' => $tk]), CURLOPT_HTTPHEADER => ['Content-Type: application/json']]);
$r = json_decode((string)curl_exec($c), true);
$mail = strtolower((string)($r['users'][0]['email'] ?? ''));
if ($mail !== 'admin@araujotechsistemas.com') { echo '{"ok":false}'; exit; }
$tz = new DateTimeZone('America/Asuncion'); $now = new DateTime('now', $tz); $from = (clone $now)->modify('-29 days');
$out = ['ok' => true, 'v' => 0, 'c' => [], 's' => []];
foreach (array_unique([$from->format('Y-m'), $now->format('Y-m')]) as $m) {
  $d = json_decode((string)@file_get_contents(__DIR__ . '/datos/hits-' . $m . '.json'), true); if (!is_array($d)) continue;
  // visitas: conta só os dias dentro dos 30 dias; toques e slider: o mês inteiro (aproximado)
  foreach (($d['vd'] ?? []) as $day => $n) { $dt = $m . '-' . $day; if ($dt >= $from->format('Y-m-d')) $out['v'] += (int)$n; }
  foreach (['c', 's'] as $k) foreach (($d[$k] ?? []) as $id => $n) $out[$k][$id] = ($out[$k][$id] ?? 0) + (int)$n;
}
echo json_encode($out);
