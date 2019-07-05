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

	Update(time, dontScroll)																	// UPDATE TIMELINE
	{
		var i;
		if (time != undefined)	this.curTime=time;													// Set current time
		$("[id^=tly-]").css( {'color':'#000','font-weight':'normal' });								// Reset all
		$("[id^=tbar-]").css( {"background-color":" #ddd" });										// Reset all
		if (app.curModelId == "100") {																// If camera
			$("#tly-100").css({'color':'#009900','font-weight':'bold' });							// Highlight label
			$("#tbar-100").css({"background-color":"#b1d0b0" });									// Bar
			}
		var sc=app.doc.scenes[app.curScene];														// Point at current scene
		if (!sc)	return;																			// Quit if invalid
		for (i=0;i<sc.layers.length;++i) 															// For each layer in scene
			if (app.curModelId == sc.layers[i]) {													// If current
				$("#tly-"+sc.layers[i]).css( {'color':'#009900','font-weight':'bold' });			// Highlight label
				$("#tbar-"+sc.layers[i]).css( { "background-color":"#b1d0b0" });					// Highlight bar
				}
		$("#curTimeBox").val(SecondsToTimecode(this.curTime));										// Update time

		var x=this.TimeToPos(this.curTime);															// Get x pos in timeline
		var x1=$("#timeSliderDiv").scrollLeft();													// Get curreent scrooll pos if not scrolling
		if (!dontScroll) {																			// If scrolling
			x1=Math.max(0,x-$("#timeBarsDiv").width()/2);											// Move to center
			$("#timeSliderDiv").scrollLeft(x1);														// Scroll slider
			$("#timeScaleDiv").scrollLeft(x1);														// Sscale
			$("#timeBarsDiv").scrollLeft(x1);														// Bars
			}
		$("#timeCursorDiv").css({left:(x+152-x1)+"px"}); 											// Position cursor
	}

	DrawBars()																					// DRAW TIMELINE BARS
	{
		var o,i=0,str="";																					
		var h=$("#timeLabelDiv").height()-6;														// Height
		var span=$("#timeBarsDiv").width()/10/this.scale;											// Span size
		var ly=app.doc.scenes[app.curScene].layers;													// Point at layers
		var dur=app.doc.scenes[app.curScene].style.dur;												// Get duration
		var w=dur*span-2;																			// Total width = span * secs
		str+="<div style='float:left;margin-top:6px;pointer-events:none'>";							// Contain tics
		var s="<div style='display:inline-block;background-color:#999;width:1px;height:"+h+"px;top:0;margin-left:"+(span-1)+"px'></div>";	// Position info
		for (i=0;i<dur;++i) 	str+=s																// For each second, add line
		str+="</div><div id='tbar-100' style='width:"+w+"px' class='co-timeBar'></div>";			// Camera bar
		for (i=0;i<ly.length;++i) {																	// For layer
			o=app.doc.models[app.doc.FindById(ly[i])];												// Point at layer
			str+="<div id='tbar-"+o.id+"' style='width:"+w+"px' class='co-timeBar'></div>";			// Add bar
			}

		$("#timeBarsDiv").html(str);																// Add to div
		$("#timeSliderDiv").html("<div style='height:1px;width:"+(w+24)+"px'></div>");				// Add dummy width to slider div
		$("#timeSliderDiv").on("scroll",()=> {														// On scroll
			var x=$("#timeSliderDiv").scrollLeft();													// Get spot in slider
			$("#timeScaleDiv").scrollLeft(x);														// Scroll scale
			$("#timeBarsDiv").scrollLeft(x);														// Bars
			$("#timeCursorDiv").css({left:(this.TimeToPos(this.curTime)+152-x)+"px"}); 				// Position cursor
			});

		var y=$("#timeBarsDiv").position().top;														// Cursor top
		$("#timeCursorDiv").css({top:y+"px",left:"152px",height:(h-26)+"px"}); 						// Position cursor
		$("#timeBarsDiv").on("click", (e)=> {														// SET TIME
			this.Update(this.PosToTime(e.offsetX),true);											// Update without scrolling
			});
		}

	DrawScale()																					// DRAW TIME SCALE
	{
		var i,x=0,str="";																					
		var h="<span style='position:absolute;top:3px;left:";										// Position info
		var span=$("#timeBarsDiv").width()/10/this.scale;											// Segment span
		var dur=app.doc.scenes[app.curScene].style.dur;												// Point at current scene
		
		for (i=0;i<dur;++i) {																		// For each 1-second span
			if (!(i%this.scale)) str+=h+Math.max(0,x-12)+"px'>"+SecondsToTimecode(i).substr(0,5)+"</span>";	// Set position
			x+=span;																				// Next spot
			}
		$("#timeScaleDiv").html(str);																// Add scale to div

		str="<input id='curTimeBox' class='co-num' type='text' style='font-size:11px;margin:0;width:50px;height:10px;color:#666'>"	
		str+="<img id='contractTime' title='Contract timeline' src='img/collapse.png' style='cursor:pointer;margin-left:25px'>";	
		str+="<img id='expandTime' title='Expand timeline' src='img/expand.png' style='cursor:pointer;margin-left:25px'>";	
		$("#timeControlDiv").html(str);																// Add coontrols to div	
		$("#expandTime").on("click", ()=> { this.scale=Math.min(512,this.scale*2); this.Draw() });	// Increase time
		$("#contractTime").on("click", ()=> { this.scale=Math.max(.5,this.scale/2); this.Draw() });	// Decrease time
		$("#curTimeBox").on("change", function() {													// New value
			var now=TimecodeToSeconds(this.value);													// Convert to seconds
			app.tim.Update(isNaN(now)? undefined : now);											// Update time id a real value
			});
		$("#timeScaleDiv").on("click", (e)=> {														// SET TIME
			this.Update(this.PosToTime(e.clientX-154+$("#timeBarsDiv").scrollLeft()),true);			// Update without scrolling
			});
		}

	DrawLabels()																				// DRAW LABELS
	{
		var i,o,str="";
		var sc=app.doc.scenes[app.curScene];														// Point at current scene
		var str="<div class='co-layerList' id='tly-100'>Camera&nbsp;&nbsp;<img height=16 style='vertical-align:-5px' src='img/cameraicon.png'></div><br>";	// Add camera icon/name
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
			Sound("click");																			// Sound
			app.DrawTopMenu();																		// Draw menu		
			});

	}

// HELPERS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	TimeToPos(time)																				// CONVERT TIME TO TMELINE POSITION
	{
		return time*($("#timeBarsDiv").width()/10/this.scale);										// Pos = time / 1-second span width
	}

	PosToTime(pos)																				// CONVERT  TMELINE POSITION TO TIME
	{
		return pos*this.scale/($("#timeBarsDiv").width()/10);										// Time = pos *  
	}



}  // TIME CLOSURE