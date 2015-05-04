"use strict";
(function($){
	$.fn.logreg = function(options )
	   {
	       return this.each(function ()
	       {
	           var element = $(this);	           
	           if (element.data('logreg')) return;	           
	           
	           var myplugin = new logreg(this, options);
	           element.data('logreg', myplugin);
			   element.data('logreg').methods.init();
	       });
	   };

	var logreg = function (target, options){		
		var componentObj = {
			methods:{
				init: function(){
					$("#inputs_logreg").show();
					var id = "";
					var btn_id = "";
					var radio_name = "";
					for(var i = 0; i<options.num; i++){
						var row = $('<tr id="player'+i+'"></tr>').appendTo("#inputs_logreg table");
						componentObj.methods.addinput(row, i);
					}
					if(options.user_logged !== ''){
						console.log(options.user_logged);
						componentObj.methods.render(options.user_logged, options.user_logged_id, 0);
					}
					$("#send_button").click(function(){
						var lleno = true;
						$('input[type=text]').each(function(){
							if($(this).val()==""){
								lleno = false;
							}
						});
						if(lleno){
							$('form').submit();
						}else{
							alert('Todos los campos deben ser llenados');
						}
					});

				},
				login: function(username, password, id){
					if(!componentObj.methods.userAlreadyLogin(username)){
						$.ajax({
							method: "POST",
							url: "/session/logingame",
							data: { user: username, pass: password},
							dataType: 'json'
						}).done(function( msg ) {
							if(msg.error === undefined){
								componentObj.methods.render(username, msg.id, id);
							}else{
								var id_error = "#error"+id;
								$(id_error).text(msg.error);
							}
						});
					}else{
						var id_error = "#error"+id;
						$(id_error).text("Usuario ya logeado");
					}
				},
				register: function(username, password, id){
					$.ajax({
						method: "POST",
						url: "/session/registergame",
						data: { user: username, pass: password},
						dataType: 'json'
					}).done(function( msg ) {
						if(msg.error === undefined){
							componentObj.methods.render(username, msg.id, id);
						}else{
							var id_error = "#error"+id;
							$(id_error).text(msg.error);
						}
					});
				},
				addinput:function(row, i){
					var td = $('<td></td>').appendTo(row);
					var checkbox = $('<input class="logreg_in_user" type="checkbox" name="logreg'+i+'">').appendTo(td);
					$('<td><input class="logreg_in_user" type="text" name="user'+i+'"></td>').appendTo(row);
					$('<td><input class="logreg_in_pass" type="password" name="pass'+i+'"></td>').appendTo(row);
					$('<td><input id="btn'+i+'" type="button" value="Enviar" disable>').appendTo(row);	
					$('<label id="error'+i+'" class="errors"></label></td>').appendTo(row);	
					var btn_id = "#btn"+i;

					$(checkbox).bootstrapSwitch({
						state:'true',
						size:"small",
						onText:"Logearse",
						offText:"Registrarse",
						offColor:"success",
						indeterminate:"true",
						label:"Elige"
					});

					$(btn_id).click(function(){
						var str = $(this).attr('id');
						var id = str.slice(-1);
						var radio_name = 'input[name=logreg'+id+']';
						var type = $(radio_name).is(':checked');
						console.log(type);
						var user_txt = 'input[name=user'+id+']';
						var pass_txt = 'input[name=pass'+id+']';
						var user = $(user_txt).val();
						var pass = $(pass_txt).val();
						

						if(user.length > 0 && pass.length>0){
							if(type === undefined){
								console.log("nada");
							}else if(type == 0){
								componentObj.methods.register(user, pass, id);
							}else if(type == 1){
								componentObj.methods.login(user, pass, id);
							}
						}else{
							var id_error = "#error"+id;
							$(id_error).text("Los campos no pueden estar vacios");
						}						
					});
				},
				render: function(username, user_id, id){
					
					var arr = {name:username, id:user_id};
					var json = JSON.stringify(arr);
					var row = "#player"+id;
					$(row).addClass("user_ready");
					$(row).html("");
					$("<td colspan='3'><label>"+username+"</label></td>").appendTo(row);
					var span = $("<td><span>X</span>").appendTo(row);
					$("<input type='hidden' name='players[]' value='"+json+"'>").appendTo(row);

					$(span).click(function(){
						$(row).removeClass("user_ready");
						$(row).html("");
						componentObj.methods.addinput(row, id);
					});
				},
				userAlreadyLogin:function(name){
					var flag = false;
					$("input[type=hidden]").each(function(){
						var json = $.parseJSON($(this).val());
						if(json.name === name){
							flag = true;
						}
					});
					return flag;
				}
			}			
		};
		return componentObj;
	};
})(jQuery); 