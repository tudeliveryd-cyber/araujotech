#!/usr/bin/env python3
"""Gera araujo-tech-site/guia/llegar/index.html: guia para quem está chegando a Santa Rita (ES/PT).
Só informação nacional conferida em fonte oficial (ver LINKS) e orientação geral; nada de valores, que mudam.
O que é local (endereços, telefones, horários) fica na própria Guía (lugares públicos, profissionais)."""
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'araujo-tech-site', 'guia', 'llegar', 'index.html')
REV = '14/11/2026'
I = lambda p: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'
IC = {
 'doc': '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
 'money': '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.500"/><path d="M6.500 9.500v.01M17.500 14.500v.01"/>',
 'phone': '<rect x="7" y="2.500" width="10" height="19" rx="2.500"/><path d="M11 18.500h2"/>',
 'bolt': '<path d="M13 2 5 13.500h6L10 22l9-12h-6z"/>',
 'health': '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
 'school': '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.500V16c1.500 1.500 3.200 2 5 2s3.500-.5 5-2v-4.500M21 9v6"/>',
 'car': '<path d="M5 16l1.500-5.500A2 2 0 0 1 8.400 9h7.200a2 2 0 0 1 1.900 1.500L19 16"/><rect x="3.500" y="13" width="17" height="5" rx="1.500"/><path d="M7 18v2M17 18v2"/>',
 'home': '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10M10 20v-6h4v6"/>',
 'help': '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0"/><circle cx="17.500" cy="9" r="2.500"/><path d="M16.500 14.200A5 5 0 0 1 21.500 19"/>',
 'ext': '<path d="M14 5h5v5M19 5l-8 8M11 6H6v12h12v-5"/>', 'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>', 'back': '<path d="M15 5l-7 7 7 7"/>',
}
SRC_ES = 'Fuente'; SRC_PT = 'Fonte'
def ext(url, es, pt):
    return ('<a class="src" href="%s" target="_blank" rel="noopener">%s<span data-l="es">%s</span><span data-l="pt">%s</span></a>' % (url, I(IC['ext']), es, pt))
def gl(href, es, pt):
    return ('<a class="go" href="%s"><span data-l="es">%s</span><span data-l="pt">%s</span>%s</a>' % (href, es, pt, I(IC['arrow'])))

