#!/usr/bin/env bash
# uso: tools/e2e/run.sh <script.js> [arquivo de regras] [projeto]
cd "$(dirname "$0")/../../firebase"
export TZ="America/Asuncion" # o navegador dos testes usa a hora do Paraguai; o Node precisa da mesma data (no CI, em UTC, das 21h às 24h do Paraguai a data já era a do dia seguinte)
export RULES="${2:-firestore.rules}"; PROJ="${3:-araujotech-catalogos}"
# regras de outro repositório: copia para cá (o emulador só lê dentro da pasta do projeto)
if [ -n "${RULES_SRC:-}" ]; then cp "$RULES_SRC" "_externas.rules"; RULES="_externas.rules"; fi
printf '{"firestore":{"rules":"%s"},"emulators":{"firestore":{"port":8080,"host":"127.0.0.1"},"auth":{"port":9099,"host":"127.0.0.1"},"ui":{"enabled":false},"singleProjectMode":true}}' "$RULES" > firebase.json
FB="${FIREBASE_BIN:-/home/claude/emu/pkg/ft/node_modules/.bin/firebase}"
"$FB" emulators:exec --project "$PROJ" --only firestore,auth "node ../tools/e2e/$1" 2>&1 | grep -v "^Picked up\|logging:\|^i  \|^✔  \|^⚠  \|MetadataLookupWarning\|trace-warnings"
exit ${PIPESTATUS[0]}
