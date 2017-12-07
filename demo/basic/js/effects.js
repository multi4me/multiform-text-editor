$(document).ready(function(){
	'use strict';//diretriz padrão do JavaScript para restringir variáveis - deve-se sempre declarar com "var"
	/*----- /Inicialização/ -----*/
	//Variáveis principais, localizadas pelo uso de "var" para evitar que sejam re-setadas por fora, aumentando a segurança quando o Quiz é acessado diretamente
	var pagina = 1;//sempre inicia na capa
	var id_quiz, id_sistem, inline, item_dados_bs, item_dados, padrao_cor, link_email, categorias_dados, quiz_dados, quiz_dados_bs, ver_stts, id_quest, quest_dados, qst_num, altr_min, letras_ar, wrapchoice, num_rsp, crdt_ok, $img_trgt = $("#img-trgt");
	//Objeto de questão padrão. Precisa estar em sincronia com o especificado na classe do "PHP"
	var questao_novo_obj = {id_quest:null, tipo:1, fnt_quiz:null, id_orig:null, enunciado:null, enunciado_img:null, enunciado_img_fonte:null, subtitulo:null,
		midias:[{id_midia:1, midia:null, titulo:null}], iformacoes:[{id_info:1, info:null, url:null}], alternativas:[{id_alternat:1, ordem:1, txt:null, txt_rlcnr:null, img:null, img_rlcnr:null, indic:0}],
		fonte:null, fonte_url:null, ordem:1, status:2, stts_uso:1};
	//Captura o parâmetro "id_quiz", o que determina se é um quiz a ser editado ou se é novo
	var param_qz = new RegExp('[\?&]id=([^&#]*)').exec(window.location.href);//executa a expressão regular ('?' ou '&' seguido do parâmetro-informado, '=' e caracteres que não sejam '&' ou '#') cujo resultado será uma array assim: ["&id=5", "5"]
	id_quiz = (param_qz!=null ? (param_qz[1] || null) : null);//se o parâmetro "id" existe retorna o seu valor ou null (caso esteja vazio), senão retornará null
	//Captura o parâmetro "id_sistem", o que determina se é um quiz a ser editado ou se é novo
	var param_stm = new RegExp('[\?&]sstm=([^&#]*)').exec(window.location.href);
	id_sistem = (param_stm!=null ? (param_stm[1] || null) : null);
	//Captura o parâmetro "inline" para ser verificado se o "quiz adm" está sendo editado em conjunto com o "quiz user" localizadamente - dentro de listagem ou não
	var param_inl = new RegExp('[\?&]inline=([^&#]*)').exec(window.location.href);
	inline = (param_inl!=null ? (param_inl[1] || null) : null);
	//A variável "rdrcnr" e "stdmn" vem da 'index.php' onde é verificado se o quiz foi carregado em iframe ou diretamente - forçando redirecionamento
	if(typeof rdrcnr !== 'undefined' && rdrcnr == true){//Se precisa redirecionar filtra pelo sistema informado ou o padrão "CPBEdu"
		switch(id_sistem){
			case 4:
				window.location = (stcpbedu+"/#!quiz-link/"+id_quiz+"-id"); break;
			default:
				window.location = (stcpbedu+"/#!quiz-link/"+id_quiz+"-id"); break;
		}
	}
	
	/*----- /Carregamento dos dados iniciais/ -----*/
	//Monta parâmetros e carrega as informações que alimentam as listas da capa (categorias). Se o id foi informado seta as informações anteriormente cadastradas para o quiz especificado
	var params_obj = {acao: "iniciar"};//objeto de parâmetros para o método post
	id_quiz != null ? (params_obj.id_quiz = id_quiz) : null;//passa "id_quiz" como parâmetro apenas quando existe
	$(".block-s").show();
	$.post(site_url+"/admin/controller/ctrl_admin.php", params_obj, function(dados){
		$(".block-s").hide();
		if(dados.stts == 1){
			//Guarda os objetos de dados em variáveis globais para reutilização
			item_dados = dados.item;//dados principais do quiz especificado. Se id_quiz não foi especificado terá apenas um objeto de valores padrões para um novo quiz
			item_dados_bs = $.extend(true, {}, item_dados);//dados principais do quiz preservado para comparação. Mantem-se inalterado até que haja salvamento do Quiz. Necessita usar $.extend() para fazer a clonagem
			categorias_dados = dados.categorias;//dados das categorias. Se id_quiz foi especificado terá todas as categorias, senão apenas os níveis primários (categoria 1)
			padrao_cor = dados.cores;//dados de cores do sistema predefinido.
			link_email = dados.link_email;//link para exibir botão com o link para envio de email ao "Portal"
			Capa();
		}else if(dados.stts == 2){//Se houve erro
			Mensagem("Erro!", dados.msg, 2);
		}else if(dados.stts == 3){//Se houve acesso negado
			AcessoNegado(dados.msg);
		}
		//console.log(dados.msg);
	}, "json");

	/*----- /Funções principais/ -----*/
	//Função para salvar/editar devidamente a página atual ("Capa->1", "Questão->2", ou "Créditos->3"), insere dados quando o quiz é novo ou atualiza (quando necessário) e ao retornar: manipula os dados e carrega páginas
	function SalvarCarregar(tipo, extraval){
		$(".block-s").show();
		var params_obj = {};//sempre recria o objeto de parâmetros zerado e o deleta no final desta função por possuir e referenciar vários objetos
		if(pagina == 1){//CAPA - Quando o usuário passa pela capa
			if(id_quiz == null){//Se é quiz novo insere
				params_obj = {acao:"inserir_dados", pgn:pagina, dados:item_dados};
			}else{//Atualiza quiz
				var etapa = null;//etapa de salvamento inicialmente nula
				//Define se há dados a serem atualizados e se será salvo por etapas
				if(JSON.stringify(item_dados) != JSON.stringify(item_dados_bs)){
					item_dados.assunto!=item_dados_bs.assunto || item_dados.random_quest!=item_dados_bs.random_quest || item_dados.random_alternat!=item_dados_bs.random_alternat ? etapa=1 : null;//alterações só em alguns dados do item quiz (etapa 1)
					item_dados.id_categ1!=item_dados_bs.id_categ1 || item_dados.id_categ2!=item_dados_bs.id_categ2 || item_dados.id_categ3!=item_dados_bs.id_categ3 ? etapa = (etapa==1 ? 0 : 2) : null;//alterações só nas categorias (etapa 2) ou nas duas (etapa 0)
				}
				//Mesmo se não há atualização (dados:null) executa a ação enviando os parâmetros para carregar dados do Quiz
				params_obj = {acao:"atualizar_dados", pgn:pagina, etp:etapa, id_quiz:id_quiz, dados:(etapa!=null ? item_dados : null)};
			}
		}
		if(pagina == 2){//QUESTÃO - Quando o usuário navega entre as questões ou conclui
			var etp_dados_ar = [];//grupo de dados conforme etapas a serem salvas (etapa 0 é mudança de status do quiz)
			ver_stts = VerificaStatus(tipo);//verifica se há falta de dados obrigatórios
			ver_stts ? etp_dados_ar[0] = ver_stts : null;//o primeiro índice preenchido indica mudança de status
			if(tipo != 4){//Se não for tipo exclusão de questão, insere ou tenta atualizar
				if(id_quest == null){//Se é questão nova insere
					JSON.stringify(item_dados) != JSON.stringify(item_dados_bs) ? etp_dados_ar[1] = item_dados : null;//alterações em dados do item quiz (etapa 1)
					etp_dados_ar[2] = quest_dados;//necessariamente passa os dados da questão a ser inserida (etapa 2)
					params_obj = {acao:"inserir_dados", pgn:pagina, id_quiz:id_quiz, dados:etp_dados_ar};
				}else{//Atualiza questão
					var qst_bs_dds = quiz_dados_bs.questoes[qst_num-1];//dados da questão de base atual
					//Se há diferenças em "item_dados" ou entre a atual questão e a versão base seta as etapas de atualização
					JSON.stringify(item_dados) != JSON.stringify(item_dados_bs) ? etp_dados_ar[1] = item_dados : null;//alterações em dados do item quiz (etapa 1)
					if(quest_dados.tipo!=qst_bs_dds.tipo || quest_dados.enunciado!=qst_bs_dds.enunciado || (quest_dados.enunciado_img!=undefined && quest_dados.enunciado_img!=qst_bs_dds.enunciado_img)
					|| (quest_dados.enunciado_img_fonte!=undefined && quest_dados.enunciado_img_fonte!=qst_bs_dds.enunciado_img_fonte) || (quest_dados.subtitulo!=undefined && quest_dados.subtitulo!=qst_bs_dds.subtitulo) || quest_dados.status!=qst_bs_dds.status){//alterações em dados principais da questão (etapa 2)
						etp_dados_ar[2] = $.extend(true, {}, quest_dados);//nessa etapa atribui "quest_dados" clonando para depois deletar itens
						delete etp_dados_ar[2].midia; delete etp_dados_ar[2].informacoes; delete etp_dados_ar[2].alternativas;//remove alguns itens array do objeto e desnecessários para essa etapa
					}
					JSON.stringify(quest_dados.alternativas) != JSON.stringify(qst_bs_dds.alternativas) ? etp_dados_ar[3] = quest_dados.alternativas : null;//alterações nos dados das alternativas da questão (etapa 3)
					//quest_dados.midias != undefined && JSON.stringify(quest_dados.midias) != JSON.stringify(qst_bs_dds.midias) ? etp_dados_ar[4] = quest_dados.midias : null;//alterações em dados de mídia da questão (etapa 4)
					//quest_dados.informacoes != undefined && JSON.stringify(quest_dados.informacoes) != JSON.stringify(qst_bs_dds.informacoes) ? etp_dados_ar[5] = quest_dados.informacoes : null;//alterações nos dados das informações da questão (etapa 5)
					//Se houver alguma etapa a ser atualizada apronta os parâmetros, senão apenas carrega outra questão ou a página de créditos
					if(etp_dados_ar.length > 0){
						etp_dados_ar[7] = id_quest;//primeiro item guarda o "id_quest" para as filtragens
						params_obj = {acao:"atualizar_dados", pgn:pagina, id_quiz:id_quiz, dados:etp_dados_ar};
					}else{
						//Tipo 1 é navegação de questão, tipo 2 é nova questão criada e 3 é conclusão
						if(tipo == 1 || tipo == 2){
							Quest(false, extraval);//carrega outra questão ("extraval" traz o valor a ser atribuído à "qst_num")
							return;//sai da função
						}else if(tipo == 3){
							//Exibe e inicia a montagem da página de créditos
							$("#quiz-core").addClass('d-nn');
							$("#quiz-credit").removeClass('d-nn');
							pagina = 3;//atribui para página de créditos
							Credit();//carrega a página de créditos
							return;//sai da função
						}
					}
				}
			}else{//Se for tipo exclusão de questão prepara dados para exclusão no banco
				etp_dados_ar[1] = {id_quest: id_quest, stts_uso: Number(quest_dados.stts_uso)};
				params_obj = {acao:"excluir_questao", id_quiz:id_quiz, dados:etp_dados_ar};
			}
		}
		if(pagina == 3){//CRÉDITOS - Quando o usuário manipula a tela final
			var etp_dados_ar = [];//grupo de dados conforme etapas a serem salvas (etapa 0 é mudança de status do quiz)
			ver_stts = VerificaStatus();//verifica se há falta de dados obrigatórios
			ver_stts ? etp_dados_ar[0] = ver_stts : null;//o primeiro índice preenchido indica mudança de status
			//Alterações em "gabarito" e/ou "impressão" (etapa 1)
			if(item_dados.gabarito != item_dados_bs.gabarito || item_dados.impressao != item_dados_bs.impressao){
				etp_dados_ar[1] = {gab: item_dados.gabarito, imp:item_dados.impressao};
			}
			//Alterações em autoria: elaboração ou montagem (etapa 2)
			item_dados.autoria != item_dados_bs.autoria ? etp_dados_ar[2] = item_dados.autoria : null;
			//Alterações nas fontes das questões (etapa 3)
			var qz_dds, qz_bs_dds;
			for(var i=0; i<quiz_dados.questoes.length; i++){
				qz_dds = quiz_dados.questoes[i];
				qz_bs_dds = quiz_dados_bs.questoes[i];
				if(qz_dds.stts_uso == 1){
					if(qz_dds.fnt_quiz != qz_bs_dds.fnt_quiz || qz_dds.fonte != qz_bs_dds.fonte || qz_dds.fonte_url != qz_bs_dds.fonte_url){
						!etp_dados_ar[3] ? etp_dados_ar[3]=[] : null;//cria o item da array, se ainda não existe
						etp_dados_ar[3].push({id_quest: qz_dds.id_quest, fnt_quiz: qz_dds.fnt_quiz, fonte: qz_dds.fonte, fonte_url: qz_dds.fonte_url});
					}
				}
			}
			//Se houver alguma etapa a ser atualizada apronta os parâmetros, senão apenas retorna à questões ou exibe mensagem de conclusão
			if(etp_dados_ar.length > 0){
				params_obj = {acao:"atualizar_dados", pgn:pagina, id_quiz:id_quiz, dados:etp_dados_ar};
			}else{
				//Tipo 1 é retorno à página de questões e tipo 2 é conclusão do quiz
				if(tipo == 1){
					//Exibe e inicia a montagem da página de questões
					$("#quiz-credit").addClass('d-nn');
					$("#quiz-core").removeClass('d-nn');
					pagina = 2;//atribui para página de questões
					Quest(false, qst_num);//carrega última questão visitada ("qst_num" foi globalmente setada)
					return;//sai da função
				}else if(tipo == 2){
					$(".block-s").hide();
					//Usa o status atual para trazer a primeira mensagem em "extraval" (quiz incompleto) ou a segunda (parcial)
					var stts = item_dados.status;
					if(stts != 0){//Se não é quiz desativado
						Mensagem((stts>=2 ? "Pronto!" : "Quase"), extraval[(stts>=2 ? 0 : 1)], (stts>=2 ? 1 : null));//Mensagem(título, mensagem, tipo)
					}else{
						Mensagem("Inalterado", "Este quiz está desativado e não houve alteração.");//se for quiz desativado executa mensagem padrão, uma vez que o status não se altera
					}
					return;//sai da função
				}
			}
		}
		//Se o tipo é 0 volta ao "quiz user" via plugin "porthole". É usado apenas na edição de quizzes existentes e quando chamado pelo plugin
		if(tipo == 0){
			//Se há dados a serem inseridos ou se houve mudanças pergunta ao usuário se deseja salvar
			if((pagina==1 && etapa != null) || (pagina==2 && id_quest == null) || (pagina==2 && etp_dados_ar.length > 0) || (pagina==3 && etp_dados_ar.length > 0)){
				$(".block-s").hide();
				if(confirm("Houve alteração nos dados. Deseja salvar as informações atuais?")){
					//Se irá salvar então verifica se os dados estão inseridos corretamente, do contrário sairá da função até o usuário corrigir e repetir o processo
					if((pagina == 1 && VerificaCampos() == false) || (pagina == 2 && VerificaQuestao() == false)){//Verifica e exibe mensagem no caso de alterações na página de questões e créditos -->incluir verificação de créditos
						pagina == 1 ? Mensagem("Incompleto", "Algum dado obrigatório está faltando. Por favor, complete e repita o processo.", 2) : null;//exibe mensagem no caso de alterações na página da capa
						IframeVoltarCancela();//envia mensagem a janela-pai para cancelar
						return;//sai da função
					}else{
						$(".block-s").show();
					}
				}else{//Se usuário decidiu não atualizar
					IframeVoltar();
					return;//sai da função
				}
			}else{//Se não há o que atualizar
				IframeVoltar();
				return;//sai da função
			}
		}
		//Ajax de envio e requisição de dados
		$.ajax({
			type: "POST",
			url: site_url+"/admin/controller/ctrl_admin.php",
			data: params_obj,
			dataType: "json",
			contentType : "application/x-www-form-urlencoded",
			success: function (dados){
				$(".block-s").hide();
				if(dados.stts == 1){
					if(tipo == 0){//Se é tipo 0 e uma vez salvo, volta ao "quiz user" via plugin "porthole"
						IframeVoltar(true);//o parâmetro "true" informa que houve salvamento (atualização)
						return;//sai da função
					}
					if(pagina == 1){//Capa
						if(id_quiz == null){//Ao inserir novo Quiz: atribui o valor "id_quiz" retornado
							item_dados.id_quiz = dados.id_quiz;
							id_quiz = dados.id_quiz;//determina existência do quiz atual
						}
						//O objeto "quiz_dados" é alimentado com os dados e replicado
						quiz_dados = dados.quiz;//em novo quiz ele recebe um objeto simples padrão, algo assim: {questoes:[{id_quest:null, ..., alternativas:[{id_alternat:1, ...}]}], autoria:{}}
						quiz_dados_bs = $.extend(true, {}, quiz_dados);//reserva a versão base para comparações futuras
						//Exibe e inicia a montagem das questões
						$(".wrap-cover").addClass('d-nn');
						$("#quiz-core").removeClass('d-nn');
						pagina = 2;//atribui para página de questões
						Quest(true, 1);//sempre inicia na primeira questão
					}
					if(pagina == 2){//Questão
						if(tipo != 4){//Se não for tipo exclusão de questão executa ações de inserção ou atualização
							if(id_quest == null){//Ao inserir nova questão: atribui o valor "id_quest" retornado
								quest_dados.id_quest = dados.id_quest;//ao atribuir o valor: "quiz_dados.id_quest" também é alterado
							}
							quiz_dados_bs.questoes[qst_num-1] = $.extend(true, {}, quiz_dados.questoes[qst_num-1]);//reatribui os dados da questão à "quiz_dados_bs.questoes[indx]", que é base de comparação para as novas alterações
							//Tipo 1 é navegação de questão, tipo 2 é nova questão criada e 3 é conclusão do quiz
							if(tipo == 1 || tipo == 2){
								Quest(false, extraval);//carrega outra questão ("extraval" traz o valor a ser atribuído à "qst_num")
							}else if(tipo == 3){
								//Exibe e inicia a montagem da página de créditos
								$("#quiz-core").addClass('d-nn');
								$("#quiz-credit").removeClass('d-nn');
								pagina = 3;//atribui para página de créditos
								Credit();//carrega a página de créditos
							}
						}else{//Se for tipo exclusão de questão chama a função que ajeitará a questão atual e os dados
							ExcluiCarregaDadosQuestao();
						}
					}
					if(pagina == 3){
						quiz_dados_bs.autoria = $.extend(true, [], quiz_dados.autoria);//reatribui os dados de autoria à "quiz_dados_bs.autoria", base de comparação para as novas alterações
						quiz_dados_bs.questoes = $.extend(true, [], quiz_dados.questoes);//reatribui os dados das questões à "quiz_dados_bs.questoes", base de comparação para as novas alterações
						//Tipo 1 é retorno à página de questões e tipo 2 é conclusão do quiz
						if(tipo == 1){
							//Exibe e inicia a montagem da página de questões
							$("#quiz-credit").addClass('d-nn');
							$("#quiz-core").removeClass('d-nn');
							pagina = 2;//atribui para página de questões
							Quest(false, qst_num);//carrega última questão visitada ("qst_num" foi globalmente setada)
						}else if(tipo == 2){
							//Usa o status novo ou o atual para ver se não está faltando nada, usando a primeira mensagem em "extraval" (quiz completo) ou a segunda (parcial)
							var stts = (ver_stts ? ver_stts : item_dados.status);//se houve mudança de status retorna novo valor, ou retorna o atual
							if(stts != 0){//Se não é quiz desativado
								Mensagem((stts>=2 ? "Pronto!" : "Quase"), extraval[(stts>=2 ? 0 : 1)], (stts>=2 ? 1 : null));//Mensagem(título, mensagem, tipo)
							}else{
								Mensagem("Atualizado", "Este quiz está desativado mas as informações foram salvas.");//se for quiz desativado executa mensagem padrão, uma vez que o status não se altera
							}
						}
					};
					//Podendo ser alterado em qualquer página reatribui os dados do item quiz à "item_dados_bs", que é base de comparação para as novas alterações
					ver_stts ? item_dados.status=ver_stts : null;//se houve mudança no status atualiza o dado, antes da clonagem a seguir
					item_dados_bs = $.extend(true, {}, item_dados);//necessita usar $.extend() para fazer a clonagem deixando os dados independentes
				}else if(dados.stts == 2){//Se houve erro
					pagina == 1 ? $(".wrap-cover .btn").removeClass('d-nn') : null;//reexibe o botão "iniciar"
					if(pagina == 2){
						tipo == 1 ? $(".st-txt").val(qst_num) : null;//realimenta a caixa de texto da navegação com o nº da questão atual
						tipo == 2 ? quiz_dados.questoes.pop() : null;//remove a nova questão (último item) anteriormente incluída
					}
					Mensagem("Erro!", dados.msg, 2);
				}else if(dados.stts == 3){//Se houve acesso negado
					AcessoNegado(dados.msg);
				}
				//console.log(dados.msg);
			},
			error: function (){
				$(".block-s").hide();
				pagina == 1 ? $(".wrap-cover .btn").removeClass('d-nn') : null;//reexibe o botão "iniciar"
				if(pagina == 2){
					tipo == 1 ? $(".st-txt").val(qst_num) : null;//realimenta o caixa de texto da navegação com o nº da questão atual
					tipo == 2 ? quiz_dados.questoes.pop() : null;//remove a nova questão (último item) anteriormente incluída
				}
				Mensagem("Erro!", "Houve um problema inesperado. Por favor, tente novamente ou se o erro persistir contate-nos pelo e-mail: "+link_email, 2);
			}
		});
		//Anula itens que possuem referência à vários objetos e dados
		params_obj = null;
		etp_dados_ar = null;
	}
	//Função que verifica se o quiz atual está completo, retornando para atualizar "status" no banco e aqui. É independente de outras verificações específicas em cada página
	function VerificaStatus(tp){
		var stts_inc = false;//status de incompleto
		//Verifica se algum dado obrigatório está imcompleto - com valor indefinido, nulo, zero ou vazio
		if(!item_dados.id_categ1 || !item_dados.id_categ2 || !item_dados.id_categ3 || !item_dados.assunto){//Dados iniciais/principais
			stts_inc = true;
		}else if($.map(quiz_dados.autoria, function(val){ if(val.elab==1){return 1}; }).length == 0){//Dados de autoria (se há algum elaborador)
			stts_inc = true;
		}else{//Dados de questões (apenas enunciado e fontes de crédito)
			var qst_total = quiz_dados.questoes.length;//total de questões existentes
			for(var i=0; i<qst_total; i++){
				if(quiz_dados.questoes[i].stts_uso == 1){//Se questão foi gerada por este quiz
					//Se é página de questão e tipo é 2 (criando nova questão) pula a última que ainda será salva ou se é tipo 4 (exclusão de questão) pula a atual que não mais existirá
					if(pagina == 2 && ((tp == 2 && i == qst_total-1) || (tp == 4 && i == qst_num-1))){
						continue;
					}
					//Verifica questão - se alguma não tem fonte e não está setada como original seta variável para status incompleto
					if(!quiz_dados.questoes[i].enunciado || (!quiz_dados.questoes[i].fonte && !quiz_dados.questoes[i].fnt_quiz)){
						stts_inc = true;
						break;
					}
				}
			}
		}
		//Caso tenha havido mudança quanto aos dados obrigatórios retorna novo status a ser aplicado, se não há mudanças retorna "false". Se for quiz desativado (0) o status não se altera
		if((!stts_inc && item_dados.status == 1) || (stts_inc && item_dados.status > 1)){
			return (stts_inc ? 1 : 2);//se está incompleto retorna 1, ou retorna 2 para status de completo e despublicado
		}else{
			return false;
		}
	}

	/*---- /Capa/ ----*/
	//Alimenta a capa usando os dados do item quiz e categorização e prepara o botão inicial
	function Capa(){
		//A caixa de seleção da categoria 1 sempre será alimentada. Se é edição de quiz existente, usa categorização para alimentar as demais listas e seta a cor
		$("#inp-categ1").addOption(categorias_dados.categ1, false);
		if(id_quiz != null){
			//Alimenta as listas de seleção (categorias) e o assunto. 
			$("#inp-categ1").val(String(item_dados.id_categ1));
			$("#inp-categ2").addOption(categorias_dados.categ2, false);
			$("#inp-categ2").val(String(item_dados.id_categ2));
			$("#inp-categ3").addOption(categorias_dados.categ3, false);
			$("#inp-categ3").val(String(item_dados.id_categ3));
			$("#inp-txt").val(item_dados.assunto);
			//Para cada nível há um padrão de cor diferente. Exemplo com o sistema "Página do usuário", se o nível é "Educ. Infantil" (categoria1=1) -> "1": [2, {1:6, 2:9, 3:2}] ou "nível": ["categ. q determina a cor", {"id 1":cor6, "id 2":cor9, "id 3":cor2}]
			var categ_cor = padrao_cor[item_dados.id_categ1];//padrão de cores, ex.: se o nível é "Educ.Infantil" então valerá [2, {1:6, 2:9, 3:2}] ou ["categ. Ano", {"3 anos":cor6, "4 anos":cor9, "5 anos":cor2}].
			var num_cor = categ_cor[1][item_dados["id_categ"+categ_cor[0]]];//recebe o número da cor conforme o id da categoria que determina a cor. O objeto de cor possui id da categoria (chave) e o número de cor padrão do Quiz (valor) -> {id-categoria: cor-padrão, ...}
			$("#quiz-adm").removeClass("tipo-0");
			$("#quiz-adm").addClass("tipo-"+num_cor);//aplica ao quiz a classe "tipo-*" conforme o id da categoria que determina a cor, alterando o padrão de cores automaticamente
		}
		//Prepara manipulações e carregamentos para quando as listas são alteradas seguindo hierarquias
		var inp_titulo_ar = $(".select-quiz").map(function(){ return $(this).find("option:first").text(); });//cria array com os títulos das categorias para realimentá-las oportunamente
		$(".wrap-form-adm .select-quiz").on("change",function(){//#inp-categ1, #inp-categ2, #inp-categ3...
			var inp_categ = $(this).attr("id").match(/\d+$/g)[0];//número da categoria selecionada. Regexp: um-ou-mais-digitos seguido de final-da-string
			var inp_val = $(this).val();//valor (id) da opção selecionada
			//Alterando e carregando conforme caixa selecionada
			if(inp_categ != "3"){//Se não foi selecionada a última caixa de seleção na hierarquia desabilita os próximos e carrega a próxima categoria
				var elmts = $(this).nextAll(".select-quiz");//próximos elementos do atualmente selecionado
				elmts.val("ttl");
				elmts.attr("disabled", "");
				elmts.css("opacity", "0.8");
				if(inp_val != "ttl" && inp_val != item_dados["id_categ"+inp_categ]){//Se não foi selecionado o primeiro "option" (título) da seleção e seu valor é diferente do atualmente setado pra essa categoria, carrega a próxima
					elmts.removeOption(/^(?!ttl)/);//remove os "option" exceto o primeiro. Regexp: início-de-string(não-seguido de ttl)
					$(elmts[0]).find("option:first").text("carregando...");
					params_obj = {acao:"carregar_categoria", ctg:(Number(inp_categ)+1), id_pai:inp_val};
					$.post(site_url+"/admin/controller/ctrl_admin.php", params_obj, function(dados){
						if(dados.stts == 1){
							$(elmts[0]).addOption(dados.categoria, false);
							$(elmts[0]).removeAttr("disabled");
							$(elmts[0]).css("opacity", "");
							$(elmts[0]).find("option:first").text(inp_titulo_ar[Number(inp_categ)]);
							item_dados["id_categ"+inp_categ] = inp_val;//seta o novo valor selecionado da categoria alterada
						}else if(dados.stts == 2){//Se houve erro
							$("#inp-categ"+inp_categ).val("ttl");
							Mensagem("Erro!", dados.msg, 2);
						}else if(dados.stts == 3){//Se houve acesso negado
							AcessoNegado(dados.msg);
						}
						//console.log(dados.msg);
					}, "json");
				}else if(inp_val != "ttl"){//Se o valor do "option" selecionado é o mesmo do atualmente setado pra essa categoria, apenas habilita o próximo
					$(elmts[0]).removeAttr("disabled");
					$(elmts[0]).css("opacity", "");
				}
			}else if(inp_val != "ttl"){
				item_dados["id_categ"+inp_categ] = inp_val;//seta o novo valor selecionado da categoria alterada
			}
			//Mudança de cores conforme seleção. Qualquer seleção repete o processo para evitar que uma cor mantenha-se em seleções neutras
			inp_categ == "1" && inp_val != "ttl" ? categ_cor = padrao_cor[inp_val] : null;//na mudança de opções de 1º nível (categoria 1) atribui-se o padrão de cores correspondente
			var clss_ar = $("#quiz-adm").attr('class').match(/tipo-\d+/);//encontra qualquer cor já setada
			clss_ar != null ? $("#quiz-adm").removeClass(clss_ar[0]) : null;//se há cor, remove-a
			var num_cor = categ_cor[1][$("#inp-categ"+categ_cor[0]).val()];//número de cor conforme valor da opção ativada na categoria que determina a cor
			$("#quiz-adm").addClass("tipo-"+(num_cor!=undefined ? num_cor : "0"));//seta a cor determinada ou a cor 0 (neutra)
			VerificaCampos();//exibe o botão inicial caso a categorização esteja completa e assunto preenchido, ou oculta-o
		});
		//Ao ocorrer alterações no campo de texto de "assunto": se não está preenchido só com espaços ou só vazio, atualiza o "item_dados.assunto" e exibe o botão inicial
		$("#inp-txt").on("keyup change paste", function(){
			item_dados.assunto = $(this).val();
			VerificaCampos();//exibe o botão inicial caso a categorização esteja completa e assunto preenchido, ou oculta-o
		});
		//Seta o valor para "random_quest" ou "random_alternat" nos dados do quiz quando o checkbox é alterado
		var random_ar = ["random_quest", "random_alternat"];
		$("#random-quest, #random-alternat").each(function(indx){
			$(this).prop("checked", (item_dados[random_ar[indx]]==1 ? true : false));
			$(this).on("click", function(){
				item_dados[random_ar[indx]] = ($(this).is(":checked") ? "1" : "0");
			});
		});
		//Altera o texto do botão inicial e já o exibe se é quiz existente
		$(".wrap-cover .btn").text(id_quiz!=null ? "Editar" : "Criar");
		id_quiz != null ? setTimeout(function(){$(".wrap-cover .btn").removeClass('d-nn');}, 200) : null;//o temporizador é usado devido às mudanças simultâneas de classe de elementos pai que ocorrem acima (?)
		//Ao usuário clicar para iniciar: chama a função de salvamento que insere/atualiza dados para então montar as questões
		$(".wrap-cover .btn").on("click", function(){
			$(".wrap-cover .btn").addClass('d-nn');
			SalvarCarregar();
		});
	}
	//Função verifica se os campos obrigatórios de categorização estão completos e assunto preenchido, exibindo o botão inicial ou ocultando-o
	var btn_tm;//cria a variável de tempo - global para este escopo
	function VerificaCampos(){
		if($(".select-quiz").selectedValues().indexOf("ttl") == -1 && (/\S{3}/).test($("#inp-txt").val()) == true){//Se nenhuma caixa está selecionada na "option" de título e se assunto não está vazio - regexp: não-espaço em sequência-de-três
			clearTimeout(btn_tm);//limpa o temporizador antes de reseta-lo
			btn_tm = setTimeout(function(){$(".wrap-cover .btn").removeClass('d-nn');}, 200);//o temporizador é usado devido às mudanças simultâneas de classe de elementos pai que ocorrem acima (?)
			return true;
		}else{
			$(".wrap-cover .btn").addClass('d-nn');
			return false;
		}
	}

	/*---- /Questões/ ----*/
	//Função que monta cada questão, suas alternativas e os demais detalhes de interação
	function Quest(ini, qstn){
		/*---- Inicia questão ----*/
		//A variável "quest_dados" terá o objeto de dados da questão da vez. É necessariamente uma referência (não independente) de "quiz_dados.questoes[indx]", qualquer alteração também ocorrerá em "quiz_dados"
		qst_num = qstn;//variável global que só é atribuída se esta função foi efetivamente chamada
		quest_dados = quiz_dados.questoes[qst_num-1];
		id_quest = quest_dados.id_quest;//seta o id da questão podendo ser "null" para nova ou um valor, determinando a existência da questão atual
		//Se a função é chamada pela primeira vez: prepara a edição e manipulação das questões, senão apenas re-seta os elementos para cada página de questão
		if(ini === true){
			//Declara variáveis principais das questões
			altr_min = 2;//mínimo de alternativas por questão
			letras_ar = ["A","B","C","D","E","F","G"];
			wrapchoice = "#quiz-core .alternative .wrap-choice";//hierarquia até a classe das alternativas
			//Carrega o topo, se houver
			if(item_dados.topo){
				MontaImagem($("#topo-img"), (static_img+"/"+item_dados.topo));
			}
			/*--- Manipula - janela de opções ---*/
			//Monta a escolha dos tipos de questão aplicando às alternativas existentes. O parâmetro "qstini" valerá "true" inicialmente a cada vez que uma questão existente é carregada
			$(".wrap-mult .rd-mult input").on("click", function(event, qstini){
				event.stopPropagation();//executa apenas o evento do input, sem propagar para seus pais
				var tipo = $(this).parent().index()+1;//índice do elemento/opção clicado
				if(tipo <= 2){//Se tipo é única ou múltipla escolha
					$(wrapchoice+" .ck-resp").removeClass('d-nn');
					$(wrapchoice+" .choice").removeClass('active');//sem destaque
					$(wrapchoice+" .choice").css("cursor", "default");//cursor padrão
					$(wrapchoice+" .ck-resp").prop("checked", false);//desmarca todas alternativas
					$(wrapchoice+" .ck-resp").attr("type", (tipo==1 ? "radio" : "checkbox"));//elemento "input" tipo "radio" só permite um selecionado e "checkbox" permite vários
				}
				if(tipo == 3){//Se tipo é "verdadeiro/falso"
					$(wrapchoice+" .ck-resp").addClass('d-nn');
					$(wrapchoice+" .choice").addClass('active');//destaca muda a cor do fundo dos círculos das alternativas
					$(wrapchoice+" .choice").css("cursor", "pointer");//cursor de clique
					$(wrapchoice+" .choice").text("F");//todas as alternativas como falso
				}
				//Para todos os tipos de alternativas//-->tipo relacionar
				$(wrapchoice).removeClass('active');//retira destaque de todas
				for(var i=0; i<quest_dados.alternativas.length; i++){//Usa o "loop" para alterações sequenciais em cada alternativa
					var altr_dds = quest_dados.alternativas[i];
					tipo <= 2 ? $(wrapchoice+":eq("+i+") .choice").text(letras_ar[i]) : null;//preenche a letra
					if(qstini===true){//Inicialmente na questão existente altera cada alternativa
						tipo == 3 ? $(wrapchoice+":eq("+i+") .choice").text(altr_dds.indic==1 ? "V" : "F") : null;//se é tipo 3 preenche a letra com "V\F"
						if(tipo <= 2){
							$(wrapchoice+":eq("+i+") .ck-resp").prop("checked", (altr_dds.indic==1 ? true : false));//seleciona
							altr_dds.indic==1 ? $(wrapchoice+":eq("+i+")").addClass('active') : null;//destaca
						}
					}else{
						altr_dds.indic = 0;//seta todas alternativas para falso (indic = 0)
					}
				};
				//Seta o tipo para a questão atual
				quest_dados.tipo = tipo;
				document.activeElement == $(this).get(0) ? document.activeElement.blur() : null;//no clique, se uma opção está focada, desfoca-a, evitando mudança de opção pelo teclado nesse momento
			});
			/*--- Manipula - eventos de questão - mídias e info ---*/
			/*-->//Caso haja alguma figura ou outros tipos de mídia (ou mesmo embed) para ser exibido, monta o link/botão "midia" aplicando os efeitos da biblioteca "FancyBox"
			if(quest.midia != null && quest.midia != ""){*/
				//var patt = /\/.*\..*/ig;//expressão pra barras que caracterizam url's
				/*if(!patt.test(quest.midia)){//Se for uma mídia interna
					$(".question .midia").attr({href: static_img+"/"+quest.midia, title: quest.midia_ttl});
					$(".question .midia").fancybox({
						live: false,
						helpers: { title: {type: 'float'} }
					});
				}else{
					var patt = /^<.+>/i;//expressão que caracteriza tag's
					if(!patt.test(quest.midia)){//Se "embed" tem apenas um link, acrescenta-o para a "FancyBox" detectar automaticamente o tipo e servidor de origem (YouTube, GoogleMaps, etc.)
						$(".question .midia").attr({href: quest.midia, title: quest.midia_ttl});
						$(".question .midia").addClass('fancybox.'+(!(/\.swf(\b|\?)/gmi).test(quest.midia) ? 'iframe' : 'swf'));//classe da "FancyBox" que seta o tipo "iframe" ou "swf", garantindo que abra qualquer arquivo, como 'pdf', por exemplo, ou arquivos flash (funcionando o fullscreen)
						$('.question .midia').fancybox({
							live: false,
							padding: 0,
							helpers: {
								title: {type: 'float'},
								media: {}
							}
						});
					}else{//Se "embed" for uma tag ("<iframe>", "<object>", etc.) passa seu conteúdo diretamente para a "FancyBox" ao clique do botão
						$(".question .midia").attr({href: "#", title: "Mídia"});
						$(".question .midia").on("click", function(){
							$.fancybox(quest.midia);
						});
					}
				}
				$(".question .midia").removeClass('d-nn');//exibe o botão "midia"
			}
			//Caso haja alguma informação para ser exibida, monta a estrutura (textos e linques) para abrir diretamente por "FancyBox" e exibe o link/botão "info"
			if(quest.informacoes != null && quest.informacoes.length > 0){
				var info_cntd = "<div class='txt-info'>";
				for(var i=0; i<quest.informacoes.length; i++){
					var info = quest.informacoes[i];
					if(info.url==null || info.url==""){
						info_cntd += "<span>- "+info.info+"</span>";
					}else{
						var patt = /^(?!.+:\/\/)/i;//expressão regular para: início do texto ("^") não seguido ("?!") de qualquer caractere (".") em qualquer quantidade ("+") e seguido de "://"
						patt.test(info.url) ? info.url=("http://"+info.url) : null;//se o link não é iniciado por algum protocolo de comunicação ("http://", "https://", "ftp://", etc.) coloca o padrão "http://"
						info_cntd += "<a href='"+info.url+"' target='_blank'>- "+info.info+"</a>";
					}
				}
				info_cntd += "</div>";
				$(".question .info").on("click", function(){
					$.fancybox({
						title: "Informações",
						content: info_cntd,
						autoCenter: true,
						helpers:{
							title:{type: 'float', position: 'top'}
						},
						afterLoad: function(){
							$(".fancybox-inner").css({"background-color": "#e0e0e0"});
						}
					});
				});
				$(".question .info").removeClass('d-nn');//exibe o botão "info"
			}*/
			/*--- Manipula - eventos de questão - enunciado & subtitulo ---*/
			//Quando a caixa de texto do enunciado ou subtítulo em modo minimizado é apontada, destaca-as por cor
			$("#txt-enunc, #txt-subt, .question .it-img").on("mouseover", function(event){
				$(this).parents(".question").hasClass('min') ? $("#txt-enunc, #txt-subt, .question .it-img").css("background-color", "#F0EEDB") : null;
			}).mouseout(function(){
				$("#txt-enunc, #txt-subt, .question .it-img").css("background-color", "");
			});
			//Após pressionar qualquer tecla no campo de texto do enunciado atualiza o dado (html) com temporizador, garantindo captura de alterações sem repetições desnecessárias
			var enncd_tm;//cria a variável de tempo - global para este escopo
			$("#txt-enunc").on("input keyup paste", function(){//-->futuramente substituir pelo evento "input" apenas, novo e mais apropriado, para capturar qualquer inserção e alteração, sem temporizador
				clearTimeout(enncd_tm);//limpa o temporizador antes de reseta-lo
				enncd_tm = setTimeout(function(){
					quest_dados.enunciado = $("#txt-enunc").html();//atualiza o dado
				}, 300);
			});
			//Ao ocorrer alterações no campo de texto do subtítulo: atualiza o dado
			$("#txt-subt").on("input change paste", function(){//-->"input" ainda não funciona em todos browsers, quando for o caso usá-lo sozinho
				quest_dados.subtitulo = $(this).val() || null;//subtítulo estará preenchido ou poderá ser nulo
			});
			//Ao desfocar da caixa do enunciado, se vazio: limpa o elemento e atualiza o dado (após isso o usuário nem sempre poderá retrazer conteúdo com cntrl+z)
			$("#txt-enunc").on("focusout", function(){
				//Se houver apenas caracteres de tipo espaço (espaço-simples, nova-linha, etc) ou vazio, limpa o elemento completamente
				if((/^\s*$/g).test($("#txt-enunc").text())){//regexp: inicio-de-string seguido de caractere-espaço zero-ou-mais-vezes seguido de fim-de-string
					$("#txt-enunc").empty();
					quest_dados.enunciado = null;//deixa dado do enunciado nulo
				}
			});
			//Quando o enunciado é pressionada guarda a posição do mouse em relação a caixa para ao focar: rolar até a linha do cursor
			var enncd_msy;//cria a variável como global para este escopo
			$("#txt-enunc").on("mousedown", function(event){
				enncd_msy = event.pageY - $(this).offset().top;//a coordenada Y do mouse em relação ao topo da página menos a coordenada da caixa
			});
			//Ao se focar nas caixas de texto do enunciado ou subtítulo: expande-se e prepara-se para voltar a ser minimizado
			$("#txt-enunc, #txt-subt").on("focusin", function(){
				if($("#txt-enunc").text()=="" || $(this).parents(".question").hasClass('min')){//Executa apenas se estiver vazio (permitido) ou minimizado, evitando problemas e repetições ao refocar a caixa com ela já maximizada
					$("body").mousedown();//executa se foi anteriormente setado e ainda existe (navegação por "tab")
					var $wrap_fcd = $(this).parents(".question");//elemento pai focado
					setTimeout(function(elmt){//Usa um temporizador para que foco na linha clicada aconteça antes das aplicações na caixa
						$wrap_fcd.removeClass('min');//maximiza área da questão
						$(elmt).is("#txt-enunc") && enncd_msy ? $("#txt-enunc").scrollTop(enncd_msy-50) : null;//rola até a linha do cursor (carret)
						$("#txt-enunc, #txt-subt").removeAttr("style");//remove todos estilos aplicados (como cor de fundo e os aplicados ao usuário alterar tamanho)
						$(".question .it-img").css("background-color", "");//remove do elemento de imagem apenas a cor de fundo
						//$(".question .wrap-img").removeClass('d-nn');//exibe elemento de imagem, sempre
					}, 100, this);
					//Aplica evento (rotulado) ao "body", verificando quando o usuário clica fora do elemento pai
					$("body").off("mousedown.enncmin").on("mousedown.enncmin", function(event){//Ao qualquer elemento ser pressionado. É usado "off()" para evitar duplicação do evento
						//Verifica se o alvo não é a div pai ("wrap_fcd") e não é um elemento filho dela, se não é botão de navegação, botões de edição de questão ou nova alternativa
						if(!$(event.target).is($wrap_fcd) && $wrap_fcd.has(event.target).length == 0 && $(event.target).parents(".wrap-btn").length == 0 && !$(event.target).is("#nova-alternat")){//Filtro de exceções
							if($("#txt-enunc").text()){//Se houver algum texto digitado: 
								$(".question").addClass('min');//minimiza o elemento pai
								$(".question .wrap-img .it-img").css("background-image") == "none" ? $(".question .wrap-img").addClass('d-nn') : null;//se não houver imagem carregada: oculta elemento
							}
							//$("body").off("mousedown.enncmin");//elimina evento de clique
						}
					});
				}
			});
			//Ao clicar-se na imagem: executa evento que expande os elementos
			$(".question .it-img").on("click", function(){
				$(this).parents(".question").hasClass('min') ? $("#txt-enunc").focusin() : null;
			});
			//Prepara menu de edição para formatação do enunciado. O quarto parâmetro é função a ser executada após edição no texto pelo menu e os parâmetros são: a caixa editável, dados da seleção e exec (true/false, informando se o commando foi suportado)
			$(".question .menu-edit").formatTxt($("#txt-enunc"), null, null, function(cx, slc, exc){
				FormatAtualizaExibeMsg(cx, slc, exc);
			});
			/*--- Manipula - eventos de alternativas ---*/
			//Quando a caixa de texto da alternativa em modo minimizado é apontada, destaca-se por cor
			$(".txt-alternat").on("mouseover", function(){
				$(this).parents(".wrap-choice").hasClass('min') ? $(this).css("background-color", "#F0EEDB") : null;
			}).mouseout(function(){
				$(this).css("background-color", "");
			});
			//Ao ocorrer alterações no campo de texto da alternativa: atualiza o dado (html)
			var altrntv_tm;//cria a variável de tempo - global para este escopo
			$(".txt-alternat").on("input keyup paste", function(){//-->futuramente substituir pelo evento "input" apenas, novo e mais apropriado, para capturar qualquer inserção e alteração, sem temporizador
				clearTimeout(altrntv_tm);//limpa o temporizador antes de reseta-lo
				altrntv_tm = setTimeout(function(elmt){
					quest_dados.alternativas[$(elmt).parents(".wrap-choice").index()].txt = $(elmt).html() || null;//atualiza o dado
				}, 300, this);
			});
			//Ao desfocar da caixa da alternativa, se vazio: limpa o elemento e atualiza o dado (após isso o usuário nem sempre poderá retrazer conteúdo com cntrl+z)
			$(".txt-alternat").on("focusout", function(){
				//Se houver apenas caracteres de tipo espaço (espaço-simples, nova-linha, etc) ou vazio, limpa o elemento completamente
				if((/^\s*$/g).test($(this).text())){//regexp: inicio-de-string seguido de caractere-espaço zero-ou-mais-vezes seguido de fim-de-string
					$(this).empty();
					quest_dados.alternativas[$(this).parents(".wrap-choice").index()].txt = null;//deixa dado da alternativa nulo
				}
			});
			//Quando a alternativa é pressionada guarda a posição do mouse em relação a caixa para ao focar: rolar até a linha do cursor
			var altrntv_msy;//cria a variável como global para este escopo
			$(".txt-alternat").on("mousedown", function(event){
				if($(this).parents(".wrap-choice").hasClass('min')){
					altrntv_msy = event.pageY - $(this).offset().top;//a coordenada Y do mouse em relação ao topo da página menos a coordenada da caixa
				}
			});
			//Ao se focar na caixa de texto: alternativa expande-se e prepara-se para voltar a ser minimizada
			$(".txt-alternat").on("focusin", function(){
				if($(this).parents(".wrap-choice").hasClass('min')){//Executa apenas se estiver minimizado, evitando problemas e repetições ao refocar a caixa com ela já maximizada
					$("body").mousedown();//executa se foi anteriormente setado e ainda existe (navegação por "tab")
					var $wrap_fcd = $(this).parents(".wrap-choice");//elemento pai focado
					var $txt_fcd = $(this);//elemento "textarea" filho focado
					setTimeout(function(){//Usa um temporizador para que foco na linha clicada aconteça antes das aplicações na caixa
						$wrap_fcd.removeClass('min');//maximiza área da alternativa
						altrntv_msy ? $($txt_fcd).scrollTop(altrntv_msy-50) : null;//rola até a linha do cursor (carret)
						$txt_fcd.removeAttr("style");//remove todos estilos aplicados (como cor de fundo e os aplicados ao usuário alterar tamanho)
						$txt_fcd.attr("placeholder", "Digite uma alternativa");//altera legenda de conteúdo da alternativa
						$wrap_fcd.find(".it-img").css("background-color", "");//remove do elemento de imagem apenas a cor de fundo
						//$wrap_fcd.find(".wrap-img").removeClass('d-nn');//exibe elemento de imagem, sempre
					}, 100);
					//Aplica evento (rotulado) ao "body", verificando quando o usuário clica fora do elemento pai
					$("body").off("mousedown.altrmin").on("mousedown.altrmin", function(event){//Ao qualquer elemento ser pressionado. É usado "off()" para evitar duplicação do evento
						//Verifica se o alvo não é a div pai ("wrap_fcd") e não é um elemento filho dela, se não é botão de navegação, botões de edição de questão ou nova alternativa
						if(!$(event.target).is($wrap_fcd) && $wrap_fcd.has(event.target).length == 0 && $(event.target).parents(".wrap-btn").length == 0 && !$(event.target).is("#nova-alternat")){//Filtro de exceções
							$wrap_fcd.addClass('min');
							$wrap_fcd.find(".wrap-img .it-img").css("background-image") == "none" ? $wrap_fcd.find(".wrap-img").addClass('d-nn') : null;//se não houver imagem carregada: oculta elemento
							$txt_fcd.attr("placeholder", "Preencha a alternativa");
							$("body").off("mousedown.altrmin");
						}
					});
				}
			});
			//Quando o elemento da letra de alternativa for clicado manipula-o e atualiza os dados
			$(wrapchoice+" .choice").on("click", function(){
				if(quest_dados.tipo == 3){//Se o tipo é "verdadeiro/falso"
					$(this).text($(this).text()!="V" ? "V" : "F");//preenche o texto da alternativa com "V" ou "F"
					quest_dados.alternativas[$(this).parent().index()].indic = ($(this).text()=="F" ? 0 : 1);//seta o valor "indic" no objeto "quest_dados"
				}
			});
			//Quando a checagem de alternativa é clicada verifica a escolha e destaca conforme o tipo de questão, atualizando os dados das questões
			$(wrapchoice+" .ck-resp").on("change", function(){
				var $wrpchc = $(this).parents(".wrap-choice");
				if(quest_dados.tipo == 1){//Se é tipo "única escolha"
					$wrpchc.addClass('active');//ativa o clicado
					$wrpchc.siblings(".wrap-choice").removeClass('active');//desativa todos os demais
				}else if(quest_dados.tipo == 2){//Se é tipo "múltipla escolha"
					$(this).is(":checked") == true ? $wrpchc.addClass('active') : $wrpchc.removeClass('active');//remove ou adiciona a classe "active"
				}
				//Verifica em cada elemento de alternativa se está marcada ou não e seta o valor "indic" no objeto "quest_dados"
				for(var i=0; i<quest_dados.alternativas.length; i++){
					quest_dados.alternativas[i].indic = ($(wrapchoice+":eq("+i+") .ck-resp").is(":checked")==true ? 1 : 0);
				};
			});
			//Quando exclusão de alternativa é clicado verifica se as existentes atendem ao mínimo de alternativas e atualiza dados
			$(wrapchoice+" .ico-trash").on("click", function(){
				if(quest_dados.alternativas.length > altr_min){
					quest_dados.alternativas.splice($(this).parents(".wrap-choice").index(), 1);//remove primeiramente o item conforme o índice do elemento
					$(this).parents(".wrap-choice").remove();//remove o elemento
					OrdenaAlternativas();//deve ser chamado após remover o elemento
					quest_dados.alternativas.length <= altr_min ? $(wrapchoice+" .ico-trash").addClass('disabled') : null;//se agora o mínimo foi atingido desabilita exclusão
				}else{
					Mensagem("Não permitido", "É necessário manter o mínimo de "+altr_min+" alternativas.", 2);
				}
			});
			//Clicando-se no botão "nova alternativa" clona mais uma e atualiza os dados
			$("#nova-alternat").on("click", function(){
				var altr_total = quest_dados.alternativas.length;//total de alternativas
				if(altr_total < letras_ar.length){//Adiciona alternativas só até o máximo determinado pela quantidade de letras disponíveis em "letras_ar"
					var $elmt_novo = $(wrapchoice+":eq(0)").clone(true, true);//a função "$.clone(true, true)" usa true para copia total de propriedades e eventos
					$elmt_novo.addClass('min');//garante que a nova alternativa esteja minimizada
					$elmt_novo.find(".choice").text(quest_dados.tipo<=2 ? letras_ar[altr_total] : "F");//preenche a letra-->ver tipo relacionar
					$elmt_novo.find(".txt-alternat").empty();//limpa o conteúdo da caixa de texto e tudo o que o acompanha
					$elmt_novo.find(".ck-resp").prop("checked", false);//desmarca antes de inserir (assim não desmarca outra alternativa, quando é tipo 1)
					$elmt_novo.removeClass('active');//retira destaque
					$elmt_novo.insertAfter(wrapchoice+":eq("+(altr_total-1)+")");//insere o elemento alternativa após a última existente
					//Adiciona novo objeto nas alternativas desta questão usando o maior id existente, já que a ordem pode ter sido alterada e alternativas podem ter sido excluídas
					var id_ultm = $.map(quest_dados.alternativas, function(val, indx){ return val.id_alternat; }).sort().pop();//"$.map()" aqui retorna array com o id de cada alternativa, "sort()" organiza por ordem crescente e "pop()" remove e traz o valor do último item (maior id)
					$(wrapchoice+":eq("+altr_total+")").attr("data-id-alternat", (id_ultm+1));//seta no elemento o valor "data-id-alternat"
					quest_dados.alternativas.push($.extend(true, {}, questao_novo_obj.alternativas[0]));//inclui novo objeto padrão nas alternativas da questão
					quest_dados.alternativas[altr_total].id_alternat = id_ultm+1;//atualiza valor de "id_alternat"
					quest_dados.alternativas[altr_total].ordem = altr_total+1;//atualiza valor de "ordem"
					quest_dados.alternativas.length > altr_min ? $(wrapchoice+" .ico-trash").removeClass('disabled') : null;//se o total é maior que o mínimo habilita exclusão
					//Remove (da clonagem) e depois aplica o plugin de formatação de texto ao menu da alternativa
					$.fn.formatTxt.destroy($(wrapchoice+":eq("+altr_total+")"+" .menu-edit"));//remove eventos e dados aplicados do plugin "formatTxt()"
					$(wrapchoice+":eq("+altr_total+")"+" .menu-edit").formatTxt(function(){return $(this).parent().find(".txt-alternat")}, null, null, function(cx, slc, exc){
						FormatAtualizaExibeMsg(cx, slc, exc);
					});
				}
			});
			/*--- Manipula - eventos de upload de imagem ---*/
			//Evento chamado ao usuário apontar sobre o elemento de upload
			$(".wrap-img").hover(function(){
				if($(this).find(".it-img").css("background-image") != "none"){//Se há imagem carregada:
					$(this).find(".ico-del").removeClass('d-nn');//exibe o botão de excluir a imagem atual
					$(this).find(".it-img").css("opacity", "0.3");//aplica na imagem opacidade baixa para que os elementos superiores apareçam
				}
			}, function(){
				if($(this).find(".it-img").css("background-image") != "none"){//Se há imagem carregada:
					$(this).find(".ico-del").addClass('d-nn');//oculta o botão de excluir
					$(this).find(".it-img").css("opacity", ($(this).attr("id")=="topo-img" ? "0.7" : ""));//reaplica na imagem opacidade alta (para topo) ou total
				}
			});
			//Quando o usuário clicar sobre a área de upload, abre janela de edição da imagem para recorte (plugin "Cropper")
			$(".wrap-img").click(function(){
				if($(this).find(".it-img").css("background-image") == "none"){//Se não há imagem carregada:
					$(".block-j").show();//exibe o fundo escuro e bloqueia tela enquanto edita-se a imagem
					$("#img-edit").addClass('v-hd');//deixa a janela de edição de imagem invisível apesar de disponível
					$("#img-edit").removeClass('d-nn');//disponibiliza a janela de edição de imagem para cálculos e antes de aplicar o "Cropper"
					var wrpid = $(this).attr("id");//guarda o id para diferenciação de elementos (topo, enunciado, etc.)
					var lrg_pdr = $("#img-edit").width()-4;//largura padrão conforme o total da janela de edição de imagem, menos 4 de borda
					var aspct, vw_md, drg_md;//declara variáveis para proporção e outras opções
					if(wrpid == "topo-img"){//Se é topo:
						aspct = Math.ceil(80/11);//proporção padrão do topo (800px / 110px). Arredonda acima para melhor garantir o ajuste do Cropper
						vw_md = 1;//modo de vizualização (área de corte) limitado à área da imagem carregada
						drg_md = "move";//modo de arrasto da área de seleção da imagem
						$("#img-vislzr-trgt").width(lrg_pdr);//largura do visualizador com o total da largura padrão
						$("#img-vislzr-trgt").height(lrg_pdr/aspct);//altura do visualizador proporcional a sua largura já setada
					}else{//Se é qualquer imagem geral
						aspct = NaN;//sem manter proporção
						vw_md = 0;//modo de vizualização (área de corte) ilimitado
						drg_md = "crop";//modo de arrasto da área de seleção da imagem
						var lrg_max, alt_max;//declara variáveis de medidas máximas
						if(wrpid == "enunc-img"){//Se é enunciado:
							lrg_max = 620; alt_max = 300;
						}else if(wrpid == "midia-img"){//Se é midia:
							lrg_max = 700; alt_max = 700;
						}else{//Se for alguma alternativa [não usam "id"]:
							lrg_max = 620; alt_max = 200;
						}
						$("#img-vislzr-trgt").width(Math.min(lrg_max, lrg_pdr));//largura inicial (máxima) ou a largura padrão, se menor
						$("#img-vislzr-trgt").height(alt_max);//altura inicial (máxima)
					}
					$("#img-edit-vislzr").height($("#img-vislzr-trgt").height());//fixa a altura do envólucro do elemento de visualização no mesmo tamanho
					$("#img-edit-cntnr").css("max-height", $(window).height()-$("#img-edit-vislzr").height()-150);//seta a altura máxima do "container" (altura da janela menos visualizador e sobras) antes de executar o "Cropper"
					$("#img-input").focus().trigger("click");//executa o clique do elemento "input" de imagem para o usuário importar imagem
					//Aplica as opções pelo método do plugin "Cropper"
					$img_trgt.cropper({
						aspectRatio:aspct,
						preview:"#img-vislzr-trgt",
						viewMode:vw_md,
						dragMode:drg_md
					});
					//Evento chamado quando o "Cropper" está montado com a imagem já importada - só então exibe o editor
					$img_trgt.on("built.cropper", function(e){
						$("#img-edit").removeClass('v-hd');//deixa a janela de edição de imagem visível
					});
				}
			});
			//Ao usuário clicar sobre o botão de excluir imagem: exclui e reexibe elementos
			$(".wrap-img .ico-del").click(function(event){
				event.stopPropagation();//executa o evento do elemento, sem propagar à seus pais
				var $wrap_img = $(this).parents(".wrap-img");//elemento pai da área de upload
				if($wrap_img.find(".it-img").css("background-image") != "none"){//Se há imagem carregada:
					Mensagem("Confirme", "Deseja mesmo excluir a imagem atual?", 0, true, function(ret){//Essa função usa a "Fancybox" como "modal = true" e precisa de uma função localizada para o retorno ("ret")
						if(ret === 1){//Usuário clicou "sim"
							//-->Excluir imagem do banco e o arquivo
							DesmontaImagem($wrap_img);
							var wrpid = $wrap_img.attr("id");//id para diferenciação de elementos (topo, enunciado, etc.)
							if(wrpid == "topo-img"){//Se é topo:
								item_dados.topo = null;//atualiza o dado de imagem para nulo
							}else if(wrpid == "enunc-img"){//Se é enunciado:
								quest_dados.enunciado_img = null;//atualiza o dado de imagem para nulo
							}else if(wrpid == "midia-img"){//Se é midia:
								quest_dados.midias = null;//atualiza o dado de imagem para nulo -->revisar futuramente
							}else{//Se for alguma alternativa [não usam "id"]:
								var indx = $wrap_img.parents(".wrap-choice").index();//índice do invólucro pai da alternativa
								quest_dados.alternativas[indx].img = null;//atualiza o dado de imagem para nulo
							}
						}
					});
				}
			});
			/*Manipulações da área de edição de imagem e recorte pelo usuário*/
			//Quando qualquer botão de edição é clicado seta comandos ao "Cropper"
			$(".img-btn-it").on("click", function(){
				var $this = $(this);
				var imgbtn_dds = $this.data();
				var $target;
				var result;
				if($this.prop("disabled") || $this.hasClass("disabled")){//Se o botão estiver desabilitado:
					return;//retorna do evento interrompendo processo
				}
				if($img_trgt.data('cropper') && imgbtn_dds.method){
					imgbtn_dds = $.extend({}, imgbtn_dds); // Clone a new one
					if(typeof imgbtn_dds.target !== 'undefined'){
						$target = $(imgbtn_dds.target);
						if(typeof imgbtn_dds.option === 'undefined'){
							try{
								imgbtn_dds.option = JSON.parse($target.val());
							}catch(e){
								console.log(e.message);
							}
						}
					}
					result = $img_trgt.cropper(imgbtn_dds.method, imgbtn_dds.option, imgbtn_dds.secondOption);
					switch (imgbtn_dds.method) {
						case 'scaleX':
						case 'scaleY':
							$(this).data('option', -imgbtn_dds.option);
							break;
					}
					if($.isPlainObject(result) && $target){
						try{
							$target.val(JSON.stringify(result));
						}catch(e){
							console.log(e.message);
						}
					}

				}
			});
			// Import image
			var $img_impt = $('#img-input');
			var URL = window.URL || window.webkitURL;
			var blobURL;
			if(URL){
				$img_impt.change(function(){
					var files = this.files, file;
					if(!$img_trgt.data('cropper')){
						return;
					}
					if(files && files.length){
						file = files[0];
						if(/^image\/\w+$/.test(file.type)){
							blobURL = URL.createObjectURL(file);
							$img_trgt.one('built.cropper', function(){
								// Revoke when load complete
								URL.revokeObjectURL(blobURL);
							}).cropper('reset').cropper('replace', blobURL);
							$img_impt.val('');
						}else{
							window.alert('Please choose an image file.');
						}
					}
				});
			}else{
				$img_impt.prop('disabled', true).parent().addClass('disabled');
			}
			// Keyboard
			$(document.body).on("keydown", function(e){
				if(!$img_trgt.data('cropper') || this.scrollTop > 300){ return; }
				switch(e.which){
					case 37:
						e.preventDefault();
						$img_trgt.cropper("move", -1, 0);
						break;
					case 38:
						e.preventDefault();
						$img_trgt.cropper("move", 0, -1);
						break;
					case 39:
						e.preventDefault();
						$img_trgt.cropper("move", 1, 0);
						break;
					case 40:
						e.preventDefault();
						$img_trgt.cropper("move", 0, 1);
						break;
				}
			});
			//Desabilita alguns botões, caso não haja suporte
			if(typeof document.createElement("cropper").style.transition === "undefined"){
				$("#img-btn-rtc1, #img-btn-rtc2, #img-btn-invr1, #img-btn-invr2").prop("disabled", true);
			}
			//Ao usuário clicar sobre o botão cancelar da janela de edição: re-seta, limpando objetos e eventos
			$("#img-edit #img-btn-cnclr").click(function(event){
				$("#img-edit").addClass('d-nn');//oculta tela de edição de imagem
				$(".block-j").hide();//oculta o fundo escuro
				//Elimina o objeto de edição de imagem
				$("#img-trgt").cropper("destroy");//limpa recursos do "Cropper" aplicados à imagem
			});
			/*--- Manipula - eventos de questão - navegação e alterações ---*/
			//Clicando-se nos botões de navegação altera a página e manda salvar para carregar a questão
			$(".naveg-quest .st-left, .naveg-quest .st-right").on("click", function(){
				if(!$(this).hasClass('disabled')){//Se o botão está habilitado, navega
					if(VerificaQuestao()){//Se dados obrigatórios estão completos
						var qstn = $(this).hasClass('st-left') ? qst_num-1 : qst_num+1;//se o botão da esquerda foi clicado atribui valor para a questão anterior, senão para a próxima
						SalvarCarregar(1, qstn);//chama "SalvarCarregar(tipo, extraval)" para verificar se há o que inserir/atualizar e por lá chama a função "Quest()"
					}
				}
			});
			//Ao preencher texto de navegação e pressionar "enter": altera a página e manda salvar para carregar a questão
			$(".st-txt").keydown(function (event){
				var key = event.which;//captura código da tecla. O "which" da jQuery normaliza os códigos independente do tipo de evento
				if($(".st-txt").val() != "" && key == 13){//Se está preenchido e a tecla é "enter"
					if(VerificaQuestao()){//Se dados obrigatórios estão completos
						var val = parseInt($(".st-txt").val());//valor digitado arredondado ao inteiro do número
						var qst_total = quiz_dados.questoes.length;//total de questões
						//Corrige valor digitado dentro dos limites e então carrega a questão
						var num = Math.max(1, Math.min(qst_total, val));//se o valor digitado for 0 retorna 1, se for maior que o total de questões retorna o valor de qst_total
						if(num != qst_num){//Se for diferente da questão atual
							SalvarCarregar(1, num);//chama "SalvarCarregar(tipo, extraval)" para verificar se há o que inserir/atualizar e por lá chama a função "Quest()"
						}else{
							$(".st-txt").val(num);//preenche com o texto corrigido
						}
					}else{
						$(".st-txt").val(qst_num);//volta a preencher com o nº da questão atual
					}
				}else if($.inArray(key, [8, 9, 16, 46, 36, 35, 37, 39])!==-1 || (key == 65 && event.ctrlKey === true) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105)){//Permite: "backspace", "tab", "shift", "delete", "home", "end", "left", "right" ou "Ctrl+A" ou números superios ou números do keypad
					return;//apenas retorna da função
				}else{//Se não é tecla permitida impede a ação
					event.preventDefault();//não retorna o valor da tecla
				}
			});
			//Exclusão de questão
			$("#exclui-qst").on("click", function(){
				//Se o usuário confirmar a exclusão verifica se é questão nova ou não e exclui. Na mensagem de confirmação só usará a expressão "permanentemente" se não for questão nova ou de terceiro
				Mensagem("Confirmação", "Deseja mesmo excluir "+(id_quest==null || quest_dados.stts_uso == 2 ? "esta" : "permanentemente<br> esta")+" questão?", 0, true, function(ret){//Essa função usa a "Fancybox" como "modal = true" e precisa de uma função localizada para o retorno ("ret")
					if(ret === 1){//Usuário clicou "sim"
						if(id_quest == null){//Se a questão é nova, chama função que a exclui dos dados e carrega outra
							ExcluiCarregaDadosQuestao();
						}else{//Se a questão preexistia chama "SalvarCarregar()" para excluir do banco por lá chama "ExcluiCarregaDadosQuestao()"
							SalvarCarregar(4);//tipo 4 (excluindo questão)
						}
					}
				});
			});
			//Clicando-se no botão "nova questão" renova os dados chamando Quest();
			$("#nova-qst").on("click", function(){
				if(VerificaQuestao()){//Se dados obrigatórios estão completos
					quiz_dados.questoes.push($.extend(true, {}, questao_novo_obj));//adiciona novo objeto de questão padrão
					var qst_total = quiz_dados.questoes.length;//total de questões após adição de nova questão
					quiz_dados.questoes[qst_total-1].ordem = (Number(quiz_dados.questoes[qst_total-2].ordem) + 1);//atualiza a ordem da nova questão conforme a da ordem anterior
					//Chama "SalvarCarregar(tipo, extraval)" para verificar se há o que inserir/atualizar e por lá chama a função "Quest()", passando o número da questão a ser chamada conforme total de questões
					SalvarCarregar(2, qst_total);
				}
			});
			//Clicando-se no botão "concluir" verifica se os dados obrigatórios de todas as questões existentes estão preenchidos corretamente
			$("#concluir").on("click", function(){
				if(VerificaQuestao()){//Se dados obrigatórios estão completos
					SalvarCarregar(3);//chama "SalvarCarregar(tipo, extraval)" para verificar se há o que inserir/atualizar e por lá chama a tela de créditos
				}
			});
		}else{//Re-seta os elementos para navegação entre questões, nova questão, etc.
			$(".question #txt-enunc").html("");
			$(".question #txt-subt").val("");
			DesmontaImagem($(".question .wrap-img"));//desmonta elemento de upload de imagem
			/*-->$(".question .midia").addClass('d-nn');
			$(".question .midia").off();
			$(".question .midia").attr("class", $(".midia")[0].className.replace(/(fancybox)\S*(\s|\b)/g, ""));//limpa do elemento qualquer classe "fancybox"
			$(".question .info").addClass('d-nn');
			$(".question .info").off();*/
			$(wrapchoice+":eq(0)").nextAll().remove();//deixa apenas a primeira alternativa e remove o resto
			$(wrapchoice+" .txt-alternat").html("");
			$(wrapchoice).removeClass('active');
			$(wrapchoice).addClass('min');//garante que as alternativas estejam minimizadas
			DesmontaImagem($(wrapchoice+" .wrap-img"));//desmonta elemento de upload de imagem
			$.fn.formatTxt.destroy($(wrapchoice+" .menu-edit"));//remove eventos e dados aplicados do plugin "formatTxt()"
			$(".question #num").text(qst_num);//altera numeração da questão
			$(".naveg-quest .st-txt").val(qst_num);//altera numeração da caixa de navegação
		}
		/*---- Monta e alimenta questão e alternativas ----*/
		//Sendo questão nova: seta variáveis e clona para o mínimo de alternativas, ou se é questão existente: seta variáveis e clona e alimenta o total de alternativas
		if(id_quest == null){
			$(".question").removeClass('min');//maximiza área da questão
			//A partir da primeira alternativa, duplica as demais conforme a quantidade mínima por questão
			for(var i=1; i<altr_min; i++){
				$(wrapchoice+":eq(0)").clone(true, true).insertAfter(wrapchoice+":eq("+(i-1)+")");//a função "$.clone(true, true)" usa true para copia total de propriedades e eventos
				$(wrapchoice+":eq("+i+")").attr("data-id-alternat", (i+1));//seta no elemento o valor "data-id-alternat"
				quest_dados.alternativas.push($.extend(true, {}, questao_novo_obj.alternativas[0]));//inclui novo objeto padrão nas alternativas desta questão
				quest_dados.alternativas[i].id_alternat = i+1;//atualiza valor de "id_alternat"
				quest_dados.alternativas[i].ordem = i+1;//atualiza valor de "ordem"
			}
			//Após as alternativas já terem sido clonadas
			$(wrapchoice+" .ico-trash").addClass('disabled');//desabilita botão de excluir alternativa por iniciar com o mínimo
			$(".wrap-mult .rd-mult:eq(0) input").trigger("click");//monta o tipo de questão atual como "única escolha" por padrão. O evento já foi criado no início
		}else{
			//Prepara o enunciado, imagem e subtítulo
			$(".question #txt-enunc").html(quest_dados.enunciado);//preenche o texto do enunciado (html)
			quest_dados.enunciado_img ? MontaImagem($(".question .wrap-img"), (static_img+"/"+quest_dados.enunciado_img)) : null;//carrega a imagem direto no enunciado, se houver
			quest_dados.subtitulo != null ? $(".question #txt-subt").val(quest_dados.subtitulo) : null;//preenche o subtítulo
			qst_num==1 && !$("#txt-enunc").text() ? $("#txt-enunc").focusin() : null;//se não houver algum texto digitado (desconsiderando html), maximiza. Necessário apenas à primeira vez
			//A partir da primeira alternativa, duplica e alimenta-as conforme a quantidade por questão
			var altr_total = quest_dados.alternativas.length;//total de alternativas
			for(var i=0; i<altr_total; i++){
				i > 0 ? $(wrapchoice+":eq(0)").clone(true, true).insertAfter(wrapchoice+":eq("+(i-1)+")") : null;//a função "$.clone(true, true)" usa true para copia total de propriedades e eventos
				//Prepara o elemento de alternativa e seu conteúdo, que pode conter texto, imagem ou os dois.
				var altr_dds = quest_dados.alternativas[i];
				$(wrapchoice+":eq("+i+")").attr("data-id-alternat", altr_dds.id_alternat);//seta no elemento o valor "data-id-alternat"
				$(wrapchoice+":eq("+i+") .txt-alternat").html(altr_dds.txt);//preenche o texto da alternativa (html)
				DesmontaImagem($(wrapchoice+" .wrap-img"));//desmonta elemento de upload de imagem
				altr_dds.img ? MontaImagem($(wrapchoice+":eq("+i+") .wrap-img"), static_img+"/"+altr_dds.img) : null;//carrega a imagem, se houver
			}
			//Após as alternativas já terem sido clonadas
			altr_total > altr_min ? $(wrapchoice+" .ico-trash").removeClass('disabled') : null;//se nº de alternativas for suficiente mostra que os botões excluir estão habilitados
			$(".wrap-mult .rd-mult:eq("+(quest_dados.tipo-1)+") input").trigger("click", true);//monta o tipo de questão atual. O evento já foi criado no início e "true" é passado para marcar as alternativas indicadas
		}
		/*---- Finaliza questão ----*/
		//Habilita/desabilita os botões de navegação de questão conforme total de questões e página atual
		var qst_total = quiz_dados.questoes.length;//total de questões
		if(qst_total == 1){
			$(".naveg-quest .st-left, .naveg-quest .st-right").addClass('disabled');//desabilita os botões de navegação
			$(".naveg-quest .st-txt").prop('disabled', true);//desabilita navegação pela caixa de texto
		}else{
			qst_num == 1 ? $(".naveg-quest .st-left").addClass('disabled') : $(".naveg-quest .st-left").removeClass('disabled');//habilita/desabilita navegador da esquerda
			qst_num == qst_total ? $(".naveg-quest .st-right").addClass('disabled') : $(".naveg-quest .st-right").removeClass('disabled');//habilita/desabilita navegador da direita
			$(".naveg-quest .st-txt").prop('disabled', false);//habilita navegação pela caixa de texto
		}
		//Prepara menu de edição para formatação das alternativas, depois de criadas. O quarto parâmetro é função a ser executada após edição no texto pelo menu e os parâmetros são: a caixa editável, dados da seleção e exec (true/false, informando se o commando foi suportado)
		$(wrapchoice+" .menu-edit").formatTxt(function(){return $(this).parent().find(".txt-alternat")}, null, null, function(cx, slc, exc){
			FormatAtualizaExibeMsg(cx, slc, exc);
		});
		$("body").mousedown();//executa o evento do corpo que minimiza tudo e elimina o evento
		$(".block-s").hide();//garante que a questão seja exibida sem a tela de bloqueio
	}
	//Função chamada para montagem de imagens já existentes ou novas
	function MontaImagem(elmt, imgsrc){
		var $elmt_wrap = elmt//variável com o elemento pai do upload
		var elmt_wrpid = elmt.attr("id");//guarda o id para diferenciação de elementos (topo, enunciado, etc.)
		$elmt_wrap.find(".upload-img p").addClass(elmt_wrpid=="topo-img" ? 'v-hd' : 'd-nn');//mantém o rótulo de anexo apenas invisível (para topo) ou inexistente
		$elmt_wrap.find(".loading-w").removeClass('d-nn');//exibe o ícone de carregamento
		var tpImg = new Image();//cria objeto de imagem para usar o evento de carregamento
		tpImg.src = imgsrc;//passa ao objeto o caminho da imagem
		tpImg.onload = function(){//Ao carregar a imagem: aplica ao elemento, oculta e prepara elementos
			$elmt_wrap.removeClass('d-nn');//garante que esteja visível para carregamento e cálculos
			$elmt_wrap.find("div.it-img").css("background-image", "url("+this.src+")");//aplica por css o "src" do objeto como "background"
			if(elmt_wrpid != "topo-img"){//Se não é imagem de topo:
				var img_altp = Math.round(($elmt_wrap.find(".upload-img").width()-15) / (this.width / this.height));//calcula a altura da imagem proporcional à largura que ocupará
				var img_alt = Math.min(img_altp, Number($elmt_wrap.find("div.it-img").css("max-height").replace("px", "")));//usa a altura proporcional ou a máxima setada no estilo do elemento
				$elmt_wrap.find("div.it-img").height(img_alt);//seta altura do elemento com a imagem no background
			}else{//Se é a imagem do topo:
				$elmt_wrap.find(".it-img").css("opacity", "0.7");//aplica na imagem opacidade para que a borda tracejada fique visivelmente melhor
			}
			$elmt_wrap.find(".loading-w").addClass('d-nn');//oculta o ícone de carregamento
		};
		tpImg.onerror = function(){//Caso a imagem não exista ou esteja quebrada, re-seta elementos e exibe mensagem ao usuário
			DesmontaImagem($elmt_wrap);
			Mensagem("Erro ao carregar "+(elmt_wrpid=="topo-img" ? "o topo" : "imagem"), "A imagem não existe ou está quebrada. O problema não deve afetar demais funcionalidades, mas se ocorrer algo extranho informe-nos pelo email: "+link_email+". Você também pode tentar adicionar uma nova.", 2);
			delete this;//limpa objeto de imagem
		};
	}
	//Função chamada para desmontar uma imagem excluída ou um "upload de imagem" reiniciado, cancelado ou mal-sucedido
	function DesmontaImagem(elmt){
		var $elmt_wrap = elmt//variável com o elemento pai do upload
		$elmt_wrap.find(".it-img").removeAttr("style");//remove estilos do elemento de imagem, incluindo o "background-image"
		$elmt_wrap.find(".loading-w").addClass('d-nn');//oculta o ícone de carregamento
		$elmt_wrap.find(".upload-img p").removeClass('v-hd d-nn');//reexibe o rótulo de anexo de imagens
		$elmt_wrap.find(".upload-img .ico-del").addClass('d-nn');//oculta o botão de excluir
	}
	//Função que seta a ordem das alternativas conforme seus respectivos elementos e reorganiza-as na array "alternativas" do objeto "quest_dados". Chamada sempre que alternativas são removidas ou reordenadas pelo usuário
	function OrdenaAlternativas(){
		for(var i=0; i<quest_dados.alternativas.length; i++){
			var altr_dds = quest_dados.alternativas[i];
			altr_dds.ordem = ($(wrapchoice+"[data-id-alternat="+altr_dds.id_alternat+"]").index() + 1);//seta a ordem conforme posição do elemento de mesmo "id_alternat"
			quest_dados.tipo <= 2 ? $(wrapchoice+":eq("+i+") .choice").text(letras_ar[i]) : null;//preenche a letra-->ver tipo relacionar
		};
		//Ordena a array de alternativas conforme o item "ordem" de cada objeto, mantendo uma ordem crescente
		quest_dados.alternativas.sort(function(a, b){
			if(a.ordem > b.ordem){
				return 1;
			}else if(a.ordem < b.ordem){
				return -1;
			}
			return 0;//quando "a" é igual a "b" (nesse caso não deve acontecer);
		});
	}
	//Função verifica se os dados obrigatórios foram setados pelo o usuário na questão atual e exibe mensagem
	function VerificaQuestao(){
		var ntxt=0; var nindic=0;
		var altr_total = quest_dados.alternativas.length;
		quest_dados.enunciado!=undefined && (/\S{3,}/g).test(quest_dados.enunciado) ? ntxt+=1 : null;//se há sequência de pelo menos três caracteres não-espaço incrementa a var "ntxt"
		for(var i=0; i<altr_total; i++){
			quest_dados.alternativas[i].indic!=undefined && quest_dados.alternativas[i].indic == 1 ? nindic += 1 : null;//se a alternativa vale "1" incrementa "nindic"
			(quest_dados.alternativas[i].txt!=undefined && (/\S{1,}/g).test(quest_dados.alternativas[i].txt)) || (quest_dados.alternativas[i].img!=undefined && quest_dados.alternativas[i].img!="") ? ntxt+=1 : null;//se há sequência de pelo menos um caractere não-espaço ou se há alguma imagem, incrementa a var "ntxt"
		};
		//-->Ver tipo relacionar
		//Verifica se a questão sendo tipo "única/múltipla escolha" tem menos 1 alternativa indicada ou se o enunciado e as alternativas estão preenchidas e retorna true/false
		var ver1 = (ntxt==(altr_total+1) ? true : false);
		var ver2 = (quest_dados.tipo==3 ? true : (nindic>0 ? true : false));
		if(ver1 == false || ver2 == false){
			Mensagem("Questão incompleta", "Esta questão "+(ver1==false ? "está com o enunciado ou alguma alternativa não preenchidos" : "")+(ver1==false && ver2==false ? ", e " : (ver1==false ? "." : ""))+(ver2==false ? "está sem pelo menos uma alternativa marcada como correta." : "")+" Complete ou exclua para navegar entre questões.", 2);
			return false;
		}else{
			return true;
		}
	}
	//Função que exclui questão atual em "quiz_dados" e carrega outra. Chamada diretamente ou ao excluir da base
	function ExcluiCarregaDadosQuestao(){
		quiz_dados.questoes.splice(qst_num-1, 1);//remove o item de questão atual
		id_quest != null ? quiz_dados_bs.questoes.splice(qst_num-1, 1) : null;//se já foi salvo, remove o item de questão também na base
		var qst_total = quiz_dados.questoes.length;//total de questões após remoção
		//Se não há mais questões carrega uma nova ou se sobrou questão carrega a anterior à excluída
		qst_total == 0 ? quiz_dados.questoes[0] = $.extend(true, {}, questao_novo_obj) : null;//reatribui um objeto de questão simples
		var qstn = (qst_num<=qst_total ? qst_num : Math.max(qst_num-1, 1));//se questão atual não é a última então reexibe na mesma posição, ou a anterior ou 1
		Quest(false, qstn);
	}

	/*---- /Créditos/ ----*/
	//Função para montagem e manipulação da tela de créditos (autoria, fontes das questões e outras funcionalidades)
	function Credit(){
		/*---- Inicia montagem da tela final ----*/
		//-->exibição de gabarito e impressão
		if(crdt_ok != true){//Preenche os campos iniciais e seta os eventos e funções apenas a primeira vez
			crdt_ok = true;//indica que a montagem principal e criação dos eventos já ocorreu uma vez, evitando repetições e problemas
			/*--- Manipula - autoria do quiz ---*/
			//Manipula elementos de autoria e busca de usuários. Sempre terá pelo menos um usuário
			//$(".frm-wrap-credit .lblInput:eq(0) input").val();
			$(".frm-wrap-credit .lblInput:eq(1) input").val(quiz_dados.autoria[0].nome);//-->por agora só traz o nome do único montador
			//-->programar adição de usuários e ao ocorrer alteração alterar fontes originais

			/*--- Manipula - fontes ---*/
			//Quando a caixa de texto de uma fonte em modo minimizado ou simplificado é apontada, destaca-se por cor
			$("#quest-fonts .simp-font, #quest-fonts .frm-font .txt-font").on("mouseover", function(){
				if($(this).hasClass("simp-font")){
					$(this).children("span").css("background-color", "#F0EEDB");
				}else if($(this).parents(".frm-font").hasClass('min')){
					$(this).css("background-color", "#F0EEDB");
				}
			}).mouseout(function(){
				if($(this).hasClass("simp-font")){
					$(this).children("span").css("background-color", "");
				}else{
					$(this).css("background-color", "");
				}
			});
			//Ao ocorrer alterações nos campos de texto de fonte maximizada: atualiza o dado
			var fnt_tm;//cria a variável de tempo - global para este escopo
			$("#quest-fonts .frm-font .txt-font").on("input keyup paste", function(){//-->futuramente substituir pelo evento "input" apenas, novo e mais apropriado, para capturar qualquer inserção e alteração, sem temporizador
				var $wrap_src = $(this).parents(".wrap-source");//elemento pai
				var $simp_fnt = $wrap_src.children(".simp-font");//elemento simplificado
				clearTimeout(fnt_tm);//limpa o temporizador antes de reseta-lo
				fnt_tm = setTimeout(function(elmt){
					quiz_dados.questoes[$wrap_src.data('ind')].fonte = $(elmt).html() || null;//atualiza o dado podendo ser nulo
					$simp_fnt.children("span").html($(elmt).html());
				}, 300, this);
			});
			//Ao ocorrer alterações no campo de texto do link da fonte: atualiza o dado
			$("#quest-fonts .frm-font .lnk-font").on("input change paste", function(){//-->"input" ainda não funciona em todos browsers, quando for o caso usá-lo sozinho
				var $wrap_src = $(this).parents(".wrap-source");//elemento pai
				quiz_dados.questoes[$wrap_src.data('ind')].fonte_url = $(this).val() || null;//link estará preenchido ou poderá ser nulo
			});
			//Ao desfocar da caixa da fonte, se vazio: limpa o elemento e atualiza o dado (após isso o usuário nem sempre poderá retrazer conteúdo com cntrl+z)
			$("#quest-fonts .frm-font .txt-font").on("focusout", function(){
				//Se houver apenas caracteres de tipo espaço (espaço-simples, nova-linha, etc) ou vazio, limpa o elemento completamente
				if((/^\s*$/g).test($(this).text())){//regexp: inicio-de-string seguido de caractere-espaço zero-ou-mais-vezes seguido de fim-de-string
					$(this).empty();
					var $wrap_src = $(this).parents(".wrap-source");//elemento pai
					quiz_dados.questoes[$wrap_src.data('ind')].fonte = null;//deixa dado da fonte nulo
				}
			});
			//Ao usuário focar na fonte: expande-se e prepara-se para voltar a ser minimizada ou simplificada
			var fnt_msy;//cria a variável como global para este escopo
			$("#quest-fonts .simp-font, #quest-fonts .frm-font .txt-font").on("mousedown focusin", function(event){
				//Quando a fonte é pressionada guarda a posição do mouse em relação a caixa para ao focar: rolar até a linha do cursor
				event.type=="mousedown" ? fnt_msy = event.pageY - $(this).offset().top : null;//a coordenada Y do mouse em relação ao topo da página menos a coordenada da caixa
				//Executa apenas se é fonte simplificada (e se evento de clique) ou minimizada (e se evento de foco), evitando problemas e repetições ao refocar a caixa com ela já maximizada
				if(($(this).hasClass("simp-font") && event.type=="mousedown") || ($(this).parents(".frm-font").hasClass("min") && event.type=="focusin")){
					$("body").mousedown();//executa se foi anteriormente setado e ainda existe (navegação por "tab")
					var $wrap_fcd = $(this).parents(".wrap-source");//elemento pai focado
					var $frm_max = $wrap_fcd.find(".frm-font");//elemento maximizado
					var $txt_fcd = ($(this).hasClass("simp-font") ? $(this).children("span") : $(this));//elemento de texto filho focado
					var $txt_max = $wrap_fcd.find(".txt-font");//elemento de texto do elemento maximizado
					setTimeout(function(){//Usa um temporizador para que foco na linha clicada aconteça antes das aplicações na caixa
						$wrap_fcd.find(".simp-font").addClass('d-nn');//oculta fonte simplificada
						$frm_max.removeClass('d-nn');
						$frm_max.removeClass('min');//maximiza a fonte
						$txt_fcd.removeAttr("style");//remove todos estilos aplicados (como cor de fundo e os aplicados ao usuário alterar tamanho)
						$txt_max.attr("placeholder", "Adicione uma fonte");//altera o texto explicativo padrão
						$txt_max.focus();//foca no texto maximizado
						fnt_msy ? $txt_max.scrollTop(fnt_msy-20) : null;//rola até a linha do cursor (carret)
					}, 100);
					//Aplica evento (rotulado) ao "body", verificando quando o usuário clica fora do elemento pai
					$("body").off("mousedown.fntmin").on("mousedown.fntmin", function(event){//Ao qualquer elemento ser pressionado. É usado "off()" para evitar duplicação do evento
						//Verifica se o alvo não é a div pai ("wrap_fcd") e não é um elemento filho dela e se não é um dos botões finais
						if(!$(event.target).is($wrap_fcd) && $wrap_fcd.has(event.target).length == 0 && $(event.target).parents(".wrap-btn").length == 0){//Filtro de exceções
							$frm_max.addClass('min');//minimiza a fonte
							$txt_max.scrollTop(0);//deixa o texto na primeira linha
							$txt_max.attr("placeholder", "Preencha a fonte");
							//Se a fonte está corretamente preenchida deixa em modo simplificado
							if((/\S{3}/).test($txt_max.text())){//Verifica se há pelo menos três caracteres "não-espaço"
								$frm_max.addClass('d-nn');
								$wrap_fcd.find(".simp-font").removeClass('d-nn');
							}
							//Se a url da fonte está corretamente preenchida, inclui classe "link" para destaque
							if((/\S{5}/).test($frm_max.find(".lnk-font").val())){//Se digitado pelo menos 5 caracteres "não-espaço"
								$wrap_fcd.find(".simp-font").addClass('link');
							}else{//Se houver menos de 5 caracteres digitados
								$wrap_fcd.find(".simp-font").removeClass('link');
							}
							$("body").off("mousedown.fntmin");
						}
					});
				}
			});
			//Quando a checagem "original" de fonte for clicada bloqueia elementos e altera o dado "fnt_quiz" da questão
			$("#quest-fonts .frm-font .chck-font").on("change", function(){
				var $wrap_src = $(this).parents(".wrap-source");//elemento pai focado
				var quest = quiz_dados.questoes[$wrap_src.data('ind')];//questão no índice reservado
				if($(this).is(":checked") == true){//Se foi checado bloqueia os campos de texto e alimenta a fonte com autoria do quiz
					if(!quest.fonte || confirm("O texto da fonte será substituído. Deseja mesmo marcar esta fonte como original?")){//Verifica se já há algum texto e pede confirmação do usuário
						var elbrdrs = ElaborNomes();//traz os nomes de elaboradores, concatenados
						$wrap_src.find(".menu-edit > *").addClass('d-nn');//oculta os itens do menu
						$wrap_src.find(".txt-font").html(elbrdrs).prop("contenteditable", false);
						$wrap_src.find(".lnk-font").val("").prop("readonly", true);//limpa a url e bloqueia texto
						$wrap_src.find(".simp-font > span").text(elbrdrs);//alimenta texto simplificado
						quest.fonte = null;//a fonte precisa valer "null"
						quest.fonte_url = null;
						quest.fnt_quiz = id_quiz;//seta o id do quiz atual como fonte da questão
						if($wrap_src.find(".frm-font").hasClass('min')){//Se foi marcado com o elemento minimizado, oculta-o e já exibe o simplificado
							$wrap_src.find(".frm-font").addClass('d-nn');
							$wrap_src.find(".simp-font").removeClass('d-nn');
						}
					}else{//Se há texto e não foi aceito pelo usuário, desmarca novamente
						$(this).prop("checked", false);
					}
				}else{//Se a checagem é desfeita libera os campos de texto
					$wrap_src.find(".menu-edit > *").removeClass('d-nn');//exibe os itens do menu
					$wrap_src.find(".txt-font").html("").prop("contenteditable", true);
					$wrap_src.find(".txt-font").focus();//foca no texto da fonte
					$wrap_src.find(".lnk-font").prop("readonly", null);
					quest.fnt_quiz = null;
				}
			});
			/*--- Manipula - botões finais ---*/
			//Ao clicar no botão "voltar": salva o que foi feito até agora e retorna a última questão editada
			$("#quiz-credit #voltar").on("click", function(){
				SalvarCarregar(1);//chama "SalvarCarregar(tipo, extraval)" para verificar se há o que atualizar
			});
			//Ao clicar no botão de completar: verifica se há algum dado obrigatório faltando, para salvar e exibir a mensagem final ou parcial
			$("#quiz-credit #complet").on("click", function(){
				var elbrdrs = ElaborNomes();//retorna nome dos elaboradores
				var qst_fnt_inc = false;//variável de fonte incompleta
				for(var i=0; i<quiz_dados.questoes.length; i++){
					if(quiz_dados.questoes[i].stts_uso == 1){//Se questão foi gerada por este quiz
						if(!quiz_dados.questoes[i].fonte && !quiz_dados.questoes[i].fnt_quiz){//Se não tem fonte e não está setada como original atribui "true" à variável
							qst_fnt_inc = true;
							break;
						}
					}
				}
				if(!elbrdrs || qst_fnt_inc){//Se não possui elaborador(es) ou se alguma fonte não está preenchida exibe mensagem de aviso
					Mensagem("Incompleto", "Está faltando "+(!elbrdrs ? "incluir pelo menos um elaborador para este quiz" : "")+(!elbrdrs && qst_fnt_inc ? " e " : (!elbrdrs ? "." : " "))+(qst_fnt_inc ? "alguma fonte ser devidamente preenchida." : ""), 2);
				}else{
					var msg_fim = [];
					msg_fim[0] = "O seu quiz está completo."+(inline==2 ? " Você poderá ver na listagem o resultado final e editar por lá mesmo." : "");
					msg_fim[1] = "A página de créditos está pronta, mas alguma coisa está faltando nas páginas anteriores. Confira, para que o quiz fique completo.";
					SalvarCarregar(2, msg_fim);//chama "SalvarCarregar(tipo, extraval)" para verificar se há o que atualizar, passando as mensagens
				}
			});
		}else{
			//Podendo haver mudanças ao usuário sair e retornar aos créditos, limpa e deixa apenas a primeira fonte e remove o resto
			$(".wrap-source:eq(0)").nextAll().remove();
			$(".wrap-source:eq(0)").removeData('id_quest');
			$(".wrap-source:eq(0) .txt-font").text("");
			$(".wrap-source:eq(0) .lnk-font").val("");
			$(".wrap-source:eq(0) .txt-font").prop("readonly", null);
			$(".wrap-source:eq(0) .chck-font").prop("checked", false);
			$(".wrap-source:eq(0) .simp-font").addClass('d-nn');
			$(".wrap-source:eq(0) .simp-font").removeClass('link');
			$(".wrap-source:eq(0) .frm-font").addClass('min');
			$(".wrap-source:eq(0) .frm-font").removeClass('d-nn');
			$.fn.formatTxt.destroy($(".wrap-source:eq(0) .menu-edit"));//remove eventos e dados aplicados do plugin "formatTxt()"
		}
		/*---- Fontes por questão ----*/
		var elbrdrs = ElaborNomes();//traz os nomes de elaboradores concatenados
		//A partir da primeira fonte, duplica e alimenta-as conforme a quantidade de questões
		var fnt_total = quiz_dados.questoes.length;//total de fontes
		var elmt_font, $elmt_novo, fnt_txt, fnt_url, fnt_quiz, stts_uso;
		for(var i=0; i<fnt_total; i++){
			fnt_txt = quiz_dados.questoes[i].fonte;
			fnt_url = quiz_dados.questoes[i].fonte_url;
			fnt_quiz = quiz_dados.questoes[i].fnt_quiz;
			stts_uso = quiz_dados.questoes[i].stts_uso;
			//Determina elemento pai verificando se a questão é do quiz atual ou usada de outro quiz
			elmt_font = (stts_uso==1 ? "#quest-fonts" : "#biblio-fonts");
			//Usa o primeiro item já existente ou clona-o para os próximos
			if($(elmt_font+" .wrap-source:eq(0)").data('id_quest') == undefined){//Verifica se dado "id_quest" ainda não foi setado
				$elmt_novo = $(elmt_font+" .wrap-source:eq(0)");
			}else{
				$elmt_novo = $(elmt_font+" .wrap-source:eq(0)").clone(true, true);//a função "$.clone(true, true)" usa true para cópia total de propriedades e eventos
			}
			$elmt_novo.data({id_quest: quiz_dados.questoes[i].id_quest, ind: i});//reserva o dado de "id_quest" em cada fonte e seu índice ("ind") da array
			if(stts_uso == 1){//Se é questão criada pelo quiz atual monta e alimenta nos modos simplificado e maximizado
				//Prepara elementos de fonte e conteúdo em modo simplificado
				$elmt_novo.find(".simp-font > b").text((i+1)+" | ");//alimenta a fonte com a numeração
				$elmt_novo.find(".simp-font > span").html(fnt_txt ? fnt_txt : (fnt_quiz ? elbrdrs : ""));//alimenta a fonte com o texto ou elaboradores ou vazio
				fnt_url ? $elmt_novo.find(".simp-font").addClass('link') : null;//se houver link adiciona classe para pintar o texto
				//Prepara elementos de fonte e conteúdo em modo maximizado
				$elmt_novo.find(".frm-font .num-font").text(i+1);//altera a numeração
				$elmt_novo.find(".frm-font .chck-font").prop("checked", (fnt_quiz ? true : false));//marca/desmarca o "checkbox" conforme originalidade da questão
				fnt_quiz ? $elmt_novo.find(".menu-edit > *").addClass('d-nn') : $elmt_novo.find(".menu-edit > *").removeClass('d-nn');//exibe ou oculta os itens do menu
				$elmt_novo.find(".frm-font .txt-font").html(fnt_txt ? fnt_txt : (fnt_quiz ? elbrdrs : ""));//preenche com a fonte, com os elaboradores ou vazio se não houver
				$elmt_novo.find(".frm-font .txt-font").prop("contenteditable", (fnt_quiz ? false : true));//aplica "contenteditable = false" se for questão original
				$elmt_novo.find(".frm-font .lnk-font").val(fnt_url ? fnt_url : "");//preenche com a url, se houver
				$elmt_novo.find(".frm-font .lnk-font").prop("readonly", (fnt_quiz ? true : null));//aplica "readonly" se for questão original
				//Verifica se o texto da fonte está preenchido ou se é original e exibe a fonte simplificada, senão exibe em modo minimizado
				if(fnt_txt || fnt_quiz){
					$elmt_novo.find(".frm-font").addClass('d-nn');
					$elmt_novo.find(".simp-font").removeClass('d-nn');
				}else{
					$elmt_novo.find(".frm-font").removeClass('d-nn');
					$elmt_novo.find(".simp-font").addClass('d-nn');
				}
			}else{//Se é questão (stts_uso = 2) de outro quiz ou de origem externa padrão, vindo da biblioteca de questões, monta os elementos simplificados
				/*-->montar segundo bloco de fontes (biblioteca) unindo fontes repetidas
				//Monta as fontes no conteúdo usando os itens já agrupados (ver em quiz user)*/
			}
			//Inclui o elemento clonado ao conjunto de fontes de questão - 1° ou 2º bloco
			$elmt_novo.appendTo(elmt_font+" .gp-fonts");
		}
		//Verifica se cada bloco de fontes possui pelo menos uma fonte setada e exibe o bloco
		$("#quest-fonts .wrap-source:eq(0)").data('id_quest') ? $("#quest-fonts").removeClass('d-nn') : $("#quest-fonts").addClass('d-nn');
		//Prepara menu de edição para formatação do enunciado. O quarto parâmetro é função a ser executada após edição no texto pelo menu e os parâmetros são: a caixa editável, dados da seleção e exec (true/false, informando se o commando foi suportado)
		$(".wrap-source .menu-edit").formatTxt(function(){return $(this).parent().find(".txt-font")}, null, null, function(cx, slc, exc){
			FormatAtualizaExibeMsg(cx, slc, exc);
		});
		//-->$("#biblio-fonts .wrap-source:eq(0)").data('id_quest') ? $("#biblio-fonts").removeClass('d-nn') : $("#biblio-fonts").addClass('d-nn');
		$(".block-s").hide();//garante que seja exibido sem a tela de bloqueio
		//Função retorna o nome dos elaboradores (se existir algum) do quiz atual, para preencher as fontes originais
		function ElaborNomes(){
			//Junta os nomes dos elaboradores 
			var elbrdrs_ar = $.map(quiz_dados.autoria, function(val){ if(val.elab==1){return val.nome}; });
			return (elbrdrs_ar.length > 0 ? elbrdrs_ar.join(", ") : "");//retorna os nomes separados por vírgula ou só retorna vazio//-->melhorar usando "e" na separação do último nome
		}
	}

	/*----- /Funções extras e gerais/ -----*/
	//Função padrão de resposta ao uso do plugin "formatTxt()" para atualizar e exibir mensagem de formatação não suportada
	function FormatAtualizaExibeMsg(cx, slc, exc){
		cx.keyup();//-->usado para atualizar dado, mas futuramente não será necessário quando evento "input" (detector de qualquer mudança) funcionar em todos os navegadores
		exc == false ? Mensagem("Não suportado", "O comando não foi executado por este navegador. Se possível, atualize para uma versão mais nova ou use o \"Chrome\" - o mais compatível.", 2) : null;
	}
	/*Função chamada sempre que alguma requisição é feita e retorna erro.
	Parâmetros opcionais: "tp" (tipo [mensagem afirmativa, erro, etc...]), "rsp" (bloqueia tela e exige resposta do usuário) e "cllbck" é a função executada na resposta*/
	function Mensagem(ttl, msg, tp, rsp, cllbck){
		//Aplica a FancyBox com a menssagem de erro
		$.fancybox({
			modal: (rsp===true ? true : false),
			title: "<b style='font-size: 1.5em;'>"+ttl+"</b>",
			content: "<p style='font-size: 2.5em;'>"+msg+"</p>",
			scrolling: 'no',
			maxWidth: 700,
			helpers: {
				title: {type: 'inside', position: 'top'},
				overlay: {css: {'overflow': 'hidden'}}
			},
			beforeShow: function(){
				if(rsp === true){
					$(".fancybox-wrap").css('text-align', 'center');
					this.inner.append($("<input>", {type:"button", title:"Sim", class:"cnfrm btn-g", value:"Sim"}).data("num", 1).css("background-color", "rgb(247,255,221)"));
					this.inner.append($("<input>", {type:"button", title:"Não", class:"cnfrm btn-g", value:"Não"}).data("num", 2).css({"margin-left":"20px", "background-color":"rgb(255,237,211)"}));
					$(".fancybox-wrap .cnfrm").css({'margin-top':'8px', 'line-height':'25px'});
				}
			},
			afterShow: function(){
				setTimeout(function(){//realiza alterações com uma pausa para funcionar
					$(".fancybox-inner").css('height', '');
					tp == 1 ? $(".fancybox-title").css('color', 'rgb(60, 111, 62)') : null;
					tp == 2 ? $(".fancybox-title").css('color', 'rgb(132, 64, 64)') : null;
					if(rsp === true){
						$(".cnfrm").on("click", function (event){
							num_rsp = $(event.target).data("num");
							$.fancybox.close();
						});
					}
				}, 0);
				if(rsp != true){//Se não é modal verifica tamanho do texto para fechar automaticamente ou não
					var plvrs_num = msg.match(/\b\S+\b/g).length;//captura o número de palavras na frase da string
					plvrs_num <= 10 ? setTimeout(function(){$.fancybox.close();}, (plvrs_num<=5 ? 2500 : 4000)) : null;//se houver menos de 10 palavras fecha a mensagem automaticamente
				}
			},
			afterClose: function(){
				rsp === true ? cllbck.call(this, num_rsp) : null;//em "call(this, param1, param2...)" o primeiro parâmetro refere-se ao "this" (escopo) usado na função
			}
		});
	}
	//Função chamada sempre que alguma requisição é feita e retorna acesso negado
	function AcessoNegado(msg){
		//Remove as funções e todo o elemento de formulário da capa
		SalvarCarregar = undefined;
		Capa = undefined;
		Quest = undefined;
		$("#new-quiz").remove();
		$("#quiz-core").remove();
		$("#quiz-credit").remove();
		/*Aplica a FancyBox com a menssagem e se for "inline" monta botão que chama o objeto ouvinte na janela que carregou o "quiz adm" para recarregar o iframe do "quiz user" - isso funcionará quando o admin é montado na listagem ou onde existir este ouvinte
		O dado "modal: true" é necessário para que a tela seja bloqueada e não se possa fecha-la normalmente*/
		$.fancybox({
			modal: true,
			title: "<b style='font-size: 1.5em;'>Acesso negado!</b>",
			content: "<p style='font-size: 2.5em;'>"+msg+"</p>"+(inline==1 ? "<br><a href='#' onclick='IframeVoltar()' class='btn' style='text-decoration: none'>Voltar</a>" : ""),
			scrolling: 'no',
			helpers: {
				title: {type: 'inside', position: 'top'},
				overlay: {css: {'overflow': 'hidden'}}
			},
			afterShow: function(){
				setTimeout(function(){//realiza alterações com uma pausa para funcionar
					$(".fancybox-inner").css('height', '');
					$(".fancybox-title").css('color', 'rgb(132, 64, 64)');
				}, 0);
			}
		});
	}

	/*----- /Acesso ao iframe/ -----*/
	/*Usando o plugin "porthole" (que foi carregado na janela principal e este iframe), preparando a comunicação entre o iframe e a janela pai.
	A classe e funções são adicionadas à "window" deixando mais global e permitindo chamadas de fora do "$(document)" como no caso do "Fancybox"*/
	//Verifica o domínio que carregou o iframe filtrando pela lista de permitidos ("dmns_url_ar" foi criada na index)
	var url_pai = document.referrer.replace(/(https?:\/\/)|(\/$)/g, "");//regexp: "http" seguido de "s" (ou não) seguido de "//" ou "/" no fim de string
	if(dmns_url_ar.indexOf(url_pai) != -1){
		//Classe para enviar e receber mensagens da janela principal
		window.windowProxy = new Porthole.WindowProxy(document.referrer);
		//Registra um objeto ouvinte para receber mensagens
		window.windowProxy.addEventListener(function(event){ 
			//Da janela principal ao usuário tentar sair do "quiz adm" e voltar ao "quiz user" envia para aqui a mensagem "tipo salvar"
			if(event.data["tipo"] == "salvar"){
				if(item_dados != undefined){//Se existem dados chama "SalvarCarregar()" para salvar a página atual e por lá é chamado "IframeVoltar()"
					SalvarCarregar(0);//tipo 0
				}else{//Se não existem dados retornados (por acesso negado) chama "IframeVoltar()" diretamente
					IframeVoltar();
				}
			}
		});
		//Funções de envio de mensagem à janela pai
		window.IframeVoltar = function(slvmnt){//Retorna mensagem "tipo voltar" passando o id do quiz e dados a serem atualizados na listagem (se necessário)
			var wndwprxy_dds = {'tipo':'voltar', 'id_quiz':id_quiz};
			if(slvmnt == true){//Se houve salvamento envia outros dados à listagem
				wndwprxy_dds.categ1 = $("#inp-categ1 option:selected").text();
				wndwprxy_dds.categ2 = $("#inp-categ2 option:selected").text();
				wndwprxy_dds.categ3 = $("#inp-categ3 option:selected").text();
				wndwprxy_dds.assunto = item_dados.assunto;
			}
			if(item_dados){//Se "item_dados" está preenchido usa valor de status
				wndwprxy_dds.status = (slvmnt==true && ver_stts ? ver_stts : item_dados.status);//se houve salvamento e mudança de status envia o novo ou senão o status atual do quiz
			}
			window.windowProxy.post(wndwprxy_dds);
		}
		window.IframeVoltarCancela = function(){//Retorna mensagem "tipo voltar-cancela" para cancelar o processo de voltar do quiz especificado
			window.windowProxy.post({'tipo':'voltar-cancela', 'id_quiz':id_quiz});
		}
	}

	/*---- /Diverso/ ----*/
	//Aplica clique a todas os elementos da logo com window.open('cpbeducacional.com.br', '_blank', 'toolbar=0,location=0,menubar=0') e pode-se passar um terceiro parâmetro com parâmtros para o link
	$(".logo-cpb, .logo-cpb-white").on("click", function(){
		window.open('http://cpbeducacional.com.br', '_blank');
	});
	//Usando o plugin baseado em jQuery "ToolTipster" versão 3.0, que exibe mensagens de rotulação e dicas nos elementos
	if(typeof $().tooltipster !== 'undefined'){
		TlTpstr();
	}else{
		$.getScript(sttc_lib+'/jquery-tooltipster/3.0/js/jquery.tooltipster.min.js', function(/*data, textStatus, jqxhr*/){
			TlTpstr();
		});
	}
	function TlTpstr(){//Usa função para evitar repetição
		/*Setando valores padrões para o uso do plugin "Tooltipster". Usa 1 segundo por padrão para que as mensagens sejam exibidas apenas se o usuário persistir*/
		$.fn.tooltipster("setDefaults", {
			/*autoClose: false,*/
			maxWidth: 250,
			position: "top",
			delay: 1000, speed: 300,
			restoration: "previous",
			icon: "?",
			iconTouch: true,
			iconTheme: "tooltipster-icon-light-medium",
			theme: "tooltipster-light-medium"
		});
		//Aplicando o método. Pode ser usado vazio usando o atributo "title" do elemento para o texto ou setando opções ({content: "Mensagem de texto", position: "top", ...}), ou uma única opção ("content", "Mensagem de texto")
		$(".wrap-cover *[title]").tooltipster();
		$(".menu-edit > *[title]").tooltipster({position: "top", delay: 500, speed: 100, theme: "tooltipster-light-shadow", iconTouch: false});//seta para todos os elementos com atributo "title"
		$(".menu-edit > * *[title]").tooltipster({position: "bottom", delay: 300, speed: 100, theme: "tooltipster-light-small", iconTouch: false});//seta para todos os elementos com atributo "title"
		$("#img-edit .img-btn-it").tooltipster({delay: 200});
	}
});