T = []
# 1 ------------------------------------------------------------ documentos
T.append(dict(id='documentos', ic='doc', es='Documentos: radicación y cédula', pt='Documentos: radicação e cédula',
 bes='''<p>Para vivir legalmente en Paraguay, el trámite se hace en la <b>Dirección Nacional de Migraciones</b>. Es <b>personal y presencial</b>.</p>
<p><b>Para brasileños (Acuerdo de Residencia del Mercosur):</b> primero se pide la <b>residencia temporal</b>, que dura <b>dos años</b> y no se prorroga. Antes de que venza hay que pedir la <b>residencia permanente</b>, para no perder los derechos migratorios.</p>
<p>Mientras el trámite corre, Migraciones entrega la constancia de <b>residente precario</b>, que permite entrar y salir del país, estudiar y trabajar.</p>
<p><b>Documentos que Migraciones pide por el Mercosur:</b></p>
<ul><li>Documento de identidad vigente del país de origen (RG o pasaporte).</li><li>Certificado de nacimiento.</li><li>Certificado de estado civil, cuando corresponde.</li><li>Antecedentes penales o policiales del país de origen o de residencia.</li><li>Certificado de antecedentes para extranjeros, emitido en Paraguay.</li><li>Constancia de ingreso al país (el sello o registro de entrada).</li><li>Declaración jurada de no tener antecedentes internacionales.</li><li>Documentación que acredite la presencia en el país.</li></ul>
<p class="tip"><b>Importante:</b> los documentos brasileños tienen que estar <b>apostillados o legalizados</b> antes de presentarlos, y traducidos cuando Migraciones lo pida. Conviene apostillar en Brasil, antes de mudarte. Para menores, se piden los documentos de los padres y, si falta uno, autorización notarial.</p>
<p><b>La cédula paraguaya:</b> la expide el <b>Departamento de Identificaciones</b> de la Policía Nacional. Por el Mercosur, la cédula se entrega <b>después de la residencia permanente</b>. Por el régimen general de la Ley 6984/2022, la cédula sale con la residencia temporal y vence junto con ella.</p>
<p class="nt">Presentar los documentos no garantiza la aprobación. Los aranceles cambian: consultá el valor vigente en Migraciones.</p>''',
 bpt='''<p>Para morar legalmente no Paraguai, o trâmite é feito na <b>Dirección Nacional de Migraciones</b>. É <b>pessoal e presencial</b>.</p>
<p><b>Para brasileiros (Acordo de Residência do Mercosul):</b> primeiro se pede a <b>residência temporária</b>, que dura <b>dois anos</b> e não é prorrogada. Antes de vencer, é preciso pedir a <b>residência permanente</b>, para não perder os direitos migratórios.</p>
<p>Enquanto o trâmite anda, a Migraciones entrega o comprovante de <b>residente precário</b>, que permite entrar e sair do país, estudar e trabalhar.</p>
<p><b>Documentos que a Migraciones pede pelo Mercosul:</b></p>
<ul><li>Documento de identidade válido do país de origem (RG ou passaporte).</li><li>Certidão de nascimento.</li><li>Certidão de estado civil, quando for o caso.</li><li>Antecedentes criminais ou policiais do país de origem ou de residência.</li><li>Certificado de antecedentes para estrangeiros, emitido no Paraguai.</li><li>Comprovante de entrada no país (o carimbo ou registro de entrada).</li><li>Declaração juramentada de não ter antecedentes internacionais.</li><li>Documentação que comprove a presença no país.</li></ul>
<p class="tip"><b>Importante:</b> os documentos brasileiros precisam estar <b>apostilados ou legalizados</b> antes de apresentar, e traduzidos quando a Migraciones pedir. Vale a pena apostilar no Brasil, antes de se mudar. Para menores, pedem os documentos dos pais e, se faltar um deles, autorização em cartório.</p>
<p><b>A cédula paraguaia:</b> quem emite é o <b>Departamento de Identificaciones</b> da Polícia Nacional. Pelo Mercosul, a cédula é entregue <b>depois da residência permanente</b>. Pelo regime geral da Lei 6984/2022, a cédula sai com a residência temporária e vence junto com ela.</p>
<p class="nt">Apresentar os documentos não garante a aprovação. As taxas mudam: consulte o valor atual na Migraciones.</p>''',
 links=[ext('https://www.ip.gov.py/ip/?p=580020', 'Agencia IP (gobierno): requisitos de la residencia temporal, 04/05/2026', 'Agencia IP (governo): requisitos da residência temporária, 04/05/2026'),
        ext('https://www.migraciones.gov.py/', 'Dirección Nacional de Migraciones', 'Dirección Nacional de Migraciones'),
        ext('https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones', 'Ley N.º 6984/2022 de Migraciones', 'Lei n.º 6984/2022 de Migrações'),
        gl('/guia/#util', 'Oficinas y teléfonos en Santa Rita útil', 'Escritórios e telefones em Santa Rita útil')]))
# 2 ------------------------------------------------------------ dinheiro
T.append(dict(id='dinero', ic='money', es='Dinero: guaraníes, cambio y banco', pt='Dinheiro: guaranis, câmbio e banco',
 bes='''<p>La moneda es el <b>guaraní</b> (Gs. o ₲). Los precios no llevan centavos y los números son grandes: es normal pagar decenas de miles de guaraníes por una compra chica.</p>
<ul><li><b>Cambio:</b> en la portada de la Guía está el valor de referencia del dólar y del real. En las casas de cambio el valor puede ser distinto: compará antes de cambiar.</li><li><b>Reales y Pix:</b> preguntá en cada comercio antes de comprar. No todos aceptan, y el cambio que usan lo define el comercio.</li><li><b>Cuenta bancaria:</b> cada banco o financiera tiene sus requisitos. En general piden documento de identidad, constancia de residencia o cédula paraguaya y comprobante de domicilio. Consultá directamente en la sucursal.</li><li><b>Factura:</b> pedí siempre la factura legal de tus compras importantes.</li></ul>''',
 bpt='''<p>A moeda é o <b>guarani</b> (Gs. ou ₲). Os preços não têm centavos e os números são grandes: é normal pagar dezenas de milhares de guaranis numa compra pequena.</p>
<ul><li><b>Câmbio:</b> na capa da Guia está o valor de referência do dólar e do real. Nas casas de câmbio o valor pode ser diferente: compare antes de trocar.</li><li><b>Reais e Pix:</b> pergunte em cada comércio antes de comprar. Nem todos aceitam, e a cotação usada é definida pelo comércio.</li><li><b>Conta bancária:</b> cada banco ou financeira tem as suas exigências. Em geral pedem documento de identidade, comprovante de residência migratória ou cédula paraguaia e comprovante de endereço. Consulte direto na agência.</li><li><b>Nota fiscal:</b> peça sempre a "factura legal" das compras importantes.</li></ul>''',
 links=[gl('/guia/#hoy', 'Ver el cambio de referencia de hoy', 'Ver o câmbio de referência de hoje')]))
