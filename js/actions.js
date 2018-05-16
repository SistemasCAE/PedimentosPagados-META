var fn = {

	deviceready: function(){
		document.addEventListener("deviceready", fn.init/*this.init*/, false);
	},
	init: function(){
	/*
	 * En esta sección vamos a asociar
	 * todos los eventos del "Click" al HTML
	 */
	  fn.compruebaSesion();
	  $("#botonAcceder").tap(fn.iniciarSesion);
   	  $("#botonConsultarPedimento").tap(fn.consultaPedimento);
	  $("#botonConsultarFecha").tap(fn.consultaFechaPago);
	  $("#linkConsultaNoPedimento").tap(fn.divPorPedimento);
	  $("#linkConsultaFechaPago").tap(fn.divPorFechaPago);
	  $("#cierraSesion").tap(fn.cierraSesion);
	  
	},
	iniciarSesion: function(){
		var usuario = $("#usuario").val();
		var password = $("#password").val();
		try{
			if(usuario === ""){
				throw new Error("No ha indicado el usuario");
				return;
			}
			if(password === ""){
				throw new Error("No ha indicado la contraseña");
				return;
			}
		}catch(error){
			window.plugins.toast.show(error, 'short', 'center');
			console.log(error);
			return;
		}		
		var aduana = $("#aduana").val();
		if(aduana=='puebla')
		{
			$("#aduanaNp").text('Aduana: Puebla');
			$("#aduanaFp").text('Aduana: Puebla');
			window.localStorage.setItem("aduanaMETA", aduana);
			fn.enviaSesion("compruebaSesion.php",usuario,password);
		}
		else
		{
			$("#aduanaNp").text('Aduana: Queretaro');
			$("#aduanaFp").text('Aduana: Queretaro');
			window.localStorage.setItem("aduanaMETA", aduana);
			n.enviaSesion("compruebaSesion.php",usuario,password);
		}
	},
	enviaSesion: function(archivoSesion,usuario,password){
		if(networkInfo.estaConectado() == false){
			window.plugins.toast.show("No existe conexión a internet, revisela e intente de nuevo", 'long', 'center');
		}else{
			$.ajax({
				method: "POST",
				url: "http://enlinea.laser-oe.com.mx/AppConsultaPedimentos/"+archivoSesion,
				data: { 
					usu: usuario,
					pass: password
				}
			}).done(function(mensaje){
				if(mensaje != "0"){
					window.localStorage.setItem("nombreUsuarioMETA", usuario);
					window.location.href="#inicio";
				}else{
					window.plugins.toast.show("Usuario/Contraseña invalido(s)", 'long', 'center');
				}
			}).fail(function(error){
				alert("hubo error");
			});
		}
	},
	
	cierraSesion: function(){
		window.localStorage.removeItem("nombreUsuarioMETA");
		window.localStorage.removeItem("aduanaMETA");
		$('#noPedimento').val('')
		$('#fechaInicio').val('');
		$('#fechaFin').val('');
		$('#resultado').html('');
		$("#usuario").val("");
		$("#password").val("");
		window.location.href = "#paginaInicio";
	},
	
	compruebaSesion: function(){
		if(window.localStorage.getItem("nombreUsuarioMETA") != null){
			if(window.localStorage.getItem("aduanaMETA") != null){
				if(window.localStorage.getItem("aduanaMETA")=='puebla')
				{
					$("#aduanaNp").text('Aduana: Puebla');
					$("#aduanaFp").text('Aduana: Puebla');
				}
				else
				{
					$("#aduanaNp").text('Aduana: Queretaro');
					$("#aduanaFp").text('Aduana: Queretaro');
				}
				window.location.href="#inicio";
			}
		}
	},
	
	consultaPedimento: function(){
	if(networkInfo.estaConectado() == false){
			window.plugins.toast.show("No existe conexión a internet, revisela e intente de nuevo", 'long', 'center');
		}else{
		$('#resultado').html("Cargando...");
		var empresa_rfc = window.localStorage.getItem("nombreUsuarioMETA");
		var aduana_consulta = window.localStorage.getItem("aduanaMETA");
		var noPedimento= $("#noPedimento").val();
		try{
			if(noPedimento === ""){
				throw new Error("No ha indicado el pedimento");
			}
		}catch(error){
			window.plugins.toast.show(error, 'short', 'center');
			$('#resultado').html("");
			return;
		}
		var archivoConsulta = 'http://enlinea.laser-oe.com.mx/AppConsultaPedimentos/buscaPedimento.php';
		
		////////////////////////////////////////////////////////////// Envio AJAX//////////////////////////////////////////////////////////////////
		$.ajax({
				type: "GET",
				url: archivoConsulta,
				data: { 
					opcion: 1,
					noPedimento: noPedimento,
					rfc : empresa_rfc,
					aduana_consulta : aduana_consulta
				},
				dataType: "json"
			}).done(function(data, textStatus, jqXHR){
				$('#resultado').html('');
				if(data[0].Archivo=='nada')
				{
					$('#resultado').html('No se encontraron registros');
				}
				else{
					for(var x=0; x<data.length; x++)
					{
						$('#resultado').append('<div id="'+data[x].Archivo+'" onClick="fn.abrePDF('+"'"+data[x].Archivo+"','"+data[x].Ruta+"'"+')">'+data[x].Archivo+'</div></br>');
					}
				}
			}).fail(function(error){
				alert(error.status);
				alert(error.message);
				alert(error.responseText);
			});
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		}
	},
	
	abrePDF : function(archivo,ruta){
		var vector = ruta.split("/");
		var nuevaRuta = vector[5]+"/"+vector[6]+"/"+vector[7]+"/"+vector[8]+"/"+vector[9]+"/"+archivo;
		var UrlFile = 'http://enlinea.laser-oe.com.mx/'+nuevaRuta;
		console.log(UrlFile);
		var ref = cordova.InAppBrowser.open('https://docs.google.com/viewer?url='+UrlFile+'&embedded=true', '_blank', 'location=yes');
		window.open = cordova.InAppBrowser.open;
	},
	
	consultaFechaPago: function(){
	if(networkInfo.estaConectado() == false){
			window.plugins.toast.show("No existe conexión a internet, revisela e intente de nuevo", 'long', 'center');
		}else{	
		$('#resultado').html("Cargando...");
		var empresa_rfc = window.localStorage.getItem("nombreUsuarioMETA");
		var fechaInicio= $("#fechaInicio").val();
		var operacion= $("#combo").val();
		var fechaFin= $("#fechaFin").val();
		var aduana_consulta = window.localStorage.getItem("aduanaMETA");
		
		var archivoConsulta = 'http://enlinea.laser-oe.com.mx/AppConsultaPedimentos/buscaPedimento.php';
		
		
		
		try{
			if(fechaInicio == ""){
				throw new Error("No ha indicado Fecha Inicio");
			}
			if(fechaFin == ""){
				throw new Error("No ha indicado Fecha Final");
			}
		}catch(error){
			window.plugins.toast.show(error, 'short', 'center');
			$('#resultado').html("");
		}
		////////////////////////////////////////////////////////////// Envio AJAX//////////////////////////////////////////////////////////////////
		$.ajax({
				type: "GET",
				url: archivoConsulta,
				data: { 
					opcion: 2,
					fechaInicio: fechaInicio,
					fechaFin: fechaFin,
					rfc : empresa_rfc,
					operacion : operacion,
					aduana_consulta : aduana_consulta
				},
				dataType: "json"
			}).done(function(data, textStatus, jqXHR){
				$('#resultado').html('');
				console.log(data);
				if(data[0].Pedimento=='nada')
				{
					$('#resultado').html('No se encontraron registros');
				}
				else
				{
					$('#resultado').html('<div class = "ui-grid-b" id="cuadricula"></div>');
					for(var x=0; x<data.length; x++)
					{	
						console.log(data[x].Pedimento);
						if(((x+1)%3)==1)
						{
							$('#cuadricula').append('<div id="'+data[x].Pedimento+'" class="ui-block-a" onClick="fn.consultaPedimento2('+"'"+data[x].Pedimento+"'"+')">'+data[x].Pedimento+'</div>');
						}
						else
						{
							if(((x+1)%3)==2)
							{
								$('#cuadricula').append('<div id="'+data[x].Pedimento+'" class="ui-block-b" onClick="fn.consultaPedimento2('+"'"+data[x].Pedimento+"'"+')">'+data[x].Pedimento+'</div');
							}
							else
							{
								if(((x+1)%3)==0)
								{
									$('#cuadricula').append('<div id="'+data[x].Pedimento+'" class="ui-block-c" onClick="fn.consultaPedimento2('+"'"+data[x].Pedimento+"'"+')">'+data[x].Pedimento+'</div>');
								}
							}
						}
					}
				}
			}).fail(function(error){
				//alert("Error");
				console.log(error.responseText);
			});
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		}
	},
	
	consultaPedimento2: function(noPedimento){
	if(networkInfo.estaConectado() == false){
			window.plugins.toast.show("No existe conexión a internet, revisela e intente de nuevo", 'long', 'center');
		}else{	
		console.log(noPedimento);
		var empresa_rfc = window.localStorage.getItem("nombreUsuarioMETA");
		var aduana_consulta = window.localStorage.getItem("aduanaMETA");
		var archivoConsulta = 'http://enlinea.laser-oe.com.mx/AppConsultaPedimentos/buscaPedimento.php';
		
		////////////////////////////////////////////////////////////// Envio AJAX//////////////////////////////////////////////////////////////////
		$.ajax({
				type: "GET",
				url: archivoConsulta,
				data: { 
					opcion: 1,
					noPedimento: noPedimento,
					rfc : empresa_rfc,
					aduana_consulta : aduana_consulta
				},
				dataType: "json"
			}).done(function(data, textStatus, jqXHR){
				$('#popup').html('');
				if(data[0].Archivo=='nada')
				{
					$('#popup').html('No se encontraron registros');
				}
				else{
					$('#popup').html('<a href="#" data-rel="back" class="ui-btn ui-icon-delete ui-btn-icon-left"></a><h1><strong>Archivos Disponibles</strong></h1><br>');
					for(var x=0; x<data.length; x++)
					{
						$('#popup').append('<div id="'+data[x].Archivo+'" onClick="fn.abrePDF('+"'"+data[x].Archivo+"','"+data[x].Ruta+"'"+')">'+data[x].Archivo+'</div></br>');
					}
					fn.mostrarPopUp();
				}
			}).fail(function(error){
				alert(error.status);
				alert(error.message);
				alert(error.responseText);
			});
		}
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	},
	
	mostrarPopUp : function()
	{
		$("#popup").popup("open");
	},
	
	divPorPedimento: function(){
		$('#noPedimento').val('')
		$('#fechaInicio').val('');
		$('#fechaFin').val('');
		$('#resultado').html('');
	},
	
	divPorFechaPago: function(){
		$('#noPedimento').val('')
		$('#fechaInicio').val('');
		$('#fechaFin').val('');
		$('#resultado').html('');
	}
}
/*
 *Llamar al metodo Init en el navegador
 */
//fn.init();

/*
 *Llamar deviceready para compilar
 */
fn.deviceready();