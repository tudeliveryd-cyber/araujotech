<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página
// Guía Vitrix: horários e entrega de cada catálogo (para "Abierto ahora" e "Con delivery"). Só leitura do catálogo público.
// guia.php?ids=loja1,loja2  →  {"loja1":{"days":[...],"del":true,"pick":true}}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/prods_lib.php';
$out = [];
$ids = array_slice(array_unique(array_filter(explode(',', (string)($_GET['ids'] ?? '')))), 0, 60);
foreach ($ids as $id) {
  if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id)) continue;
  $s = at_shop_cfg($id);
  if (!$s || ($s['status'] ?? '') === 'suspenso') continue;
  $st = $s['cfg']['store'] ?? [];
  $days = [];
  if (is_array($st['days'] ?? null) && count($st['days']) === 7) foreach ($st['days'] as $d) {
    $days[] = ['on' => ($d['on'] ?? true) !== false, 'a' => array_slice((array)($d['a'] ?? []), 0, 2), 'b' => array_slice((array)($d['b'] ?? []), 0, 2)];
  }
  $out[$id] = ['days' => $days, 'del' => !empty($st['delivery']), 'pick' => !empty($st['pickup']), 'paused' => !empty($st['paused'])];
}
echo json_encode($out ?: new stdClass(), JSON_UNESCAPED_UNICODE);
