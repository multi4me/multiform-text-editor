/*!
 * MultiformTextEditor - jQuery plugin for rich text editing
 * version: 1.0.0 (30 Nov 2017)
 * @requires jQuery v2.0 or later
 *
 * License: MIT License
 *
 * Copyright (c) 2017 Multi4me - multi4me@outlook.com
 *
 */



/*Focado em programadores com experiência em JavaScript e JQuery, o objetivo do plugin é ser uma forma de editar texto com a flexibilidade que permita adicionar qualquer tipo de formatação e inserção sem a necessidade de alterar a base do plugin e usando qualquer estrutura HTML e estilização que se queira.
- O protótipo "formatTxt()" aplica os eventos aos itens do menu e caixa de edição para destaque, detecção e aplicação dos formatos e montagens. Usa o objeto "datafrmt_obj" para aplicação das edições com o comando "execCommand(comando, ShowDefaultUI(false), valor(opcional))" e outras possibilidades de formatação.
- É possível, por exemplo, adicionar uma lista de formas em SVG (retângulo, losango, elipse, etc.) para serem inseridos no texto, algo que não é padrão dos plugins de edição, ou mesmo um item para aplicar um conjunto de estilos css ao texto selecionado por meio de uma classe pré-criada no css da página.
- O programador deverá seguir os padrões do objeto "datafrmt_obj" para adicionar propriedades e métodos para formatar, manipular e inserir na caixa editável ou usando o que já está setado (negrito, itálico, sublinhado, ...), podendo reescrever os dados padrões, seus rótulos e valores.
- Como caixa de texto deve-se usar um elemento (não-input) com o atributo "contenteditable" valendo "true" e o menu deve ser montado seguindo apenas alguns padrões:
	- cada item de formatação terá a classe "frmttxt-mn-it" e nele o atributo "data-frmt=*" possuirá o mesmo rótulo da formatação referenciada no objeto "datafrmt_obj", opcionalmente podendo-se usar "data-val=*" para quando se quer passar valor à formatação, embora seja possível passar valor de diferentes formas;
	- elementos que listam um grupo de itens de formatação (como uma paleta de cores, em que cada cor é um elemento "frmttxt-mn-it") terá a classe "frmttxt-mn-gp", que quando clicado exibirá seu filho com a classe "frmttxt-mn-drpdn" que é quem possui o conjunto de itens de formatação;
	- se um elemento em algum lugar no menu for necessário para manipular elementos e dados antes e durante as formatações (como dois elementos para o usuário selecionar se quer aplicar cor ao texto ou fundo), deve-se setar a classe "frmttxt-mn-mp" e o atributo "data-mnpl=*" com o nome do método criado no objeto "datamnpl_obj" (deve ser diferente dos nomes de "datafrmt_obj").
- Veja a explicação do objeto "datafrmt_obj" e "datamnpl_obj" ao final. Ambos podem ser editados pelo programador para se alterar os padrões de formatação já disponíveis.
- Exemplo de menu de edição e caixa de texto:
	<div class="menu-edit unselectable">
		<b class="frmttxt-mn-it" data-frmt="ngrto">B</b>
		<i class="frmttxt-mn-it" data-frmt="itlco">i</i>
		<u class="frmttxt-mn-it" data-frmt="sblnhdo" data-val="underline">U</u>
		&nbsp;&nbsp;❘&nbsp;&nbsp;
		<div class="frmttxt-mn-gp texto-cor">
			<span>✽<span>
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
		&nbsp;&nbsp;&nbsp;❘&nbsp;&nbsp;
		<span class="frmttxt-mn-it limpa-frmt" data-frmt="lmpfrmt">&nbsp;</span>
	</div>
	<div id="txt-edit" contenteditable="true" placeholder="Digite o texto"></div>
- O exemplo acima foi montado já usando os rótulos das formatações pré-criadas para negrito, itálico, sublinhado e cor e ao ser instanciado, a seguir, acrescenta-se objeto com uma nova formatação para criação de bloco de citação. Uma função é passada como último parâmetro para executar algo após qualquer alteração na caixa de texto:
	$(".menu-edit").formatTxt($("#txt-edit"), {tagcompleta: {tg:["BLOCKQUOTE"], vltgc: function(mnit, slc){
		return "<blockquote>"+(slc.txt || "...")+"</blockquote>"; 
	}}}, null, function(){console.log("alterou")});
- Ainda no exemplo acima o programador poderá antes alterar dados das formatações padrões como a "sblnhdo", por exemplo, mudando a forma como texto será sublinhado (aplicando um estilo com atributo "text-decoration") e colocando 'data-val="underline"' no html do item no menu:
	$.fn.formatTxt.datafrmt_obj.sblnhdo = {tg:[{nm:null, atr:"style", ext:"text-decoration"}], vlatr: function(mnit, slc){ return ["style", "text-decoration"]; }};
	- também poderia-se passar o mesmo objeto na aplicação de "formatTxt()" como parâmetro e usando o mesmo nome da formatação padrão ("sblnhdo") para que seja sobrescrita*/


