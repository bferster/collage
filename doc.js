///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOC CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Doc {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		this.lights=[];																				// Holds lights
		this.models=[];																				// Holds models
		this.Init();																				// Init
		this.tree=null;																				// Holds scene tree
	}

	Init()																						// INIT DOC
	{
		this.lights=[];																				// Reset lights
		this.models=[];																				// Models
	}

	ProjectInit(tsv)																			// INIT NEW PROJECT
	{
		var i,v,data,pos,name,id,npos;
		tsv=tsv.split("\n");																		// Split into lines
		pos=this.InitPos();	pos.y=150;	pos.z=500;	pos.sx=45;										// Default camera pos
		this.Add("Scene","camera",{ objId:"camera" }, pos, 100);									// Add scene camera
		for (i=1;i<tsv.length;++i) {																// For each line
			v=tsv[i].split("\t");																	// Split into fields
			if (!v[0])	continue;																	// Skip if no type
			name=v[1] ? v[1] : "";																	// Get name
			data=v[2] ? JSON.parse(v[2]) : {};														// Get style
			npos=v[3] ? JSON.parse(v[3]) : {};														// Get pos
			id=this.MakeUniqueID();																	// Make up unique id
			pos=this.InitPos();																		// Identity pos
			for (var key in npos)		pos[key]=npos[key];											// Extract new positions
			if (v[0] == "light")		this.AddLight(name, v[0],  data, pos, id);					// Add light
			else if (v[0] == "model")	this.Add(name, v[0], data, pos, id);						// Model
			else if (v[0] == "panel")	this.Add(name, v[0], data, pos, id);						// Panel
			else if (v[0] == "space")	this.Add(name, v[0], data, pos, id);						// Space
			else if (v[0] == "iframe")	this.Add(name, v[0], data, pos, id);						// Iframe
		}
		app.Draw();																					// Redraw
	}

	AddLight(name, type, style, pos, id)														// ADD A LIGHT
	{
		this.lights.push({ pos:pos, style:style, name:name ? name: "", id:id, type:type});			// Init object and add to doc
		app.sc.AddLight(style, pos, id);															// Add to scene
	} 

	Add(name, type, style, pos, id)																// ADD AN OBJECT
	{
		this.models.push( { pos:pos, style:style, name:name ? name: "", id:id, type:type } );		// Init object and add to doc
		if (type == "panel")				app.sc.AddPanel(style, pos, id);						// Add panel to scene
		else if (type == "model")			app.sc.AddModel(style, pos, id);						// Add model
		else if (type == "iframe")			app.sc.AddProxy(style, pos, id);						// Add iframe
		else if (style.type == "room")		app.sc.AddRoom(style, pos, id);							// Add room
		else if (type == "group")			app.sc.AddGroup(style, pos, id);						// Add group
	} 

	InitPos(pos)																				// INIT POS OBJECT
	{
		if (!pos) 		pos={};																		// Make object if null
		pos.x=0;		pos.y=0;		pos.z=0;													// Position
		pos.rx=0;		pos.ry=0;		pos.rz=0;													// Rotation
		pos.sx=1;		pos.sy=1;		pos.sz=1;													// Scale
		pos.cx=0;		pos.cy=0;		pos.cz=0;													// Center
		pos.col="#000000";				pos.a=1;													// Color / alpha
		pos.pl=pos.cl=pos.sl=pos.rl=pos.al=0;														// Locks
		return pos;																					// Return object reference
	}

	Load(id, callback) 																			// LOAD DOC FROM GOOGLE DRIVE
	{
		var str="https://docs.google.com/spreadsheets/d/"+id+"/export?format=tsv";					// Access tto
		var xhr=new XMLHttpRequest();																// Ajax
		xhr.open("GET",str);																		// Set open url
		xhr.send();																					// Do it
		xhr.onload=function() { 																	// When loaded
			var tsv=xhr.responseText.replace(/\r/g,"");												// Remove CRs
			if (callback)	callback(tsv);															// Run callback
		};									

		xhr.onreadystatechange=function(e) { 														// ON AJAX STATE CHANGE
			if ((xhr.readyState === 4) && (xhr.status !== 200)) {  									// Ready, but no load
				Sound("delete");																	// Delete sound
				PopUp("<p style='color:#990000'><b>Couldn't load Google Doc!</b></p>Make sure that <i>anyone</i><br>can view it in Google",5000); // Popup warning
				}
			};		
		}

