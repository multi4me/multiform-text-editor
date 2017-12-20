$(document).ready(function(){
	//Prepara menu de edição para formatação de texto. O quarto parâmetro é função a ser executada após edição no texto pelo menu, e os parâmetros são: a caixa editável, dados da seleção e exec (true/false, informando se o commando foi suportado)
	$("#menu").formatTxt($("#box-txt"), null, null, function(cx, slc, exc){
		ShowMessage(cx, slc, exc);
	});
	//Função padrão de resposta ao uso do plugin "formatTxt()" para atualizar e exibir mensagem de formatação não suportada
	function ShowMessage(cx, slc, exc){
		cx.keyup();//-->usado para atualizar dado, mas futuramente não será necessário quando evento "input" (detector de qualquer mudança) funcionar em todos os navegadores
		exc == false ? alert("Not supported - The command was not executed by this browser. If possible, upgrade to a newer version.") : null;
	}
});