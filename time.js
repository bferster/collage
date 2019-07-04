///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TIMELINE CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Time {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.tim=this;																				// Set name
		this.curTime=0;																				// Current time
		this.scale=1;																				// Timeline scaling factor
		this.Init();																				// Init
	}

	Init()																						// INIT DOC
	{
	}

	Draw()																						// DRAW
	{
		if (!app.doc.scenes[app.curScene]) return;													// Must be a valid scene
		this.DrawLabels();																			// Draw labels
		this.DrawScale();																			// Draw time scale
		this.DrawBars();																			// Draw layer bars
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
		this.DrawScale();																			// Show time/scale
		}

	DrawBars()																					// DRAW TIMELINE BARS
	{
		var i,str="";																					
		var x=$("#timeBarsDiv").position().left;
		var y=$("#timeBarsDiv").position().top;
		var h=$("#timeBarsDiv").height();;
		var span=$("#timeBarsDiv").width()/10*this.scale;
		var dur=app.doc.scenes[app.curScene].style.dur;												// Get duration
	
		
		var s="<div style='background-color:#999;display:inline-block;width:1px;height:"+h+"px;margin-left:"+span+"px'></div>";	// Position info
		for (i=0;i<dur*this.scale;++i) 	str+=s;														// For each time unit, add line
		$("#timeBarsDiv").html(str);																// Add to div
		}

	DrawScale()																					// DRAW TIME SCALE
	{
		var i,x=0;																					
		
		var h="<span style='position:absolute;top:3px;left:";										// Position info
		var span=$("#timeBarsDiv").width()/10*this.scale;
		var str=h+"-50px'>Current time: "+SecondsToTimecode(this.curTime)+"</span>";				// Current time
		str=""
		var dur=app.doc.scenes[app.curScene].style.dur;												// Point at current scene
		for (i=0;i<dur*this.scale;++i) {															// For each time unit
			str+=h+Math.max(0,x-12)+"px'>"+SecondsToTimecode(i)+"</span>";							// Set position
			x+=span;
		}
		$("#timeScaleDiv").html(str);																// Add to div
//		$("#timeScaleDiv").scrollLeft(500)
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