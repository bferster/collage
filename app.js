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
		this.sc=new Scene("threeDiv");																// Alloc 3D class		
		this.op=new Options();																		// Options class		
		this.menuOps=["Side","Settings"];															// Menu options
		this.scale=1;																				// Plan scaling
		this.curSide="Front";																		// Current side
		this.len=30;	this.hgt=7;		this.wid=10;												// Default sizes
		this.clen=9;	this.chgt=4;	this.cwid=8;	this.coff=10.5;								// Cupola sizes				
		this.hlen=3;	this.tlen=3;																// Porch sizes				
		this.Draw();																				// Start 
	
		$("#planBase").draggable();																	// Make draggable
		$("#rightDiv,#planDiv").on("mousedown touchdown touchmove wheel", (e)=> { e.stopPropagation() } );	// Don't move orbiter in menus
		
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
		let str="";
		let wx=$("#planDiv").width();				let wy=$("#planDiv").height();					// Div width
		let ppf=(wx*.75*this.scale)/(this.len*1+this.hlen*1+this.tlen*1);							// Pixels per foot
		+this.hlen+this.tlen
		let w=this.len;								let h=this.hgt;									// Get dimensions
		if (this.curSide == "Roof")					h=this.wid;										// If top
		else if (this.curSide == "Floor")			h=this.wid;										// If bottom
		else if (this.curSide == "Head")			w=this.wid;										// Head
		else if (this.curSide == "Tail")			w=this.wid;										// Tail
		else if (this.curSide == "Cupola floor")	h=this.cwid,w=this.clen;						// If Cupola bottom
		else if (this.curSide == "Cupola front")	h=this.chgt,w=this.clen;						// If Cupola front
		else if (this.curSide == "Cupola back")		h=this.chgt,w=this.clen;						// If Cupola back
		else if (this.curSide == "Cupola head")		h=this.chgt,w=this.cwid;						// If Cupola head
		else if (this.curSide == "Cupola tail")		h=this.chgt,w=this.cwid;						// If Cupola tail
		w=w*ppf;									h=h*ppf;										// Scale to draw it

		if ((this.curSide == "Front") || (this.curSide == "Back")) {								// Front/back baee/Cupola
			str+=`<div class='co-planPanel' style='top:${this.hgt*ppf+2}px;left:${this.tlen*ppf*-1}px;
			width:${(this.len*1+this.hlen*1+this.tlen*1)*ppf}px;height:${.5*ppf}px'> &nbsp; Base</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${(-this.chgt-.5)*ppf-4}px;left:${this.coff*ppf}px;
			width:${this.clen*ppf}px;height:${this.chgt*ppf}px;text-align:center'>Cupola</div>`;	
			}
	
		if ((this.curSide == "Roof") || (this.curSide == "Floor")) {								// Roof/floor base
			str+=`<div class='co-planPanel' style='top:0;left:${this.tlen*ppf*-1}px;
			width:${(this.len*1+this.hlen*1+this.tlen*1)*ppf}px;height:${h}px'>&nbsp; Base</div>`;	
			}

		if ((this.curSide == "Head") || (this.curSide == "Tail")) {									// Head/tail base/Cupola
			str+=`<div class='co-planPanel' style='top:${this.hgt*ppf+2}px;left:0}px;
			width:${w}px;height:${.5*ppf}px;text-align:center'>Base</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf}px;
			width:${w+ppf}px;height:${.5*ppf}px;text-align:center'>Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${(-this.chgt-.5)*ppf-4}px;left:${(this.wid-this.cwid)/2*ppf}px;
			width:${this.cwid*ppf}px;height:${this.chgt*ppf}px;text-align:center'>Cupola</div>`;	
			}

		if ((this.curSide == "Cupola front") || (this.curSide == "Cupola back")) {					// Cupola front/back roofs
			str+=`<div class='co-planPanel' style='top:${h+2}px;left:${(-this.coff-.5)*ppf}px;
			width:${(this.len+1)*ppf}px;height:${.5*ppf}px'> &nbsp; Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf-1}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Cupola roof</div>`;	
			}

		if ((this.curSide == "Cupola head") || (this.curSide == "Cupola tail")) {					// Cupola head/tail roofs
			str+=`<div class='co-planPanel' style='top:${h+2}px;left:${-0.5*ppf}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Roof</div>`;	
			str+=`<div class='co-planPanel' style='top:${-0.5*ppf-2}px;left:${-0.5*ppf-1}px;
			width:${w+ppf}px;height:${.5*ppf}px'> &nbsp; Cupola roof</div>`;	
			}

		if (this.curSide == "Cupola floor") 														// Cupola floor roof
			str+=`<div class='co-planPanel' style='top:${(-this.wid+this.cwid-1)/2*ppf}px;left:${(-this.coff-.5)*ppf}px;
			width:${(this.len+1)*ppf}px;height:${(this.wid+1)*ppf}px'> &nbsp; Roof</div>`;	

	
		if (this.curSide == "Roof")	{																// Roof Cupola/main
			str+=`<div id='planSide' class='co-planPanel' style='top:${-0.5*ppf}px;left:${-0.5*ppf}px;width:${w+ppf}px;height:${h+ppf}px;text-align:center'>${this.curSide}</div>`;	// Roof div
			str+=`<div class='co-planPanel' style='top:${(this.wid-this.cwid)/2*ppf}px;left:${this.coff*ppf}px;
			width:${this.clen*ppf}px;height:${this.cwid*ppf}px;text-align:center'>Cupola</div>`;
			}
		else	
			str+=`<div id='planSide' class='co-planPanel' style='top:0;left:0;width:${w}px;height:${h}px;text-align:center'>${this.curSide}</div>`;	// Main div
		
		$("#planBase").html(str);																	// Add to plan
		if (init) $("#planBase").css({ "left":(wx-w)/2+"px", top: (wy-h)/2});						// Center if initting
		app.sc.SetCameraSide(this.curSide);															// Position camera to side
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
			app.op.Picker($("#addOption").val(),this.curSide,null);									// Run picker
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
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspwid' type='text' class='co-ps' value='${this.wid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dsphgt' type='text' class='co-ps' value='${this.hgt}'></td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dsplen' type='text' class='co-ps' value='${this.len}'></td></tr>`;
		str+=`<tr><td colspan='2'><br><b>Porch length</b></td></tr>`;
		str+=`<tr><td>Head</td><td><input style='width:40px' id='dsphlen' type='text' class='co-ps' value='${this.hlen}'></td></tr>`;
		str+=`<tr><td>Tail</td><td><input style='width:40px' id='dsptlen' type='text' class='co-ps' value='${this.tlen}'></td></tr>`;
		str+=`<tr><td colspan='2'><br><b>Cupola dimensions</b></td></tr>`;
		str+=`<tr><td>Width</td><td><input style='width:40px' id='dspcwid' type='text' class='co-ps' value='${this.cwid}'></td></tr>`;
		str+=`<tr><td>Height</td><td><input style='width:40px' id='dspchgt' type='text' class='co-ps' value='${this.chgt}'</td></tr>`;
		str+=`<tr><td>Length</td><td><input style='width:40px' id='dspclen' type='text' class='co-ps' value='${this.clen}'></td></tr>`;
		str+=`<tr><td>Offset</td><td><input style='width:40px' id='dspcoff' type='text' class='co-ps' value='${this.coff}'></td></tr>`;
		str+="</table><hr><br>"
		str+="<div class='co-bs' id='exportPro'>Export project</div>";
		str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class='co-bs' id='importPro'>Import project</div><br>";
		str+=`<br><p>All dimensions are in feet. When you change a size, the plan and 3D view will redraw to match.</p>
			<p>Projects are automatically save and loaded, but you can import and export specific projects using the button below.</p>`; 

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

// OPTIONS

	AddOption(side, name, params)																// ADD NEW OPTION TO SIDE						
	{
	}

	RemoveOption(side, name)																	// REMOVE OPTION FROM SIDE
	{
	}

	EditOption(side, name, params)																// EDIT OPTION
	{
	}

	DrawOption(side, name)																		// DRAW OTION ON PLAN	
	{
	}

	MoveOption(side, name, x, y)																// MOVE OPTION
	{
	}

	AlignOptions(side, names, style)															// ALIGN OPTIONS
	{
		//Top/Bottom/Center/Distribute Width
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
			{ name: "Single",   pic:"http://www.sweethome3d.com/models/window85x123.png" }, 
			{ name: "Double",   pic:"http://www.sweethome3d.com/models/katorlegaz/window-01.png" },
			{ name: "Picture",  pic:"http://www.sweethome3d.com/models/contributions/window_shop.png" },
			{ name: "Casement", pic:"http://www.sweethome3d.com/models/window85x123.png" },
			{ name: "Round",    pic:"http://www.sweethome3d.com/models/roundWindow.png" },
			{ name: "Half-round", pic:"http://www.sweethome3d.com/models/halfRoundWindow.png" },
			{ name: "Bay",      pic:"http://www.sweethome3d.com/models/contributions/pictureWindow.png" },
			{ name: "Arch",     pic:"http://www.sweethome3d.com/models/scopia/window_2x4_arched.png" }
			];
		this.door=[];
		this.wall=[];
		this.appliance=[];
		this.furniture=[];
		this.curOption="";
		this.curType="";
	}

	Picker(type, side, option)																	// EDIT OR ADD OPTION	
	{
		let s=type+" editor";																		// Edit message
		$("#opPicker").remove();																	// Remove any existing one
		if (!option) s="Add a new "+type.toLowerCase()+" to the "+side.toLowerCase()+" side";		// New message
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
		let o={ wid:48,hgt:24,dep:6,col:"White",mak:"Pella",mod:"353364-12",
				fwid:4,fhgt:2,fdep:3,fcol:"White" };
		let str=`<img src="${op.pic}" style='float:left;vertical-align:top;width:128px'>
		<br><br><br><br>&nbsp; <b>${op.name} ${type.toLowerCase()}</b><br><br>
		<table style='border-spacing:4px'>																			
		<tr><td colspan='6'><hr></td</tr>		
		<tr><td colspan='6'><b>${type.toUpperCase()}</b></td</tr>		
		<tr><td>Width:</td><td><input style='width:30px' id='eopwid' type='text' class='co-ps' value='${o.wid ? o.wid : ""}'></td>
		<td>Height:</td><td><input style='width:30px' id='eophgt' type='text' class='co-ps' value='${o.hgt ? o.hgt : ""}'></td>
		<td>Depth:</td><td><input style='width:30px'  id='eopdep' type='text' class='co-ps' value='${o.dep ? o.dep : ""}'></td></tr>
		<tr><td>Color:</td><td><input style='width:30px' id='eocol' type='text' class='co-ps' value='${o.col ? o.col : ""}'></td>
		<tr><td>Make:</td><td colspan='2'><input style='width:80px'</ id='eopmak' type='text' class='co-ps' value='${o.mak? o.mak : ""}'></td>
		<td colspan='3'>Model: <input style='width:80px'  id='eopmod' type='text' class='co-ps' value='${o.mod ? o.mod : ""}'></td></tr>
	
		<tr><td colspan='6'><b>FRAME</b></td</tr>		
		<tr><td>Width:</td><td><input style='width:30px' id='eopfwid' type='text' class='co-ps' value='${o.fwid ? o.fwid : ""}'></td>
		<td>Height:</td><td><input style='width:30px' id='eopfhgt' type='text' class='co-ps' value='${o.fhgt ? o.fhgt : ""}'></td>
		<td>Depth:</td><td><input style='width:30px'  id='eopfdep' type='text' class='co-ps' value='${o.fdep ? o.fdep : ""}'></td></tr>
		<tr><td>Color:</td><td><input style='width:30px' id='eofcol' type='text' class='co-ps' value='${o.fcol ? o.fcol : ""}'></td>
		<tr><td colspan='6'><b>PANES</b></td</tr>		
		<tr><td>Horizontal:</td><td><input style='width:30px' id='eopfwid' type='text' class='co-ps' value='${o.fwid ? o.fwid : ""}'></td>
		<td>Vertical:</td><td><input style='width:30px'  id='eopfdep' type='text' class='co-ps' value='${o.fdep ? o.fdep : ""}'></td></tr>
		</table><p><hr></p><div class='co-bs' id='eosave'>Save</div>&nbsp;&nbsp;&nbsp`;
		$("#opParams").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to body
		
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
