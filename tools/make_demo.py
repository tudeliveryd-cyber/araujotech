#!/usr/bin/env python3
"""Gera araujo-tech-site/demo/index.html a partir do catálogo (index.html).

Loja de demonstração fictícia "Casa Brasa", com fotos reais (Unsplash, licença livre),
sempre aberta, sem nuvem (cada visitante vê a sua cópia, salva no próprio navegador).
Rodar de novo sempre que o catálogo mudar: python3 tools/make_demo.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index.html')
OUT = os.path.join(ROOT, 'araujo-tech-site', 'demo', 'index.html')

U = lambda pid, w=800: f"https://images.unsplash.com/{pid}?auto=format&fit=crop&w={w}&q=70"

LOGO_SVG = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'>"
            "<rect width='300' height='200' rx='28' fill='#1C1917'/>"
            "<path d='M150 38c14 18 26 30 26 50a26 26 0 0 1-52 0c0-10 5-18 12-25 0 10 5 16 10 18-4-14 0-30 4-43z' fill='none' stroke='#F97316' stroke-width='7' stroke-linejoin='round'/>"
            "<text x='150' y='150' text-anchor='middle' font-family='Georgia,serif' font-size='34' font-weight='700' fill='#FAF7F2' letter-spacing='4'>CASA BRASA</text>"
            "<text x='150' y='178' text-anchor='middle' font-family='Arial,sans-serif' font-size='13' fill='#F97316' letter-spacing='5'>PARRILLA · BURGERS</text></svg>")

SEED = r"""
<script>
window.TDC_SHOP='casa-brasa';window.TDC_DEMO=true;window.TDC_SEED_V='cb4';
window.TDC_SEED=function(c){
 var P=function(pt,es){return {pt:pt,es:es}};
 var U=function(id,w){return 'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w='+(w||800)+'&q=70'};
 var add=[{id:'add',n:P('Adicionais','Adicionales'),type:'many',req:false,o:[{id:'ovo',n:P('Ovo','Huevo'),p:3000},{id:'qj',n:P('Queijo extra','Queso extra'),p:4000},{id:'bac',n:P('Bacon','Panceta'),p:5000}]}];
 var ponto=[{id:'pt',n:P('Ponto da carne','Punto de la carne'),type:'one',req:true,o:[{id:'j',n:P('Mal passado','Jugoso'),p:0},{id:'a',n:P('Ao ponto','A punto'),p:0},{id:'b',n:P('Bem passado','Bien cocido'),p:0}]}];
 var guar=[{id:'gu',n:P('Acompanhamento','Guarnición'),type:'one',req:true,o:[{id:'pf',n:P('Batata frita','Papas fritas'),p:0},{id:'ar',n:P('Arroz','Arroz'),p:0},{id:'en',n:P('Salada','Ensalada'),p:0}]}];
 var tam=[{id:'tm',n:P('Tamanho','Tamaño'),type:'one',req:true,o:[{id:'m',n:P('Média (6 fatias)','Mediana (6 porciones)'),p:0},{id:'g',n:P('Grande (8 fatias)','Grande (8 porciones)'),p:15000}]}];
 var sabor=[{id:'sb',n:P('Sabor','Sabor'),type:'one',req:true,o:[{id:'c',n:P('Cola','Cola'),p:0},{id:'l',n:P('Laranja','Naranja'),p:0},{id:'li',n:P('Limão','Lima-limón'),p:0}]}];
 var pr=function(id,cat,ptn,esn,ptd,esd,price,photo,o){o=o||{};return {id:id,cat:cat,n:P(ptn,esn),d:P(ptd,esd),price:price,promo:o.promo||0,on:true,feat:!!o.feat,best:!!o.best,photo:U(photo),g:o.g||[]}};
 var s=c.store;
 s.name='Casa Brasa';s.slogan=P('Churrasco, hambúrgueres e pizzas no forno','Parrilla, hamburguesas y pizzas al horno');
 s.logo='__LOGO__';s.cover=U('photo-1644447381290-85358ae625cb',1600);s.coverSet=true;
 s.address='Santa Rita, Alto Paraná';s.whatsapp='595982086171';s.prep=30;s.etaPad=20;s.minOrder=0;s.paused=false;s.allowSched=false;
 s.days=[0,1,2,3,4,5,6].map(function(){return {on:true,a:['10:00','15:00'],b:['18:00','00:00']}});
 s.ads=[];s.instagram='';s.facebook='';
 s.coupons=[{code:'BIENVENIDO10',type:'pct',value:10,min:0,on:true}];
 s.slides=[{title:P('Combo burger + batata','Combo burger + papas'),sub:P('Burger, batata frita e refrigerante por Gs. 48.000','Burger, papas fritas y gaseosa por Gs. 48.000'),pid:'b3',color:'#1C1917',img:U('photo-1560971017-e22e6a4fbefd',1200)},
           {title:P('Sexta da pizza','Viernes de pizza'),sub:P('Pizza grande com preço de média','Pizza grande a precio de mediana'),pid:'z1',color:'#7C2D12',img:U('photo-1716237389720-2c4fdabf0ac0',1200)}];
 c.theme={primary:'#C2410C',secondary:'#1C1917',button:'#1C1917',text:'#1C1917',bg:'#FFFFFF',price:'#C2410C',promo:'#EA580C',highlight:'#F59E0B',card:'#FAF7F2',header:'#1C1917'};
 c.layout=Object.assign({},c.layout,{cards:'list',cat:'chips',featured:true,banner:true});
 c.cats=[{id:'burgers',n:P('Hambúrgueres','Hamburguesas'),i:'burger'},{id:'parrilla',n:P('Churrasco','Parrilla'),i:'meat'},{id:'pizzas',n:P('Pizzas','Pizzas'),i:'pizza'},{id:'acomp',n:P('Porções','Acompañamientos'),i:'fries'},{id:'bebidas',n:P('Bebidas','Bebidas'),i:'cup'},{id:'postres',n:P('Sobremesas','Postres'),i:'cake'}];
 c.products=[
  pr('b1','burgers','Burger clássico','Burger clásico','Pão brioche, carne 180 g, queijo, alface, tomate e molho da casa.','Pan brioche, carne de 180 g, queso, lechuga, tomate y salsa de la casa.',35000,'photo-1553979459-d2229ba7433b',{g:add}),
  pr('b2','burgers','Burger duplo cheddar','Burger doble cheddar','Duas carnes de 150 g, cheddar derretido, cebola caramelizada e bacon.','Dos carnes de 150 g, cheddar derretido, cebolla caramelizada y panceta.',45000,'photo-1542574271-7f3b92e6c821',{promo:39000,feat:true,best:true,g:add}),
  pr('b3','burgers','Combo burger + batata','Combo burger + papas','Burger clássico, batata frita e refrigerante 500 ml.','Burger clásico, papas fritas y gaseosa de 500 ml.',48000,'photo-1560971017-e22e6a4fbefd',{feat:true,g:sabor}),
  pr('p1','parrilla','Bife de chorizo','Bife de chorizo','300 g na brasa, com acompanhamento à escolha.','300 g a la parrilla, con guarnición a elección.',75000,'photo-1600891964092-4316c288032e',{best:true,g:ponto.concat(guar)}),
  pr('p2','parrilla','Churrasco da casa','Asado de la casa','Corte especial assado lentamente, com acompanhamento.','Corte especial asado lentamente, con guarnición.',65000,'photo-1610057098265-05f2bcbedd55',{g:guar}),
  pr('p3','parrilla','Espetinhos com arroz','Brochetas con arroz','Espetinhos de carne com arroz, batata e molho.','Brochetas de carne con arroz, papas y salsa.',52000,'photo-1726947147359-65de4d245979'),
  pr('z1','pizzas','Pizza pepperoni','Pizza pepperoni','Molho de tomate, muçarela e pepperoni.','Salsa de tomate, muzzarella y pepperoni.',60000,'photo-1716237389720-2c4fdabf0ac0',{feat:true,g:tam}),
  pr('z2','pizzas','Pizza da casa','Pizza de la casa','Muçarela, tomate, cebola e azeitonas.','Muzzarella, tomate, cebolla y aceitunas.',55000,'photo-1542282811-943ef1a977c3',{g:tam}),
  pr('a1','acomp','Batata frita','Papas fritas','Porção grande, crocante por fora e macia por dentro.','Porción grande, crocante por fuera y suave por dentro.',15000,'photo-1526230427044-d092040d48dc'),
  pr('a2','acomp','Salada da casa','Ensalada de la casa','Folhas verdes, beterraba, tomate e molho de limão.','Hojas verdes, remolacha, tomate y aderezo de limón.',25000,'photo-1537785713284-0015ce8a145c'),
  pr('d1','bebidas','Limonada natural','Limonada natural','Feita na hora, 500 ml.','Hecha al momento, 500 ml.',12000,'photo-1728777187102-1ed5cd6346d5'),
  pr('d2','bebidas','Refrigerante 500 ml','Gaseosa 500 ml','Bem gelado.','Bien fría.',8000,'photo-1533007716222-4b465613a984',{g:sabor}),
  pr('s1','postres','Brownie com sorvete','Brownie con helado','Brownie de chocolate morno com uma bola de sorvete.','Brownie de chocolate tibio con una bocha de helado.',18000,'photo-1717768024023-73768e73f630')
 ];
 s.upsellCat='bebidas';
 s.loyalty={on:true,every:5,cat:'burgers',prize:P('1 batata frita grátis','1 papas fritas gratis')};
 return c};
