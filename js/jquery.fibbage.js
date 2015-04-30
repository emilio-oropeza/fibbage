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
			methods:{
				init: function(){
					$(componentObj.screen_answer).hide();
					$(componentObj.screen_choose).hide();
					$(componentObj.screen_show).hide();
					$(componentObj.screen_result).hide();
					componentObj.methods.question();
				},
				question: function(){
					$(componentObj.screen_read).show();
					console.log(options.players[componentObj.index].name);
					console.log(options.questions[componentObj.index].pregunta);
					$("#read_player span").text(options.players[componentObj.index].name);
					$("#read_question").text(options.questions[componentObj.index].pregunta);
					$("#read_btn").click(function(){
						$(componentObj.screen_read).hide();
						componentObj.methods.answer();
					});
				},
				answer:function(){
					$(componentObj.screen_answer).show();
					console.log(options.players.length);
				}
			}			
		};
		return componentObj;
	};
})(jQuery); 