# 3 ------------------------------------------------------------ celular
T.append(dict(id='celular', ic='phone', es='Celular e internet', pt='Celular e internet',
 bes='''<ul><li>Para tener un número paraguayo comprás un chip prepago de una operadora y lo registrás con tu documento de identidad (pasaporte o RG para extranjeros; llevá el original).</li><li>El código del país es <b>+595</b>. Los celulares empiezan con <b>09</b>: desde el exterior, o en WhatsApp, se escribe +595 9… sin el cero.</li><li>Antes de elegir operadora o internet para tu casa, preguntá a los vecinos cuál tiene mejor señal en tu barrio: cambia mucho de una zona a otra.</li><li>Casi todos los negocios atienden por WhatsApp. En la Guía, cada negocio tiene el botón directo.</li></ul>''',
 bpt='''<ul><li>Para ter um número paraguaio, você compra um chip pré-pago de uma operadora e registra com o seu documento de identidade (passaporte ou RG para estrangeiros; leve o original).</li><li>O código do país é <b>+595</b>. Os celulares começam com <b>09</b>: do exterior, ou no WhatsApp, se escreve +595 9… sem o zero.</li><li>Antes de escolher operadora ou internet para casa, pergunte aos vizinhos qual tem melhor sinal no seu bairro: muda muito de uma zona para outra.</li><li>Quase todos os negócios atendem por WhatsApp. Na Guia, cada negócio tem o botão direto.</li></ul>''',
 links=[]))
# 4 ------------------------------------------------------------ luz e água
T.append(dict(id='luz', ic='bolt', es='Luz y agua', pt='Luz e água',
 bes='''<p>La electricidad es de la <b>ANDE</b> (Administración Nacional de Electricidad), en todo el país.</p>
<ul><li><b>Si alquilás:</b> preguntá a nombre de quién está el medidor y quién paga la factura. Pedí ver la última factura pagada antes de firmar.</li><li><b>Conexión nueva:</b> la solicitud tiene que ir firmada por un <b>electricista matriculado en la ANDE</b>, que hace el cálculo y la instalación. Se declara la potencia, el frente del terreno y la actividad. Después se pagan los derechos de conexión y se espera la instalación; en el interior el plazo puede ser mayor que en Asunción.</li><li><b>Cortes de luz:</b> el teléfono de reclamos de la ANDE es el <b>160</b>.</li><li><b>Agua:</b> depende del barrio. Puede ser de una junta de saneamiento, de una aguatería privada o de pozo propio. Preguntá al propietario quién presta el servicio y cómo se paga.</li></ul>''',
 bpt='''<p>A energia elétrica é da <b>ANDE</b> (Administración Nacional de Electricidad), no país todo.</p>
<ul><li><b>Se você aluga:</b> pergunte em nome de quem está o medidor e quem paga a conta. Peça para ver a última conta paga antes de assinar.</li><li><b>Ligação nova:</b> o pedido precisa ser assinado por um <b>eletricista credenciado na ANDE</b>, que faz o cálculo e a instalação. Declara-se a potência, a frente do terreno e a atividade. Depois se pagam as taxas de ligação e se espera a instalação; no interior o prazo pode ser maior que em Assunção.</li><li><b>Falta de luz:</b> o telefone de reclamações da ANDE é o <b>160</b>.</li><li><b>Água:</b> depende do bairro. Pode ser de uma "junta de saneamiento", de uma empresa privada ("aguatería") ou de poço próprio. Pergunte ao proprietário quem presta o serviço e como se paga.</li></ul>''',
 links=[ext('https://www.ande.gov.py/', 'ANDE', 'ANDE'),
        ext('https://www.abc.com.py/economia/2024/09/22/sepa-cuanto-cuesta-una-nueva-conexion-de-la-ande-para-el-suministro-electrico/', 'ABC Color: cómo es una conexión nueva de la ANDE, 22/09/2024', 'ABC Color: como é uma ligação nova da ANDE, 22/09/2024')]))
