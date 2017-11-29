# MultiformTextEditor
The plugin <em>JavaScript/jQuery</em> <span style="color: #7a4120;"><em><strong>MultiformTextEditor</strong></em></span> is  highly flexible, designed for rich editing <strong><em>WYSIWYG</em></strong> (interfaces that allow the user to see something very similar to the final result) of text on the web, with the distinction of being moldable to the level of their own methods and controls assembly so that the developers redesign the code according to their needs and a wide range - from a simple set of controls (bold, italics, underline, superscript, listing, etc) for basic formatting or <em>inline</em>, to a whole vast range of formats, inserts and possible stylizations by the options menu.
<em><img class=" size-full wp-image-3199 aligncenter" src="https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt1.jpg" alt="prtflo_modulo_PluginFormatTxt1" width="715" height="51" /></em>

Made to be used by other programmers and receive contributions from the <em>JavaScript</em> developer community. If you are one of them, contribute, and if you are a Portuguese-speaker help us to translate the code into English.

Focado em programadores com experiência em <strong><em>JavaScript & jQuery</em></strong>, o objetivo do plugin, além de ser limpo e muito leve, é ser uma forma de editar texto em um gral de customização que se permita adicionar qualquer tipo de formatação e inserção sem a necessidade de alterar a base e padrões do plugin (mas pronto para isso também e podendo servir de base para outros plugins) e permitindo usar qualquer estrutura <em>HTML</em> nos controles, botões e estilização que se queira ao montar o menu de edição. Para isso, necessita-se de algum padrão de configuração de rótulos a ser seguido, no nome das classes e uso de atributos de dados nos elementos principais, são eles:
<ul>
	<li><span style="color: #808000;"><strong>frmttxt-mn-it</strong></span> para cada item de formatação, com o atributo <span style="color: #808000;"><strong>data-frmt="*"</strong></span> para o tipo de formatação e opcionalmente <span style="color: #808000;"><strong>data-val="*"</strong></span>;</li>
	<li><strong><span style="color: #808000;">frmttxt-mn-gp</span></strong> para grupo de itens de formatação e um elemento filho com a classe <span style="color: #808000;"><strong>frmttxt-mn-drpdn</strong></span> para servir de invólucro dos itens;</li>
	<li><span style="color: #808000;"><strong>frmttxt-mn-mp</strong></span> para manipuladores de outros elementos e dados antes e durante as formatações, com o atributo <span style="color: #808000;"><strong>data-mnpl="*"</strong></span> para o nome do método</li>
</ul>
Cada item de formatação terá a classe <strong>frmttxt-mn-it</strong> e nele o atributo <strong>data-frmt="*"</strong> possuirá o mesmo rótulo da formatação escolhida, referenciada no objeto <strong>datafrmt_obj</strong> (explicado mais à frente), opcionalmente podendo-se usar <strong>data-val="*"</strong> para quando se quer passar valor à formatação, embora seja possível passar valor de diferentes formas. Elementos que listam um grupo de itens de formatação (como uma paleta de cores, em que cada cor é um elemento "frmttxt-mn-it") terá a classe <strong>frmttxt-mn-gp</strong>, que quando clicado exibirá seu filho com a classe <strong>frmttxt-mn-drpdn</strong> que é quem possui o conjunto de itens de formatação. Se um elemento em algum lugar no menu for necessário para manipular elementos e dados antes e durante as formatações (como dois elementos para o usuário selecionar se quer aplicar cor ao texto ou fundo), deve-se setar a classe <strong>frmttxt-mn-mp</strong> e o atributo <strong>data-mnpl="*"</strong> com o nome do método criado no objeto <strong>datamnpl_obj</strong> (deve ser diferente dos nomes de "datafrmt_obj"). Veja a explicação dos objetos "datafrmt_obj" e "datamnpl_obj" ao final. Ambos podem ser editados pelo programador para se alterar os padrões de formatação já disponíveis.
* Como caixa de texto deve-se usar um elemento <strong>não-input</strong> com o atributo <span style="color: #808000;"><strong>contenteditable</strong><strong>="true"</strong></span>