// HELPERS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	FindModelFrom3D(name3D)																		// FIND INDEX OF MIODEL FROM 3D OBJECT'S NAME
	{
		var i;
		for (i=0;i<this.models.length;++i)															// For each model
			if (this.models[i].style.objId == name3D)	return i;									// Retun if match
		return 0;																					// No match
	}
	
	FindById(id, o)																				// FIND INDEX FROM ID
	{
		var i;
		if (!o)	o=this.models;																		// Look in models
		for (i=0;i<o.length;++i)																	// For each item
			if (o[i].id == id)	 return i;															// If a match return index
		return -1;																					// Not found
	}
	
	MakeUniqueID(o)																				// MAKE UNIQUE ID NUMBER
	{
		var i,id;
		if (!o)	o=this.models;																		// Look in models
		for (id=101;id<1000;++id) {																	// Look from 101 - 1000
			for (i=0;i<o.length;++i)																// For each item
				if (o[i].id == id)	 break;															// If a match quit looking
			if (o.length == i)	return	id;															// Return id
			}
		return -1;																					// Not found
	}

	Remove(ix)																					// REMOVE
	{
		if ((ix >= 0) && (ix < this.models.length)) {												// If valid range
			app.sc.DeleteObject(this.models[ix].style.objId);										// Remove from scene
			this.models.splice(ix,1);																// Remove from doc
			}
	} 

}	// DOC CLASS CLOSURE

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TREE  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Tree {

	constructor()  																	// CONSTRUCTOR
	{
		this.Init();																	// Init tree
	}

	Init(id) 																			// INIT TREE
	{
		var i,oo;
		var _this=this;																	// Save context		
		var o=app.doc.models[0];														// Point at root												
		if (!o)	return;																	// If invalid, quit
		var str="<ul><li class='parent active'><a id='tr-"+o.id+"'>"+o.name+"</a></li>"; // Add root tree node
		$("#treeDiv").html(str+"</ul>");												// Add to tree div
		this.AddChildren($("#tr-"+o.id),0);												// Add children to tree
		for (i=1;i<app.doc.models.length;++i) {											// For each model
			oo=app.doc.models[i];														// Point at  model
//			if (!app.doc.FindLobById(oo.parent))										// If no parent
				str+="<ul><li><a id='tr-"+oo.id+"'>"+oo.name+"</a></li></ul>";			// Add to tree
			}
		$("#tr-"+o.id).parent().children('ul').slideToggle('fast');            			// Open course
		$("[id^=tr-]").draggable( {	revert:true, delay:500 });							// Make lines draggable to change spotin tree
		$("[id^=tr-]").droppable( {														// Make lines droppable 
			drop: function(e,ui) {														// On drop
				var mode=e.shiftKey ? "move" : "shift";									// Move or shift
				app.Do();																// Save for undo
//				app.doc.ChangeOrder(ui.draggable[0].id.substr(3),e.target.id.substr(3),mode); // Rearrange
				_this.Init(ui.draggable[0].id.substr(3));								// Re-init tree	
				Sound("ding");															// Ding
				}
		});

		if (id != undefined) this.Open(id);	

		$('.co-tree li > a').on("click", function(e) {									// ON CLICK OF NODE TEXT
			_this.handleTreeClick($(this),e);  											// Handle
			Sound("click"); 															// Click
			});      
	}

	Open(id)																		// OPEN TREE AT ID
	{
		var i;
		var row=$("#tr-"+id);															// Row
		var par=row.parent();															// Point at previous line
		$('.co-tree li a').each( function() {                          					// For each line
			$(this).css({"color":"#000","font-weight":"normal"});      					// Normal
			}); 
		row.css({"color":"#009900","font-weight":"bold"});          					// Bold and green   
		for (i=0;i<20;++i) {															// Iterate upwards
			if ($(par).attr("class") == "co-tree")	break;								// Quit at top of tree
			if ($(par).attr("class") == "parent") {										// Has children
				par.addClass('active');                         						// Active class on 
				par.children('ul').slideToggle('fast');            						// Slide into place
				}
			par=par.parent();															// Up a level
			}
	}

	handleTreeClick(row, e)																// HANDLE TREE CLICK
	{
		if (e.offsetX < 12) {                                         				  		// In icon
			row.parent().toggleClass('active');                         					// Toggle active class on or off
			row.parent().children('ul').slideToggle('fast');            					// Slide into place
			}
		else{																				// In text
			$('.co-tree li a').each( function() {                          					// For each line
				$(this).css({"color":"#000","font-weight":"normal"});      					// Normal
				}); 
			row.css({"color":"#009900","font-weight":"bold"});          					// Bold and green   
			this.curRow=row;																// Save row
			this.curPaneId=e.target.id.substr(3);											// Save pane id
			app.curModel=app.doc.FindById(this.curPaneId);									// Set current model
			app.DrawTopMenu();																// Redraw menu
			}
		}

	AddChildren(row, id) 																// ADD CHILDREN TO TREE RECURSIVELY
	{
		var i,o,oo;
		if (id < 0)	return;																	// Invalid index
		var o=app.doc.models[id];															// Point at parent												
		if (!o)	return;																		// If invalid, quit
		if (!o.children)	return;															// Quit if no children
		var str="<ul style='display:none'>";												// Wrapper
		for (i=0;i<o.children.length;++i) {													// For each child
			str+="<li";																		// Start row
			oo=app.doc.models[o.kids[i]];													// Point at child model via index
			if (oo.children.length)	str+=" class='parent'"									// Add parent if it has children
			str+="><a id='tr-"+oo.id+"'>"+oo.name;											// Add index and name
			str+"</a></li>";																// Add label
			}
		row.after(str+"</ul>");																// Add to tree
		for (i=0;i<o.children.length;++i) {													// For each child
			row=$("#tr-"+o.children[i])
			this.AddChildren(row,o.kids[i]);												// Recurse
			}
		}
}																							// Class closure
