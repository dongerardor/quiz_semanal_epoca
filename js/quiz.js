var cursor = 0,//numero de pergunta atual
score = 0,//score geral
arrPerguntas = [],
arrRespostas = [],
feedbackEntregado = false;
var evt = (navigator.userAgent.match(/(iPad|iPhone)/ig)) ? "touchstart" : "click";

$(document).ready (function (){
	var url = window.location.href;
	var separador = "doc=";
	var idPlanilha = "0Aq3TCrTdfBLcdEw0SHhFTjZsMEFmb3dydGJtREdsZkE";//endereço default da planilha de google docs
	if (url.indexOf (separador) != -1){
		var idPlanilha = url.split(separador)[1];
		console.log ("OK. ID doc: " + idPlanilha);
	}else{
		console.log ("Error. Falha conetando com os dados. Fornecendo dados por defeito");
	}
	initQuiz (idPlanilha);
});


function initQuiz (idPlanilha){
	var strUrlDoc = "http://docs.google.com/spreadsheet/ccc?key=" + idPlanilha + "#gid=0";
	showStages (-1);
	TC.load({"url":strUrlDoc},function(data){
		arrPerguntas = data;//os dados
		//resuelvo el null como 0 en el campo respOK
		for (var i in arrPerguntas){
			if (arrPerguntas[i].respOK == null){
				arrPerguntas[i].respOK = 0;
			}
		}
		initAll();//assim que recebi os dados, inicializo o quiz
	});
}
	
//começo o quiz
function initAll (){
	showStages (0);
	
	$("#labelContinuar").text ("");
	
	//al hacer click sobre el stage 0, paso al siguiente stage
	$("#stage0").bind(evt, function() {
		showStages (1);
		resetQuiz();
	});
	
	$("#btnContinuar").bind(evt, function (){
		if (!$(".rbRespostas:checked").val()) {
       		$("#labelContinuar").text ("Selecione alguma das respostas");
        	return false;
    	}
		cursor++;
		displayPergunta ();
	});
	
	
	//ao clicar nalgum radiobutton, avalio se a resposta é correta
	//e tarefas associadas
	$("#divRadioButtons input:radio").bind(evt, function (){
		
		var idRbSelected = $('input[name=respostas]:checked').attr("id");
		var numRespostaSelecionada = Number (idRbSelected.substr(idRbSelected.length - 1));
		var respostaCorreta = arrPerguntas[cursor].respOK;
		var usuarioAcertou = false;
		
		$("#labelContinuar").removeClass("respVerde").removeClass("respVermelha");//reset cores nas labels
		
		if (numRespostaSelecionada == respostaCorreta){//se a resposta está certa
			usuarioAcertou = true;
			$("#labelContinuar").addClass("respVerde").text ("CORRETO");
			score++;
		}else{
			$("#labelContinuar").addClass("respVermelha").text ("ERRADO");
		}
		$("#feedbackResposta").show("slow");
		
		//assigno cores às perguntas respondidas, segundo o usuário acertou ou não
		if (usuarioAcertou){
			$("#txtResposta" + respostaCorreta).addClass("respVerde");
		}else{
			$("#txtResposta" + numRespostaSelecionada).addClass("respVermelha");
			$("#txtResposta" + respostaCorreta).addClass("respVerde");
		}
		
		//guardamos a informação sobre a respostas desta pergunta
		//dentro de um array, com uma variável booleana cuja posição corresponde ao número de pergunta
		usuarioAcertou?arrRespostas.push(true):arrRespostas.push(false);
		$("#divRadioButtons input:radio").attr('disabled',true);
	});
}

//oculto ou mostro os divs/stages em função do stage já selecionado (variavel "stage")
function showStages (_numStage){
	$(".stage").hide();
	if (_numStage >= 0){
		$("#stage" + String (_numStage)).show();
	}
}

//zeramos o quiz, para começar
function resetQuiz (){
	cursor = 0;
	score = 0;
	arrRespostas = [];
	showStages (1);
	$("#divTableResultados").html ("");
	displayPergunta ();
}

//displayPergunta faz tudo o relacionado com a exhibição das perguntas
function displayPergunta (){
	$("#labelContinuar").text ("");
	$("#labelContinuar").removeClass("respVerde");
	
	//desligo feedback
	$("#feedbackResposta").hide();
	
	//uncheck everything
	$('.rbRespostas').each(function(){
		$(this).prop('checked', false);
  	});
	
	//sin clases
	$('.txtRespostas').removeClass("respVermelha").removeClass("respVerde");
	
	$("#divRadioButtons input:radio").attr('disabled',false);
	
	if (cursor < arrPerguntas.length){
		var objPergunta = arrPerguntas [cursor];
		$("#numeroPergunta").text("Pergunta " + (cursor+1) + "/" + arrPerguntas.length);
		$("#txtPergunta").text(objPergunta.pergunta);
		$("#txtResposta0").text(objPergunta.resp0);
		$("#txtResposta1").text(objPergunta.resp1);
		$("#txtResposta2").text(objPergunta.resp2);
		$("#txtResposta3").text(objPergunta.resp3);
		$("#imgPergunta").attr("src", objPergunta.imagem);
		
	}else{//fin del quiz
		fimQuiz ();
	}
}

//depois da última pergunta, entro no estágio final
function fimQuiz (){
	
	var qPerguntas 			= arrPerguntas.length;
	var qPerguntasAcertadas = score;
	var strPerguntasRespondidas = "Você acertou " + qPerguntasAcertadas + " de " + arrPerguntas.length + " perguntas.";
	
	showStages (2);
	
	$("#qPerguntasRespondidas").text(strPerguntasRespondidas);
	
	construirTabelaFinal ();
	
	$("#btnFim").bind (evt, function (){
		resetQuiz();
	})
}

//No estágio final, apresento uma tabela resumindo a performance do usuário
function construirTabelaFinal (){
	
	var strTable = "";
	strTable += "<table>";
	strTable += "<tr><td width='470' valign='top'>";
	strTable += "<a href='";
	strTable += arrPerguntas[0].url;
	strTable += "' target='_blank'>";
	strTable += arrPerguntas[0].pergunta;
	strTable += "</td>";
	strTable += "<td>";
	strTable += arrRespostas[0]==true?"<img src='images/answerRight.png' />":"<img src='images/answerWrong.png' />";
	strTable += "</td>";
		
	for (i=1; i<arrPerguntas.length; i++){//desenho a tabela
		//item
		strTable += "<tr><td valign='top'>";
		strTable += "<a href='";
		strTable += arrPerguntas[i].url;
		strTable += "' target='_parent'>";
		strTable += arrPerguntas[i].pergunta;
		strTable += "</a>";
		strTable += "</td>";
		strTable += "<td>";
		strTable += arrRespostas[i]==true?"<img src='images/answerRight.png' />":"<img src='images/answerWrong.png' />";
		strTable += "</td>";
		strTable += "</tr>";
	}
	strTable += "</td></tr></table>";
	
	$("#divTableResultados").html (strTable);		
}