<?php
// "Ahora en la Guía": cada pestaña abierta de la Guía manda un código al azar cada 45 s (guia/on.js -> guia_on.php).
// Se guarda solo código -> hora del último aviso (se borra a los 3 minutos), el pico del día y el máximo por hora de hoy.
// Sin nombre, teléfono ni dirección IP. Lo lee solo el admin (guia_stats.php con on=1).
function guia_on($s = '') {
  $f = __DIR__ . '/datos/online.json'; $h = @fopen($f, 'c+'); if (!$h) return null; $out = null;
  if (flock($h, LOCK_EX)) {
    $d = json_decode((string)stream_get_contents($h), true); if (!is_array($d)) $d = [];
    $now = time(); $dt = new DateTime('now', new DateTimeZone('America/Asuncion')); $day = $dt->format('Y-m-d'); $hr = $dt->format('H');
    $a = is_array($d['a'] ?? null) ? $d['a'] : [];
    foreach ($a as $k => $t) if ($now - (int)$t > 180) unset($a[$k]);
    if ($s !== '' && (isset($a[$s]) || count($a) < 5000)) $a[$s] = $now;
    $n = 0; foreach ($a as $t) if ($now - (int)$t <= 120) $n++; // conectado = avisó en los últimos 2 minutos
    if (($d['day'] ?? '') !== $day) { $d['day'] = $day; $d['pk'] = 0; $d['at'] = ''; $d['h'] = []; }
    if (!is_array($d['h'] ?? null)) $d['h'] = [];
    if ($n > (int)($d['pk'] ?? 0)) { $d['pk'] = $n; $d['at'] = $dt->format('H:i'); }
    if ($n > (int)($d['h'][$hr] ?? 0)) $d['h'][$hr] = $n;
    $d['a'] = (object)$a;
    ftruncate($h, 0); rewind($h); fwrite($h, json_encode($d)); fflush($h); flock($h, LOCK_UN);
    $out = ['n' => $n, 'pk' => (int)$d['pk'], 'at' => (string)$d['at'], 'h' => (object)$d['h']];
  }
  fclose($h); return $out;
}
