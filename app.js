///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class App  {																					

	constructor(id)   																			// CONSTRUCTOR
	{
		app=this;
		this.topMenuTab=0;																			// Default layers
		this.gid="1ek9gEvG_lW9bSdKWva0wVY5zcBG3wWVdz8L6R6wOUQI";									// Default spreadsheet
		this.curUndo=0;																				// Current undo index
		this.curState=null;																			// Current state
		this.undos=[];																				// Holds undos
		this.curModelIx=0;																			// Assume no object selected
		this.curModelId=0;																			// Assume no object selected
		this.curModelObj=0;																			// Assume no object selected
		this.curScene=0;																			// Current scene
		this.sc=new Scene("mainDiv");																// Make new scene		
		this.doc=new Doc();																			// Make new doc		
		this.tim=new Time();																		// Make new timeline		
		this.cameraLock=0;																			// Camera lock
		$("#rightDiv,#bottomDiv,#botRightDiv").on("mousedown touchdown touchmove wheel", (e)=> { e.stopPropagation() } );	// Don't move orbiter in menus
		var url=window.location.search.substring(1);						   						// Get query string
		if (url) {
			if (url.match(/gid=/i)) 	this.gid=url.split("&")[0].substr(4);						// If params have a 'gid=' tag, use it
			else						this.gid=url;												// Default spreadsheet
			}
		this.doc.Load(this.gid,(tsv)=> { this.doc.ProjectInit(tsv) });								// Load from Google doc
		this.Draw();																				// Start 
	}

	Draw() 																						// REDRAW
	{
		this.sc.Render();																			// Render scene and animate
		this.DrawTopMenu();																			// Draw top menu
		this.tim.Draw();																			// Draw timeline
	}

	DrawTopMenu(update)																			// DRAW TOP MENU AREA
	{
		if (update)						this.UpdateLayerMenu();										// Update positions			
		else if (this.topMenuTab == 0) 	this.DrawLayerMenu();										// Draw layer menu
		else if (this.topMenuTab == 1) 	this.DrawSceneMenu();										// Scene
		else if (this.topMenuTab == 2) 	this.DrawSettingMenu();										// Settings
	}

	UpdateLayerMenu()																			// UPDATE LAYER MENU 
	{
		var mod=this.curModelObj;																	// Point at model
		if (!mod) return;																			// Quit if no model
		var o=mod.pos;																				// Point at pos
		$("#cm-1").val(o.x.toFixed(0));	  $("#cm-2").val(o.y.toFixed(0));	$("#cm-3").val(o.z.toFixed(0));		// Update pos
		$("#cm-4").val(o.sx.toFixed(2));  $("#cm-5").val(o.sy.toFixed(2));	$("#cm-6").val(o.sz.toFixed(2));	// Scale
		$("#cm-7").val(o.rx.toFixed(2));  $("#cm-8").val(o.ry.toFixed(2));	$("#cm-9").val(o.rz.toFixed(2));	// Rot
		$("#cm-13").val(o.cx.toFixed(0)); $("#cm-14").val(o.cy.toFixed(0)); $("#cm-15").val(o.cz.toFixed(0));	// Center
		$("#cm-16").val(o.a.toFixed(2));  $("#cm-col").val(o.col);									// Alpha/color
		$("#cm-asl").slider("option","value",o.a*100);												// Alpha slider
		$("#cm-ease").prop("selectedIndex",o.ease);													// Ease
		var sc=this.doc.scenes[this.curScene];														// Point at current scene
		for (var i=0;i<sc.layers.length;++i) {														// For each layer in scene
			o=app.doc.models[this.doc.FindById(sc.layers[i])].pos;									// Point at layer's pos
			$("#lv-"+i).prop("src","img/"+(o.vis ? "visible" : "hidden")+".png")					// Hidden indicator
			}
	}

	DrawLayerMenu()																				// DRAW LAYER MENU 
	{
		var i,g;
		var sc=this.doc.scenes[this.curScene];														// Point at current scene
		var str=TabMenu("topTabMenu",["Layers","Scenes", "Settings"],this.topMenuTab);				// Add tab menu
		var mod=this.curModelObj;																	// Point at model
		if (!mod)	return;																			// Invalid
		var o=mod.pos;																				// Point at pos
		str+="<table style='text-align:center;margin:4px'><tr><td></td><td>x</td><td>y</td><td>z&nbsp;&nbsp;&nbsp;</td></tr>";	// Header
		str+="<tr><td style='text-align:left'>Position&nbsp;</td><td>"+MakeNum(1,o.x,0,o.pl)+"</td><td>"+MakeNum(2,o.y,0,o.pl)+"</td><td>"+MakeNum(3,o.z,0,o.pl);
		str+="&nbsp;<img id='loc-pl' style='cursor:pointer' src='img/"+(o.pl ? "" :"un")+"lock.png'</td></tr>"
		if (this.curModelIx) {																		// If not the camera
			str+="<tr><td style='text-align:left'>Size</td><td>"+MakeNum(4,o.sx,2,o.sl)+"</td><td>"+MakeNum(5,o.sy,2,o.sl)+"</td><td>"+MakeNum(6,o.sz,2,o.sl);
			str+="&nbsp;<img id='loc-sl' style='cursor:pointer' src='img/"+(o.sl ? "" :"un")+"lock.png'</td></tr>"
			str+="<tr><td style='text-align:left'>Center</td><td>"+MakeNum(13,o.cx,0,o.cl)+"</td><td>"+MakeNum(14,o.cy,0,o.cl)+"</td><td>"+MakeNum(15,o.cz,0,o.cl);
			str+="&nbsp;<img id='loc-cl' style='cursor:pointer' src='img/"+(o.cl ? "" :"un")+"lock.png'</td></tr>"
			str+="<tr><td style='text-align:left'>Rotation&nbsp;</td><td>"+MakeNum(7,o.rx,2,o.rl)+"</td><td>"+MakeNum(8,o.ry,2,o.rl)+"</td><td>"+MakeNum(9,o.rz,2,o.rl);
			str+="&nbsp;<img id='loc-rl' style='cursor:pointer' src='img/"+(o.rl ? "" :"un")+"lock.png'</td></tr>"
			str+="<tr><td style='text-align:left'>Opacity</td><td>"+MakeNum(16,o.a,2,o.al)+"</td><td colspan='2' style='text-align:left'><div style='width:100px;display:inline-block;margin:0 16px' id='cm-asl'></div>";
			str+="<img id='loc-al' style='cursor:pointer' src='img/"+(o.al ? "" :"un")+"lock.png'</td></tr>";
			str+="<tr><td style='text-align:left'>Color</td><td colspan='3' style='text-align:left'><input style='width:80px;margin-right:11px' id='cm-col' value='"+o.col+"' type='text' class='co-num'>";
			str+="Eases&nbsp;"+MakeSelect("cm-ease",false,["None", "In", "Out", "Both"],o.ease,null,[0,1,2,3])+"</td></tr>";
			str+="<tr><td style='text-align:left'>Name</td><td colspan='3' style='text-align:left'><input style='width:186px;' id='cm-name' value='"+mod.name+"' type='text' class='co-is'></td></tr>";
			str+="<tr><td style='text-align:left'>Controls</td><td colspan='3'style='text-align:left'>"+OptionBar("transformBar",["Move","Size","Rotate"])+"</td></tr>";
			}
		else{
			str+="<tr><td style='text-align:left'>Opacity&nbsp;</td><td>"+MakeNum(16,o.a,2,o.al);
			str+="<td colspan='2'>Eases&nbsp;&nbsp;"+MakeSelect("cm-ease",false,["None", "In", "Out", "Both"],o.ease,null,[0,1,2,3])+"</td></td></tr>";
			str+="<tr><td style='text-align:left'>Name</td><td colspan='3'><input style='width:200px' id='cm-name' value='Scene' type='text' class='co-is'></td></tr>";
			}
		str+="</table></div>";																		// End table
		if (!this.curModelIx)	str+="<div style='color:#999;margin:14px'><i>Double-click on an object on the screen to select a layer to edit, or choose it from the list below.<br><br>Scroll thumb wheel to zoom in/out. Hold Control key to dolly camera.</i></div>";	// Show msg
		str+="<div class='co-menuHeader'>Layers for scene <b><i>"+sc.name+"</b></i></div>";			// Header
		str+="<div style='max-height:50hv;margin:8px'>";
		str+="<div class='co-layerList' id='ly-100'"+(this.curModelId == "100" ? " style='color:#009900;font-weight:bold' " : "");
		str+="><img width=16 style='vertical-align:-5px' src='img/cameraicon.png'>&nbsp;&nbsp;Camera</div><span style='float:right;color:#666'>"+(mod.type == "group" ? "In group?" : "Hide")+"</span><br>";	// Add camera icon/name
		for (i=0;i<sc.layers.length;++i) {															// For each layer in scene
			o=app.doc.models[this.doc.FindById(sc.layers[i])];										// Point at layer
			if (!o)	continue;																		// Skip bad layer
			str+="<div class='co-layerList' id='ly-"+o.id+"'";										// Layer div
			str+=this.curModelId == sc.layers[i] ? " style='color:#009900;font-weight:bold' " : "";	// Highlight current
			str+="><img width='16' style='vertical-align:-5px' src='img/"+o.type+"icon.png'>&nbsp;&nbsp;";// Add icon
			if (mod.type == "group") {																// If a group
				str+=o.name+"</div>";																// Add name
				g="img/"+(mod.style.layers.includes(o.id) ? "checked" : "unchecked")+".png";;		// Set incude icon
				if (o.type != "group")	str+="<span id='lg-"+(o.id)+"' style='float:right;color:#888;margin-right:4px;cursor:pointer;font-size:16px'><img width='16' style='vertical-align:-5px' src='"+g+"'></span>"; // Add grouping icon
				str+="<br>"	
				}
			else
				str+=o.name+"</div><img width='12' id='lv-"+(i+1)+"' style='float:right;margin-right:4px;cursor:pointer' src='img/"+(o.pos.vis ? "visible" : "hidden")+".png'><br>"; // Add visibility icon
			}												
		str+="<br><hr>";
		str+="<img style='float:right;cursor:pointer;margin-top:4px' src='img/helpicon.gif' onclick='ShowHelp()'>";	// Help 
		str+=OptionBar("viewAngleBar",["Top","Left","Front","Back","Right"],"View&nbsp;&nbsp;&nbsp;");
		if (this.curModelIx)	str+="<div style='color:#999;margin:16px;'><i>Esc to cancel changes<br>Ctrl to lock to grid<br>+ or - to scale controls<br>M, S, or R to set axis</i></div>";	// Show msg
		$("#rightDiv").html(str);																	// Add to div
		
		$("#cm-asl").slider({ 	value:mod.pos.a*100, 												// Alpha slider
			start: function() { app.Do() },															// On start save undo
			slide: function(e,ui) {																	// On slide				
				mod.pos.a=ui.value/100;																// Set value
				$("#cm-16").val(mod.pos.a);															// Set input					
				app.tim.SetKeyPos(mod.id,mod.pos);													// Set pos key					
				app.sc.MoveObject(mod.id,mod.pos);													// Show effect
				app.SaveState();																	// Save current state for redo
				}
			});
		$("#cm-asl").slider(mod.pos.al ? "disable" : "enable");										// Disable status

		$("[id^=ly-]").on("click", function() {														// SET MODEL
			var id=this.id.substr(3);																// Remove prefix
			app.SetCurModelById(id);																// Set new model
			app.sc.TransformController(id);															// Shoe controller
			app.DrawTopMenu();																		// Draw menu		
			});

		$("[id^=lg-]").on("click", function() {														// SET GROUP INCLUSIONS
			app.Do();																				// Save undo
			var id=this.id.substr(3);																// Remove prefix from id
			var o=app.curModelObj.style.layers;														// Point at group members
			for (i=0;i<o.length;++i)	if (o[i] == id)	o.splice(i,1);   							// If in, remove it
			if (i == o.length)			o.push(id);													// Otherwise, add it
			app.sc.SetGroupMembers(app.curModelId,o);												// Reset members
			app.SaveState();																		// Save current state for redo
			app.DrawTopMenu();																		// Draw menu		
			});

		$("[id^=lv-]").on("click", function() {														// SET VISIBILITY
			var id=this.id.substr(3)-1;																// Remove prefix
			var mod=app.doc.models[app.doc.FindById(sc.layers[id])];								// Point at layer
			mod.pos.vis=1-mod.pos.vis;																// Toggle state
			$(this).prop("src","img/"+(mod.pos.vis ? "visible" : "hidden")+".png");					// Hide/show
			app.sc.MoveObject(mod.id, mod.pos)														// Move model
			});

		$("[id^=topTabMenu-]").on("click", function() {												// CHANGE TAB
			app.topMenuTab=this.id.substr(11);														// Extract tab number
			app.DrawTopMenu();																		// Draw menu		
			});
	
		$("[id^=loc-]").on("click", function() {													// SET LOCK
			app.Do();																				// Save undo
			var id=this.id.substr(4);																// Remove prefix
			mod.pos[id]=1-mod.pos[id];																// Toggle
			app.DrawTopMenu();																		// Redraw
			Sound("click");																			// Click
			app.sc.transformControl.detach();														// Detach from control
			app.SaveState();																		// Save current state for redo
		});

		$("[id^=cm-]").on("change", function() {													// CHANGE FACTOR
			if (id != 16) app.Do();																	// Save undo
			var id=this.id.substr(3);																// Remove prefix
			var mod=app.curModelObj;																// Point at model
			if (id == "name") 		{ mod.name=this.value;	app.tim.Draw() }						// Name
			else if (id == "col") 	mod.pos.col=this.value;											// Color
			else if (id == "ease") 	mod.pos.ease=this.value;										// Ease
			else if (!isNaN(this.value)) {															// A number
				var val=this.value-0;																// Force number
				if (id == 1)		mod.pos.x=val;													// Pos X
				else if (id == 2)	mod.pos.y=val;													// Y
				else if (id == 3)	mod.pos.z=val;													// Z
				else if (id == 7)	mod.pos.rx=val;													// Rotate X in degrees
				else if (id == 8)	mod.pos.ry=val;													// Y
				else if (id == 9)	mod.pos.rz=val;													// Z
				else if (id == 4)	{ if (val)	mod.pos.sx=val; }									// Scale X and avoid 0
				else if (id == 5)	{ if (val)	mod.pos.sy=val; }									// Y
				else if (id == 6)	{ if (val)	mod.pos.sz=val; }									// Z
				else if (id == 13)	mod.pos.cx=val;													// Center X
				else if (id == 14)	mod.pos.cy=val;													// Y
				else if (id == 15)	mod.pos.cz=val;													// Z
				else if (id == 16)	mod.pos.a=val;													// Alpha
				$("#cm-asl").slider("option","value",mod.pos.a*100);								// Set slider
				}
			if (mod) 	app.tim.SetKeyPos(mod.id,mod.pos)											// Set pos key															
			app.SaveState();																		// Save current state for redo
		});
		
		OptionBarEvents("transformBar","radio",(id)=> {												// Menu handler
			if (id == 0)		app.sc.transformControl.setMode("translate");						// Move
			else if (id == 1)	app.sc.transformControl.setMode("scale");							// Size
			else if (id == 2)	app.sc.transformControl.setMode("rotate");							// Rotate		
			},0);

		OptionBarEvents("viewAngleBar","flash",(id)=> {												// Menu handler
			if (id == 0)		app.sc.SetCamera(0,500,0);											// Top
			else if (id == 1)	app.sc.SetCamera(-500,0,0);											// Left
			else if (id == 2)	app.sc.SetCamera(0,0,500);											// Front
			else if (id == 3)	app.sc.SetCamera(0,0,-500);											// Back		
			else if (id == 4)	app.sc.SetCamera(500,0,0);											// Right	
			});
		
		function MakeNum(id, num, places, lock) {													// Make number box
			num=num.toFixed(places);																// Convert
			return "<input id='cm-"+id+"'value='"+num+"'"+(lock ? " disabled ": "")+"type='text' class='co-num'>";	// Return input				
			}
	}

	DrawSceneMenu()																				// DRAW SCENE MENU 
	{
		var i,g,o;
		var sc=app.doc.scenes[app.curScene];														// Point at current scene
		var str=TabMenu("topTabMenu",["Layers","Scenes", "Settings"],this.topMenuTab);				// Add tab menu
		str+="<table style='margin:8px 8px'>";														// End scene 
		str+="<tr><td>Name</td><td><input style='width:160px' id='cm-name' value='"+sc.name+"' type='text' class='co-is'></td></tr>";
		str+="<tr><td>Background&nbsp;</td><td><input style='width:160px' id='cm-back' value='"+(sc.style.back ? sc.style.back : "")+"' type='text' class='co-is'></td></tr>";
		str+="<tr><td>Seconds</td><td><input id='cm-dur' value='"+(sc.style.dur ? sc.style.dur : "0")+"' type='text' class='co-num'></td></tr>";
		str+="</table><div class='co-menuHeader'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Active scenes";// Header
		str+="<img id='delsc' style='float:right;cursor:pointer;margin:-2px 4px' src='img/trashbut.gif'>";
		str+="<img id='addsc' style='float:right;cursor:pointer;width:12px;margin-top:1px' src='img/addbut.gif'></div>";
		str+="<ol id='cmscene' style='width:100%,max-height:50hv'>";								// Scene container
		for (i=0;i<app.doc.scenes.length;++i)														// For each scene 	
			str+="<li id='sc-"+i+"'>"+app.doc.scenes[i].name+"</li>";								// Add to div
		str+="</ol></table>";
		str+="<div class='co-menuHeader'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Scene layers";	// Header
		str+="<img id='delly' style='float:right;cursor:pointer;margin:-2px 4px' src='img/trashbut.gif'>";
		str+="<img id='addly' style='float:right;cursor:pointer;width:12px;margin-top:1px' src='img/addbut.gif'></div>";
		for (i=1;i<this.doc.models.length;++i) {													// For each model
			o=app.doc.models[i];																	// Point at model
			if (!o)	continue;																		// Skip bad 
			str+="<div class='co-layerList' id='sl-"+o.id+"'";										// Model div
			str+=this.curModelId == o.id ? " style='color:#009900;font-weight:bold' " : "";			// Highlight current
			str+=">&nbsp;&nbsp;<img width='16' style='vertical-align:-5px' src='img/"+o.type+"icon.png'>&nbsp;&nbsp;";// Add icon
			str+=o.name;																			// Add name
			g="img/"+(sc.layers.includes(o.id) ? "checked" : "unchecked")+".png";;					// Set incude icon
			str+="</div><span id='lg-"+(o.id)+"' style='float:right;color:#888;margin-right:4px;cursor:pointer;font-size:16px'><img width='16' style='vertical-align:-5px' src='"+g+"'></span><br>"; // Add grouping icon
			}												
		str+="<hr><div style='color:#999;margin:16px'><i>Choose a scene by clicking on it.<br>To add a scene, click on the add scene button.<br>Drag Scenes to re-arrange them.</i></div>";	// Show msg
		str+="<img style='float:right;cursor:pointer;margin-top:4px' src='img/helpicon.gif' onclick='ShowHelp()'>";	// Help 
		$("#rightDiv").html(str);																	// Add to div
	
		$("#cmscene").sortable({ delay:150,															// Sortable
				stop:()=>{																			// On stop dragging
					var s=[];																	
					$("li").each(function() { s.push(app.doc.scenes[this.id.substr(3)]) }); 		// For each scene, add to new array
					this.doc.scenes=s;																// Replace scene array	
					Sound("ding");																	// Ding
				}	});	
		$("#sc-"+app.curScene).css({"color":"#009900","font-weight":"bold"});						// Highlight current scene
		
		$("[id^=cm-]").on("change", function() {													// Set factor
			app.Do();																				// Save undo
			var id=this.id.substr(3);																// Remove prefix
			var o=app.doc.scenes[app.curScene];														// Point at current scene
			if (id == "name") 		o.name=this.value;												// Name
			else if (id == "back") 	o.style.back=this.value;										// Background
			else if (id == "dur") 	o.style.dur=this.value;											// Duration
			app.SaveState();																		// Save current state for redo
			app.Draw();																				// Redraw menu		
			});

		$("[id^=sl-]").on("click", function() {														// SET MODEL
			var id=this.id.substr(3);																// Remove prefix
			app.SetCurModelById(id);																// Set new model
			app.DrawTopMenu();																		// Draw menu		
			});

		$("#delly").on("click", function() {														// REMOVE LAYER
			ConfirmBox("Are you sure?","This will delete the model named: <b>"+app.curModelObj.name+"</b>",()=>{	// If sure
				app.Do();																			// Save undo
				app.doc.models.splice(app.curModelIx,1);											// Remove it
				app.sc.DeleteObject(app.curModelId);												// Remove from scene
				Sound("delete");																	// Sound
				app.SetCurModelById();																// Nothing selected
				app.SaveState();																	// Save current state for redo
				app.Draw();																			// Draw menu		
				});
			});

		$("#addly").on("click", function() {														// ADD LAYER
			var str="<table><tr><td>Type</td><td>"+MakeSelect("ayt",false,["Model", "Panel", "Space", "iFrame"])+"</td></tr>";
			str+="<tr><td>Name</td><td><input style='width:200px' id='ayn' type='text' class='co-is'></td></tr>"
			str+="<tr><td>Source</td><td><input style='width:200px' id='ays' type='text' class='co-is'></td></tr>"
			str+="</table>";
			app.Do();																				// Save undo
			DialogBox("Add new layer", str, 400, ()=> { 								
				Sound("ding");																		// Ding
				var style={ src:$("#ays").val() };													// Set style
				app.doc.Add($("#ayn").val(), $("#ayt").val().toLowerCase(), style, app.doc.InitPos(), app.doc.MakeUniqueID());	// Add New layer
				app.Draw();																			// Draw menu		
				app.SaveState();																	// Save current state for redo
				});
			});
	
		$("[id^=lg-]").on("click", function() {														// SET LAYER INCLUSION
			app.Do();																				// Save undo
			var id=this.id.substr(3);																// Remove prefix from id
			var o=app.doc.scenes[app.curScene].layers;												// Point scene's layers
			for (i=0;i<o.length;++i)	if (o[i] == id)	o=o.splice(i,1);   							// If in, remove it
			if (i == o.length)			o.push(id);													// Otherwise, add it
			app.doc.InitScene(app.curScene);														// Init scene after change
			app.SaveState();																		// Save current state for redo
			app.Draw();																				// Draw menu		
			});
	
		$("#addsc").on("click", function() {														// ADD NEW SCENE
			app.Do();																				// Save undo
			var sty={};		sty.dur=60;		sty.layers=[];											// Set  layers and dur
			app.doc.AddScene("Rename", sty, [], app.doc.MakeUniqueID(app.doc.scenes));				// Add new scene
			app.SaveState();																		// Save current state for redo
			app.Draw();																				// Draw menu		
			});

		$("#delsc").on("click", function() {														// REMOVE SCENE
			ConfirmBox("Are you sure?","This will delete the scene named: <b>"+app.doc.scenes[app.curScene].name+"</b>",()=>{	// If sure
				app.Do();																			// Save undo
				app.doc.scenes.splice(app.curScene,1);												// Remove it
				Sound("delete");																	// Sound
				app.SaveState();																	// Save current state for redo
				app.Draw();																			// Draw menu		
				});
			});
		
		$("[id^=sc-]").on("click", function() {														// EDIT SCENE FIELD
			app.curScene=this.id.substr(3);															// Extract scene number
			app.doc.InitScene(app.curScene);														// Init scene
			app.Draw();																				// Redraw app		
			Sound("click");																			// Click
			});
				
		$("[id^=topTabMenu-]").on("click", function() {												// CHANGE TAB
			app.topMenuTab=this.id.substr(11);														// Extract tab number
			app.DrawTopMenu();																		// Redraw menu		
		});
	}
	
	DrawSettingMenu()																			// DRAW SETTING MENU 
	{
		var str=TabMenu("topTabMenu",["Layers","Scenes", "Settings"],this.topMenuTab);				// Add tab menu
		$("#rightDiv").html(str);																	// Add to div

		$("[id^=topTabMenu-]").on("click", function() {												// Change tab
			app.topMenuTab=this.id.substr(11);														// Extract tab number
			app.DrawTopMenu();																		// Draw menu		
			});
	}

	SetCurModelById(id)																			// SET MODEL POINTERS
	{
		if (!id)	id=100;																			// Assume camera	
		app.curModelIx=app.doc.FindById(id);														// Set index
		app.curModelId=id;																			// Id
		app.curModelObj=app.doc.models[app.curModelIx];												// Point at model
	}

