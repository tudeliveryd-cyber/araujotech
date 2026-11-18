<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Recibe el aviso de "pestaña abierta" de la Guía (guia/on.js). Ver guia_on_lib.php. No devuelve nada.
header('Content-Type: text/plain; charset=utf-8'); header('Cache-Control: no-store');
$o = $_SERVER['HTTP_ORIGIN'] ?? ''; if ($o !== '' && !preg_match('#^https://(www\.)?(araujotechsistemas|guiadesantarita)\.com$#', $o)) { http_response_code(204); exit; }
$ua = strtolower((string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
if ($ua === '' || preg_match('/bot|crawl|spider|headless|lighthouse|preview|facebookexternalhit|whatsapp/', $ua)) { http_response_code(204); exit; }
$s = (string)($_REQUEST['s'] ?? ''); if (!preg_match('/^[a-z0-9]{12}$/', $s)) { http_response_code(204); exit; }
// freno por conexión: muchas personas pueden salir por la misma IP de la operadora, por eso el límite es alto
$rl = sys_get_temp_dir() . '/at_gon_' . md5(($_SERVER['REMOTE_ADDR'] ?? '') . '|' . date('YmdHi'));
$rn = (int)@file_get_contents($rl); if ($rn >= 300) { http_response_code(204); exit; } @file_put_contents($rl, (string)($rn + 1));
if (mt_rand(1, 200) === 1) foreach (glob(sys_get_temp_dir() . '/at_gon_*') ?: [] as $x) if (time() - @filemtime($x) > 300) @unlink($x);
require __DIR__ . '/guia_on_lib.php'; guia_on($s);
http_response_code(204);