</script>
"""


FARM_LOGO_SVG = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'>"
            "<rect width='300' height='200' rx='28' fill='#0B3B36'/>"
            "<path d='M136 36h28v22h22v28h-22v22h-28V86h-22V58h22z' fill='none' stroke='#5EEAD4' stroke-width='7' stroke-linejoin='round'/>"
            "<text x='150' y='152' text-anchor='middle' font-family='Georgia,serif' font-size='32' font-weight='700' fill='#F0FDFA' letter-spacing='3'>VIDA PLENA</text>"
            "<text x='150' y='178' text-anchor='middle' font-family='Arial,sans-serif' font-size='13' fill='#5EEAD4' letter-spacing='6'>FARMACIA</text></svg>")

FARM_SEED = r"""
<script>
window.TDC_SHOP='vida-plena';window.TDC_DEMO=true;window.TDC_SEED_V='vp1';
window.TDC_SEED=function(c){
 var P=function(pt,es){return {pt:pt,es:es}};
 var U=function(id,w){return 'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w='+(w||800)+'&q=70'};
 var pr=function(id,cat,ptn,esn,ptd,esd,price,photo,o){o=o||{};return {id:id,cat:cat,n:P(ptn,esn),d:P(ptd,esd),price:price,promo:o.promo||0,on:true,feat:!!o.feat,best:!!o.best,rx:!!o.rx,photo:U(photo),g:o.g||[]}};
 var talla=[{id:'tl',n:P('Tamanho','Talla'),type:'one',req:true,o:[{id:'p',n:P('P','P'),p:0},{id:'m',n:P('M','M'),p:0},{id:'g',n:P('G','G'),p:0},{id:'xg',n:P('XG','XG'),p:5000}]}];
 var s=c.store;
 s.name='Farmacia Vida Plena';s.slogan=P('Sua saúde em casa, com entrega rápida','Tu salud en casa, con delivery rápido');
 s.logo='__LOGO__';s.cover=U('photo-1580281657529-557a6abb6387',1600);s.coverSet=true;s.ramo='farmacia';
 s.address='Santa Rita, Alto Paraná';s.whatsapp='595982086171';s.prep=15;s.etaPad=20;s.minOrder=0;s.paused=false;s.allowSched=false;
 s.days=[0,1,2,3,4,5,6].map(function(){return {on:true,a:['07:00','22:00'],b:['','']}});
 s.ads=[];s.instagram='';s.facebook='';s.upsellCat='';s.loyalty={on:false,every:10};
 s.coupons=[{code:'SALUD10',type:'pct',value:10,min:0,on:true}];
 s.slides=[{title:P('Semana das vitaminas','Semana de las vitaminas'),sub:P('Vitaminas e suplementos com preço especial','Vitaminas y suplementos con precio especial'),pid:'v1',color:'#0B3B36',img:U('photo-1707129785947-ddc627a8bab9',1200)},
           {title:P('Controle sua pressão em casa','Controlá tu presión en casa'),sub:P('Tensiômetro digital com desconto','Tensiómetro digital con descuento'),pid:'e2',color:'#134E4A',img:U('photo-1615486511484-92e172cc4fe0',1200)}];
 c.theme={primary:'#0F766E',secondary:'#0B3B36',button:'#0B3B36',text:'#0F1F1D',bg:'#FFFFFF',price:'#0F766E',promo:'#16A34A',highlight:'#14B8A6',card:'#F3F8F7',header:'#0B3B36'};
 c.layout=Object.assign({},c.layout,{cards:'list',cat:'chips',featured:true,banner:true});
 c.cats=[{id:'med',n:P('Medicamentos','Medicamentos'),i:'pill'},{id:'vit',n:P('Vitaminas','Vitaminas'),i:'leaf'},{id:'cuid',n:P('Cuidado pessoal','Cuidado personal'),i:'drop'},{id:'bebe',n:P('Bebês','Bebés'),i:'gift'},{id:'aux',n:P('Primeiros socorros','Primeros auxilios'),i:'plus'},{id:'equ',n:P('Aparelhos','Equipos de salud'),i:'monitor'}];
 c.products=[
  pr('m1','med','Paracetamol 500 mg','Paracetamol 500 mg','Caixa com 20 comprimidos. Febre e dor.','Caja de 20 comprimidos. Fiebre y dolor.',12000,'photo-1584308666744-24d5c474f2ae',{best:true}),
  pr('m2','med','Ibuprofeno 400 mg','Ibuprofeno 400 mg','Caixa com 10 comprimidos. Dor e inflamação.','Caja de 10 comprimidos. Dolor e inflamación.',15000,'photo-1762328494465-274a63177884',{promo:12000,feat:true}),
  pr('m3','med','Amoxicilina 500 mg','Amoxicilina 500 mg','Caixa com 21 cápsulas. Antibiótico.','Caja de 21 cápsulas. Antibiótico.',38000,'photo-1587854692152-cbe660dbde88',{rx:true}),
  pr('m4','med','Omeprazol 20 mg','Omeprazol 20 mg','Caixa com 14 cápsulas. Azia e gastrite.','Caja de 14 cápsulas. Acidez y gastritis.',22000,'photo-1607619056574-7b8d3ee536b2'),
  pr('m5','med','Loratadina 10 mg','Loratadina 10 mg','Caixa com 10 comprimidos. Alergias.','Caja de 10 comprimidos. Alergias.',14000,'photo-1512069772995-ec65ed45afd6'),
  pr('m6','med','Losartana 50 mg','Losartán 50 mg','Caixa com 30 comprimidos. Pressão arterial.','Caja de 30 comprimidos. Presión arterial.',35000,'photo-1714642764170-fb950305c397',{rx:true}),
  pr('v1','vit','Vitamina C mastigável','Vitamina C masticable','Frasco com 60 unidades, sabor laranja.','Frasco de 60 unidades, sabor naranja.',45000,'photo-1648139347040-857f024f8da4',{feat:true,promo:39000}),
  pr('v2','vit','Multivitamínico','Multivitamínico','Frasco com 30 cápsulas. Uma por dia.','Frasco de 30 cápsulas. Una por día.',58000,'photo-1562243061-204550d8a2c9'),
  pr('c1','cuid','Álcool em gel 500 ml','Alcohol en gel 500 ml','70%, com dosador.','70%, con dosificador.',18000,'photo-1583947215259-38e31be8751f',{best:true}),
  pr('c2','cuid','Protetor solar FPS 50','Protector solar FPS 50','Uso diário, rosto e corpo.','Uso diario, rostro y cuerpo.',85000,'photo-1598662972299-5408ddb8a3dc'),
  pr('c3','cuid','Creme hidratante 200 g','Crema hidratante 200 g','Pele seca e sensível.','Piel seca y sensible.',48000,'photo-1763503834047-ac85c4105c0b'),
  pr('b1','bebe','Fraldas x 30','Pañales x 30','Pacote com 30 unidades.','Paquete de 30 unidades.',75000,'photo-1695998575483-b215c8b2f619',{g:talla}),
  pr('a1','aux','Kit de primeiros socorros','Botiquín de primeros auxilios','Gaze, esparadrapo, curativos e tesoura.','Gasas, cinta, curitas y tijera.',120000,'photo-1765996796562-ce301df337a0'),
  pr('a2','aux','Curativos x 20','Curitas x 20','Caixa com 20 unidades, tamanhos variados.','Caja de 20 unidades, tamaños surtidos.',8000,'photo-1609840534277-88833ef3ddeb'),
  pr('e1','equ','Termômetro digital','Termómetro digital','Leitura em 60 segundos, com alarme.','Lectura en 60 segundos, con alarma.',35000,'photo-1594790628624-9e563bea851d'),
  pr('e2','equ','Tensiômetro digital de braço','Tensiómetro digital de brazo','Mede pressão e pulsação. Com estojo.','Mide presión y pulso. Con estuche.',280000,'photo-1615486511484-92e172cc4fe0',{feat:true,promo:240000})
 ];
 return c};
