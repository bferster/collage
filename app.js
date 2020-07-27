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
		app.sc.SetCameraSide(side);																	// Position camera to side
	}


	DrawOptions(side)
	{
		let h=2*this.ppf;	let w=4*this.ppf
		let x=2*this.ppf;	let y=2*this.ppf
	
		let str=`<div id='${side}Opt-26' class='co-planOption' 
			style='width:${w}px;height:${h}px;top:${y}px;left:${x}px'>
			Window 3
			</div>`

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
		str+="<tr><td>Align options &nbsp;</td><td>"+MakeSelect("align",false,["Pick direction","Top","Bottom", "Center", "Distribute widths"])+"</td></tr>";
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
			Drag the divider to change size of plan/3D view</p> 
			<p>Scale plan view using the thumbwheel, or the +/- buttons. Drag the plan with mouse.</p>
			<p>Scale 3D view using the thumbwheel, or the up/down keys. Rotate model with mouse.</p>`
		$("#rightDiv").html(str);																	// Add to div

		$("#sidePicker").on("change", ()=>{															// On side change
			this.curSide=$("#sidePicker").val();;													// Current side
			this.Draw();																			// Redraw
			});
		$("#addOption").on("change", ()=>{															// ON ADD OPTION
			app.op.Picker($("#addOption").val(),null);												// Run picker
			$("#addOption").val("Pick type");														// Reset menu	
			});
	
		function MakeNum(id, num, places, lock) {													// Make number box
			num=num.toFixed(places);																// Convert
			return "<input id='cm-"+id+"'value='"+num+"'"+(lock ? " disabled ": "")+"type='text' class='co-num'>";	// Return input				
			}
	}

	DrawSettingMenu()																			// DRAW SETTING MENU 
	{
		var str=TabMenu("topTabMenu",this.menuOps,this.topMenuTab);									// Add tab menu
		str+="<br><br><table style='margin:8px 8px'>";												// Add table
		str+=`<tr><td colspan='2'><b>Overall dimensions</b></td></tr>`;
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspwid' type='text' class='co-ps' value='${wid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dsphgt' type='text' class='co-ps' value='${hgt}'></td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dsplen' type='text' class='co-ps' value='${len}'></td></tr>`;
		str+=`<tr><td colspan='2'><br><b>Porch length</b></td></tr>`;
		str+=`<tr><td>Head</td><td><input style='width:40px' id='dsphlen' type='text' class='co-ps' value='${hlen}'></td></tr>`;
		str+=`<tr><td>Tail</td><td><input style='width:40px' id='dsptlen' type='text' class='co-ps' value='${tlen}'></td></tr>`;
		str+=`<tr><td colspan='2'><br><b>Cupola dimensions</b></td></tr>`;
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspcwid' type='text' class='co-ps' value='${cwid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dspchgt' type='text' class='co-ps' value='${chgt}'</td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dspclen' type='text' class='co-ps' value='${clen}'></td></tr>`;
		str+=`<tr><td>Offset</td><td><input style='width:40px' id='dspcwid' type='text' class='co-ps' value='${coff}'></td></tr>`;
		str+="</table><hr><br>"
		str+="<div class='co-bs' id='exportPro'>Export project</div>";
		str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class='co-bs' id='importPro'>Import project</div><br>";
		str+=`<br><p>All dimensions are in feet. When you change a size, the plan and 3D view will redraw to match.</p>
			<p>Projects are automatically save and loaded, but you can import and export specific projects using the button below.</p>`; 

		$("#rightDiv").html(str);																	// Add to div

		$("[id^=dsp]").on("change", (e)=> {														// ON PARAMETER CHANGE
			let id=e.target.id;																		// Extract id
			this[id.substr(3)]=$("#"+id).val();														// Set value
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
			{ name: "Single hung",  pic:"http://www.sweethome3d.com/models/window85x123.png", cost:800}, 
			{ name: "Double hung",  pic:"http://www.sweethome3d.com/models/katorlegaz/window-01.png", cost:1000 },
			{ name: "Picture",  	pic:"http://www.sweethome3d.com/models/contributions/window_shop.png", cost:800  },
			{ name: "Casement", 	pic:"http://www.sweethome3d.com/models/window85x123.png", cost:900 },
			{ name: "Round",    	pic:"http://www.sweethome3d.com/models/roundWindow.png", cost:400 },
			{ name: "Half-round", 	pic:"http://www.sweethome3d.com/models/halfRoundWindow.png", cost:500 },
			{ name: "Bay",      	pic:"http://www.sweethome3d.com/models/contributions/pictureWindow.png", cost:1800 },
			{ name: "Arch",     	pic:"http://www.sweethome3d.com/models/scopia/window_2x4_arched.png", cost:1200 }
			];
		this.door=[
			{ name: "Panel",   		pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-02.png", cost:600}, 
			{ name: "Plain",   		pic:"http://www.sweethome3d.com/models/door.png", cost:300}, 
			{ name: "Glass",   		pic:"http://www.sweethome3d.com/models/contributions/doorGlassPanels.png", cost:1200}, 
			{ name: "Front glass", 	pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-07.png", cost:1000}, 
			{ name: "Glass top",   	pic:"http://www.sweethome3d.com/models/contributions/frontDoorDark.png", cost:800}, 
			{ name: "Garage",   	pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-02.png", cost:1200}, 
			{ name: "Accordian",   	pic:"http://www.sweethome3d.com/models/contributions/accordionFoldDoors.png", cost:600}, 
			{ name: "Dutch",	   	pic:"http://www.sweethome3d.com/models/katorlegaz/exterior-door-07.png", cost:1200}, 
			{ name: "French",   	pic:"http://www.sweethome3d.com/models/scopia/window_4x5.png", cost:1800} 
			];
		this.appliance=[
			{ name: "Stove",   		pic:"http://www.sweethome3d.com/models/cooker.png", cost:1600}, 
			{ name: "Fridge full",  pic:"http://www.sweethome3d.com/models/contributions/frigorifero.png", cost:1200}, 
			{ name: "Fridge short", pic:"http://www.sweethome3d.com/models/fridge.png", cost:300}, 
			{ name: "Washer",   	pic:"http://www.sweethome3d.com/models/scopia/clothes_washing_machine.png", cost:1600}, 
			{ name: "AC",   		pic:"http://www.sweethome3d.com/models/scopia/internal-unity-air-conditioning.png", cost:4000}, 
			{ name: "Toilet",   	pic:"http://www.sweethome3d.com/models/lucapresidente/water.png", cost:1600}, 
			{ name: "Shower",   	pic:"http://www.sweethome3d.com/models/blendswap-cc-0/showerStall.png", cost:3000}, 
			{ name: "Sink",   		pic:"http://www.sweethome3d.com/models/sink.png", cost:1200} 
			];
		this.furniture=[
			{ name: "Sofs",   		pic:"http://www.sweethome3d.com/models/katorlegaz/mid-century-bench-sofa.png", cost:600}
			]; 
		this.wall=[
			{ name: "Spiral stair", pic:"http://www.sweethome3d.com/models/contributions/escalierColimacon.png", cost:2000}, 
			{ name: "Stair",   		pic:"http://www.sweethome3d.com/models/contributions/staircase_ladder_steep.png", cost:100},
			{ name: "Rail", 		pic:"http://www.sweethome3d.com/models/contributions/roundedEdgesRailing.png", cost:800}, 
			{ name: "Ladder",   	pic:"http://www.sweethome3d.com/models/contributions/pool_ladder.png", cost:400}, 
			{ name: "Archway",   	pic:"http://www.sweethome3d.com/models/contributions/arch.png", cost:800} 
 			];
		this.curOption="";
		this.curType="";
	}

	Picker(type, option)																		// EDIT OR ADD OPTION	
	{
		let s=type+" editor";																		// Edit message
		$("#opPicker").remove();																	// Remove any existing one
		if (!option) s="Add new "+type.toLowerCase();												// New message
		let str=`<div id='opPicker' class='co-opPicker'>
		<div style='text-align:center; color:#fff; background-color:#a4baec; border-radius:8px 8px 0 0;height:18px; padding-top:4px'>
			<b>${s}</b>
			<div style='float:right;cursor:pointer;margin:-1px 6px 0 0' onclick='$("#opPicker").remove()'>&otimes;</div>	
		</div>`
	
		str+="<div>"+this.ObjectList(this[type.toLowerCase()]);										// Add options list and enclosing div
		str+="<div id='opParams' class='co-opParams'></div></div>";									// Add params div and close enclosing div
	
		$("body").append(str.replace(/\t|\n|\r/g,"")+"</div>");										// Remove format and add to body
		if (!isMobile) $("#opPicker").draggable();													// Draggable on desktop
		$("#opPicker,#opList").on("mousedown touchdown touchmove wheel", (e)=> { e.stopPropagation() } );	// Don't move orbiter in menus

		$("[id^=opItem-]").on("click", (e)=>{														// Draggable
			$("[id^=opItem-]").css("border-color","#999")
			let id=e.currentTarget.id.substr(7);													// Extract id
			$("#opItem-"+id).css("border-color","#ff0000");											// Highlight
			this.curOption=this[type.toLowerCase()][id];											// Set current option
			this.EditOption(this.curOption, type);													// Edit it
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

	EditOption(op, type)																		// EDIT OPTION
	{
		let o={ wid:48,hgt:24,dep:6,col:"White",mak:"Pella",mod:"353364-12",mat:"Wood",cos:op.cost,
				fwid:4,fhgt:2,fdep:3,fcol:"White",fsil:"Bar",vp:1,hp:1 };
		let str=`<img src="${op.pic}" style='float:left;vertical-align:top;height:128px'>
		<br><br><br>&nbsp; <b style='font-size:2em'>${op.name}<br>&nbsp;${type}</b><br>
		<table style='border-spacing:3px 0'>																			
		<tr><td colspan='6'><br><b>${type.toUpperCase()}</b></td</tr>		
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Make</td><td colspan='2'><input style='width:80px' id='eopmak' type='text' class='co-ps' value='${o.mak? o.mak : ""}'></td>
		<td>Model</td><td colspan='2'><input style='width:80px' id='eopmod' type='text' class='co-ps' value='${o.mod ? o.mod : ""}'></td></tr>
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Width</td><td><input style='width:30px' id='eopwid' type='text' class='co-ps' value='${o.wid ? o.wid : ""}'></td>
		<td>Height</td><td><input style='width:30px' id='eophgt' type='text' class='co-ps' value='${o.hgt ? o.hgt : ""}'></td>
		<td>Depth</td><td><input style='width:30px'  id='eopdep' type='text' class='co-ps' value='${o.dep ? o.dep : ""}'></td></tr>
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Color</td><td><input style='width:30px' id='eocol' type='text' class='co-ps' value='${o.col ? o.col : ""}'></td>
		<td>Material</td><td><input style='width:30px' id='eomat' type='text' class='co-ps' value='${o.mat ? o.mat : ""}'></td></tr>
		
		<tr><td colspan='6'><b>FRAME</b></td</tr>		
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Width</td><td><input style='width:30px' id='eopfwid' type='text' class='co-ps' value='${o.fwid ? o.fwid : ""}'></td>
		<td>Depth:</td><td><input style='width:30px'  id='eopfdep' type='text' class='co-ps' value='${o.fdep ? o.fdep : ""}'></td>
		<td>Sill type</td><td><input style='width:30px'  id='eopfsil' type='text' class='co-ps' value='${o.fdep ? o.fsil : ""}'></td></tr>
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Color</td><td><input style='width:30px' id='eofcol' type='text' class='co-ps' value='${o.fcol ? o.fcol : ""}'></td></tr>
		<tr><td colspan='6'><b>PANES</b></td</tr>		
		<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Horizontal</td><td><input style='width:30px' id='eohp' type='text' class='co-ps' value='${o.hp ? o.hp : ""}'></td>
		<td>Vertical</td><td><input style='width:30px'  id='eovp type='text' class='co-ps' value='${o.vp ? o.vp : ""}'></td></tr>
		</table><p><hr></p><div class='co-bs' id='eosave'>Save</div><br><br><br>
		All measurements are in inches.<br>
		Estimated cost to add this ${type.toLowerCase()} is <b>$${op.cost}.</b>
		`;
		
		$("#opParams").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to body
		$("#opParams").css("padding","12px 8px");												// Set padding

		ColorPicker("eocol",-1,true);															// Init color
		ColorPicker("eofcol",-1,true);															// Init frame color
		$("#eocancel").on("click", ()=> {	$("#opPicker").remove();	});						// CANCEL
		$("#eocol").on("click", ()=> 	{	ColorPicker("eocol",-1);	}); 					// COLOR HANDLER
		$("#eofcol").on("click", ()=> 	{	ColorPicker("eofcol",-1);	}); 					// FRAME COLOR HANDLER

		$("#eosave").on("click", ()=> {															// SAVE
			$("#opPicker").remove();
			}); 
	
			
	}

} // Options class closure


class Doc  {																																											

	constructor()   																			// CONSTRUCTOR
	{
		this.sides=[];																				// Holds sides
		this.sides.push( { name:"Front", options:[] });												// Add each one
		this.sides.push( { name:"Back", options:[] });	
		this.sides.push( { name:"Head", options:[] });	
		this.sides.push( { name:"Tail", options:[] });	
		this.sides.push( { name:"Roof", options:[] });	
		this.sides.push( { name:"Floor", options:[] });	
		this.sides.push( { name:"Cupola front", options:[] });	
		this.sides.push( { name:"Cupola back", options:[] });	
		this.sides.push( { name:"Cupola head", options:[] });	
		this.sides.push( { name:"Cupola tail", options:[] });	
		this.sides.push( { name:"Cupola floor", options:[] });	
		this.len=30;	this.hgt=7;		this.wid=10;												// Default sizes
		this.clen=9;	this.chgt=4;	this.cwid=8;	this.coff=10.5;								// Cupola 			
		this.hlen=3;	this.tlen=3;																// Porch 			
	}
	
	AddOption(side, name, params)																// ADD NEW OPTION TO SIDE						
	{
	}

	RemoveOption(side, name)																	// REMOVE OPTION FROM SIDE
	{
	}

	EditOption(side, name, params)																// EDIT OPTION
	{
	}

} // Doc class closure