# 5 ------------------------------------------------------------ saúde
T.append(dict(id='salud', ic='health', es='Salud y emergencias', pt='Saúde e emergências',
 bes='''<ul><li><b>Emergencias:</b> 911 (Policía), 141 (ambulancia, SEME) y 132 (Bomberos Voluntarios). Están siempre en la Guía.</li><li><b>Salud pública:</b> los hospitales y puestos del Ministerio de Salud Pública atienden a todas las personas.</li><li><b>IPS:</b> el Instituto de Previsión Social atiende a los trabajadores asegurados (con aporte del empleador) y a sus familiares.</li><li><b>Farmacia de turno:</b> la Guía muestra cuál está de turno cuando está cargada.</li><li>Traé de Brasil tus recetas, estudios y la libreta de vacunas de los chicos.</li></ul>''',
 bpt='''<ul><li><b>Emergências:</b> 911 (Polícia), 141 (ambulância, SEME) e 132 (Bombeiros Voluntários). Estão sempre na Guia.</li><li><b>Saúde pública:</b> os hospitais e postos do Ministério de Saúde Pública atendem todas as pessoas.</li><li><b>IPS:</b> o Instituto de Previsión Social atende os trabalhadores segurados (com contribuição do empregador) e seus familiares.</li><li><b>Farmácia de plantão:</b> a Guia mostra qual está de plantão quando está cadastrada.</li><li>Traga do Brasil as suas receitas, exames e a carteira de vacinação das crianças.</li></ul>''',
 links=[gl('/guia/#util', 'Emergencias, hospital y farmacias', 'Emergências, hospital e farmácias'),
        ext('https://www.mspbs.gov.py/', 'Ministerio de Salud Pública', 'Ministério de Saúde Pública'), ext('https://portal.ips.gov.py/', 'IPS', 'IPS')]))
# 6 ------------------------------------------------------------ escola
T.append(dict(id='escuela', ic='school', es='Escuela para tus hijos', pt='Escola para os filhos',
 bes='''<p>Los estudios de primaria y secundaria hechos en Brasil se reconocen en Paraguay por el <b>Protocolo de Integración Educativa del Mercosur</b>. El reconocimiento lo tramita el <b>Ministerio de Educación y Ciencias (MEC)</b>.</p>
<ul><li>Traé de Brasil el <b>histórico escolar</b> y el certificado de estudios de cada hijo, <b>apostillados</b>.</li><li>Traé también el certificado de nacimiento y la libreta de vacunas.</li><li>Hablá primero con la escuela o el colegio donde lo querés inscribir: ellos indican qué papeles presentar y en qué grado entra.</li><li>El año escolar va de <b>febrero a noviembre</b>. Las clases son en español; el guaraní también es materia.</li></ul>''',
 bpt='''<p>Os estudos de ensino fundamental e médio feitos no Brasil são reconhecidos no Paraguai pelo <b>Protocolo de Integração Educativa do Mercosul</b>. O reconhecimento é feito pelo <b>Ministerio de Educación y Ciencias (MEC)</b>.</p>
<ul><li>Traga do Brasil o <b>histórico escolar</b> e o certificado de estudos de cada filho, <b>apostilados</b>.</li><li>Traga também a certidão de nascimento e a carteira de vacinação.</li><li>Fale primeiro com a escola ou colégio onde quer matricular: eles dizem que papéis apresentar e em que série a criança entra.</li><li>O ano letivo vai de <b>fevereiro a novembro</b>. As aulas são em espanhol; o guarani também é matéria.</li></ul>''',
 links=[ext('https://www.mec.gov.py/', 'Ministerio de Educación y Ciencias', 'Ministerio de Educación y Ciencias'),
        ext('https://www.bacn.gov.py/leyes-paraguayas/8573/ley-n-6050-aprueba-el-protocolo-de-integraci-n-educativa-y-reconocimiento-de-cert-ficados-t-tulos-y-estudios-de-nivel-primario-fundamental-b-sico-y-medio-secundario-entre-los-estados-partes-del-mercosur-y-estados-asociados', 'Ley N.º 6050: protocolo educativo del Mercosur', 'Lei n.º 6050: protocolo educativo do Mercosul')]))
