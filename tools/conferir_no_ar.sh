#!/usr/bin/env bash
# Confere os sites oficiais e as regras do Firebase em produção. SÓ LEITURA: não grava nem altera nada.
# Roda no GitHub Actions (workflow "Conferir no ar"), que tem acesso à internet.
set -u
FALHAS=0
ok(){ echo "OK    | $1"; }
bad(){ echo "FALHA | $1"; FALHAS=$((FALHAS+1)); }
UA="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

echo "== 1. Páginas no ar (status e versão publicada)"
# url | texto que precisa existir na página (prova de que a versão nova está no ar)
while IFS='|' read -r url marca; do
  [ -z "$url" ] && continue
  body=$(mktemp); code=$(curl -sS -L -A "$UA" --compressed --max-time 40 -o "$body" -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  tam=$(wc -c < "$body")
  if [ "$code" != "200" ]; then bad "$url -> HTTP $code"
  elif [ -n "$marca" ] && ! grep -q -- "$marca" "$body"; then bad "$url -> 200, mas SEM a versão nova (falta '$marca')"
  else ok "$url -> 200, ${tam} bytes${marca:+, versão nova confirmada ($marca)}"; fi
  rm -f "$body"
done <<'URLS'
https://araujotechsistemas.com/|syslogo
https://araujotechsistemas.com/vitrix/|pbBind
https://araujotechsistemas.com/catalogo-digital/|vitrix
https://araujotechsistemas.com/img/vitrix/vitrix-blanco.png|
https://araujotechsistemas.com/trabaja/|
https://araujotechsistemas.com/demo/|vxMark
https://araujotechsistemas.com/demo-farmacia/|q_none
https://araujotechsistemas.com/demo-agenda/|badPhone
https://araujotechsistemas.com/admin/|weakfix
https://araujotechsistemas.com/painel/|forceMc
https://araujotechsistemas.com/licencia.js|
https://araujotechsistemas.com/sitemap.xml|
https://fogaomineiro.araujotechsistemas.com/|vxMark
https://fogaomineiro.araujotechsistemas.com/painel/|forceMc
https://teste.araujotechsistemas.com/|forceMc
https://teste.araujotechsistemas.com/agenda/|badPhone
https://teste.araujotechsistemas.com/agenda/gestion.html|forceMc
https://barberialoli.araujotechsistemas.com/reservas.html|badPhone
https://barberialoli.araujotechsistemas.com/gestion.html|forceMc
https://meupulpito.com/|
https://meupulpito.com/app/|
https://tudeliveryd-cyber.github.io/Caj-Entrega/|
URLS

echo; echo "== 2. Cabeçalhos (compressão, cache, segurança) e certificado"
for url in https://araujotechsistemas.com/ https://araujotechsistemas.com/img/logo-completo.png https://fogaomineiro.araujotechsistemas.com/ https://barberialoli.araujotechsistemas.com/reservas.html https://meupulpito.com/; do
  h=$(curl -sS -I -L -A "$UA" -H 'Accept-Encoding: gzip, br' --max-time 30 "$url" 2>/dev/null | tr -d '\r')
  g(){ echo "$h" | grep -i "^$1:" | tail -1 | cut -d' ' -f2- ; }
  echo "INFO  | $url | compressão: $(g content-encoding || true) | cache: $(g cache-control || true) | nosniff: $(g x-content-type-options || true) | servidor: $(g server || true)"
done
for host in araujotechsistemas.com fogaomineiro.araujotechsistemas.com barberialoli.araujotechsistemas.com meupulpito.com; do
  fim=$(echo | openssl s_client -servername "$host" -connect "$host:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  if [ -z "$fim" ]; then bad "certificado de $host não pôde ser lido"; else
    dias=$(( ( $(date -d "$fim" +%s) - $(date +%s) ) / 86400 ))
    if [ "$dias" -lt 15 ]; then bad "certificado de $host vence em $dias dias"; else ok "certificado de $host válido por mais $dias dias"; fi; fi
done

echo; echo "== 3. Firebase real (araujotech-catalogos): o que é público abre, o que é privado fica fechado"
K="AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U"; B="https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents"
probe(){ # caminho | esperado | descrição
  pb=$(mktemp); code=$(curl -sS -g --max-time 30 -o "$pb" -w '%{http_code}' "$B/$1?key=$K&pageSize=1" 2>/dev/null || echo 000)
  if [ "$code" = "$2" ]; then ok "$3 -> HTTP $code (esperado)"
  else msg=$(tr -d '\n' < "$pb" | grep -o '"message": *"[^"]*"' | head -1 | cut -d'"' -f4 | cut -c1-160)
    if [ "$code" = "429" ]; then bad "$3 -> HTTP 429: o Firebase recusou por limite/cota (os dados continuam fechados). Motivo: ${msg:-sem detalhe}"
    else bad "$3 -> HTTP $code (esperado $2)${msg:+. Motivo: $msg}"; fi; fi; rm -f "$pb"; }
probe "shops/fogao-mineiro" 200 "catálogo público do Fogão Mineiro (leitura sem login)"
probe "licencias/_lz" 200 "contador da promoção de lançamento (público)"
probe "shops/fogao-mineiro/orders" 403 "pedidos dos clientes sem login"
probe "shops/fogao-mineiro/priv/main" 403 "custos privados do dono sem login"
probe "billing" 403 "cobranças e acessos dos clientes sem login"
probe "platform/main" 403 "dados do admin sem login"
probe "shopUsers" 403 "lista de usuários das lojas sem login"
probe "agendaUsers" 403 "lista de usuários das agendas sem login"
probe "agendas/loli/state" 403 "dados internos da Agenda (clientes, caixa) sem login"
probe "agendas/loli/reservas" 403 "reservas recebidas sem login"
probe "cliques" 403 "contatos pelo WhatsApp (só o admin lê) sem login"
# v13 no ar: visitante consegue somar 1 no contador de contatos (dia fixo de teste, fora dos últimos 30 dias do painel)
cc=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -X POST "${B%/documents}/documents:commit?key=$K" \
  -d '{"writes":[{"update":{"name":"projects/araujotech-catalogos/databases/(default)/documents/cliques/2000-01-01","fields":{}},"updateMask":{"fieldPaths":[]},"updateTransforms":[{"fieldPath":"wa","increment":{"integerValue":"1"}}]}]}' 2>/dev/null || echo 000)
if [ "$cc" = "200" ]; then ok "regras v13 no ar: contador de contatos aceita +1 -> HTTP $cc"; else bad "regras v13: contador de contatos -> HTTP $cc (esperado 200; a v13 foi publicada?)"; fi
cx=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -X PATCH "$B/cliques/2000-01-01?key=$K" -d '{"fields":{"wa":{"integerValue":"999"}}}' 2>/dev/null || echo 000)
if [ "$cx" = "403" ]; then ok "regras v13: ninguém troca o número do contador -> HTTP $cx (esperado)"; else bad "regras v13: trocar o contador -> HTTP $cx (esperado 403)"; fi
probe "visitas" 403 "contador de visitas sem login"

