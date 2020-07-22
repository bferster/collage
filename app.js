///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class App  {																					

	constructor(id)   																			// CONSTRUCTOR
	{
		app=this;
		this.topMenuTab=0;																			// Default layers
		this.curUndo=0;																				// Current undo index
		this.curState=null;																			// Current state
		this.undos=[];																				// Holds undos
		this.sc=new Scene("threeDiv");																// Make 3D div		
		this.doc=new Doc();																			// Make new doc		
		this.menuOps=["Side","Settings"];															// Menu options
		this.scale=1;																				// Plan scaling
		this.curSide="Front";																		// Current side
		this.len=30;	this.hgt=7;		this.wid=10;												// Default sizes
		this.clen=6;	this.chgt=4;	this.cwid=8;												// Cupula sizes				

		this.doc.ProjectInit();																		// Init project
		this.Draw();																				// Start 
	
		$("#planBase").draggable();																	// Make draggable
		$("#rightDiv,#sizerDiv,#planDiv,#botRightDiv").on("mousedown touchdown touchmove wheel", (e)=> { e.stopPropagation() } );	// Don't move orbiter in menus
		
		$("#planZoomIn").on("click", ()=>{															// On zoom in	
			Sound("click");																			// Click 
			this.scale=Math.min(this.scale+.25,4)													// Scale up to 4
			this.DrawSide();																		// Draw side
			});
		$("#planZoomOut").on("click", ()=>{															// On soom in	
			Sound("click");																			// Click 
			this.scale=Math.max(this.scale-.25,.25);												// Scale to .25
			this.DrawSide();																		// Draw side
			});
		$("#planDiv").on("wheel", (e)=>{															// On scroll wheel
			if (e.originalEvent.deltaY < 0)	$("#planZoomIn").trigger("click");						// Zoom in
			else							$("#planZoomOut").trigger("click");						// Zoom out
			});
	}

	Draw() 																						// REDRAW
	{
		this.DrawTopMenu(0);																		// Draw top menu
		this.DrawSide(true);																		// Draw side
		this.sc.Render();																			// Render scene and animate
	}

	DrawSide(init)
	{
		let wx=$("#planDiv").width();				let wy=$("#planDiv").height();					// Div width
		let ppf=(wx*.75*this.scale)/this.len;														// Pixels per foot
		let w=this.len;								let h=this.hgt;									// Get dimensions
		if (this.curSide == "Roof")					h=this.wid;										// If top
		else if (this.curSide == "Floor")			h=this.wid;										// If bottom
		else if (this.curSide == "Head")			w=this.wid;										// Head
		else if (this.curSide == "Tail")			w=this.wid;										// Tail
		else if (this.curSide == "Cupula floor")	h=this.cwid,w=this.clen;						// If cupula bottom
		else if (this.curSide == "Cupula front")	h=this.chgt,w=this.clen;						// If cupula front
		else if (this.curSide == "Cupula back")		h=this.chgt,w=this.clen;						// If cupula back
		else if (this.curSide == "Cupula head")		h=this.chgt,w=this.cwid;						// If cupula head
		else if (this.curSide == "Cupula tail")		h=this.chgt,w=this.cwid;						// If cupula tail
		w=w*ppf;									h=h*ppf;										// Scale to draw it

		let str=`<div id='planSide' style='width:${w}px;height:${h}px;background-color:#fff;border:2px solid #000'/>`;	// Make div
		$("#planBase").html(str);																	// Add to plan
		if (init) $("#planBase").css({ "left":(wx-w)/2+"px", top: (wy-h)/2});						// Center if initting
	}

	DrawTopMenu(num)																				// DRAW TOP MENU AREA
	{
		this.topMenuTab=num;																		// Set tab number
		if (this.topMenuTab == 0) 		this.DrawSidesMenu();										// Draw layer menu
		else if (this.topMenuTab == 1) 	this.DrawSettingMenu();										// Settings
//		else if (this.topMenuTab == 2) 	this.DrawEstimateMenu();									// Settings
	}

	DrawSidesMenu()																				// DRAW LAYER MENU 
	{
		var str=TabMenu("topTabMenu",this.menuOps,this.topMenuTab);									// Add tab menu
		str+="<br><br><table>"
		str+="<tr><td>Choose side to edit &nbsp;</td><td>"+MakeSelect("sidePicker",false,["Front","Back","Head","Tail","Roof","Floor","Cupula front", "Cupula back", "Cupula head", "Cupula tail", "Cupula floor"],this.curSide)+"</td></tr>";;	// Choose side
		str+="<tr><td>Add new option &nbsp;</td><td>"+MakeSelect("option",false,["Window","Door","Wall","Porch"])+"</td></tr>";
		str+="</table><br>";																			// End table
		str+="<div class='co-menuHeader'>Estimated cost</div>";										// Header
		str+="<table>";																				// Header
		str+="<tr><td>Base panel:</td><td>$1,500</td</tr>";
		str+="<tr><td>Window 1:</td><td>&nbsp;&nbsp;&nbsp;$400</td</tr>";
		str+="<tr><td>Window 2:</td><td>&nbsp;&nbsp;&nbsp;$400</td</tr>";
		str+="<tr><td colspan='2'><hr></td</tr>";
		str+="<tr><td><b>Total side:</b></td><td>$2,100</td</tr>";
		str+="<tr><td><b>Entire project:&nbsp;&nbsp;&nbsp;</b></td><td>$8,500</td</tr>"
		str+="</table>";																		// End table


		$("#rightDiv").html(str);																	// Add to div

		$("#sidePicker").on("change", ()=>{															// On side change
			this.curSide=$("#sidePicker").val();;													// Current side
			this.Draw();																			// Redraw
			});

		function MakeNum(id, num, places, lock) {													// Make number box
			num=num.toFixed(places);																// Convert
			return "<input id='cm-"+id+"'value='"+num+"'"+(lock ? " disabled ": "")+"type='text' class='co-num'>";	// Return input				
			}
	}

	DrawSettingMenu()																			// DRAW SETTING MENU 
	{
		var str=TabMenu("topTabMenu",this.menuOps,this.topMenuTab);									// Add tab menu
		str+="<p>This tab has options to set the various parameters of the design, as well as save and load projects to our server.</p>" 
		str+="<table style='margin:8px 8px'>";														// End scene 
		str+=`<tr><td colspan='2'><p><b>Overall dimensions</b> (in feet)</p></td></tr>`;
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspwid' type='text' class='co-ps' value='${this.wid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dsphgt' type='text' class='co-ps' value='${this.hgt}'></td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dsplen' type='text' class='co-ps' value='${this.len}'></td></tr>`;
		str+=`<tr><td colspan='2'><p><b>Cupula dimensions</b></p></td></tr>`;
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspcwid' type='text' class='co-ps' value='${this.cwid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dspchgt' type='text' class='co-ps' value='${this.chgt}'</td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dspclen' type='text' class='co-ps' value='${this.clen}'></td></tr>`;
		str+="</table><hr><br>&nbsp;&nbsp;&nbsp;<div class='co-bs' id='loadPro'>Load project</div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class='co-bs' id='savePro'>Save project</div>";
		$("#rightDiv").html(str);																	// Add to div

		$("[id^=dsp]").on("change", (e)=> {														// ON PARAMETER CHANGE
			let id=e.target.id;																		// Extract id
			this[id.substr(3)]=$("#"+id).val();														// Set value
			this.DrawSide(true);																	// Redraw
			});
	
		$("#savePro").on("click", function() {														// ON SAVE
			});
	
		$("#savePro").on("click", function() {														// ON SAVE
			});

	
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
		if (!this.curUndo) {																		// No undos to un-do
			Sound("delete");																		// Acknowledge
			return;															
			}
		var o={models:[], scenes:[] };																// Composite object
		o.models=JSON.parse(JSON.stringify(app.doc.models));										// Clone models 
		o.scenes=JSON.parse(JSON.stringify(app.doc.scenes));										// Clone scenes 
		this.curUndo--;																				// Dec index
		o=this.undos[this.curUndo];																	// Point at saved state
		app.doc.models=JSON.parse(JSON.stringify(o.models));										// Restore models and dec index 
		app.doc.scenes=JSON.parse(JSON.stringify(o.scenes));										// Restore scenes 
		this.Draw();																				// Redraw
		Sound("ding");																				// Acknowledge
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