# 7 ------------------------------------------------------------ carro
T.append(dict(id='auto', ic='car', es='Auto, moto y licencia', pt='Carro, moto e habilitação',
 bes='''<ul><li><b>Licencia de conducir:</b> en Paraguay la expiden las <b>municipalidades</b>. Si vas a vivir acá, consultá en la Municipalidad de Santa Rita cómo sacar la licencia paraguaya y si tu CNH sirve mientras tanto.</li><li>La Agencia Nacional de Tránsito (ANTSV) exige un <b>certificado de primeros auxilios</b> para la licencia. Los demás requisitos y aranceles los define cada municipio.</li><li><b>Vehículo con chapa brasileña:</b> el tiempo que puede quedarse en el país lo define Aduanas. Averiguá antes de traerlo para quedarte: no es lo mismo entrar como turista que como residente.</li><li>En ruta, llevá siempre documentos del vehículo, licencia, luces bajas encendidas y cinturón. La Patrulla Caminera controla las rutas.</li></ul>''',
 bpt='''<ul><li><b>Habilitação:</b> no Paraguai quem emite são as <b>prefeituras (municipalidades)</b>. Se você vai morar aqui, consulte na Municipalidad de Santa Rita como tirar a habilitação paraguaia e se a sua CNH vale enquanto isso.</li><li>A Agência Nacional de Trânsito (ANTSV) exige um <b>certificado de primeiros socorros</b> para a habilitação. As demais exigências e taxas são definidas por cada município.</li><li><b>Veículo com placa brasileira:</b> o tempo que ele pode ficar no país é definido pela Aduana. Informe-se antes de trazer para ficar: entrar como turista não é o mesmo que entrar como residente.</li><li>Na estrada, leve sempre os documentos do veículo, habilitação, farol baixo aceso e cinto. A Patrulla Caminera fiscaliza as rodovias.</li></ul>''',
 links=[gl('/guia/#util', 'Municipalidad y Patrulla Caminera', 'Municipalidad e Patrulla Caminera'),
        ext('https://www.ultimahora.com/municipios-recuerdan-los-nuevos-requisitos-renovar-registros-n3046346', 'Última Hora: requisitos de las licencias, 31/01/2023', 'Última Hora: exigências das habilitações, 31/01/2023')]))
# 8 ------------------------------------------------------------ moradia
T.append(dict(id='vivienda', ic='home', es='Vivienda y el día a día', pt='Moradia e dia a dia',
 bes='''<ul><li><b>Alquiler:</b> pedí siempre contrato por escrito, con el monto, la fecha de pago, la garantía y quién paga luz y agua. Guardá los recibos.</li><li><b>Idioma:</b> en Santa Rita se habla mucho portugués, pero los trámites, contratos y facturas son en español. La Guía está en los dos idiomas.</li><li><b>Compras:</b> en la Guía ves los negocios por categoría, los que están abiertos ahora y los que hacen delivery.</li><li><b>Feriados:</b> la agenda de la Guía muestra los próximos feriados nacionales. Ese día cierran bancos y oficinas públicas.</li><li><b>Ómnibus:</b> los horarios de la terminal a Ciudad del Este y Encarnación están en Santa Rita útil.</li></ul>''',
 bpt='''<ul><li><b>Aluguel:</b> peça sempre contrato por escrito, com o valor, a data de pagamento, a garantia e quem paga luz e água. Guarde os recibos.</li><li><b>Idioma:</b> em Santa Rita se fala muito português, mas os trâmites, contratos e notas são em espanhol. A Guia está nos dois idiomas.</li><li><b>Compras:</b> na Guia você vê os negócios por categoria, os que estão abertos agora e os que fazem entrega.</li><li><b>Feriados:</b> a agenda da Guia mostra os próximos feriados nacionais. Nesse dia fecham bancos e repartições públicas.</li><li><b>Ônibus:</b> os horários do terminal para Ciudad del Este e Encarnación estão em Santa Rita útil.</li></ul>''',
 links=[gl('/guia/', 'Abrir la Guía de negocios', 'Abrir a Guia de negócios'), gl('/guia/#util', 'Ómnibus y lugares útiles', 'Ônibus e lugares úteis')]))
