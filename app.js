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
		this.planScale=1;
		this.planPos={ left:0,top:0 };																// Scoll position of plan														

		$("#rightDiv,#sizerDiv,#planDiv,#botRightDiv").on("mousedown touchdown touchmove wheel", (e)=> { e.stopPropagation() } );	// Don't move orbiter in menus
	
		var url=window.location.search.substring(1);						   						// Get query string
		if (url) {
			if (url.match(/gid=/i)) 	this.gid=url.split("&")[0].substr(4);						// If params have a 'gid=' tag, use it
			else						this.gid=url;												// Default spreadsheet
			}
		let w=$("#planDiv").width();
		let h=$("#planDiv").height();
		let str=`<div class='co-plan' id='planBase'><svg id="planSVG" width="${w}" height="${h}"> viewbox="0 0 ${w} ${h}</svg></div>`;
		$("#planDiv").html(str);																	// Add to div
		$("#planBase").draggable({ stop:()=>{														// ON DRAG STOP
				this.planPos.left+=$("#planBase").offset().left;									// Reset x
				this.planPos.top+=$("#planBase").offset().top;										// Y
				$("#planBase").css({top:0,left:0});													// Back to start
				this.DrawGrid();																	// Draw grid
				this.DrawSide();																	// Draw side
				}	
			});
		this.doc.ProjectInit();																		// Init project
		this.Draw();																				// Start 
	}

	Draw() 																						// REDRAW
	{
		this.DrawTopMenu(0);																		// Draw top menu
		this.planPos={ left:0,top:0 };																// Srcoll position of plan														
		this.DrawGrid();																			// Draw grid
		this.DrawSide();																			// Draw side
		this.sc.Render();																			// Render scene and animate
	}

	DrawGrid()																					// DRAW PLAN GRID
	{
		let e;
		let w=$("#planDiv").width();
		let h=$("#planDiv").height();
		let inc=w/50*this.planScale;
		let pos=0;
		$("#planSVG").empty();

		while (pos < h) {
			e=MakeSVG("line", { x1:-2000, y1:pos, x2:2000, y2:pos, stroke:"#999","stroke-width":.5})
			$("#planSVG")[0].appendChild(e);
			pos+=inc;
			}
		pos=0;
		while (pos < w) {
			e=MakeSVG("line", { y1:0, x1:pos, y2:"100%", x2:pos, stroke:"#999","stroke-width":.5})
			$("#planSVG")[0].appendChild(e);
			pos+=inc;
			}
		}

		DrawSide()
		{
			let x=this.planPos.left*this.planScale;
			let y=this.planPos.top*this.planScale;
			let e=MakeSVG("polygon",{points:`${x+100},${y+50} ${x+500},${y+50} ${x+500},${y+300} ${x+100},${y+300} ${x+100},${y+50}`,fill:"#fff", stroke:"#000"})
			$("#planSVG")[0].appendChild(e);
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
		var o=app.doc.InitPos();																	// Point at pos
		str+="<br><br>Choose side to edit &nbsp;"+MakeSelect("sidePicker",false,["Front","Back","Head","Tail","Roof","Floor","Cupula"]);	// Choose side
		
		str+="<table style='text-align:center;margin:4px'><tr><td></td><td>x</td><td>y</td><td>z&nbsp;&nbsp;&nbsp;</td></tr>";	// Header
		str+="<tr><td style='text-align:left'>Position&nbsp;</td><td>"+MakeNum(1,o.x,0,o.pl)+"</td><td>"+MakeNum(2,o.y,0,o.pl)+"</td><td>"+MakeNum(3,o.z,0,o.pl);
		str+="&nbsp;<img id='loc-pl' style='cursor:pointer' src='img/"+(o.pl ? "" :"un")+"lock.png'</td></tr>"
			str+="<tr><td style='text-align:left'>Opacity&nbsp;</td><td>"+MakeNum(16,o.a,2,o.al);
			str+="<td colspan='2'>Eases&nbsp;&nbsp;"+MakeSelect("cm-ease",false,["None", "In", "Out", "Both"],o.ease,null,[0,1,2,3])+"</td></td></tr>";
			str+="<tr><td style='text-align:left'>Name</td><td colspan='3'><input style='width:200px' id='cm-name' value='Scene' type='text' class='co-is'></td></tr>";
		str+="</table></div>";																		// End table
		str+="<div class='co-menuHeader'>Estimated cost</div>";										// Header
		str+="<table>";																				// Header
		str+="<tr><td><b>This side:</b></td><td>$1,500</td</tr>"
		str+="<tr><td><b>Entire project:&nbsp;&nbsp;&nbsp;</b></td><td>$8,500</td</tr>"
		str+="</table>";																		// End table

		$("#rightDiv").html(str);																	// Add to div
		

		$("#sidePicker").on("change", ()=>{});

		function MakeNum(id, num, places, lock) {													// Make number box
			num=num.toFixed(places);																// Convert
			return "<input id='cm-"+id+"'value='"+num+"'"+(lock ? " disabled ": "")+"type='text' class='co-num'>";	// Return input				
			}
	}

	DrawSettingMenu()																			// DRAW SETTING MENU 
	{
		var str=TabMenu("topTabMenu",this.menuOps,this.topMenuTab);									// Add tab menu
		str+="<p>This area will have options to set the various overall parameters of the design, as well asc save and load projects to our server.</p>" 
		str+="<table style='margin:8px 8px'>";														// End scene 
		str+="<tr><td>Width</td><td><input style='width:40px' id='dssGid' type='text' class='co-ps' value='10'> feet</td></tr>";
		str+="<tr><td>Height</td><td><input style='width:40px' id='dssGid' type='text' class='co-ps' value='7'> feet</td></tr>";
		str+="<tr><td>Length</td><td><input style='width:40px' id='dssGid' type='text' class='co-ps' value='30'> feet</td></tr>";
		str+="</table><hr><br>&nbsp;&nbsp;&nbsp;<div class='co-bs' id='loadPro'>Load project</div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class='co-bs' id='savePro'>Save project</div>";
		$("#rightDiv").html(str);																	// Add to div

		$("#loadPro").on("click", function() {														// ON LOAD
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
