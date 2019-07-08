///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TIMELINE CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Time {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.tim=this;																				// Set name
		this.curTime=0;																				// Current time
		this.curKey="";																				// Current key
		this.curEase=2;																				// Both
		this.scale=1;																				// Timeline scaling factor
	}

	Draw()																						// DRAW
	{
		if (!app.doc.scenes[app.curScene]) return;													// Must be a valid scene
		this.DrawScale();																			// Draw time scale
		this.DrawLabels();																			// Draw labels
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
		$("#timeCursorDiv").css({left:(x+141-x1)+"px"}); 											// Position cursor
	}

	DrawBars()																					// DRAW TIMELINE BARS
	{
		var o,i=0,y=10,str="";																					
		var _this=this;																				// Save context
		var h=$("#timeLabelDiv").height()+13;														// Height
		var span=$("#timeBarsDiv").width()/10/this.scale;											// Span size
		var ly=app.doc.scenes[app.curScene].layers;													// Point at layers
		var dur=app.doc.scenes[app.curScene].style.dur;												// Get duration
		var w=dur*span-2;																			// Total width = span * secs
		var s="<div style='display:inline-block;background-color:#999;width:1px;height:"+h+"px;margin-left:"+(span-1)+"px'></div>";	// Position info
		for (i=0;i<dur;++i) str+=s																	// For each second, add tick line
		str+="<div id='tbar-100' style='width:"+w+"px;top:"+y+"px' class='co-timeBar'>";			// Add camera bar
		str+=this.DrawKeys("100")+"</div>";															// Add keys and close div
		for (i=0;i<ly.length;++i) {																	// For layer
			y+=20;																					// Move down
			o=app.doc.models[app.doc.FindById(ly[i])];												// Point at layer
			str+="<div id='tbar-"+o.id+"' style='width:"+w+"px;top:"+y+"px' class='co-timeBar'>";	// Add layer bar
			str+=this.DrawKeys(o.id)+"</div>";														// Add keys
			}

		$("#timeBarsDiv").html(str);																// Add to div
		$("#timeSliderDiv").html("<div style='height:1px;width:"+(w+24)+"px'></div>");				// Add dummy width to slider div
		$("#timeSliderDiv").on("scroll",()=> {														// On scroll
			var x=$("#timeSliderDiv").scrollLeft();													// Get spot in slider
			$("#timeScaleDiv").scrollLeft(x);														// Scroll scale
			$("#timeBarsDiv").scrollLeft(x);														// Bars
			$("#timeCursorDiv").css({left:(this.TimeToPos(this.curTime)+144-x)+"px"}); 				// Position cursor
			});

		$("#timeBarsDiv").on("mousemove", (e)=>{													// SCRUB TIMELINE
			if (e.which == 1)																		// If button presssed
				_this.Update(_this.PosToTime(e.clientX-152+$("#timeBarsDiv").scrollLeft()),true);	// Go there
			});

		$("#timeCursorDiv").css({height:(h+8)+"px"}); 												// Size cursor
		$("#timeBarsDiv").on("click", (e)=> {														// SET TIME
			this.SetKey();																			// Clear current key
			this.Update(this.PosToTime(e.offsetX),true);											// Update without scrolling
			});
		
		$("[id^=tky-]").on("click", function() {													// GO TO KEY
			var keys=app.doc.scenes[app.curScene].keys;												// Point at current scene's keys
			for (var i=0;i<keys.length;++i) 														// For each key in scene
				if (keys[i].id == _this.curKey) {													// A match
					_this.curTime=keys[i].time;														// Set key's time
					break;																			// Quit looking
					}																
			_this.SetKey(this.id);																	// Highlight it
			Sound("click");																			// Acknowledge
			return false;																			// Dont propagate
			});
		
		$("[id^=tky-]").draggable({	axis:"x", containment:"parent",									// DRAGGABLE
			cursor:"ew-resize", cursorAt:{left:6},
			start:(e)=> { _this.SetKey(e.target.id) },												// On start
			stop: (e)=> {  																			// On stop
				_this.SetKey(e.target.id);															// Highlight it
				var i=this.FindKey(e.target.id.substr(4),app.curScene);								// Get key index
				var keys=app.doc.scenes[app.curScene].keys;											// Point at keys
				if ((i != -1) && (keys[i].time!= -1))												// A movable key
					keys[i].time=_this.curTime;														// Set key's time
				var x=Math.max(0,Math.round(this.TimeToPos(keys[i].time)-6));						// Get pos from key time
				$("#"+e.target.id).css({top:0,left:x});												// Force to top
				}
			});													
		}

	DrawKeys(layerId)																			// DRAW KEYS
	{
		var i,o,x,str="";		
		var sc=app.doc.scenes[app.curScene];														// Point at current scene
		for (i=0;i<sc.keys.length;++i) {															// For each key in scene			
			o=sc.keys[i];																			// Point at key
			if (layerId != o.id.split("K")[0])	continue;											// Not in this layer
			x=Math.max(0,Math.round(this.TimeToPos(o.time)-6));										// Get pos from key time
			str+="<div id='tky-"+layerId+"K"+i+"' class='co-timeKey' style='left:"+x+"px'><b>&bull;</b></div>";	// Add key dot 
		}
		return str;																					// Return keys
	}	

	AddKey(sceneNum, modelId, pos, time)														// ADD A NEW KEY
	{
		var sc=app.doc.scenes[sceneNum];															// Point at current scene
		var id=modelId+"K"+sc.keys.length;															// Make up id	
		var o={ time:time.toFixed(2), ease:this.curEase, pos:pos, id:id };							// Make key 
		sc.keys.push(o);																			// Add to list
		this.SortKeys(app.curScene)
		app.Draw();
	}

	DeleteKey(id)																				// DELETE KEY
	{
		var i=this.FindKey(id,app.curScene);														// Get key index
		var keys=app.doc.scenes[app.curScene].keys;													// Point at keys
		if ((i == -1) || (keys[i].time == -1))	return;												// Not found
		app.doc.scenes[app.curScene].keys.splice(i,1);												// Remove it
		Sound("delete");																			// Acknowledge
		app.Draw();																					// Redraw
	}

	FindKey(id, sceneNum)																		// FIND KEY BY ID
	{
		var i;
		var keys=app.doc.scenes[sceneNum].keys;														// Point at current scene's keys
		for (i=0;i<keys.length;++i) 																// For each key in scene
			if (keys[i].id == id) 																	// A match
				return i																			// Return index
		return -1;																					// Not
		}


	SortKeys(scene)																				// SORT KEYS BY TIME
	{
		var i;
		var sc=app.doc.scenes[scene];																// Point at scene
		sc.keys.sort((a,b)=> (a.time > b.time) ? 1 : -1);											// Sort by time
		for (i=0;i<sc.keys.length;++i)																// For each key
			sc.keys[i].id=sc.keys[i].id.split("K")[0]+"K"+i;										// Set id in order
	}

	SetKey(id)																					// SET AS CURRENT KEY 
	{
		this.curKey="";																				// Clear key
		$("[id^=tky-]").css({"background-color":"#999"});											// Reset all
		if (!id)	return;																			// Just clearing them
		this.curKey=id.substr(4);																	// Set id w/o prefix
		$("#"+id).css({"background-color":"#990000"});												// Highlight
		app.SetCurModelById(id[0]);																	// Set new model
		this.Update(this.curTime,true);																// Update without scrolling
		app.DrawTopMenu();																			// Set menu
	}

	DrawScale()																					// DRAW TIME SCALE
	{
		var i,x=0,str="";																					
		var h="<span style='position:absolute;top:3px;left:";										// Position info
		var span=$("#timeBarsDiv").width()/10/this.scale;											// Segment span
		var dur=app.doc.scenes[app.curScene].style.dur;												// Point at current scene
		
		for (i=0;i<dur;++i) {																		// For each 1-second span
			if (!(i%this.scale)) str+=h+Math.max(0,x-14)+"px'>"+SecondsToTimecode(i).substr(0,5)+"</span>";	// Set position
			x+=span;																				// Next spot
			}
		$("#timeScaleDiv").html(str);																// Add scale to div

		str="<input id='curTimeBox' class='co-num' type='text' style='font-size:11px;margin:0;width:50px;height:10px;color:#666'>"	
		str+="<img id='contractTime' title='Contract timeline' src='img/collapse.png' style='cursor:pointer;margin-left:25px'>";	
		str+="<img id='expandTime' title='Expand timeline' src='img/expand.png' style='cursor:pointer;margin-left:25px'>";	
		$("#timeControlDiv").html(str);																// Add controls to div	
	
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
		var _this=this;																				// Save context
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
			_this.SetKey();																			// Clear current key
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