# 9 ------------------------------------------------------------ ajuda
T.append(dict(id='ayuda', ic='help', es='Quién te puede ayudar', pt='Quem pode te ajudar',
 bes='''<p>Muchos trámites se pueden hacer solo, pero un profesional de la ciudad ahorra viajes y errores:</p>
<ul><li><b>Gestor de documentos:</b> radicación, cédula, antecedentes y apostillas.</li><li><b>Escribano y abogado:</b> contratos, compra de inmuebles y poderes.</li><li><b>Contador:</b> abrir una empresa, RUC y facturación.</li><li><b>Inmobiliaria:</b> alquiler y compra con contrato.</li><li><b>Electricista matriculado en la ANDE:</b> conexión nueva.</li></ul>
<p>En la Guía, la sección <b>Profesionales</b> muestra los que atienden en Santa Rita, con WhatsApp directo. Pedí siempre presupuesto por escrito y recibo de lo que pagás.</p>''',
 bpt='''<p>Muitos trâmites dá para fazer sozinho, mas um profissional da cidade poupa viagens e erros:</p>
<ul><li><b>Gestor de documentos (despachante):</b> radicação, cédula, antecedentes e apostilas.</li><li><b>Escrivão ("escribano") e advogado:</b> contratos, compra de imóveis e procurações.</li><li><b>Contador:</b> abrir empresa, RUC e emissão de notas.</li><li><b>Imobiliária:</b> aluguel e compra com contrato.</li><li><b>Eletricista credenciado na ANDE:</b> ligação nova.</li></ul>
<p>Na Guia, a seção <b>Profissionais</b> mostra os que atendem em Santa Rita, com WhatsApp direto. Peça sempre orçamento por escrito e recibo do que pagar.</p>''',
 links=[gl('/guia/', 'Buscar profesionales en la Guía', 'Buscar profissionais na Guia'), gl('/guia/aparecer/', '¿Sos profesional? Aparecé acá', 'É profissional? Apareça aqui')]))

def sec(i, t):
    return ('<section class="tp" id="%s"><h2><span class="ti">%s</span><span><small>%d</small><span data-l="es">%s</span><span data-l="pt">%s</span></span></h2>'
            '<div data-l="es">%s</div><div data-l="pt">%s</div>%s</section>') % (t['id'], I(IC[t['ic']]), i + 1, t['es'], t['pt'], t['bes'], t['bpt'], ('<p class="lk">' + ''.join(t['links']) + '</p>') if t['links'] else '')
