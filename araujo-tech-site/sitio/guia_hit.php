<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Guía Vitrix: conta visitas da Guía (t=v), toques em negócios (t=c&id=loja) e vezes que um anúncio passou no slider (t=s&id=c-loja|a-banner).
// Guarda só números por mês, sem dados de quem visitou. Os números só o admin vê (guia_stats.php).
header('Content-Type: text/plain; charset=utf-8'); header('Cache-Control: no-store');
$o = $_SERVER['HTTP_ORIGIN'] ?? ''; if ($o !== '' && !preg_match('#^https://(www\.)?araujotechsistemas\.com$#', $o)) { http_response_code(204); exit; }
$ua = strtolower((string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
if ($ua === '' || preg_match('/bot|crawl|spider|headless|lighthouse|preview|facebookexternalhit|whatsapp/', $ua)) { http_response_code(204); exit; }
$t = (string)($_REQUEST['t'] ?? ''); $id = (string)($_REQUEST['id'] ?? ''); if ($t !== 'q') $id = strtolower($id);
if ($t === 'q') { $id = trim(preg_replace('/-+/', '-', preg_replace('/[^a-z0-9ñ]+/u', '-', mb_strtolower($id))), '-'); if (!preg_match('/^[a-zñ][a-z0-9ñ-]{2,23}$/u', $id) || preg_match('/\d{4,}/', $id)) { http_response_code(204); exit; } } // buscas (só palavras curtas, sem números longos)
elseif (!in_array($t, ['v', 'c', 's'], true) || ($t !== 'v' && !preg_match('/^[a-z0-9][a-z0-9-]{1,70}$/', $id))) { http_response_code(204); exit; }
$f = __DIR__ . '/datos/hits-' . (new DateTime('now', new DateTimeZone('America/Asuncion')))->format('Y-m') . '.json';
$h = @fopen($f, 'c+'); if (!$h) { http_response_code(204); exit; }
if (flock($h, LOCK_EX)) {
  $d = json_decode((string)stream_get_contents($h), true); if (!is_array($d)) $d = ['v' => 0, 'c' => [], 's' => []];
  $day = (new DateTime('now', new DateTimeZone('America/Asuncion')))->format('d');
  if ($t === 'v') { $d['v'] = ($d['v'] ?? 0) + 1; $d['vd'][$day] = ($d['vd'][$day] ?? 0) + 1; }
  elseif (count($d[$t] ?? []) < 2000 || isset($d[$t][$id])) $d[$t][$id] = ($d[$t][$id] ?? 0) + 1;
  ftruncate($h, 0); rewind($h); fwrite($h, json_encode($d)); fflush($h); flock($h, LOCK_UN);
}
fclose($h); http_response_code(204);
