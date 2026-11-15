#!/usr/bin/env python3
"""'Días en que aparece' só para comida: em loja (roupa, suplementos…) a opção some do editor e os produtos aparecem todos os dias."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']
for f in FILES:
    s = open(f, encoding='utf-8').read()
    if 'function availDay(p){if(!FOODY())return true;' in s: print(f, 'já tem'); continue
    a = "function availDay(p){return !p||"
    assert s.count(a) == 1, (f, 'availDay')
    s = s.replace(a, "function availDay(p){if(!FOODY())return true;/* dias do produto: só restaurante e comida */return !p||")
    i = s.index("<div class=\"fld\"><span class=\"lbl\">${t('days_l')}</span>")
    j = s.index("${t('days_note')}</span></div>", i) + len("${t('days_note')}</span></div>")
    s = s[:i] + "${FOODY()?`" + s[i:j] + "`:''}" + s[j:]
    open(f, 'w', encoding='utf-8').write(s); print(f, 'ok')
