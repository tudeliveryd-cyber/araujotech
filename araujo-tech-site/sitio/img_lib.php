<?php
// Busca de fotos de produto para o painel Vitrix (Brave Search API). A chave fica em img_key.php, que é criado na
// publicação a partir do secret BRAVE_KEY do GitHub e nunca entra no repositório.
require_once __DIR__ . '/prods_lib.php';
function img_cors() {
  $o = $_SERVER['HTTP_ORIGIN'] ?? '';
  if (preg_match('#^https://[a-z0-9.-]+(:[0-9]+)?$#i', $o)) { // painéis com domínio próprio também; quem decide é o login
    header('Access-Control-Allow-Origin: ' . $o); header('Vary: Origin'); header('Access-Control-Allow-Headers: Content-Type');
  }
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') exit;
}
function img_key() { $f = __DIR__ . '/img_key.php'; if (!is_file($f)) return ''; $k = include $f; return is_string($k) ? trim($k) : ''; }
function img_out($a, $code = 200) { http_response_code($code); header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); echo json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
// login do Firebase (qualquer conta do painel). Guarda por 10 min para não consultar a cada foto.
function img_uid($tk) {
  if ($tk === '' || strlen($tk) > 4000) return '';
  $cf = sys_get_temp_dir() . '/at_imgtk_' . md5($tk);
  if (is_file($cf) && time() - filemtime($cf) < 600) return (string)@file_get_contents($cf);
  $c = curl_init((getenv('GUIA_ID_BASE') ?: 'https://identitytoolkit.googleapis.com') . '/v1/accounts:lookup?key=' . AT_KEY);
  curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode(['idToken' => $tk]), CURLOPT_HTTPHEADER => ['Content-Type: application/json']]);
  $r = json_decode((string)curl_exec($c), true); $uid = (string)($r['users'][0]['localId'] ?? '');
  if ($uid !== '') @file_put_contents($cf, $uid);
  return $uid;
}
// limites: por conta por dia e no total do mês (o plano grátis da Brave dá cerca de 1.000 buscas por mês)
const IMG_DIA = 80, IMG_MES = 900;
function img_quota($uid, $use) {
  $f = __DIR__ . '/datos/img_quota.json'; $h = @fopen($f, 'c+'); if (!$h) return true; flock($h, LOCK_EX);
  $d = json_decode((string)stream_get_contents($h), true) ?: []; $dia = date('Y-m-d'); $mes = date('Y-m');
  if (($d['m'] ?? '') !== $mes) $d = ['m' => $mes, 'n' => 0, 'd' => []];
  if (($d['dd'] ?? '') !== $dia) { $d['dd'] = $dia; $d['d'] = []; }
  $ok = ($d['n'] ?? 0) < IMG_MES && ($d['d'][$uid] ?? 0) < IMG_DIA;
  if ($ok && $use) { $d['n'] = ($d['n'] ?? 0) + 1; $d['d'][$uid] = ($d['d'][$uid] ?? 0) + 1; ftruncate($h, 0); rewind($h); fwrite($h, json_encode($d)); }
  flock($h, LOCK_UN); fclose($h); return $ok;
}
// só endereços públicos (nunca a rede interna do servidor)
function img_url_ok($u) {
  $p = parse_url($u); if (!$p || !in_array(strtolower($p['scheme'] ?? ''), ['http', 'https'], true) || empty($p['host'])) return false;
  if (isset($p['user']) || isset($p['pass'])) return false;
  $port = $p['port'] ?? null; if ($port !== null && !in_array((int)$port, [80, 443], true) && getenv('IMG_ALLOW_LOCAL') !== '1') return false;
  $ips = @gethostbynamel($p['host']); if (!$ips) return false;
  if (getenv('IMG_ALLOW_LOCAL') === '1') return $ips[0]; // só nos testes locais
  foreach ($ips as $ip) if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) return false;
  return $ips[0];
}
