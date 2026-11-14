<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página
// Guía Vitrix: horários e entrega de cada catálogo (para "Abierto ahora" e "Con delivery"). Só leitura do catálogo público.
// guia.php?ids=loja1,loja2  →  {"loja1":{"days":[...],"del":true,"pick":true,"cv":capa,"sl":slogan}}
// guia.php?g=1  →  {"ads":[banners pagos no ar hoje],"util":[lugares públicos] ou null,"pros":[profissionais em destaque]}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/prods_lib.php';
if (isset($_GET['g'])) { require __DIR__ . '/guia_lib.php'; echo json_encode(guia_pub(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; } // banners pagos e lugares públicos
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
  $o = ['days' => $days, 'del' => !empty($st['delivery']), 'pick' => !empty($st['pickup']), 'paused' => !empty($st['paused'])];
  // capa e slogan do catálogo (slider da Guía para os clientes Premium e VIP)
  if (preg_match('/^m:([a-z0-9]{2,24})$/', (string)($st['cover'] ?? ''), $m)) $o['cv'] = '/sitio/pimg.php?s=' . rawurlencode($id) . '&k=' . $m[1];
  $sl = $st['slogan'] ?? '';
  if (is_array($sl)) $sl = ['es' => trim((string)($sl['es'] ?? $sl['pt'] ?? '')), 'pt' => trim((string)($sl['pt'] ?? $sl['es'] ?? ''))]; else $sl = trim((string)$sl) === '' ? null : ['es' => trim((string)$sl), 'pt' => trim((string)$sl)];
  if ($sl && ($sl['es'] . $sl['pt']) !== '') $o['sl'] = $sl;
  $out[$id] = $o;
}
echo json_encode($out ?: new stdClass(), JSON_UNESCAPED_UNICODE);