// UNDO  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Do()																						// SAVE DO ACTION
	{
		var o={models:[], scenes:[] };																// Composite object
		o.models=JSON.parse(JSON.stringify(app.doc.models));										// Clone models 
		o.scenes=JSON.parse(JSON.stringify(app.doc.scenes));										// Clone scenes 
		this.undos[this.curUndo]=o;																	// Add to undos
		this.curUndo++;																				// Advance index
		for (i=0;i<this.undos.length-this.curUndo;++i)	this.undos.pop();							// Remove ones beyond this point		
	}

	SaveState()																					// SAVE CURRENT STATE
	{
		var o={models:[], scenes:[] };																// Composite object
		o.models=JSON.parse(JSON.stringify(app.doc.models));										// Clone models 
		o.scenes=JSON.parse(JSON.stringify(app.doc.scenes));										// Clone scenes 
		this.curState=o;																			// Save current state for redo
		}

	Undo()																						// UNDO SAVED ACTION
	{
		if (!this.curUndo) return false;															// No undos to un-do
		var o={models:[], scenes:[] };																// Composite object
		o.models=JSON.parse(JSON.stringify(app.doc.models));										// Clone models 
		o.scenes=JSON.parse(JSON.stringify(app.doc.scenes));										// Clone scenes 
		this.curUndo--;																				// Dec index
		o=this.undos[this.curUndo];																	// Point at saved state
		app.doc.models=JSON.parse(JSON.stringify(o.models));										// Restore models and dec index 
		app.doc.scenes=JSON.parse(JSON.stringify(o.scenes));										// Restore scenes 
		this.Draw();																				// Redraw
		return true;
	}

	Redo()																						// REDO UNDO ACTION
	{
		var o;
		if (this.curUndo >= this.undos.length) 		return false;									// No redos to re-do
		if (this.curUndo == this.undos.length-1)	o=this.curState;								// If on last one, redo is current state
		else										o=this.undos[this.curUndo+1];					// Point at saved state and advance index
		this.curUndo++;																				// Incc index
		app.doc.models=JSON.parse(JSON.stringify(o.models));										// Restore models and dec index 
		app.doc.scenes=JSON.parse(JSON.stringify(o.scenes));										// Restore scenes 
		this.Draw();																				// Redraw
		return true;
	}


} // App class closure