idx = ''.join('<a href="#%s"><span class="ti">%s</span><span data-l="es">%s</span><span data-l="pt">%s</span></a>' % (t['id'], I(IC[t['ic']]), t['es'].split(':')[0], t['pt'].split(':')[0]) for t in T)
HTML = '''<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Recién llegado a Santa Rita: documentos, luz, salud y escuela | Guía Vitrix</title>
<meta name="description" content="Guía paso a paso para quien se muda a Santa Rita, Alto Paraná: radicación y cédula, dinero, celular, luz y agua, salud, escuela, auto y quién te puede ayudar. En español y portugués.">
<link rel="canonical" href="https://araujotechsistemas.com/guia/llegar/">
<meta property="og:title" content="Recién llegado a Santa Rita | Cheguei em Santa Rita"><meta property="og:description" content="Documentos, dinero, luz, salud, escuela y todo lo que necesitás al mudarte a Santa Rita. Em português e espanhol."><meta property="og:image" content="https://araujotechsistemas.com/img/vitrix/og.jpg"><meta property="og:url" content="https://araujotechsistemas.com/guia/llegar/">
<link rel="icon" href="/img/vitrix/vitrix-icono.png?v=4"><meta name="theme-color" content="#24093F">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--purple:#8A12D6;--deep:#4A0A80;--night:#24093F;--lilac:#F3ECFB;--yellow:#FFC21A;--ink:#1A1222;--muted:#5F566B;--line:#E4DAF0;--display:"Red Hat Display",system-ui,sans-serif;--text:"Red Hat Text",system-ui,sans-serif}
*{box-sizing:border-box;margin:0}html{scroll-behavior:smooth}body{font-family:var(--text);color:var(--ink);background:#FBF8FE;line-height:1.6}a{color:var(--deep);font-weight:700}
.wrap{max-width:820px;margin:0 auto;padding:0 20px}
.hdr{background:var(--night);color:#fff}.nav{display:flex;align-items:center;gap:12px;height:64px;max-width:1000px}
.bk{display:inline-flex;align-items:center;gap:6px;text-decoration:none;font-weight:700;font-size:14px;padding:7px 12px 7px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.35);color:#fff}.bk svg{width:18px;height:18px}
.nav img{height:30px;width:auto;display:block}.nav .sp{flex:1}
.lang{display:flex;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:3px}.lang button{font:inherit;font-weight:700;font-size:13px;color:#fff;background:transparent;border:0;border-radius:999px;padding:5px 11px;cursor:pointer}.lang button.on{background:#fff;color:var(--night)}
.hero{background:linear-gradient(180deg,var(--night),#3B0F6B);color:#fff;padding:34px 0 40px}
.hero h1{font-family:var(--display);font-weight:900;font-size:clamp(30px,6vw,46px);line-height:1.05;letter-spacing:-.5px}
.hero p{margin-top:12px;font-size:clamp(16px,2.2vw,19px);color:#E3D3FA;max-width:620px}
.idx{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin:-22px 0 8px}
.idx a{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:11px 12px;text-decoration:none;color:var(--ink);font-size:14.5px;line-height:1.2}
.ti{width:38px;height:38px;border-radius:12px;background:var(--lilac);color:var(--purple);display:flex;align-items:center;justify-content:center;flex:none}.ti svg{width:21px;height:21px}
.warn{background:#FFF8E1;border:1px solid #F3D98A;border-radius:14px;padding:12px 16px;margin-top:18px;font-size:14.5px;color:#4A3A05}
.tp{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px 22px;margin-top:18px;scroll-margin-top:14px}
.tp h2{font-family:var(--display);font-weight:900;font-size:22px;line-height:1.15;display:flex;align-items:center;gap:12px;margin-bottom:8px}.tp h2 small{display:block;font-family:var(--text);font-weight:700;font-size:12.5px;color:var(--muted)}
.tp p,.tp li{font-size:16px}.tp p{margin-top:9px}.tp ul{margin:9px 0 0;padding-left:20px;display:flex;flex-direction:column;gap:7px}
.tip{background:var(--lilac);border-radius:12px;padding:11px 14px}.nt{font-size:14px!important;color:var(--muted)}
.lk{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px!important}
.lk a{display:inline-flex;align-items:center;gap:7px;font-size:14px;text-decoration:none;border-radius:999px;padding:8px 13px;line-height:1.2}.lk svg{width:15px;height:15px;flex:none}
.lk .go{background:var(--night);color:#fff}.lk .src{background:#fff;border:1px solid var(--line);color:var(--deep);font-weight:500}
.cta{background:var(--night);color:#fff;border-radius:20px;padding:22px;margin-top:22px;display:flex;flex-wrap:wrap;align-items:center;gap:14px}.cta div{flex:1 1 260px}.cta b{font-family:var(--display);font-weight:900;font-size:21px;display:block}.cta p{color:#E3D3FA;font-size:15px;margin-top:4px}.cta a{background:var(--yellow);color:var(--night);text-decoration:none;border-radius:14px;padding:13px 18px}
footer{margin-top:36px;padding:22px 0 36px;text-align:center;color:var(--muted);font-size:14px;border-top:1px solid var(--line)}
[data-l=pt]{display:none}html[lang=pt] div[data-l=pt],html[lang=pt] p[data-l=pt]{display:block}html[lang=pt] span[data-l=pt],html[lang=pt] b[data-l=pt],html[lang=pt] a[data-l=pt]{display:inline}html[lang=pt] [data-l=es]{display:none}
@media (max-width:560px){.bk span{display:none}.bk{padding:7px}.tp{padding:18px 16px}.idx{grid-template-columns:1fr 1fr}}
</style>
<script>try{var l=localStorage.getItem('at_lang');if(!l&&/^pt/i.test(navigator.language||''))l='pt';if(l==='pt')document.documentElement.lang='pt'}catch(e){}</script>
</head>
<body>
<header class="hdr"><div class="wrap nav"><a class="bk" href="/guia/" aria-label="Guía Vitrix">__BACK__<span>Guía Vitrix</span></a><span class="sp"></span><div class="lang" role="group" aria-label="Idioma"><button type="button" data-lang="es">ES</button><button type="button" data-lang="pt">PT</button></div><a href="/guia/"><img src="/img/vitrix/vitrix-blanco-nombre.png" alt="Vitrix"></a></div></header>
<section class="hero"><div class="wrap">
<h1><span data-l="es">Recién llegado a Santa Rita</span><span data-l="pt">Cheguei em Santa Rita</span></h1>
<p data-l="es">Lo que necesitás resolver al mudarte: documentos, dinero, luz, salud, escuela y quién te puede ayudar. Paso a paso y con la fuente oficial de cada dato.</p>
<p data-l="pt">O que você precisa resolver ao se mudar: documentos, dinheiro, luz, saúde, escola e quem pode te ajudar. Passo a passo e com a fonte oficial de cada informação.</p>
</div></section>
<main class="wrap">
<nav class="idx" aria-label="Temas">__IDX__</nav>
<p class="warn" data-l="es"><b>Información de orientación, revisada el __REV__.</b> Los requisitos y aranceles cambian: confirmá siempre en el organismo oficial antes de hacer un trámite. La Guía Vitrix no es un organismo público ni hace los trámites.</p>
<p class="warn" data-l="pt"><b>Informação de orientação, revisada em __REV__.</b> As exigências e taxas mudam: confirme sempre no órgão oficial antes de fazer um trâmite. A Guia Vitrix não é órgão público nem faz os trâmites.</p>
__SECS__
<section class="cta"><div><b data-l="es">Todo Santa Rita en un solo lugar</b><b data-l="pt">Toda Santa Rita num só lugar</b><p data-l="es">Negocios, ofertas, farmacia de turno, ómnibus y teléfonos útiles.</p><p data-l="pt">Negócios, ofertas, farmácia de plantão, ônibus e telefones úteis.</p></div><a href="/guia/"><span data-l="es">Abrir la Guía Vitrix</span><span data-l="pt">Abrir a Guia Vitrix</span></a></section>
</main>
<footer><div class="wrap"><span data-l="es">Guía Vitrix · Una iniciativa de</span><span data-l="pt">Guia Vitrix · Uma iniciativa de</span> <a href="/">Araújo Tech Sistemas</a> <span data-l="es">y</span><span data-l="pt">e</span> Tu Delivery · <a href="/guia/terminos/"><span data-l="es">Términos y privacidad</span><span data-l="pt">Termos e privacidade</span></a></div></footer>
<script>(function(){var h=document.documentElement,bs=document.querySelectorAll('.lang button');function set(){bs.forEach(function(b){b.classList.toggle('on',b.dataset.lang===(h.lang==='pt'?'pt':'es'))});document.title=h.lang==='pt'?'Cheguei em Santa Rita: documentos, luz, saúde e escola | Guia Vitrix':'Recién llegado a Santa Rita: documentos, luz, salud y escuela | Guía Vitrix'}bs.forEach(function(b){b.addEventListener('click',function(){h.lang=b.dataset.lang;try{localStorage.setItem('at_lang',b.dataset.lang)}catch(e){}set()})});set();try{if(!navigator.webdriver&&navigator.sendBeacon)navigator.sendBeacon('/sitio/guia_hit.php?t=p&id=llegar')}catch(e){}})();</script>
</body></html>
'''
out = HTML.replace('__BACK__', I(IC['back'])).replace('__IDX__', idx).replace('__REV__', REV).replace('__SECS__', '\n'.join(sec(i, t) for i, t in enumerate(T)))
open(OUT, 'w', encoding='utf-8').write(out)
print('ok', len(out))
