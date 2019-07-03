///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TIMELINE CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Time {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.tim=this;																				// Set name
		this.curTime=0;																				// Current time
		this.Init();																				// Init
	}

	Init()																						// INIT DOC
	{
	}

	Draw()																						// DRAW
	{
		this.DrawLabels();																			// Draw labels
		this.Update(this.curTime);																	// Update timeline
	}

	Update(time)																				// UPDATE TIMELINE
	{
		var i;
		if (time != undefined)	this.curTime=time;													// Set current time
		var sc=app.doc.scenes[app.curScene];														// Point at current scene
		if (!sc)	return;																			// Quit if valid
		$("[id^=tly-]").css( {'color':'#000','font-weight':'normal' });								// Reset all
		if (app.curModelId == "100") $("#tly-100").css({'color':'#009900','font-weight':'bold' });	// If camera, highlight
		for (i=0;i<sc.layers.length;++i) 															// For each layer in scene
			if (app.curModelId == sc.layers[i])														// If current
				$("#tly-"+sc.layers[i]).css( {'color':'#009900','font-weight':'bold' });			// Highlight
	}

	DrawLabels()																				// DRAW LABELS
	{
		var i,o,str="";
		var sc=app.doc.scenes[app.curScene];														// Point at current scene
		var str="<div class='co-layerList' id='tly-100'>Camera&nbsp;&nbsp;<img width=16 style='vertical-align:-5px' src='img/cameraicon.png'></div><br>";	// Add camera icon/name

		if (sc)																						// If valid
			for (i=0;i<sc.layers.length;++i) {														// For each layer in scene
				o=app.doc.models[app.doc.FindById(sc.layers[i])];									// Point at layer
				if (!o)	continue;																	// Skip bad layer
				str+="<div class='co-layerList' id='tly-"+o.id+"'";									// Layer div
				str+=">"+o.name+"&nbsp;&nbsp;<img width='16' style='vertical-align:-5px' src='img/"+o.type+"icon.png'></div><br>";// Add icon
				}												
		$("#timeLabelDiv").html(str);																// Add to div

		$("[id^=tly-]").on("click", function() {													// SET MODEL
			var id=this.id.substr(4);																// Remove prefix
			app.SetCurModelById(id);																// Set new model
			app.sc.TransformController(id);															// Show controller
			app.topMenuTab=0;																		// Set on layer menu
			app.DrawTopMenu();																		// Draw menu		
			});

	}


}  // TIME CLOSURE