Veja um exemplo simples de estruturação <em>HTML</em> para um menu de controles e a caixa de texto editável:

[code language="html"]
<div id="menu-edit unselectable">
    <b class="frmttxt-mn-it" data-frmt="ngrto">B</b>
    <i class="frmttxt-mn-it" data-frmt="itlco">i</i>
    <u class="frmttxt-mn-it" data-frmt="sblnhdo" data-val="underline">U</u>
<div class="frmttxt-mn-gp texto-cor">
<span>✽</span>
<div class="frmttxt-mn-drpdn d-nn">
            <span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(255, 255, 255)" style="background: #FFFFFF;"></span><span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(247, 218, 100)" style="background: #F7DA64;"></span>
            <span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(0, 168, 133)" style="background: #00A885;"></span><span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(128, 110, 128)" style="background: #806E80;"></span>
            <span class="frmttxt-mn-it rmv" data-frmt="txtcor" data-val="#888888" style="background: #F1F1F1;">×</span><!-- Usado como remoção de cor de texto ou fundo -->
<div class="frmttxt-mn-mp" data-mnpl="txtcortp">
                <input id="tipo-cor1" type="radio" name="tipo-cor" value="1" checked><label for="tipo-cor1">Texto</label>
                <input id="tipo-cor2" type="radio" name="tipo-cor" value="2"><label for="tipo-cor2">Fundo</label>
</div>
</div>
</div>
<span class="frmttxt-mn-it limpa-frmt" data-frmt="lmpfrmt"> </span>
</div>
<div id="box-txt" contenteditable="true" placeholder="Digite o texto"></div>
[/code]

É necessário incluir na <em>index</em> do site a biblioteca <strong><em>jQuery</em></strong> (versão mínima 2.0) e o plugin <span style="color: #7a4120;"><em><strong>MultiformTextEditor</strong></em></span>:

[code language="html" gutter="false"]
<script src="/path/to/jquery.multiform-text-editor.js"</script>
[/code]

As páginas então estarão prontas para receber aplicações de montagem dos menus para as caixas de edição especificadas, via jQuery; assim:

<strong>$(<span style="color: #808000;">menu-element</span>).<span style="color: #807482;">formatTxt</span>(<span style="color: #808000;">$(box-element)</span>|<span style="color: #808000;">function()</span>[,<span style="color: #808000;"> datafrmt_obj</span>, <span style="color: #808000;">datamnpl_obj</span>, <span style="color: #808000;">callback(</span></strong><span style="color: #808000;">$bxelmt, slc_obj, exec</span><strong><span style="color: #808000;">)</span>]);</strong>

<strong>
Descrição
</strong>

<hr />

<strong><span style="color: #808000;">menu-element</span></strong>: Id/classe do envólucro dos controles do menu de edição. Se for uma classe representando múltiplos elementos, o parâmetro <span style="color: #808000;">box-element</span> precisa ser uma função para retorno da caixa de edição específica de cada menu.
<strong><span style="color: #808000;">box-element|function()</span></strong>: Elemento <em>jQuery</em> especificando a caixa de edição de conteúdo | Função para retorno personalizado da caixa de edição e em cujo escopo o valor de <strong>this</strong> refere-se ao atual elemento <em>jQuery</em> do menu.
<strong><span style="color: #808000;">datafrmt_obj </span></strong><span style="color: #808000;">(opcional)</span>: Objeto para inclusão de formatos extras conforme o padrão e possibilidades demonstrados no corpo do plugin:
<span style="color: #808000;">{bold: {tp:"bold", tg:["B", "STRONG"]}, itlco: {tp:"italic", tg:["I", "EM"]}, color: {...}, ...}</span>
<strong><span style="color: #808000;">datamnpl_obj </span></strong><span style="color: #808000;">(opcional)</span>: Objeto para eventos extras do menu com métodos para anexar manipulações ao fluxo principal de formatações, conforme o padrão e possibilidades demonstrados no corpo do plugin:
<span style="color: #808000;">{colortype: function(mnmp, slc){ ... }}
<strong>callback(</strong>$bxelmt, slc_obj, exec<strong>)</strong></span>: Se definida, a função é chamada após qualquer formatação no conteúdo. O <strong>this</strong> no escopo da função é o item/$(elemento) clicado no menu. Parâmetros:
<span style="color: #808000;">    $bxelmt</span>: elemento <em>jQuery</em> da caixa editável;
<span style="color: #808000;">    slc_obj</span>: objeto de dados da seleção/posicionamento atual no conteúdo ({rng: range-obj, elmt: slctd-elmnt, tag: slctd_tag, txt: slctd_txt});
<span style="color: #808000;">    exec</span>: true/false informando se a formatação aplicada foi suportada no browser atual<span style="color: #808000;">
</span>

