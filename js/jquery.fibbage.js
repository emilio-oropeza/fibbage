"use strict";
(function($){
	$.fn.fibbage = function(options )
	   {
	       return this.each(function ()
	       {
	           var element = $(this);	           
	           if (element.data('fibbage')) return;	           
	           
	           var myplugin = new Fibbage(this, options);
	           element.data('fibbage', myplugin);
			   element.data('fibbage').methods.init();
	       });
	   };

	var Fibbage = function (target, options){		
		var componentObj = {
			screen_read: $("#read_game"),
			screen_answer: $("#answer_game"),
			screen_choose: $("#choose_game"),
			screen_show: $("#show_game"),
			screen_result: $("#result_game"),
			index:0,
			indexAns:0,
			question:"",
			answer:"",
			bad_answer:"",
			players_score:[],
			bs_answers:[],
			qIndex:[],
			methods:{
				init: function(){
					componentObj.methods.score_board();
					for (var i = 0; i < options.players.length; i++) {
						componentObj.players_score[i] = 0;
					};

					$(componentObj.screen_answer).hide();
					$(componentObj.screen_choose).hide();
					$(componentObj.screen_show).hide();
					$(componentObj.screen_result).hide();
					componentObj.methods.getQuestion();
					
				},
				getQuestion: function(){
					$.ajax({
						method: "GET",
						url: "/game/getquestions?index="+componentObj.qIndex,
						dataType: 'json'
					}).done(function( json ) {
						if(json.error === undefined){
							componentObj.question=json.q;
							componentObj.answer=json.a;
							componentObj.bad_answer=json.ba;
							componentObj.qIndex[componentObj.index]=json.i;
							componentObj.methods.question();
						}
					});
				},
				question: function(){
					$(componentObj.screen_read).show();
					$("#read_player span").text(options.players[componentObj.index].name);
					$("#read_question").text(componentObj.question);
					$("#read_btn").click(function(){
						componentObj.indexAns = 0;
						componentObj.bs_answers = [];
						componentObj.bs_answers[componentObj.index] = componentObj.answer;
						componentObj.bs_answers[options.players.length] = componentObj.bad_answer;
						$(componentObj.screen_read).hide();
						componentObj.methods.next();
					});
				},
				next: function(){
					if(componentObj.index !== componentObj.indexAns && 
						componentObj.indexAns < options.players.length){
						componentObj.methods.getAnswer();
					}else  if(componentObj.index === componentObj.indexAns){
						componentObj.indexAns++;
						componentObj.methods.next();
					}else if(componentObj.indexAns >= options.players.length){
						componentObj.methods.choose();
					}else{
						console.log("error "+componentObj.indexAns);
					}
				},
				getAnswer:function(){
					$("#answer_button").html("");
					$(componentObj.screen_answer).show();
					$('<button id="answer_btn" class="btn">Siguiente</button>').appendTo("#answer_button");
					$("#answer_input input").val("");
					$("#answer_player").text(options.players[componentObj.indexAns].name);
					$("#answer_playerturn").text(options.players[componentObj.index].name);

					$("#answer_btn").click(function(){

						if($("#answer_input input").val() !== ""){
							var res = $("#answer_input input").val();

							if(res === componentObj.answer){
								alert("Esa es la respuesta correcta usa otra");
							}else{
								componentObj.bs_answers[componentObj.indexAns] = res;
								$(componentObj.screen_answer).hide();
								componentObj.indexAns++;
								componentObj.methods.next();
							}
						}else{
							alert("Debes poner una respuesta")
						}
					});

				},
				choose:function(){
					$("#answers2choose").html("");
					$(componentObj.screen_choose).show();
					var flag = true;
					var arr = [];
					for (var i = 0; i < componentObj.bs_answers.length; i++) {
						arr[i] = i;
					};
					while(arr.length>0){
						var random= Math.floor((Math.random() * (componentObj.bs_answers.length)));
						var val = arr.indexOf(random);
						if(val>-1){
							var falseAns = componentObj.bs_answers[random];
							var div = $('<div class="false_ans">'+falseAns+'</>').appendTo("#answers2choose");
							$('<input type="hidden" value="'+random+'">').appendTo(div);

							
							$(div).click(function(){
								var i = $(this).find("input").val();
								$(componentObj.screen_choose).hide();
								componentObj.methods.show_correct(i);
							});
							arr.splice(val,1);
						}							

					}
				},
				show_correct:function(index_choose){
					var res = "";
					$('#show_btn').html("");
					var btn = $('<button id="show_next" class="btn">Siguiente</button>').appendTo('#show_btn');
					if(index_choose < options.players.length){
						componentObj.players_score[index_choose] += 100;
						componentObj.methods.score_update(index_choose);
						res = options.players[index_choose].name + " gano 100 pts más";
					}else{
						res = "fibbage atino, por lo tanto nadie gano puntos";
					}
					$(componentObj.screen_show).show();
					$('#correct_answer span').text(componentObj.answer);
					$('#player_win span').text(res);
					$(btn).click(function(){
						$(componentObj.screen_show).hide();
						componentObj.methods.nextRound();
					});

				},
				nextRound:function(){
					componentObj.index++;
					if(componentObj.index < options.players.length){
						componentObj.methods.getQuestion();
					}else{
						componentObj.methods.total();
					}
				},
				total:function(){
					$('#fibbage_score').hide();
					$(componentObj.screen_result).show();
					var max = 0;
					var p = -1;
					for (var i = 0; i < componentObj.players_score.length; i++) {
						if(componentObj.players_score[i] > max){
							max = componentObj.players_score[i];
							p = i;
						}
						var str = options.players[i].name+" obtuvo: "+componentObj.players_score[i]+" pts";
						$("<div id='final_"+i+"' class='finaldiv'>"+str+"</div>").appendTo(componentObj.screen_result);
					};
					$("<div id='winner' class='player'>El ganador es: "+options.players[p].name+"</div>").appendTo(componentObj.screen_result);
					var end = $("<button class='btn'>Finalizar</button>").appendTo(componentObj.screen_result);
					$(end).click(function(){
						var send = componentObj.methods.getFinalJson();
						$.ajax({
							method: "POST",
							url: "/game/save",
							data: {json:send},
							dataType: 'json'
						}).done(function( json ) {
							window.location.replace("/");
						});
					});

				},
				score_board:function(){
					for (var i = 0; i < options.players.length; i++) {
						var div = $('<div class="player_score" id="player_'+i+'"></div>').appendTo('#fibbage_score');
						$(div).text(options.players[i].name+":");
						$('<span id="score_player_'+i+'">0</span>').appendTo(div)
					};
				},
				score_update:function(index){
					var score= "#score_player_"+index;
					$(score).text(componentObj.players_score[index]);
				},
				getFinalJson:function(){
					var arr = [];
					for (var i = 0; i < options.players.length; i++) {
						arr[i] = options.players[i];
						arr[i]['score'] = componentObj.players_score[i];
					};
					return JSON.stringify(arr);
				}
			}			
		};
		return componentObj;
	};
})(jQuery); 