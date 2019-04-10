$(document).ready(function(){
	//Prepara menu de edição para formatação de texto. O quarto parâmetro é função a ser executada após edição no texto pelo menu, e os parâmetros são: a caixa editável, dados da seleção e exec (true/false, informando se o commando foi suportado)
	$(".menu-edit").formatTxt(function(){return $(this).parent().find(".box-txt")}, null, null, function(cx, slc, exc){
		ShowMessage(cx, slc, exc);
	});
	//Remove eventos e dados aplicados do plugin "MultiformTextEditor"
	//$.fn.formatTxt.destroy($(.menu-edit"));
	
	//Função padrão de resposta ao uso do plugin "formatTxt()" para atualizar e exibir mensagem de formatação não suportada
	function ShowMessage(cx, slc, exc){
		cx.keyup();//-->usado para atualizar dado, mas futuramente não será necessário quando evento "input" (detector de qualquer mudança) funcionar em todos os navegadores
		exc == false ? alert("Not supported - The command was not executed by this browser. If possible, upgrade to a newer version.") : null;
	}

	//Estrutura para exibição do menu flutuante de edição inline, ao usuário selecionar texto
	var pageX;
	var pageY;
	!window.x ? x = {} : null;
	x.Selector = {};
	x.Selector.getSelected = function() {
		var t = '';
		if(window.getSelection) {
			t = window.getSelection();
		}else if(document.getSelection) {
			t = document.getSelection();
		}else if(document.selection) {
			t = document.selection.createRange().text;
		}
		return t;
	}
	$("#box-txt-inline").on("mousedown", function(e){
		pageX = e.pageX;
		pageY = e.pageY;
		$('.mn-inline').fadeOut(200);
	});
	$("#box-txt-inline").on("mouseup", function() {
		var selectedText = x.Selector.getSelected();
		if(selectedText != ''){
			$('.mn-inline').css({'left': (pageX<$(window).width()-$('.mn-inline').width()-10 ? pageX+5 : pageX-$('.mn-inline').width()-20), 'top': pageY-60}).fadeIn(200);
		}
	});

	//Aplica a exibição de rótulo estilizado pelo plugin Tooltipster
	$(".menu-edit > *[title]").tooltipster({position: "top", delay: 500, speed: 100, theme: "tooltipster-light-shadow", iconTouch: false});//seta para todos os elementos filhos do menu com atributo "title"
	$(".menu-edit > * *[title]").tooltipster({position: "bottom", delay: 300, speed: 100, theme: "tooltipster-light-small", iconTouch: false});//seta para todos os elementos netos do menu com atributo "title"
});