<strong>
Exemplo 1
</strong>

<hr />

[code language="javascript"]
$("#menu-edit").formatTxt($("#box-txt"));
[/code]

<strong>
Exemplo 2
</strong>

<hr />

[code language="javascript"]
$("#menu-edit").formatTxt($("#box-txt"), {blckqte: {tg:["BLOCKQUOTE"], vltgc: function(mnit, slc){
    return " "+(slc.txt || "...")+" ";
}}});
[/code]

- Acrescentou um objeto com uma nova formatação para criação de bloco de citação.

<strong>
Exemplo 3
</strong>

<hr />

[code language="javascript"]
$(".menu-edit").formatTxt(function(){
    return $(this).parent().find(".box-txt")}
);
[/code]

<strong>
Exemplo 4</strong>

<hr />

[code language="javascript"]
$("#menu-edit").formatTxt($("#box-txt"), null, null, function(cx, slc, exc){
    cx.keyup();
    exc == false ? alert("Formatação não suportada por este navegador") : null;
});
[/code]

- Uma função é passada como último parâmetro para executar algo após qualquer alteração na caixa de texto.

<strong>
Execução e formatações predefinidas</strong>

<hr />

O método construtor <span style="color: #807482;"><strong>formatTxt()</strong></span> do plugin, busca os elementos com as classes padrão e prepara os eventos dos itens do menu e a caixa de edição para destaque, detecção e aplicação dos formatos e montagens. Usa o objeto predefinido <strong>datafrmt_obj </strong>(mais o objeto de formatações personalizadas, se informado) para aplicação de edições por diversas possibilidades de formatação, incluindo o uso do método <strong>execCommand(comando, ShowDefaultUI(false), valor(opcional))</strong>, que permite executar comandos de formatação padrões para editar o conteúdo selecionado ou no local posicionado.

<img class=" size-full wp-image-3200 aligncenter" src="https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt2.jpg" alt="prtflo_modulo_PluginFormatTxt2" width="718" height="215" />

O exemplo acima foi montado já usando os rótulos (classes e atributos de dados) das formatações pré-criadas para <strong>negrito</strong>, <strong>itálico</strong>, <strong>sublinhado</strong>,<strong> riscado</strong>, <strong>sobrelinhado</strong> (overline), <strong>sobrescrito</strong>, <strong>subscrito</strong>, <strong>inserção</strong> de caracteres, <strong>listagens</strong>, <strong>tamanho</strong> da fonte, <strong>cor</strong> de texto e fundo, adição/remoção de <strong>link</strong> e <strong>limpeza-de-formatação</strong>.

[gallery ids="3203,3204,3205,3206,3208,3209" type="square"]
<strong>Formatações personalizadas com "datafrmt_obj"
</strong>

<hr />

Com a opção de adição de um objeto de formatações personalizadas e um de manipulações extras, é possível, por exemplo, adicionar uma lista de formas em SVG (retângulo, losango, elipse, etc.) para serem inseridos no texto, algo que não é padrão dos plugins de edição, ou mesmo um item para aplicar um conjunto de estilos css ao texto selecionado por meio de uma classe pré-criada no css da página. O programador deverá seguir os padrões do objeto <strong>datafrmt_obj</strong> para adicionar propriedades e métodos para formatar, manipular e inserir na caixa editável, podendo reescrever os dados padrões, seus rótulos e valores.

