///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOC CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Doc {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.doc=this;
		this.lights=[];																				// Holds lights
		this.models=[];																				// Holds models
		this.Init();																				// Init
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
		this.Add("Scene","Camera",{}, pos, 100);													// Add scene camera
		for (i=1;i<tsv.length;++i) {																// For each line
			v=tsv[i].split("\t");																	// Split into fields
			if (!v[0])	continue;																	// Skip if no type
			name=v[1] ? v[1] : "";																	// Get name
			data=v[2] ? JSON.parse(v[2]) : {};														// Get style
			npos=v[3] ? JSON.parse(v[3]) : {};														// Get pos
			id=this.MakeUniqueID();																	// Make up unique id
			pos=this.InitPos();																		// Identity pos
			for (var key in npos)		pos[key]=npos[key];											// Extract new positions
			if (v[0] == "light")		this.AddLight(name,  data, pos, id);						// Add light
			else if (v[0] == "model")	this.Add(name, v[0], data, pos, id);						// Model
			else if (v[0] == "panel")	this.Add(name, v[0], data, pos, id);						// Panel
			else if (v[0] == "space")	this.Add(name, v[0], data, pos, id);						// Space
			else if (v[0] == "iframe")	this.Add(name, v[0], data, pos, id);						// Iframe
		}
	}

	AddLight(name, style, pos, id)																// ADD A LIGHT
	{
		this.lights.push({ pos:pos, style:style, name:name ? name: "", id:id});						// Init object and add to doc
		app.sc.AddLight(style, pos, id);															// Add to scene
	} 

	Add(name, type, style, pos, id)																// ADD AN OBJECT
	{
		this.models.push( { pos:pos, style:style, name:name ? name: "", id:id } );					// Init object and add to doc
		if (type == "panel")				app.sc.AddPanel(style, pos, id);						// Add panel to scene
		else if (type == "model")			app.sc.AddModel(style, pos, id);						// Add model
		else if (type == "iframe")			app.sc.AddProxy(style, pos, id);						// Add iframe
		else if (style.type == "room")		app.sc.AddRoom(style, pos, id);							// Add room

	} 

	Remove(ix)																					// REMOVE
	{
		if ((ix >= 0) && (ix < this.models.length)) {												// If valid range
			app.sc.DeleteObject(this.models[ix].style.objId);										// Remove from scene
			this.models.splice(ix,1);																// Remove from doc
			}
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

// FINDERS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	FindModelFrom3D(name3D)																		// FIND INDEX OF MIODEL FROM 3D OBJECT'S NAME
	{
		var i;
		for (i=0;i<this.models.length;++i)															// For each model
			if (this.models[i].style.objId == name3D)	return i;									// Retun if match
		return -1;																					// No match
	}
	
	FindById(id, o)																				// FIND INDEX FROM ID
	{
		var i;
		if (!o)	o=this.models;																		// Look in models
		for (i=0;i<o.length;++i)																	// For each item
			if (o.id[i] == id)	 return i;															// If a match return index
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

}	// DOC CLASS CLOSURE