</script>
"""


# cópias na raiz do repositório, para links curtos no GitHub Pages
EXTRA = {'demo': ['restaurante'], 'demo-farmacia': ['farmacia']}

def build(seed_tpl, logo_svg, out, title, ogtitle, url, desc):
    s = open(SRC, encoding='utf-8').read()
    import urllib.parse
    logo = logo_svg if logo_svg.startswith('data:') else "data:image/svg+xml," + urllib.parse.quote(logo_svg, safe='')
    seed = seed_tpl.replace('__LOGO__', logo)
    n = 0
    def rep(a, b):
        nonlocal s, n
        if a not in s:
            raise SystemExit('não achei: ' + a[:60])
        s = s.replace(a, b, 1); n += 1
    rep("<script>window.TDC_MODE='catalog'</script>", seed)
    # sempre usa a loja de demonstração (e recomeça quando a demo muda)
    rep("let pub=S.get(K.pub,null)||initCfg(SHOP);",
        "const DVK='tdc_demo_v_'+SHOP;let pub=(window.TDC_SEED&&S.get(DVK,0)!==window.TDC_SEED_V)?null:S.get(K.pub,null);"
        "if(!pub){pub=window.TDC_SEED?window.TDC_SEED(initCfg(SHOP)):initCfg(SHOP);S.set(K.pub,pub);S.set(K.draft,clone(pub));S.set(K.cart,[]);if(window.TDC_SEED)S.set(DVK,window.TDC_SEED_V)}")
    # demo sempre aberta (os links ?prueba= continuam funcionando)
    rep("function openState0(st,now=new Date()){",
        "function openState0(st,now=new Date()){if(window.TDC_DEMO&&!(typeof QS!=='undefined'&&QS.get('prueba')))return{open:true};")
    # login do painel da demo: usuário demo / senha demo (aparece escrito na tela)
    rep("const sh=curShop(),cu=(sh&&sh.user)||(SHOP===FM?'fogaomineiro':''),cp=(sh&&sh.pass)||'';",
        "const sh=curShop(),cu=window.TDC_DEMO?'demo':((sh&&sh.user)||(SHOP===FM?'fogaomineiro':'')),cp=window.TDC_DEMO?'demo':((sh&&sh.pass)||'');")
    rep("<h2>${t('nav_admin')}</h2><p>${esc(st.name)} · ${t('login_sub')}</p></div>",
        "<h2>${t('nav_admin')}</h2><p>${esc(st.name)} · ${t('login_sub')}</p>${window.TDC_DEMO?`<p class=\"demo-hint\">${lang==='pt'?'Demonstração':'Demostración'} · ${lang==='pt'?'Usuário':'Usuario'}: <b>demo</b> · ${lang==='pt'?'Senha':'Contraseña'}: <b>demo</b></p>`:''}</div>")
    # demo: botões para voltar aos exemplos e ao início do site
    rep('<span class="spacer"></span>',
        '<span class="spacer"></span><nav class="dnav">'
        '<a href="/vitrix/#rubros" class="dn" aria-label="Ver más ejemplos" title="Ver más ejemplos"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span class="dn-t" data-es="Ejemplos" data-pt="Exemplos"></span></a>'
        '<a href="/" class="dn" aria-label="Inicio" title="Inicio"><svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg><span class="dn-t" data-es="Inicio" data-pt="Início"></span></a>'
        '<a href="https://wa.me/595982086171" class="dn dq" target="_blank" rel="noopener" onclick="dqGo(this)"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.2A8 8 0 1 1 21 12z"/></svg><span class="dn-t" data-es="Quiero uno así" data-pt="Quero um assim"></span></a></nav>'
        '<script>function dqGo(a){try{if(!(navigator.webdriver&&!window.__clk)){var at="";try{at=localStorage.getItem("at_me")}catch(e){}if(at!=="1"){var d=new Date(),id=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),P="projects/araujotech-catalogos/databases/(default)/documents";fetch("https://firestore.googleapis.com/v1/"+P+":commit?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({writes:[{update:{name:P+"/cliques/"+id,fields:{}},updateMask:{fieldPaths:[]},updateTransforms:[{fieldPath:"demo",increment:{integerValue:"1"}}]}]})}).catch(function(){})}}}catch(e){}try{var pt=(document.documentElement.lang||"").indexOf("pt")===0,n=(document.title.split(" · ")[0]||"").trim(),u=location.host+location.pathname;'
        'a.href="https://wa.me/595982086171?text="+encodeURIComponent(pt?"Olá! Vi a demonstração do Vitrix \u201c"+n+"\u201d ("+u+") e quero um catálogo assim para o meu negócio.":"¡Hola! Vi la demostración de Vitrix \u201c"+n+"\u201d ("+u+") y quiero un catálogo así para mi negocio.")}catch(e){}}'
        'document.addEventListener("DOMContentLoaded",function(){var n=document.querySelector(".dnav"),h=n&&n.parentElement;if(!h||document.querySelector(".dqbar"))return;'
        'h.insertAdjacentHTML("afterend","<div class=\\"dqbar\\"><span class=\\"dqx\\" data-es=\\"Demostración de Vitrix\\" data-pt=\\"Demonstração do Vitrix\\"></span><a href=\\"https://wa.me/595982086171\\" target=\\"_blank\\" rel=\\"noopener\\" onclick=\\"dqGo(this)\\"><svg viewBox=\\"0 0 24 24\\"><path d=\\"M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.2A8 8 0 1 1 21 12z\\"/></svg><span class=\\"dqx\\" data-es=\\"Quiero uno así\\" data-pt=\\"Quero um assim\\"></span></a></div>")})</script>')
    rep("</style>", ".dnav{display:flex;gap:6px}.dn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--line);color:inherit;text-decoration:none;font-size:13.5px;font-weight:600;white-space:nowrap}.dn:hover{background:var(--line)}.dn svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.dn-t::after{content:attr(data-es)}html[lang^=pt] .dn-t::after{content:attr(data-pt)}@media (max-width:520px){.dn{padding:0;width:36px;justify-content:center}.dn-t{display:none}.dnav{gap:4px}}\n</style>")
    rep("</style>", ".dn.dq{background:#8E2DE2;border-color:#8E2DE2;color:#fff}.dn.dq:hover{background:#7410B8}body.v-admin .dn.dq{display:none}.dqbar{display:none}.dqx::after{content:attr(data-es)}html[lang^=pt] .dqx::after{content:attr(data-pt)}@media (max-width:520px){.dn.dq{display:none}.dqbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 16px;background:#F3ECFB;color:#4A0A80;font-size:13px;font-weight:600}.dqbar a{display:inline-flex;align-items:center;gap:6px;background:#8E2DE2;color:#fff;border-radius:999px;padding:7px 12px;text-decoration:none;white-space:nowrap}.dqbar svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}}body.v-admin .dqbar{display:none!important}\n</style>")
    rep("</style>", ".urlpill{display:none!important}.demo-hint{margin:6px 0 0;padding:8px 12px;border-radius:10px;background:#FFF4DE;color:#5C3A00;font-size:13px}\n</style>")
    # dados do <head>
    s = re.sub(r'<title>[^<]*</title>', '<title>' + title + '</title>', s, count=1)
    s = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + ogtitle + '">', s, count=1)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="' + url + '">', s, count=1)
    s = re.sub(r'<meta property="og:image" content="[^"]*">', '<meta property="og:image" content="https://araujotechsistemas.com/img/og.jpg">', s, count=1)
    s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + desc + '">', s, count=1)
    s = re.sub(r'<link rel="manifest"[^>]*>\n?', '', s)
    s = s.replace('<head>', '<head>\n<meta name="robots" content="noindex">', 1)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(s)
    for extra in EXTRA.get(os.path.basename(os.path.dirname(out)), []):
        os.makedirs(os.path.join(ROOT, extra), exist_ok=True)
        open(os.path.join(ROOT, extra, 'index.html'), 'w', encoding='utf-8').write(s)
    print('ok', out, n, 'trocas')

def copiar_admin():
    """Painel da Araújo Tech também em araujotechsistemas.com/admin (mesmo arquivo do Fogão)."""
    import shutil
    dst = os.path.join(ROOT, 'araujo-tech-site', 'admin')
    os.makedirs(dst, exist_ok=True)
    for f in ('index.html', 'favicon.png', 'apple-touch-icon.png'):
        shutil.copyfile(os.path.join(ROOT, 'admin', f), os.path.join(dst, f))
    print('ok admin copiado')
    # Painel do local também em araujotechsistemas.com/painel/?loja=<id>: mesmo domínio do /admin,
    # então o administrador já logado entra direto, sem digitar usuário e senha.
    pd = os.path.join(ROOT, 'araujo-tech-site', 'painel')
    os.makedirs(pd, exist_ok=True)
    h = open(os.path.join(ROOT, 'painel', 'index.html'), encoding='utf-8').read()
    for a, b in (('href="/apple-touch-icon.png"', 'href="/painel/apple-touch-icon.png"'), ('href="/favicon.png"', 'href="/painel/favicon.png"'), ('href="/icon-192.png"', 'href="/painel/icon-192.png"')):
        h = h.replace(a, b)
    open(os.path.join(pd, 'index.html'), 'w', encoding='utf-8').write(h)
    import json
    mf = json.load(open(os.path.join(ROOT, 'painel', 'manifest.json'), encoding='utf-8'))
    mf['name'] = 'Panel del local'; mf['short_name'] = 'Panel'
    for ic in mf.get('icons', []): ic['src'] = '/painel' + ic['src']
    json.dump(mf, open(os.path.join(pd, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for f in ('favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'):
        shutil.copyfile(os.path.join(ROOT, 'admin', f), os.path.join(pd, f))
    print('ok painel copiado')
    # Editor do site também no subdomínio do catálogo: o cliente que está no painel entra direto, sem novo login.
    ed = os.path.join(ROOT, 'sitio', 'editar')
    os.makedirs(ed, exist_ok=True)
    shutil.copyfile(os.path.join(ROOT, 'araujo-tech-site', 'sitio', 'editar', 'index.html'), os.path.join(ed, 'index.html'))

# Demo personalizada para a Casofarma (prospecto): mesmo catálogo de farmácia, com o logo e as cores deles.
def casofarma():
    import base64
    lg = 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(ROOT, 'tools', 'logos', 'casofarma-quad.jpg'), 'rb').read()).decode()
    seed = (FARM_SEED.replace("window.TDC_SHOP='vida-plena'", "window.TDC_SHOP='casofarma'").replace("TDC_SEED_V='vp1'", "TDC_SEED_V='cf2'")
        .replace("s.name='Farmacia Vida Plena';s.slogan=P('Sua saúde em casa, com entrega rápida','Tu salud en casa, con delivery rápido');",
                 "s.name='Casofarma';s.slogan=P('Cuidando da sua saúde!','¡Cuidando de tu salud!');")
        .replace("c.theme={primary:'#0F766E',secondary:'#0B3B36',button:'#0B3B36',text:'#0F1F1D',bg:'#FFFFFF',price:'#0F766E',promo:'#16A34A',highlight:'#14B8A6',card:'#F3F8F7',header:'#0B3B36'};",
                 "c.theme={primary:'#2E43A0',secondary:'#1E2C6E',button:'#2E43A0',text:'#141B3A',bg:'#FFFFFF',price:'#2E43A0',promo:'#D63A2B',highlight:'#D63A2B',card:'#F4F6FC',header:'#1E2C6E'};")
        .replace("color:'#0B3B36',img:U('photo-1707129785947", "color:'#1E2C6E',img:U('photo-1707129785947")
        .replace("color:'#134E4A',img:U('photo-1615486511484", "color:'#B32E22',img:U('photo-1615486511484")
        .replace("code:'SALUD10'", "code:'CASOFARMA10'"))
    assert "s.name='Casofarma'" in seed and "#2E43A0" in seed and 'cf2' in seed
    build(seed, lg, os.path.join(ROOT, 'araujo-tech-site', 'demo-casofarma', 'index.html'),
          'Casofarma · Demostración · Vitrix', 'Casofarma · Catálogo Vitrix',
          'https://araujotechsistemas.com/demo-casofarma/', 'Demostración del catálogo Vitrix de Casofarma: productos, pedidos por WhatsApp y delivery.')

def main():
    copiar_admin()
    build(SEED, LOGO_SVG, OUT, 'Casa Brasa · Demostración · Vitrix', 'Casa Brasa · Catálogo de demostración',
          'https://araujotechsistemas.com/demo/', 'Catálogo de demostración de Vitrix (Araújo Tech): así queda el menú digital de su negocio, con pedidos por WhatsApp.')
    build(FARM_SEED, FARM_LOGO_SVG, os.path.join(ROOT, 'araujo-tech-site', 'demo-farmacia', 'index.html'),
          'Farmacia Vida Plena · Demostración · Vitrix', 'Farmacia Vida Plena · Catálogo de demostración',
          'https://araujotechsistemas.com/demo-farmacia/', 'Catálogo de demostración de Vitrix (Araújo Tech) para farmacias: productos, recetas y delivery por WhatsApp.')

def rubros():
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from demos_rubros import DEMOS, seed_js
    for d in DEMOS:
        build(seed_js(d), d['logo'], os.path.join(ROOT, 'araujo-tech-site', d['folder'], 'index.html'),
              d['title'], d['name'] + ' · Catálogo de demostración',
              'https://araujotechsistemas.com/' + d['folder'] + '/', d['desc'])

if __name__ == '__main__':
    main()
    casofarma()
    rubros()
