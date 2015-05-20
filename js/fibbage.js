var screen_read =  $("#read_game");
var screen_answer =  $("#answer_game");
var screen_choose =  $("#choose_game");
var screen_show =  $("#show_game");
var screen_result =  $("#result_game");
var index = 0;
var indexAns = 0;
var question = "";
var answer = "";
var bad_answer = "";
var players_score = [];
//var bs_answers = [];
var qIndex = [];
var turno = 1;
var Server;

function log( text ) {
	console.log(text);
}

function send( text ) {
	Server.send( 'message', text );
}

$(document).ready(function() {
	log('Connecting...');
	Server = new FancyWebSocket('ws://192.168.15.12:9300');

	$('#message').keypress(function(e) {
		if ( e.keyCode == 13 && this.value ) {
			log( 'You: ' + this.value );
			send( this.value );

			$(this).val('');
		}
	});

	//Let the user know we're connected
	Server.bind('open', function() {
		log( "Connected." );
	});

	//OH NOES! Disconnection occurred.
	Server.bind('close', function( data ) {
		log( "Disconnected." );
	});

	//Log any messages sent from server
	Server.bind('message', function( payload ) {
		var str = payload.split(":");
		if(str[0]==="player"){
			console.log(str[1]);
			this_user = str[1];
			other_user = (str[1]===1)?1:2;
			init();
		}else if(str[0]==="qs"){
			init2(str[1]);
		}else if(str[0]==="choose"){
			bs_answer = str[1].split(",");
			choose(str[1].split(","));
		}
		log( payload );
	});

	Server.connect();
});

function fnquestion(){
	$(screen_read).show();
	$("#read_player span").text((index+1));
	$("#read_question").text(question);
	$("#read_btn").click(function(){
		indexAns = 0;
		bs_answers = [];
		bs_answers[index] = answer;
		bs_answers[2] = bad_answer;
		$(screen_read).hide();
		next();
	});
}			
function init(){
	$(screen_answer).hide();
	$(screen_choose).hide();
	$(screen_show).hide();
	$(screen_result).hide();

	getQuestion();
}
function init2(q){
	$(screen_answer).hide();
	$(screen_choose).hide();
	$(screen_show).hide();
	$(screen_result).hide();

	var questions = q.split(",");
	question=questions[0];
	answer=questions[1];
	bad_answer=questions[2];
	qIndex[index]=questions[3];
	fnquestion();
}

function getQuestion(){
	$.ajax({
		method: "GET",
		url: "/game/getquestions?index="+qIndex,
		dataType: 'json'
	}).done(function( json ) {
		if(json.error === undefined){
			question=json.q;
			answer=json.a;
			bad_answer=json.ba;
			qIndex[index]=json.i;
			var qs = "qs:"+question+","+answer+","+
						bad_answer+","+qIndex[index];
			send(qs);
			fnquestion();
		}
	});
}

function next (){
	if(index !== indexAns && 
		indexAns < 2 && turno != this_user){
		getAnswer();
	}else  if(index === indexAns){
		indexAns++;
		next();
	}else if(indexAns >= 2){
		send = "choose:"+bs_answers;
		Server.send( 'message', send );
	}else{
		console.log("error "+indexAns);
	}
}
function getAnswer(){
	$("#answer_button").html("");
	$(screen_answer).show();
	$('<button id="answer_btn" class="btn">Siguiente</button>').appendTo("#answer_button");
	$("#answer_input input").val("");
	$("#answer_player").text(index+1);
	$("#answer_playerturn").text((index+1)==1?1:2);

	$("#answer_btn").click(function(){

		if($("#answer_input input").val() !== ""){
			var res = $("#answer_input input").val();

			if(res === answer){
				alert("Esa es la respuesta correcta usa otra");
			}else{
				bs_answers[indexAns] = res;
				$(screen_answer).hide();
				indexAns++;
				next();
			}
		}else{
			alert("Debes poner una respuesta")
		}
	});

}
function choose(bs_answers){
	$("#answers2choose").html("");
	$(screen_answer).hide();
	$(screen_read).hide();
	$(screen_choose).show();
	var flag = true;
	var arr = [];
	for (var i = 0; i < bs_answers.length; i++) {
		arr[i] = i;
	};
	while(arr.length>0){
		var random= Math.floor((Math.random() * (bs_answers.length)));
		var val = arr.indexOf(random);
		if(val>-1){
			var falseAns = bs_answers[random];
			var div = $('<div class="false_ans">'+falseAns+'</>').appendTo("#answers2choose");
			$('<input type="hidden" value="'+random+'">').appendTo(div);

			
			$(div).click(function(){
				var i = $(this).find("input").val();
				$(screen_choose).hide();
				show_correct(i);
			});
			arr.splice(val,1);
		}							

	}
}
function show_correct(index_choose){
	var res = "";
	$('#show_btn').html("");
	var btn = $('<button id="show_next" class="btn">Siguiente</button>').appendTo('#show_btn');
	if(index_choose < 2){
		players_score[index_choose] += 100;
		score_update(index_choose);
		res = index_choose + " gano 100 pts más";
	}else{
		res = "fibbage atino, por lo tanto nadie gano puntos";
	}
	$(screen_show).show();
	$('#correct_answer span').text(answer);
	$('#player_win span').text(res);
	$(btn).click(function(){
		$(screen_show).hide();
		nextRound();
	});

}
function nextRound(){
	index++;
	if(index < 2){
		getQuestion();
		turno++;
	}else{
		total();
	}
}
function total(){
	$('#fibbage_score').hide();
	$(screen_result).show();
	var max = 0;
	var p = -1;
	for (var i = 0; i < players_score.length; i++) {
		if(players_score[i] > max){
			max = players_score[i];
			p = i;
		}
		var str = i+" obtuvo: "+players_score[i]+" pts";
		$("<div id='final_"+i+"' class='finaldiv'>"+str+"</div>").appendTo(screen_result);
	};
	$("<div id='winner' class='player'>El ganador es: "+options.players[p].name+"</div>").appendTo(screen_result);
	var end = $("<button class='btn'>Finalizar</button>").appendTo(screen_result);
	$(end).click(function(){
		var send = getFinalJson();
		$.ajax({
			method: "POST",
			url: "/game/save",
			data: {json:send},
			dataType: 'json'
		}).done(function( json ) {
			window.location.replace("/");
		});
	});

}
function score_board(){
	for (var i = 0; i < options.players.length; i++) {
		var div = $('<div class="player_score" id="player_'+i+'"></div>').appendTo('#fibbage_score');
		$(div).text(options.players[i].name+":");
		$('<span id="score_player_'+i+'">0</span>').appendTo(div)
	};
}
function score_update(index){
	var score= "#score_player_"+index;
	$(score).text(players_score[index]);
}
function getFinalJson(){
	var arr = [];
	for (var i = 0; i < options.players.length; i++) {
		arr[i] = options.players[i];
		arr[i]['score'] = players_score[i];
	};
	return JSON.stringify(arr);
}
	