Ainda no exemplo acima o programador poderá, antes de aplicar o <span style="color: #807482;"><strong>formatTxt()</strong></span>, alterar dados das formatações padrões como o <strong>sublinhado </strong>("sblnhdo"), por exemplo, mudando a forma como texto terá um traço inferior (aplicando um estilo com atributo "text-decoration", por exemplo) e colocando <strong>data-val="underline"</strong> no html do item no menu:

[code language="javascript"]
$.fn.formatTxt.datafrmt_obj.sblnhdo = {tg:[{nm:null, atr:"style", ext:"text-decoration"}], vlatr: function(mnit, slc){
    return ["style", "text-decoration"];
}};
[/code]

Também seria possível passar o mesmo objeto de formatação para sublinhado como parâmetro na aplicação de <span style="color: #807482;"><strong>formatTxt()</strong></span> e usando o mesmo nome da formatação padrão ("sblnhdo") para que seja sobrescrita.

[code language="javascript"]
$("#menu-edit").formatTxt($("#box-txt"), {sblnhdo: {tg:[{nm:null, atr:"style", ext:"text-decoration"}], vlatr: function(mnit, slc){
    return ["style", "text-decoration"];
}}});
[/code]

<strong>
Manipulações extras com "datamnpl_obj"
</strong>

<hr />

Para eventos extras do menu pode-se usar o objeto <strong>datamnpl_obj</strong> de métodos para anexar manipulações ao fluxo principal de formatações e independente delas. Ex.: a formatação de cor necessita de um manipulador para alterar o valor de destaque (dstq:{atr:"style", ext:"color"}) entre cor do texto ("color") e cor do fundo ("background-color") verificando qual foi selecionado pelo usuário. Na aplicação de <span style="color: #807482;"><strong>formatTxt()</strong></span> ao menu de edição, deve-se passar o objeto com um ou mais manipuladores, como terceiro parâmetro. Os nomes/rótulos dos métodos devem ser diferentes dos nomes de propriedade em "datafrmt_obj" uma vez que na aplicação eles são unidos num só objeto, permitindo manipulação de todos os dados. O uso de <strong>this</strong> nos métodos refere-se ao objeto pai <strong>dados_obj</strong> criado na aplicação.

[code language="javascript"]
$("#menu-edit").formatTxt($("#box-txt"), null, {txtcortp: function(mnmp, slc){//Para cores
    var chk = $(mnmp).children("input:checked").val();//opção selecionada pelo usuário
    this.txtcor.tg[0].ext = (chk == "1" ? "color" : "background-color");//altera o valor de comparação para destaque
    $(mnmp).parents(".frmttxt-mn-drpdn").find(".frmttxt-mn-it.rmv").attr("data-val", (chk == "1" ? "#888888" : "inherit"));//altera o valor usado no item que simula remoção de cor, usando a cor padrão para cor de texto e "inherit" para cor de fundo
}});
[/code]

<strong>Eventos na caixa de edição
</strong>

<hr />

Outros eventos na aplicação são prontamente preparados na caixa de edição de conteúdo como:
<ul>
	<li>Ao selecionar texto ou posicionar o cursor (por mouse ou teclado) detecta as formatações (tags) já aplicadas para destacar os itens no menu:</li>
</ul>
[gallery ids="3201,3207,3210" type="columns"]
<ul>
	<li>Limpa formatação ao usuário colar texto por mouse ou teclado. Verifica se existe dados de cópia na memória e reinsere sem formatação;</li>
	<li>Ao usuário teclar <strong>tab</strong>, insere os códigos de espaço equivalentes no html, sem deixar perder o foco</li>
</ul>
<strong>Destroy
</strong>

<hr />

O método <strong>destroy($(menu-element))</strong> mata as aplicações do plugin no elemento do menu (ou coleção de elementos), em seus elementos filhos e na caixa editável atrelada ao menu. Remove eventos com o rótulo "mnedt" e outros dados:

[code language="javascript"]
$.fn.formatTxt.destroy($("#menu-edit"));
[/code]