echo; echo "== 4. Firebase do Meu Púlpito (projeto meu-pulpito-app): dados privados fechados"
K="AIzaSyAuOBVdU5-bcFuaVEsGv4iK8H2krFU9Un8"; B="https://firestore.googleapis.com/v1/projects/meu-pulpito-app/databases/(default)/documents"
probe "pulpito" 403 "sermões dos pastores sem login"
probe "planos" 403 "planos dos usuários do Meu Púlpito sem login"
probe "config/app" 200 "configuração pública do app (planos e avisos), leitura sem login"
probe "suporte" 403 "mensagens de suporte sem login"

echo; echo "== 5. Firebase da Tu Delivery (Caja de Entregas, projeto tu-delivery-1eb61): dados privados fechados"
K="AIzaSyAIF3GBWko0C8S5xuvxG9ufPZXizAjDwCs"; B="https://firestore.googleapis.com/v1/projects/tu-delivery-1eb61/databases/(default)/documents"
probe "turnos" 403 "cadastro dos deliverys sem login"
probe "empresa" 403 "dados da empresa (Caja) sem login"
probe "config/roles" 403 "papéis de administrador sem login"
probe "liq" 403 "liquidações dos deliverys sem login"

echo; echo "== 6. Peso real da página do catálogo (o que o celular baixa de fato)"
for url in https://fogaomineiro.araujotechsistemas.com/ https://teste.araujotechsistemas.com/ https://araujotechsistemas.com/demo/; do
  hd=$(mktemp)
  cru=$(curl -sS -L -A "$UA" --max-time 40 -o /dev/null -w '%{size_download}' "$url" 2>/dev/null || echo 0)
  cmp=$(curl -sS -L -A "$UA" -H 'Accept-Encoding: br, gzip' --max-time 40 -D "$hd" -o /dev/null -w '%{size_download}' "$url" 2>/dev/null || echo 0)
  enc=$(tr -d '\r' < "$hd" | grep -i '^content-encoding:' | tail -1 | cut -d' ' -f2)
  etag=$(tr -d '\r' < "$hd" | grep -i '^etag:' | tail -1 | cut -d' ' -f2-); lm=$(tr -d '\r' < "$hd" | grep -i '^last-modified:' | tail -1 | cut -d' ' -f2-)
  rev=000
  [ -n "$etag" ] && rev=$(curl -sS -A "$UA" -H 'Accept-Encoding: br, gzip' -H "If-None-Match: $etag" --max-time 30 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  [ "$rev" != "304" ] && [ -n "$lm" ] && rev=$(curl -sS -A "$UA" -H 'Accept-Encoding: br, gzip' -H "If-Modified-Since: $lm" --max-time 30 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  kb=$((cmp/1024)); echo "INFO  | $url -> ${cru} bytes sem compressão, ${cmp} bytes transferidos (${enc:-sem compressão}); segunda visita: HTTP $rev"
  if [ "$cmp" -gt 0 ] && [ "$cmp" -le 409600 ]; then ok "$url -> primeira visita baixa ${kb} KB (alarme de crescimento em 400 KB)"; else bad "$url -> primeira visita baixa ${kb} KB (passou de 400 KB: a página cresceu)"; fi
  if [ "$rev" = "304" ]; then ok "$url -> na segunda visita o servidor responde 304 (não baixa de novo)"; else echo "INFO  | $url -> segunda visita não devolveu 304 (HTTP $rev): a página é baixada de novo, comprimida"; fi
  rm -f "$hd"
done

echo; echo "== RESULTADO: $FALHAS falha(s)"
[ "$FALHAS" = "0" ]
