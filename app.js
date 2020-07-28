///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class App  {																					

	constructor(id)   																			// CONSTRUCTOR
	{
		app=this;
		this.topMenuTab=0;																			// Default layers
		this.curUndo=0;																				// Current undo index
		this.ppf;																					// Pixels per foot
		this.curState=null;																			// Current state
		this.undos=[];																				// Holds undos
		this.sc=new Scene("threeDiv");																// Alloc 3D class		
		this.doc=new Doc();																			// Alloc Doc class		
		this.op=new Options();																		// Options class		
		this.menuOps=["Side","Settings"];															// Menu options
		this.scale=1;																				// Plan scaling
		this.curSide="Front";																		// Current side
		this.Draw();																				// Start 
	
		$("#planBase").draggable();																	// Make draggable
		$("#rightDiv,#planDiv").on("mousedown touchdown touchmove wheel", (e)=> { e.stopPropagation() } );	// Don't move orbiter in menus
		
		$("#planZoomIn").on("click", ()=>{															// On zoom in	
			Sound("click");																			// Click 
			this.scale=Math.min(this.scale+.25,4)													// Scale up to 4
			this.DrawSide(this.curSide);															// Draw side
			});
		$("#planZoomOut").on("click", ()=>{															// On soom in	
			Sound("click");																			// Click 
			this.scale=Math.max(this.scale-.25,.25);												// Scale to .25
			this.DrawSide(this.curSide);															// Draw side
			});
		$("#planDiv").on("wheel", (e)=>{															// On scroll wheel
			if (e.originalEvent.deltaY < 0)	$("#planZoomIn").trigger("click");						// Zoom in
			else							$("#planZoomOut").trigger("click");						// Zoom out
			});
	}

	Draw() 																						// REDRAW
	{
		this.DrawTopMenu(0);																		// Draw top menu
		this.DrawSide(this.curSide,true);															// Draw side
		this.sc.Render();																			// Render scene and animate
	}

	DrawSide(side, init)																		// DRAW SIDE
	{
		let str="";
		let len=app.doc.len,hgt=app.doc.hgt,wid=app.doc.wid,hlen=app.doc.hlen,tlen=app.doc.tlen;	// Set sizes
		let clen=app.doc.clen,chgt=app.doc.chgt,cwid=app.doc.cwid,coff=app.doc.coff;										
		let wx=$("#planDiv").width();		let wy=$("#planDiv").height();							// Div width
		let ppf=this.ppf=(wx*.66*this.scale)/(len*1+hlen*1+tlen*1);									// Pixels per foot
		let w=len;							let h=hgt;												// Get dimensions
		if (side == "Roof")					h=wid;													// If top
		else if (side == "Floor")			h=wid;													// If bottom
		else if (side == "Head")			w=wid;													// Head
		else if (side == "Tail")			w=wid;													// Tail
		else if (side == "Cupola floor")	h=cwid,w=clen;											// If cupola bottom
		else if (side == "Cupola front")	h=chgt,w=clen;											// If cupola front
		else if (side == "Cupola back")		h=chgt,w=clen;											// If cupola back
		else if (side == "Cupola head")		h=chgt,w=cwid;											// If cupola head
		else if (side == "Cupola tail")		h=chgt,w=cwid;											// If cupola tail
		w=w*ppf;							h=h*ppf;												// Scale to draw it

		if ((side == "Front") || (side == "Back")) {												// Front/back base/cupola
			str+=`<div class='co-planPanel' style='top:${hgt*ppf+2}px;left:${tlen*ppf*-1}px;
			width:${(len*1+hlen*1+tlen*1)*ppf}px;height:${.5*ppf}px'> &nbsp; Base</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${(-chgt-.5)*ppf-4}px;left:${cwid*ppf}px;
			width:${clen*ppf}px;height:${chgt*ppf}px;text-align:center'>Cupola</div>`;	
			}
		if ((side == "Roof") || (side == "Floor")) {												// Roof/floor base
			str+=`<div class='co-planPanel' style='top:0;left:${tlen*ppf*-1}px;
			width:${(len*1+hlen*1+tlen*1)*ppf}px;height:${h}px'>&nbsp; Base</div>`;	
			}
		if ((side == "Head") || (side == "Tail")) {													// Head/tail base/Cupola
			str+=`<div class='co-planPanel' style='top:${hgt*ppf+2}px;left:0}px;
			width:${w}px;height:${.5*ppf}px;text-align:center'>Base</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf}px;
			width:${w+ppf}px;height:${.5*ppf}px;text-align:center'>Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${(-chgt-.5)*ppf-4}px;left:${(wid-cwid)/2*ppf}px;
			width:${cwid*ppf}px;height:${chgt*ppf}px;text-align:center'>Cupola</div>`;	
			}
		if ((side == "Cupola front") || (side == "Cupola back")) {									// Cupola front/back roofs
			str+=`<div class='co-planPanel' style='top:${h+2}px;left:${(-cwid-.5)*ppf}px;
			width:${(len+1)*ppf}px;height:${.5*ppf}px'> &nbsp; Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf-1}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Cupola roof</div>`;	
			}
		if ((side == "Cupola head") || (side == "Cupola tail")) {									// Cupola head/tail roofs
			str+=`<div class='co-planPanel' style='top:${h+2}px;left:${-0.5*ppf}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf-1}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Cupola roof</div>`;	
			}
		if (side == "Cupola floor") {																// Cupola floor roof
			str+=`<div class='co-planPanel' style='top:${(-wid+cwid-1)/2*ppf}px;left:${(-coff-.5)*ppf}px;
			width:${(len+1)*ppf}px;height:${(wid+1)*ppf}px'> &nbsp; Roof</div>`;	
			}
		if (side == "Roof")	{																		// Roof Cupola/main
			str+=`<div id='planSide' class='co-planPanel' style='top:${-0.5*ppf}px;left:${-0.5*ppf}px;width:${w+ppf}px;height:${h+ppf}px;text-align:center'>${side}</div>`;	// Roof div
			str+=`<div class='co-planPanel' style='top:${(wid-cwid)/2*ppf}px;left:${cwid*ppf}px;
			width:${clen*ppf}px;height:${cwid*ppf}px;text-align:center'>Cupola</div>`;
			}
		else	
			str+=`<div id='planSide' class='co-planPanel' style='top:0;left:0;width:${w}px;height:${h}px;text-align:center'>${side}</div>`;	// Main div
		str+=this.DrawOptions(side);																// Draw options	
		$("#planBase").html(str);																	// Add to plan

		if (init) $("#planBase").css({ "left":(wx-w)/2+"px", top: (wy-h)/2});						// Center if initting
		
		$("[id^=sopt-]").draggable( { containment:"#planSide", 										// Make draggable
			stop:(e)=>{																				// On stop
				let id=e.originalEvent.target.id;													// Get id
				let pos=$("#"+id).position();														// Get pos
				let o=this.doc.sides[this.curSide].options[id.substr(5)];							// Point at this option's data
				o.x=pos.left/ppf;					o.y=pos.top/ppf;								// Set pos in feet
				}
			}) 		
		
		$("[id^=sopt-]").on("click",(e)=>{														// ON DOUBLE CLICK OPTION
			let now=new Date().getTime();															// Get now
				if (now-myLatestTap < 600) {														// In time period
					let id=e.target.id.substr(5);													// Get id
					let o=app.doc.sides[this.curSide].options[id];									// Get params
					app.op.Picker(o.type, o, id)													// Edit it
					}
				myLatestTap=now;																		// Then is now
			});

		app.sc.SetCameraSide(side);																	// Position camera to side
	}

	DrawOptions(side)																			// DRAW OPTIONS
	{
		let h,w,str="";
		let ops=this.doc.sides[side].options;														// Point at side's option
		for (i=0;i<ops.length;++i) {																// For each option
			h=ops[i].hgt/12*this.ppf;	w=ops[i].wid/12*this.ppf;									// Set sizes
			str+=`<div id='sopt-${i}' class='co-planOption' 
			style='width:${w}px;height:${h}px;top:${ops[i].y*this.ppf}px;left:${ops[i].x*this.ppf}px'>
			${ops[i].type}</div>`;
			}
		return str;
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
		str+="<tr><td>Choose side to edit &nbsp;</td><td>"+MakeSelect("sidePicker",false,["Front","Back","Head","Tail","Roof","Floor","Cupola front", "Cupola back", "Cupola head", "Cupola tail", "Cupola floor"],this.curSide)+"</td></tr>";;	// Choose side
		str+="<tr><td>Add new option &nbsp;</td><td>"+MakeSelect("addOption",false,["Pick type", "Window","Door","Wall","Furniture","Appliance"])+"</td></tr>";
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
		str+=`<br><p>Choose side to edit. Side will appear in the gridded plan view and the 3D model will face that direction.
			Drag the divider to change size of plan/3D view.</p>
			Scale plan view using the thumbwheel, or the +/- buttons. Drag the plan with mouse.  
			<p>Add options like windows and doors with Add new option menu. Once added, they can be positioned. 
			Re-edit their settings by double-clicking.</p>
			`
		$("#rightDiv").html(str);																	// Add to div

		$("#sidePicker").on("change", ()=>{															// On side change
			this.curSide=$("#sidePicker").val();;													// Current side
			this.Draw();																			// Redraw
			});
		$("#addOption").on("change", ()=>{															// ON ADD OPTION
			app.op.Picker($("#addOption").val(),null,null);												// Run picker
			$("#addOption").val("Pick type");														// Reset menu	
			});
	
	}

	DrawSettingMenu()																			// DRAW SETTING MENU 
	{
		var str=TabMenu("topTabMenu",this.menuOps,this.topMenuTab);									// Add tab menu
		str+="<br><br><table style='margin:8px 8px'>";												// Add table
		str+=`<tr><td colspan='2'><b>Overall dimensions</b></td></tr>`;
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspwid' type='text' class='co-ps' value='${app.doc.wid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dsphgt' type='text' class='co-ps' value='${app.doc.hgt}'></td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dsplen' type='text' class='co-ps' value='${app.doc.len}'></td></tr>`;
		str+=`<tr><td colspan='2'><br><b>Porch length</b></td></tr>`;
		str+=`<tr><td>Head</td><td><input style='width:40px' id='dsphlen' type='text' class='co-ps' value='${app.doc.hlen}'></td></tr>`;
		str+=`<tr><td>Tail</td><td><input style='width:40px' id='dsptlen' type='text' class='co-ps' value='${app.doc.tlen}'></td></tr>`;
		str+=`<tr><td colspan='2'><br><b>Cupola dimensions</b></td></tr>`;
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspcwid' type='text' class='co-ps' value='${app.doc.cwid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dspchgt' type='text' class='co-ps' value='${app.doc.chgt}'</td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dspclen' type='text' class='co-ps' value='${app.doc.clen}'></td></tr>`;
		str+=`<tr><td>Offset</td><td><input style='width:40px' id='dspcwid' type='text' class='co-ps' value='${app.doc.coff}'></td></tr>`;
		str+="</table><hr><br>"
		str+="<div class='co-bs' id='exportPro'>Export project</div>";
		str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class='co-bs' id='importPro'>Import project</div><br>";
		str+=`<br><p>All dimensions are in feet. When you change a size, the plan and 3D view will redraw to match.</p>
			<p>Projects are automatically save and loaded, but you can import and export specific projects using the button below.</p>`; 

		$("#rightDiv").html(str);																	// Add to div

		$("[id^=dsp]").on("change", (e)=> {														// ON PARAMETER CHANGE
			let id=e.target.id;																		// Extract id
			app.doc[id.substr(3)]=$("#"+id).val();													// Set value
			this.DrawSide(this.curSide,true);														// Redraw
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

class Options  {																					

	constructor()   																			// CONSTRUCTOR
	{
		this.window=[
			{ name: "Single hung",  pic:"http://www.sweethome3d.com/models/window85x123.png", h:36, w:24, cost:800}, 
			{ name: "Double hung",  pic:"http://www.sweethome3d.com/models/katorlegaz/window-01.png", h:36, w:24, cost:1000 },
			{ name: "Picture",  	pic:"http://www.sweethome3d.com/models/contributions/window_shop.png", h:36, w:48, cost:800  },
			{ name: "Casement", 	pic:"http://www.sweethome3d.com/models/window85x123.png", h:36, w:24, cost:900 },
			{ name: "Round",    	pic:"http://www.sweethome3d.com/models/roundWindow.png", h:24, w:24, cost:400 },
			{ name: "Half-round", 	pic:"http://www.sweethome3d.com/models/halfRoundWindow.png", h:12, w:24, cost:500 },
			{ name: "Bay",      	pic:"http://www.sweethome3d.com/models/contributions/pictureWindow.png", h:36, w:48, cost:1800 },
			{ name: "Arch",     	pic:"http://www.sweethome3d.com/models/scopia/window_2x4_arched.png", h:48, w:24,cost:1200 }
			];
		this.door=[
			{ name: "Panel",   		pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-02.png", h:72, w:30, cost:600}, 
			{ name: "Plain",   		pic:"http://www.sweethome3d.com/models/door.png", h:72, w:30, cost:300}, 
			{ name: "Glass",   		pic:"http://www.sweethome3d.com/models/contributions/doorGlassPanels.png", h:72, w:30, cost:1200}, 
			{ name: "Front glass", 	pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-07.png", h:72, w:30, cost:1000}, 
			{ name: "Glass top",   	pic:"http://www.sweethome3d.com/models/contributions/frontDoorDark.png", h:72, w:30, cost:800}, 
			{ name: "Garage",   	pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-02.png",  h:72, w:72, cost:1200}, 
			{ name: "Accordian",   	pic:"http://www.sweethome3d.com/models/contributions/accordionFoldDoors.png",  h:72, w:48, cost:600}, 
			{ name: "Dutch",	   	pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-07.png",  h:72, w:30, cost:1200}, 
			{ name: "French",   	pic:"http://www.sweethome3d.com/models/scopia/window_4x5.png", h:72, w:48, cost:1800} 
			];
		this.appliance=[
			{ name: "Stove",   		pic:"http://www.sweethome3d.com/models/cooker.png", h:30, w:24, d:24, cost:1600}, 
			{ name: "Fridge full",  pic:"http://www.sweethome3d.com/models/contributions/frigorifero.png",  h:72, w:24, d:24, cost:1200}, 
			{ name: "Fridge short", pic:"http://www.sweethome3d.com/models/fridge.png",  h:30, w:30, d:24, cost:300}, 
			{ name: "Washer",   	pic:"http://www.sweethome3d.com/models/scopia/clothes_washing_machine.png",  h:24, w:30, d:24, cost:1600}, 
			{ name: "AC",   		pic:"http://www.sweethome3d.com/models/scopia/internal-unity-air-conditioning.png",  h:16, w:24, d:8, cost:4000}, 
			{ name: "Toilet",   	pic:"http://www.sweethome3d.com/models/lucapresidente/water.png",  h:24, w:24, d:24, cost:1600}, 
			{ name: "Shower",   	pic:"http://www.sweethome3d.com/models/blendswap-cc-0/showerStall.png",  h:72, w:30, d:30, cost:3000}, 
			{ name: "Sink",   		pic:"http://www.sweethome3d.com/models/sink.png",  h:30, w:48, d:24, cost:1200} 
			];
		this.furniture=[
			{ name: "Sofs",   		pic:"http://www.sweethome3d.com/models/katorlegaz/mid-century-bench-sofa.png",  h:24, w:48, d:24, cost:600}
			]; 
		this.wall=[
			{ name: "Spiral stair", pic:"http://www.sweethome3d.com/models/contributions/escalierColimacon.png", h:72, w:24, d:24, cost:2000}, 
			{ name: "Stair",   		pic:"http://www.sweethome3d.com/models/contributions/staircase_ladder_steep.png", h:72, w:24, d:48, cost:100},
			{ name: "Rail", 		pic:"http://www.sweethome3d.com/models/contributions/roundedEdgesRailing.png", h:30, w:30, d:2, cost:800}, 
			{ name: "Ladder",   	pic:"http://www.sweethome3d.com/models/contributions/pool_ladder.png",  h:96, w:18, d:2, cost:400}, 
			{ name: "Archway",   	pic:"http://www.sweethome3d.com/models/contributions/arch.png",  h:72, w:96, d:6, cost:800} 
 			];
		this.curOption="";
		this.curType="";
	}

	Picker(type, params, id)																		// EDIT OR ADD OPTION	
	{
		let s=type+" editor";																		// Edit message
		$("#opPicker").remove();																	// Remove any existing one
		if (!params) s="Add new "+type.toLowerCase();												// New message
		let str=`<div id='opPicker' class='co-opPicker'>
		<div style='text-align:center; color:#fff; background-color:#a4baec; border-radius:8px 8px 0 0;height:18px; padding-top:4px'>
			<b>${s}</b>
			<div style='float:right;cursor:pointer;margin:-1px 6px 0 0' onclick='$("#opPicker").remove()'>&otimes;</div>	
		</div>`
	
		str+="<div>"+this.ObjectList(this[type.toLowerCase()]);										// Add options list and enclosing div
		str+="<div id='opParams' class='co-opParams'></div></div>";									// Add params div and close enclosing div
		$("body").append(str.replace(/\t|\n|\r/g,"")+"</div>");										// Remove format and add to body
		if (params) this.EditOption(this[type.toLowerCase()][params.name],params.type, params,id);	// Open params area
		if (!isMobile) $("#opPicker").draggable();													// Draggable on desktop
		$("#opPicker,#opList").on("mousedown touchdown touchmove wheel", (e)=> { e.stopPropagation() } );	// Don't move orbiter in menus

		$("[id^=opItem-]").on("click", (e)=>{														// Draggable
			$("[id^=opItem-]").css("border-color","#999")
			let id=e.currentTarget.id.substr(7);													// Extract id
			$("#opItem-"+id).css("border-color","#ff0000");											// Highlight
			this.curOption=this[type.toLowerCase()][id];											// Set current option
			this.EditOption(this.curOption,type,null);												// Edit it
			});	
		}

	ObjectList(items)																			// CREATE OPTION LIST
	{
		let i;
		let str="<div id='opList' class='co-opList'><b>Choose style</b><br>";
		for (i=0;i<items.length;++i) {
			str+=`<div id='opItem-${i}' class='co-opItem'>
			<img src="${items[i].pic}" style='width:45%;max-height:80px'><br>
			${items[i].name}</div>`;
			}
		return str+"</div>";
	}

	EditOption(op, type, params, id)																// EDIT OPTION
	{
		let o={ type:type, col:"White",mak:"Pella",mod:"353364-12",mat:"Wood", 
				fwid:4,fhgt:2,fdep:3,fcol:"White",fsil:"Bar",vp:1,hp:1,x:0,y:0 };
		if (params)	o=params;																	// Edit existing option
		else{ 																					// Pull from list, if there		
			op.h ? o.hgt=op.h : 48;	op.w ? o.wid=op.w : 24; op.d ? o.dep=op.d : 6;
			o.cost=op.cost;	o.name=op.name;	o.pic=op.pic;
			}				
		
		let str=`<img src="${o.pic}" style='float:left;vertical-align:top;height:128px'>
		<br><br><br>&nbsp; <b style='font-size:2em'>${o.name}<br>&nbsp;${o.type}</b><br>
		<table style='border-spacing:3px 0'>																			
		<tr><td colspan='6'><br><b>${o.type.toUpperCase()}</b></td</tr>		
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Make</td><td colspan='2'><input style='width:80px' id='eopmak' type='text' class='co-ps' value='${o.mak? o.mak : ""}'></td>
		<td>Model</td><td colspan='2'><input style='width:80px' id='eopmod' type='text' class='co-ps' value='${o.mod ? o.mod : ""}'></td></tr>
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Width</td><td><input style='width:30px' id='eopwid' type='text' class='co-ps' value='${o.wid ? o.wid : ""}'></td>
		<td>Height</td><td><input style='width:30px' id='eophgt' type='text' class='co-ps' value='${o.hgt ? o.hgt : ""}'></td>
		<td>Depth</td><td><input style='width:30px'  id='eopdep' type='text' class='co-ps' value='${o.dep ? o.dep : ""}'></td></tr>
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Color</td><td><input style='width:30px' id='eopcol' type='text' class='co-ps' value='${o.col ? o.col : ""}'></td>
		<td>Material</td><td><input style='width:30px' id='eopmat' type='text' class='co-ps' value='${o.mat ? o.mat : ""}'></td></tr>
		
		<tr><td colspan='6'><b>FRAME</b></td</tr>		
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Width</td><td><input style='width:30px' id='eopfwid' type='text' class='co-ps' value='${o.fwid ? o.fwid : ""}'></td>
		<td>Depth:</td><td><input style='width:30px'  id='eopfdep' type='text' class='co-ps' value='${o.fdep ? o.fdep : ""}'></td>
		<td>Sill type</td><td><input style='width:30px'  id='eopfsil' type='text' class='co-ps' value='${o.fdep ? o.fsil : ""}'></td></tr>
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Color</td><td><input style='width:30px' id='eopfcol' type='text' class='co-ps' value='${o.fcol ? o.fcol : ""}'></td></tr>
		<tr><td colspan='6'><b>PANES</b></td</tr>		
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Horizontal</td><td><input style='width:30px' id='eophp' type='text' class='co-ps' value='${o.hp ? o.hp : ""}'></td>
		<td>Vertical</td><td><input style='width:30px'  id='eopvp type='text' class='co-ps' value='${o.vp ? o.vp : ""}'></td></tr>
		</table><p><hr></p><div class='co-bs' id='eosave'>${!params ? "Add" : "Change"} ${type}</div><br><br><br>
		All measurements are in inches.<br>
		Estimated cost to add this ${o.type.toLowerCase()} is <b>$${o.cost}.</b>`;
		
		$("#opParams").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to body
		$("#opParams").css("padding","12px 8px");												// Set padding

		$("[id^=eop]").on("change", (e)=> {														// ON PARAMETER CHANGE
			let id=e.target.id;																	// Extract id
			o[id.substr(3)]=$("#"+id).val();													// Set value
			});

		ColorPicker("eopcol",-1,true);															// Init color
		ColorPicker("eopfcol",-1,true);															// Init frame color
		$("#eocancel").on("click", ()=> {	$("#opPicker").remove();	});						// CANCEL
		$("#eopcol").on("click", ()=> 	{	ColorPicker("eocol",-1);	}); 					// COLOR HANDLER
		$("#eopfcol").on("click", ()=> 	{	ColorPicker("eofcol",-1);	}); 					// FRAME COLOR HANDLER

		$("#eosave").on("click", ()=> {															// ADD
			app.doc.AddOption(app.curSide,type,o, id);											// Add option to side
			$("#opPicker").remove();															// Remove dialog
			app.Draw();																			// Redraw	
			}); 
	}

} // Options class closure


class Doc  {																																											

	constructor()   																			// CONSTRUCTOR
	{
		this.sides=[];																				// Holds sides
		this.sides["Front"]={ options:[] };															// Add each one
		this.sides["Back"]={options:[] };	
		this.sides["Head"]={options:[] };	
		this.sides["Tail"]={options:[] };	
		this.sides["Roof"]={options:[] };	
		this.sides["Floor"]={options:[] };	
		this.sides["Cupola front"]={options:[] };	
		this.sides["Cupola back"]={options:[] };	
		this.sides["Cupola head"]={options:[] };	
		this.sides["Cupola tail"]={options:[] };	
		this.sides["Cupola floor"]={options:[] };	
		this.len=30;	this.hgt=7;		this.wid=10;												// Default sizes
		this.clen=9;	this.chgt=4;	this.cwid=8;	this.coff=10.5;								// Cupola 			
		this.hlen=3;	this.tlen=3;																// Porch 			
	}
	
	AddOption(side, type, params, update)																// ADD NEW OPTION TO SIDE						
	{
		let p,o={ type: type };																		
		for (p in params) o[p]=params[p];															// Add params
		if (update)	this.sides[side].options[update]=o;												// Jost update
		else this.sides[side].options.push(o);														// Add option to list
	}

	RemoveOption(side, name)																	// REMOVE OPTION FROM SIDE
	{
	}

} // Doc class closure