(function($){
	$.fn.formatTxt = function(elmtcx, dfrmt_obj, dmnpl_obj, cllbck){
		return this.each(function(){//Aplica à um ou mais elementos de uma vez
			var elmt_mn = $(this);//elemento instanciado - menu de edição da caixa
			var elmt_cx = (typeof(elmtcx)!="function" ? elmtcx : elmtcx.apply(elmt_mn));
			var dados_obj = $.extend({}, $.fn.formatTxt.datafrmt_obj, dfrmt_obj, $.fn.formatTxt.datamnpl_obj, dmnpl_obj);//funde os objetos padrões aos objetos passados como parâmetro. O "$.extend" já valida cada objeto não usando caso seja nulo, indefinido, falso, etc.
			elmt_mn.data("frmttxt-cx", elmt_cx);//guarda como dado no menu o elemento da caixa específico
			elmt_cx.data("frmttxt-mn", elmt_mn);//guarda como dado na caixa o elemento do menu específico
			var pos_limit;//variáveis globalizadas neste escopo
			//Prepara clique nos itens de edição do menu para formatação no texto, podendo ser subitem de um grupo. Necessário usar evento "mousedown" evitando problema em "click" no IE
			elmt_mn.on("mousedown.mnedt", ".frmttxt-mn-it", function(event){
				event.preventDefault();//necessário para melhoria no IE
				event.stopPropagation();//evita que os subitens reexecutem eventos do pai
				var elmtcxit = $(event.delegateTarget).data("frmttxt-cx");
				//Aplica formatação conforme o item de objeto a ser aplicado, podendo ser simples (por tipo e opcionalmente usando valor, podendo ser um método de captura) ou montando a tag completa usando método
				var slc_obj = $.fn.formatTxt.GetSetSelectObj();//obtém objeto com os dados de seleção
				var dfrmt = $(this).attr("data-frmt");//nome do tipo de formato
				dados_obj[dfrmt].precall ? dados_obj[dfrmt].precall(this, slc_obj) : null;//chama o método de pre-execução (quando existe), manipulando dados e elementos antes de usá-los na formatação
				var dval = $(this).attr("data-val");//valor do formato ou indefinido (se não existe)
				var tp = dados_obj[dfrmt].tp;//tipo de comando (opcional)
				var css = dados_obj[dfrmt].css;//true/false para tipo estilização (opcional)
				var exec = true;//receberá false caso o comando não seja suportado pelo navegador
				var execss;//receberá true/false caso seja usado e o comando para estilização seja suportado ou não pelo navegador
				if(css){//Se for passado como "true", antes de aplicar formatação, tenta executar o comando "styleWithCSS" (não suportado pelo IE)
					try{
						execss = document.execCommand("styleWithCSS", false, "true");//seta para tipo formatação por estilização, ainda retornando true/false conforme sucesso da aplicação
					}catch(e){ execss = false; }
				}
				if(dados_obj[dfrmt].incall){//Se existe, chama o método de execução interna para realizar a formatação toda personalizada
					exec = dados_obj[dfrmt].incall(this, slc_obj, execss);
				}else{
					if(tp){//Simples - executa o tipo de comando a ser aplicado ao texto - "execCommand(CommandName(tp), ShowDefaultUI(false), ValueArgument(null ou informado))"
						var vl = dados_obj[dfrmt].vl ? dados_obj[dfrmt].vl(this, slc_obj) : dval;//se valor é um método de captura usa-o passando elemento como parâmetro, senão: usa "data-val" do elemento
						try{//Tenta executar comando e caso não seja suportado atribui 'false' à variável "exec"
							document.execCommand(tp, false, (vl!=undefined ? vl : null));//um valor é passado ao comando ou nulo
						}catch(e){ exec = false; }
					}else if(dados_obj[dfrmt].vlatr){//Valores de atributo - aplica ao envólucro da seleção ou cria elemento com o atributo
						var vlatr = dados_obj[dfrmt].vlatr(this, slc_obj);//método usa o item de menu/submenu como parâmetro e retorna uma array (['atributo', 'valor1'(opcional), 'valor2'(opcional)])
						var atr = vlatr[0]; var vl1 = vlatr[1]; var vl2 = vlatr[2];
						var elmt_slc = $(slc_obj.elmt);//elemento/envólucro da seleção
						if(!$(slc_obj.elmt).is("[contenteditable=true]") && $(slc_obj.elmt).text() == slc_obj.txt){//Se o envolucro da seleção não é a própria caixa editável e se o texto selecionado é igual à todo o texto do envólucro detectado aplica o atributo
							if(atr == "style"){//Para aplicar atributo de estilo:
								var ecss = elmt_slc.css(vl1);//valor atual da propriedade css especificado ou indefinido se ainda não foi aplicado
								if(dval == "inherit" || ecss == vl2 || ecss == dval){//Se o dado de valor do item no menu é "inherit" ou se, no elemento selecionado, o valor do estilo específico já foi aplicado (com mesmo valor informado ou dado do item):
									elmt_slc.css(vl1, "");//retira a propriedade css informada (vl1)
								}else{//Se o estilo ainda não foi aplicado ou valor é diferente:
									elmt_slc.css(vl1, (vl2 ? vl2 : dval));//aplica a propriedade "css" (vl1) informada com o valor (vl2, se informado) ou com o dado de valor do item no menu (dval)
								}
							}else if(atr == "class"){//Para aplicar atributo de classe:
								var cls = (vl1 ? vl1 : dval);//usa como classe o valor (vl1, se informado) ou pelo dado do item no menu (dval)
								elmt_slc.toggleClass(cls);//se o elemento já possui a classe remove-a, senão adiciona-a
							}else{//Para qualquer outro atributo:
								var vl = (vl1 ? vl1 : dval);//usa como valor o vl1 (se informado) ou o dado do item no menu (dval)
								elmt_slc.attr(atr) == vl ? elmt_slc.removeAttr(atr) : elmt_slc.attr(atr, vl);//se o elemento já possui o atributo com o mesmo valor especificado remove-o, senão adiciona ou altera com valor informado
							}
						}else if(slc_obj.txt){//Se seleção não possui invólucro próprio cria um "<span>" padrão com o atributo para substituição (se texto não for vazio)
							var elmt_nv = $("<span/>", {"text": slc_obj.txt});//novo elemento padrão com o texto da seleção
							atr == "style" ? elmt_nv.css(vl1, (vl2 ? vl2 : dval)) : elmt_nv.attr(atr, (vl1 ? vl1 : dval));//se o atributo a ser adicionado é de estilo aplica css, senão aplica como atributo comum
							try{//Tenta executar comando e caso não seja suportado atribui 'false' à variável "exec"
								document.execCommand("insertHTML", false, elmt_nv.prop('outerHTML'));//excuta na seleção a substituição pelo elemento novo
							}catch(e){ exec = false; }
						}
					}else if(dados_obj[dfrmt].vltgc){//Tag completa. Insere no lugar do texto selecionado um elemento todo premontado //-->comparar para ver se a seleção já possui elemento com mesma tag e texto e desmontá-lo
						var vltgc = dados_obj[dfrmt].vltgc(this, slc_obj);//passa o item de menu/submenu como parâmetro do método
						try{//Tenta executar comando e caso não seja suportado atribui 'false' à variável "exec"
							document.execCommand("insertHTML", false, vltgc);//usa fixamente o comando "insertHTML" (não suportado pelo IE)
						}catch(e){ exec = false; }
					}
				}
				try{//Tenta executar comando não suportado pelo IE
					document.execCommand("styleWithCSS", false, "false");//re-seta para tipo formatação por tag's (padrão)
				}catch(e){/*faz nada*/}
				elmtcxit.focus();//foca na caixa de texto novamente evitando falhas no desfoque
				//Chama o método de pós-execução (quando existe), manipulando dados e elementos após a formatação
				if(dados_obj[dfrmt].poscall){
					var ret = dados_obj[dfrmt].poscall(this, slc_obj, $.fn.formatTxt.GetSetSelectObj(), exec, execss);//parâmetros: o item clicado no menu, dados da seleção inicial, dados da seleção agora, "exec" e "execss" (true/false informando se a formatação foi suportada)
					typeof ret == "boolean" ? exec = ret : null;//se há um retorno true/false atribui ao "exec"
				}
				//Manipula caixa de conteúdo editável e usa a função a ser chamada após mudanças no texto (opcional)
				cllbck != undefined ? cllbck.apply(this, [elmtcxit, slc_obj, exec]) : null;//em "apply(this, [param1, param2...])" o primeiro parâmetro refere-se ao "this" (escopo) usado na função, que é o item clicado no menu. Parâmetros: a caixa editável, dados da seleção e exec (true/false informando se o commando foi suportado)
				//Executa o clique para ocultar submenu, filtrando pelo evento específico com rótulo ".mnedt"
				$("body").trigger("mousedown.mnedt");
			});
			//Prepara clique nos itens de grupo do menu exibindo o elemento de submenu (dropdown) que agrupa os subitens
			elmt_mn.find(".frmttxt-mn-drpdn").hide();//garante que todos submenus estejam ocultos
			elmt_mn.on("mousedown.mnedt", ".frmttxt-mn-gp", function(event){
				event.preventDefault();//necessário para melhoria no IE
				var wrap_drpdwn = $(this).find(".frmttxt-mn-drpdn");
				if(wrap_drpdwn.is(":hidden")){//Exibe submenu apenas se está oculto evitando repetições
					$("body").trigger("mousedown.mnedt");//se algum outro está visível executa evento que oculta
					wrap_drpdwn.show();//exibe o submenu
					!pos_limit ? pos_limit = $(event.delegateTarget).offset().left + $(event.delegateTarget).width() : null;//guarda a posição (x, à direita) limite do elemento menu
					if(wrap_drpdwn.css("left") != "auto" && (wrap_drpdwn.offset().left + wrap_drpdwn.width()) > pos_limit){//Após ficar visível o submenu é verificado e ajeitado caso passe do limite do menu
						wrap_drpdwn.css({left: "auto", right: "-13px"});//inverte-se, ficando deslocado a esquerda
					}
					var wrap_gp = $(this);//reserva elemento do grupo
					//Aplica evento ao "body", verificando quando o usuário clica fora do grupo, ocultando o submenu
					$("body").off("mousedown.mnedt keydown.mnedt");//remove eventos previamente evitando acumulo dos mesmos eventos
					$("body").on("mousedown.mnedt keydown.mnedt", function(event){//Ao qualquer elemento ser pressionado. É usado rótulo ".mnedt" para ser agora e depois: removido especificamente
						var kcd = event.which;
						//Verifica se o alvo não é o elemento pai do grupo ("wrap_gp") e não é um elemento filho dela
						if(kcd == 27 || (!$(event.target).is(wrap_gp) && wrap_gp.has(event.target).length == 0)){//Filtro de exceções
							wrap_gp.find(".frmttxt-mn-drpdn").hide();//oculta submenu
							$("body").off("mousedown.mnedt keydown.mnedt");//remove evento, filtrando pelo evento específico com rótulo de menu (sem interferir nos outros cliques do "body")
							$.fn.formatTxt.GetSetSelectObj(null, true);//restaura a seleção, quando guardada
						}
					});
				}else if(!$(event.target).is(wrap_drpdwn) && wrap_drpdwn.has(event.target).length == 0){//Se submenu já está visível e o item clicado não foi o submenu e filhos: oculta-o
					wrap_drpdwn.hide();//oculta submenu
					$.fn.formatTxt.GetSetSelectObj(null, true);//restaura a seleção, quando guardada
				}
			});
			//Prepara clique nos itens de manipulação do menu para agregar eventos extras ao fluxo principal. É necessário o vento "click" para ser executado após o usuário soltar mouse
			elmt_mn.on("click.mnedt", ".frmttxt-mn-mp", function(event){
				event.stopPropagation();//evita eventos de elementos pai sejam executados
				var elmtcxit = $(event.delegateTarget).data("frmttxt-cx");
				//Executa métodos conforme o item de objeto "datamnpl_obj"
				var slc_obj = $.fn.formatTxt.GetSetSelectObj();//obtém objeto com os dados de seleção
				var dmnpl = $(this).data("mnpl");//nome do método manipulador
				var ret = dados_obj[dmnpl](this, slc_obj, event);//chama o método manipulando dados e elementos para usá-los nas formatações independentemente
				//Como poderá haver alterações após execução do método: manipula a caixa de texto editável
				ret !== false ? elmtcxit.focus() : null;//foca na caixa de texto novamente evitando falhas no desfoque, mas apenas se não retornar 'true' (booleano)
				elmtcxit.keyup();//executa evento que detecta a formatação para destacar no menu
			});
			//Ao selecionar texto (por mouse ou teclado) detecta a formatação (tags) para destacar no menu. Usa temporizador para só executar num intervalo de tempo
			elmt_cx.on("mouseup.mnedt keyup.mnedt", function(event){
				var elmtmnit = $(event.delegateTarget).data("frmttxt-mn");
				typeof mnslc_tm != "undefined" ? clearTimeout(mnslc_tm) : null;//limpa o temporizador antes de reseta-lo
				mnslc_tm = setTimeout(function(){
					elmtmnit.find(".frmttxt-mn-slcndo").removeClass('frmttxt-mn-slcndo');//remove destaque de todos elementos do menu (filhos, netos...) que possuem a classe
					var slc_obj = $.fn.formatTxt.GetSetSelectObj();//obtém objeto com os dados de seleção
					if(slc_obj && !$(slc_obj.elmt).is("[contenteditable=true]")){//Só entra se há seleção e se o envolucro da seleção não é a própria caixa editável
						//Aplica classe de destaque aos elementos do menu comparando "tag" do texto selecionado com as tags de referência (alguns possuem tags altenativas para diferentes navegadores e/ou formas de formatação)
						var tg_ar, tg_vl;
						for(var prop in dados_obj){//Varre o objeto passando por cada propriedade
							tg_ar = dados_obj[prop].tg;//array de tags
							if(tg_ar){//Se o item possui tags de referência
								for(i=0; i<tg_ar.length; i++){
									if(typeof tg_ar[i]=="string" && tg_ar[i]==slc_obj.tag){//Tag simples - verifica nome somente [ex.: <b>, <i>, <u>, ...]
										elmtmnit.find("[data-frmt="+prop+"]").addClass('frmttxt-mn-slcndo');//aplica o destaque ao item conforme nome da formatação (propriedade)
										break;//bateu com uma tag da propriedade atual - sai do loop filho
									}else if(tg_ar[i].nm == slc_obj.tag || tg_ar[i].nm === null){//Tag com subitens ({nm:"*", atr:"*", ext:"*"}) - verifica na seleção: nome de tag(pode valer 'null'), atributo, podendo ter dado extra. Se o objeto de tag tem o "nm" igual a 'null' aceita qualquer nome de tag
										tg_vl = $(slc_obj.elmt).attr(tg_ar[i].atr);//obtém o valor do atributo informado ou indefinido (se o elemento não o possui).
										if(tg_vl){//Se há um valor (o atributo bateu com o do elemento)
											if(tg_ar[i].atr == "style"){//Se é atributo estilo: captura o valor pelo dado extra
												tg_vl = $(slc_obj.elmt).prop("style")[tg_ar[i].ext];//captura no estilo do elemento selecionado: o valor da propriedade especificada
												if(!tg_vl){//Se for invalido pula para a próxima tag
													continue;
												}
											}else if(tg_ar[i].atr == "class"){//Se é atributo de classe usa a classe informada (extra)
												if(tg_ar[i].ext && $(slc_obj.elmt).hasClass(tg_ar[i].ext)){//Se a classe foi especificada e existe no elemento usa-a como valor
													tg_vl = tg_ar[i].ext;
												}else{//Se classe não existe pula para a próxima tag
													continue;
												}
											}
											elmtmnit.find("[data-frmt='"+prop+"'][data-val='"+tg_vl+"']").addClass('frmttxt-mn-slcndo');//aplica o destaque ao item do menu
											break;//bateu com uma tag da propriedade atual - sai do loop filho
										}
									}
								}
							}
						};
					}
				}, 200);
			});
			//Na caixa, limpa formatação ao colar texto
			elmt_cx.on("paste.mnedt", function(event){
				event.preventDefault();
				var cntd;
				if(event.originalEvent.clipboardData){//Verifica se existe dados de cópia na memória
					cntd = (event.originalEvent || event).clipboardData.getData('text/plain');//captura o conteúdo copiado
					document.execCommand("insertText", false, cntd);//insere o conteúdo
				}else if(window.clipboardData){//Verifica dados de cópia na memória (para IE)
					cntd = window.clipboardData.getData('Text');//captura o conteúdo copiado
					if(window.getSelection){
						window.getSelection().getRangeAt(0).insertNode(document.createTextNode(cntd));//insere o conteúdo
					}else{
						document.selection.createRange().pasteHTML(cntd);//insere o conteúdo
					}
				}
			});
			//Na caixa, ao usuário teclar 'tab' insere código de espaço equivalente no html, sem deixar perder o foco
			elmt_cx.on("keydown.mnedt", function(event){
				var kcd = event.which;//o "which" da jQuery normaliza os códigos de tecla independente do tipo de evento
				if(kcd == 9){//código da  tecla "tab"
					event.preventDefault();//impede a aplicação padrão da tecla (foco no próximo elemento)
					try{//Tenta executar commando padrão do "JavaScript" de inserção de texto (não suportado no IE)
						document.execCommand("insertHtml", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
					}catch(e){//Se não funcionou insere pelo método de seleção
						$.fn.formatTxt.GetSetSelectObj("    ");//insere quatro espaços
					}
				}
			});
		});
	};
	
	//Função captura dados do trecho selecionado/posicionado pelo usuário e retorna como objeto. Os parâmetros são para inserção de texto e restauração de seleção de 'range'
	$.fn.formatTxt.range = null;
	$.fn.formatTxt.GetSetSelectObj = function(txt, rng){
		var slc_rng, slc_elmt, slc_tag, slc_txt, vrtxt = (txt && typeof txt == "string");
		if(window.getSelection){
			var slctn = window.getSelection();
			if(slctn.rangeCount){
				slc_rng = slctn.getRangeAt(0);
				var node = slc_rng.commonAncestorContainer;
				slc_txt = slctn.toString();
				slc_elmt = node.nodeType == 1 ? node : node.parentNode;
				if(slc_txt && slc_elmt.textContent != slc_txt){//Se não bateu com texto selecionado. Para navegadores como Firefox que não detectam o envólucro imediato
					var ncntnr = slctn.getRangeAt(0).startContainer.nextSibling;
					slc_elmt = (ncntnr && ncntnr.textContent == slc_txt ? ncntnr : slc_elmt);
				}
				slc_tag = (slc_elmt.nodeType == 1 ? slc_elmt.nodeName : slc_elmt.parentNode.nodeName);
				if(vrtxt){//Se foi passado texto para inserção, insere-o
					slc_rng.deleteContents();
					slc_rng.insertNode(document.createTextNode(txt));
				}
				if(rng == true && $.fn.formatTxt.range){//Se foi requisitado e há "range" (trecho) reservado: restaura seleção
					slctn.removeAllRanges();
					slctn.addRange($.fn.formatTxt.range);
					$.fn.formatTxt.range = null;//anula reserva de "range" novamente
				}
			}else{
				return null;
			}
		}else if(document.selection && document.selection.type != "Control"){//Para IE
			slc_rng = document.selection.createRange();
			slc_elmt = slc_rng.parentElement();
			slc_txt = slc_rng.text;
			slc_tag = slc_rng.parentElement().nodeName;
			vrtxt ? slc_rng.text = txt : null;//se informado texto, insere-o
			if(rng == true && $.fn.formatTxt.range){//Se foi requisitado e há "range" (trecho) reservado: restaura seleção
				$.fn.formatTxt.range.select();
				$.fn.formatTxt.range = null;//anula reserva de "range" novamente
			}
		}else{
			return null;
		}
		return {rng: slc_rng, elmt: slc_elmt, tag: slc_tag, txt: slc_txt};
	}
	//Função para alterar elemento(s) podendo-se mudar a tag/elemento, assim como adicionar e remover atributos, opcionalmente
	$.fn.formatTxt.altrElmnt = function(elmt, nelmt, atr_ad, atr_rm){
		elmt.each(function(){
			if(atr_ad){//Se há array de atributos a serem adicionados:
				for(i=0; i<atr_ad.length; i++){
					var atr = atr_ad[i].atr;
					var vl1 = (typeof atr_ad[i].vl1 != "function" ? atr_ad[i].vl1 : atr_ad[i].vl1(this));
					if(atr == "style"){//Se é atributo de estilo inclui por "css()" usando dois valores
						var vl2 = (typeof atr_ad[i].vl2 != "function" ? atr_ad[i].vl2 : atr_ad[i].vl2(this));
						$(this).css(vl1, vl2);
					}else if(atr == "class"){//Se é atributo de classe inclui valor por "addClass()"
						$(this).addClass(vl1);
					}else{//Se é atributo comum inclui valor
						$(this).attr(atr, vl1);
					}
				}
			}
			if(atr_rm){//Se há array de atributos a serem removidos:
				for(i=0; i<atr_rm.length; i++){
					$(this).removeAttr(atr_rm[i]);
				}
			}
			if(nelmt){//Se foi passado novo elemento, substitui pela tag informada
				var atrs = {};
				$.each($(this)[0].attributes, function(idx, atr){//Reserva os atributos do elemento
					atrs[atr.nodeName] = atr.nodeValue;
				});
				//Substitui o elemento pelo novo, com todos os atributos e conteúdo
				$(this).replaceWith( $("<"+nelmt+"/>", atrs).append($(this).contents()) );
			}
		});
	}
	//Função para matar aplicações do plugin nos filhos do elemento (ou coleção de elementos) de menu e de cada caixa editável. Remove eventos com o rótulo "mnedt" e outros dados
	$.fn.formatTxt.destroy = function(elmt){//O elemento do parâmetro deve ser um menu que tenha sido instanciado anteriormente
		$("body").trigger("mousedown.mnedt");//oculta submenus
		elmt.off(".mnedt");//remove eventos do(s) menu(s)
		elmt.find("*").off(".mnedt");//remove eventos dos filhos do(s) menu(s)
		elmt.find(".frmttxt-mn-slcndo").removeClass('frmttxt-mn-slcndo');//remove destaques do(s) menu(s)
		elmt.each(function(){//Usa o elemento da caixa editável reservado em cada menu
			var elmtcxit = $(this).data("frmttxt-cx");
			elmtcxit.off(".mnedt");//remove eventos da caixa
			elmtcxit.find("*").off(".mnedt");//remove eventos dos filhos da caixa
			elmtcxit.removeData("frmttxt-mn");//remove o dado com o elemento de menu reservado na caixa
		});
		elmt.removeData("frmttxt-cx");//remove o dado com o elemento de caixa reservado na(s) caixa(s)
	}

	/*- Cada item (propriedade) é um rótulo para a formatação e o elemento do menu deverá ter o mesmo em "data-frmt='nome'", ex.: "ngrto" para aplicação de negrito.
	- O subitem "precall" (quando necessário) é um método de pre-execução chamado para manipular dados e elementos antes de usá-los na formatação, podendo alterar até mesmo os próprios dados do objeto (ex.: usando formatação de cor, antes de executar, é verificado se foi selecionado aplicação de cor no texto ou no fundo, alterando o subitem de tipo de formatação "tp"), o "incall" executa internamente para quando se quer aplicar formatação de uma maneira totalmente personalizada e o "poscall" faz o mesmo mas ao final das execuções principais e por isso pode ser usado para solucionar execuções não suportadas (nesse caso deve-se retornar true/false conforme funcionamento).
	- O subitem "tp" é o nome do tipo padrão de comando a ser aplicado como formatação. Quando não usado, a formatação usará apenas o subitem "vlatr" ou "vltgc".
	- O subitem "tg" possui array com as tags (em maiúsculo) de referência para a tag que a formatação cria e para, ao usuário selecionar texto, destacar o elemento do menu correspondente (ex.:"B" para <b> procurará elemento com data-frmt="ngrto"), podendo ser várias (navegadores podem criar diferentes tags) e quando a mesma formatação possui valores diferentes (como tamanhos de fonte) e/ou é aplicada usando os métodos de valor ("vlatr" ou "vltgc") "tg" poderá ter objetos com 'nome', 'atributo', podendo possuir ainda propriedade 'extra' para style ou valor específico de classe, ex.: {nm:"SPAN", atr:"style", ext:"font-size"} ou {nm:"DIV", atr:"class", ext:"formato-1"}. O 'extra' para atributo "style" deverá seguir o padrão do método "css()" da jQuery (ex.: "borderTopWidth" para borda superior).
	- Quando se quer aplicar valor o item (elemento) do menu deverá possuir "data-val='valor'" e o valor deverá ser "inherit" para os casos em que se quer remoção de estilo específico. O subitem "vl" é um método para capturar valor dinamicamente (como a cor) sem se usar "data-val='valor'". O subitem "vlatr" retorna uma array com um 'atributo' (índice 0), 'valor1' (2, opcional) e 'valor2' (3, opcional - fixo ou capturado se não for usado o "data-val='valor'") para ser aplicado ao trecho selecionado, ex.: ["style", "color", mnit.css("color")], se "tg" for usado deverá ter o "nm" valendo "null" pois o atributo poderá ser aplicado a qualquer elemento que circunda a seleção. O método "vltgc" é para substituir a seleção por uma tag completa (incluindo o texto), ex.: para uma linha: "<hr>" ou para uma citação: "<blockquote>texto</blockquote>". Nos casos de uso de "vlatr" e "vltgc" o subitem "tp" não será usado.
	- O subitem "css" deverá ser incluído valendo "true" quando se quer que a formatação aconteça por meio de estilização ou como no caso de criação de lista (que ajeita o tamanho dos subelementos) altere filhos por estilização. É útil para tipos de comandos que criam por padrão tag's não suportadas em HTML5, como a criação de "<font...>" (obsoleto) para cor e tamanho. Seu uso limita a comparação de tag com valor (para destaque) em alguns casos, nos quais deverá ser usado o método "vlatr" ou "vltgc" para aplicar a formatação*/
	$.fn.formatTxt.datafrmt_obj = {
		ngrto: {tp:"bold", tg:["B", "STRONG"]}, itlco: {tp:"italic", tg:["I", "EM"]}, sblnhdo: {tp:"underline", tg:["U"]},
		rscdo: {tp:"strikeThrough", tg:["STRIKE"]}, sbrscrto: {tp:"superscript", tg:["SUP"]}, sbscrto: {tp:"subscript", tg:["SUB"]},
		sbrlnhdo: {tg:[{nm:null, atr:"style", ext:"text-decoration"}], vlatr: function(mnit, slc){ return ["style", "text-decoration"]; }},
		insrcrctr: {tp:"insertText", vl: function(mnit, slc){ return $(mnit).text(); }, poscall: function(mnit, slc, nslc, exc, excs){
						//Uma vez que a inserção de texto pelo comando "document.execCommand("insertText", ...)" não é suportado pelo IE:
						if(exc == false){//Usa a função 'cross-browser' de seleção, para inserir
							return ($.fn.formatTxt.GetSetSelectObj($(mnit).text()) ? true : false);//retorna true/false conforme funcionamento
						}
					}},
		tplist1: {tp:"insertUnorderedList", css: true}, tplist2: {tp:"insertOrderedList", css: true},
		fnttmnho: {tg:[{nm:null, atr:"style", ext:"font-size"}], vlatr: function(mnit, slc){ return ["style", "font-size"]; }},
		txtcor: {precall: function(mnit, slc){
					this.tp = ($(mnit).parents(".frmttxt-mn-drpdn").find(".frmttxt-mn-mp input:checked").val() == "1" ? "foreColor" : "backColor");
				}, tp:"foreColor", tg:[{nm:null, atr:"style", ext:"color"}], css: true, poscall: function(mnit, slc, nslc, exc, excs){
					if(excs == false && nslc.tag == "FONT"){//Se formatação não foi aplicada com estilização e foi criado um elemento "<font>" (para IE):
						/*this.tg[0].nm = "FONT"; this.tg[0].atr = "color"; this.tg[0].ext = null;//altera padrões da tag de comparação
						var mnitval = $(mnit).attr("data-val"); $(mnit).attr("data-val", mnitval.replace(/\s/g, ""));//retira do valor os espaços conforme padrão da tag <font>: 'rgb(235,107,86)'*/
						if(this.tp == "foreColor"){//Se foi aplicado cor de texto substitui por um "<span>" com estilo da mesma cor
							$.fn.formatTxt.altrElmnt($(nslc.elmt), "span", [{atr:"style", vl1:"color", vl2:$(nslc.elmt).attr("color")}], ["color"]);
						}else{//Se foi aplicado cor de fundo substitui por um "<span>" (já foi aplicado com estilo)
							$.fn.formatTxt.altrElmnt($(nslc.elmt), "span");
						}
					}
				}},
		insrlnk: {precall: function(mnit, slc){
					var inp_elmt = $(mnit).parents(".frmttxt-mn-drpdn").find("input"); var val_txt = inp_elmt.val();
					inp_elmt.val((/^([a-zA-Z0-9+.-]+):\/\//i).test(val_txt) || val_txt=="" ? val_txt : "http://"+val_txt);//verifica se há protocolo na url e insere "http://" por padrão
					$.fn.formatTxt.GetSetSelectObj(null, true);//restaura a seleção guardada para formatação do mesmo trecho
				}, tp:"createLink", vl: function(mnit, slc){ return $(mnit).parents(".frmttxt-mn-drpdn").find("input").val(); }, poscall: function(mnit, slc, nslc, exc, excs){
					var inp_elmt = $(mnit).parents(".frmttxt-mn-drpdn").find("input");
					if(inp_elmt.val()){//Se o valor do input é valido:
						!this.tp ? $(nslc.elmt).attr("href", inp_elmt.val()) : null;//se o "tp" está anulado (quando há link focado mas não selecionado) apenas altera a "url"
						$(nslc.elmt).attr("target", "_blank");//após criar link adiciona "target" para nova aba ao clicar
						$(mnit).parents(".frmttxt-mn-drpdn").find("input").val("");//apenas limpa o texto do "input" após formatação
					}
				}},
		rmvlnk: {precall: function(mnit, slc){
					slc.tag=="A" && slc.txt=="" ? this.tp = null : null;//anula o tipo de formatação quando há link focado mas não selecionado, para pular direto para o "poscall()"
				},tp:"unlink", tg:["A"], poscall: function(mnit, slc, nslc, exc, excs){
					if(slc.tag=="A" && !this.tp){//Se o "tp" está anulado (quando há link focado mas não selecionado):
						$(slc.elmt).replaceWith($(slc.elmt).text());//remove link substituindo o elemento por seu texto
						this.tp = "unlink";//retorna o tipo de formatação
					}
				}},
		lmpfrmt: {tp:"removeFormat"}
		/*, simplescaptura: {tp:"insertText", vl: function(mnit){ return $(mnit).text();}},
		atributo-css: {tg:[{nm:null, atr:"style", ext:"text-decoration"}], vlatr: function(mnit){ return ["style", "text-decoration"]; }},
		atributo-class: {tg:[{nm:null, atr:"class", ext:"sobrelinhado"}], vlatr: function(mnit){ return ["class"]; }},
		tagcompleta: {tg:["BLOCKQUOTE"], vltgc: function(mnit, slc){ return "<blockquote>"+(slc.txt || "...")+"</blockquote>"; }}*/
	}
	/*- Para eventos extras do menu pode-se usar o objeto "datamnpl_obj" de métodos para anexar manipulações ao fluxo principal de formatações e independente delas. Ex.: a formatação de cor necessita de um manipulador para alterar o valor de destaque (dstq:{atr:"style", ext:"color"}) entre cor do texto ("color") e cor do fundo ("background-color") verificando qual foi selecionado pelo usuário.
	- Os nomes/rótulos dos métodos devem ser diferentes dos nomes de propriedade em "datafrmt_obj" uma vez que, no instanciamento, eles são unidos num só objeto, permitindo manipulação de todos os dados. O uso de 'this' nos métodos refere-se ao objeto pai "dados_obj" criado no instanciamento.*/
	$.fn.formatTxt.datamnpl_obj = {
		txtcortp: function(mnmp, slc){//Para cores
			var chk = $(mnmp).children("input:checked").val();//opção selecionada pelo usuário
			this.txtcor.tg[0].ext = (chk == "1" ? "color" : "background-color");//altera o valor de comparação para destaque
			$(mnmp).parents(".frmttxt-mn-drpdn").find(".frmttxt-mn-it.rmv").attr("data-val", (chk == "1" ? "#888888" : "inherit"));//altera o valor usado no item que simula remoção de cor, usando a cor padrão para cor de texto e "inherit" para cor de fundo
		},
		insrlnkvl: function(mnmp, slc, evnt){//Para inserção de caracteres
			var inp_elmt = $(mnmp).find("input");
			if(inp_elmt.is(":visible")){//Se o "input" estiver visível:
				if(slc && !$(evnt.target).is(inp_elmt)){//Se há seleção e "input" não foi clicado depois de já visível:
					$.fn.formatTxt.range = slc.rng;//reserva o "range" (trecho) selecionado antes de perder foco
					this.insrlnk.tp = (slc.tag=="A" && slc.txt=="" ? null : "createLink");//se uma tag de link foi focado, mas não selecionada, anula o "tp" (tipo de comando) da formatação "insrlnk", obrigando a alteração apenas do "href" pelo método "vlatr"
					var val_txt = (slc.tag=="A" ? $(slc.elmt).attr("href") : "");//verifica se o elemento selecionado já é link, capturando a url ou vazio
					inp_elmt.val(val_txt).focus();//inlui texto e foca no "input"
				}
				if(!$._data(inp_elmt[0], "events")){//Se ainda não foi aplicado o evento de tecla ao input:
					inp_elmt.on("keydown.mnedt", function(event){//Ao pressionar alguma tecla, verifica:
						var kcd = event.which;
						if(kcd == 13){//código da  tecla "enter"
							event.preventDefault();//impede a aplicação padrão da tecla (foco no próximo elemento)
							inp_elmt.val() ? $(this).parent().children(".frmttxt-mn-it").mousedown() : null;//se link é valido executa o evento de formatação já aplicado ao botão "ok"
						}
					});
				}
				return false;//retorna 'false' para evitar que a caixa editável seja focada saindo do "input"
			}else{
				inp_elmt.val("");//apenas limpa o "input" ao ocultar
			}
		}
	}
}(jQuery));
