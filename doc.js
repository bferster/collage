///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOC CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Doc {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.doc=this;																				// Set name
		this.lights=[];																				// Holds lights
		this.models=[];																				// Holds models
		this.scenes=[];																				// Holds scenes
		this.Init();																				// Init
	}

	Init()																						// INIT DOC
	{
		this.lights=[];																				// Reset lights
		this.models=[];																				// Models
		this.scenes=[];																				// Scenes
	}

	ProjectInit(tsv)																			// INIT NEW PROJECT
	{
		var i,v,data,pos,name,id,npos,type;
		tsv=tsv.split("\n");																		// Split into lines
		pos=this.InitPos();	pos.y=150;	pos.z=500;	pos.sx=45;										// Default camera pos
		this.Add("Scene","camera", {}, pos, 100);													// Add scene camera
		for (i=1;i<tsv.length;++i) {																// For each line
			v=tsv[i].split("\t");																	// Split into fields
			if (!v[0])	continue;																	// Skip if no type
			name=v[1] ? v[1] : "";																	// Get name
			id=v[2]   ? v[2] : this.MakeUniqueID();													// Get Id or make a new one
			data=v[3] ? JSON.parse(v[3]) : {};														// Get style
			npos=v[4] ? JSON.parse(v[4]) : {};														// Get pos
			pos=this.InitPos();																		// Identity pos
			for (var key in npos)		pos[key]=npos[key];											// Extract new positions
			if (v[0] == "light")		this.AddLight(name, v[0],  data, pos, id);					// Add light
			else if (v[0] == "model")	this.Add(name, v[0], data, pos, id);						// Model
			else if (v[0] == "panel")	this.Add(name, v[0], data, pos, id);						// Panel
			else if (v[0] == "space")	this.Add(name, v[0], data, pos, id);						// Space
			else if (v[0] == "iframe")	this.Add(name, v[0], data, pos, id);						// Iframe
			else if (v[0] == "group")	this.Add(name, v[0], data, pos, id);						// Group
			else if (v[0] == "scene")	this.AddScene(name, data, id);								// Scene
			}
		app.SetCurModelById();																		// Init model pointers
		this.InitScene(0);																			// Init scene
		app.Draw();																					// Redraw
	}

	InitScene(num)																				// INIT SCENE
	{
		var i,m;
		var o=this.scenes[num].layers;																// Point at scene's layers
		for (i=0;i<this.models.length;++i) this.models[i].pos.vis=0;								// Hide all layers
		for (i=0;i<o.length;++i) {																	// For each active layer
			m=this.models[this.FindById(o[i])];														// Point at layer
			m.pos.vis=1;																			// Set flag in pos object									
			}
		for (i=1;i<this.models.length;++i) {														// For each layers
			m=this.models[i];																		// Point at layer
			app.sc.SetVisibility(m.id,m.pos.vis,m.pos.a)											// Hide or show layer
			}
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
		pos.col="#000000";	pos.vis=1;	pos.a=1;													// Color / visibility/ alpha
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

	AddScene(name, data, id)																	// ADD A SCENE
	{
		var o={ name:name ? name: "", id:id, layers:[] };											// Make new scene
		for (var key in data)		o[key]=data[key];												// Add elements
		this.scenes.push(o);																		// Add to doc
	} 
	
// HELPERS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	
	FindById(id, o)																				// FIND INDEX FROM ID
	{
		var i;
		if (!o)	o=this.models;																		// Look in models
		for (i=0;i<o.length;++i){																	// For each item
			if (o[i].id == id)	 return i;															// If a match return index
		}
		return -1;																					// Not found
	}
	
	MakeUniqueID(o)																				// MAKE UNIQUE ID NUMBER
	{
		var i,id,o;
		if (!o)	o=this.models;																		// Assume models
		var d=new Date().toISOString();																// Get ISO date
		var prefix=d.substr(2).replace(/-|T/g,"").substr(0,8)+'-';									// Simplify to YR|MO|DY|-
		for (id=0;id<1000;++id) {																	// Look from 0 - 1000
			for (i=0;i<o.length;++i)																// For each item
				if (o[i].id == prefix+id)	break;													// If a match quit looking
			if (o.length == i)				return	prefix+id;										// Return id
			}
		return -1;																					// Not found
	}

	Remove(ix)																					// REMOVE
	{
		if ((ix >= 0) && (ix < this.models.length)) {												// If valid range
			app.sc.DeleteObject(this.models[ix].id);												// Remove from scene
			this.models.splice(ix,1);																// Remove from doc
			}
	} 

}	// DOC CLASS CLOSURE
