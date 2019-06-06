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
		var i,v,data,pos,name,npos;
		tsv=tsv.split("\n");																		// Split into lines
		for (i=1;i<tsv.length;++i) {																// For each line
			v=tsv[i].split("\t");																	// Split into fields
			if (!v[0])	continue;																	// Skip if no type
			data={};	pos=this.InitPos();		name="";											// Reset
			if (v[1])	name=v[1];																	// Name
			if (v[2])	data=JSON.parse(v[2]);														// Parse data field
			if (v[3])	npos=JSON.parse(v[3]);														// Parse pos field
			for (var key in npos)		pos[key]=npos[key];											// Extract new positions
			if (v[0] == "light")		this.AddLight(v[1], data,pos);								// Add light
			else if (v[0] == "model")	this.Add(v[1], v[0], data,pos);								// Model
			else if (v[0] == "panel")	this.Add(v[1], v[0], data,pos);								// Panel
			else if (v[0] == "space")	this.Add(v[1], v[0], data,pos);								// Space
		}
	}

	AddLight(name, style, pos)																		// ADD A LIGHT
	{
		this.lights.push({ pos:pos, style:style, name:name ? name: "" });							// Init object and add to doc
		app.sc.AddLight(style, pos);																// Add to scene
	} 

	Add(name, type, style, pos)																		// ADD AN OBJECT
	{
		this.models.push( { pos:pos, style:style, name:name ? name: "" } );							// Init object and add to doc
		if (type == "panel")		app.sc.AddPanel(style, pos);									// Add panel to scene
		if (type == "model")		app.sc.AddModel(style, pos);									// Add model
		if (style.type == "room")	app.sc.AddRoom(style, pos);										// Add room
	} 

	Remove(id)																					// REMOVE
	{
		if ((id >= 0) && (id < this.models.length)) {												// If valid range
			app.sc.DeleteObject(this.models[id].style.objId);										// Remove from scene
			this.models.splice(id,1);																// Remove from doc
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
		return pos;																					// Return object reference
	}

	FindModelFrom3D(name3D)																		// FIND INDEX OF MIODEL FROM 3D OBJECT'S NAME
	{
		var i;
		for (i=0;i<this.models.length;++i)															// For each model
			if (this.models[i].style.objId == name3D)	return i;									// Retun if match
		return -1;																					// No match
	}

	Load(id, callback) 																			// LOAD DOC FROM GOOGLE DRIVE
	{
		var _this=this;																				// Save context
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

}	// DOC CLASS CLOSURE

