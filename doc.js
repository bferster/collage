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
var pos=this.InitPos();	pos.col=0xffffff;								this.AddLight({ type:"ambient" }, pos);
var pos=this.InitPos();	pos.col=0x222222; pos.rx=0; pos.ry=0; pos.rz=1;	this.AddLight({ type:"directional"}, pos );
var pos=this.InitPos();	pos.sx=pos.sy=pos.sz=20;						this.Add("model",{ src:"assets/desk.dae", tex:"lib/wgl/map.jpg" },pos);
var pos=this.InitPos();	pos.sx=1024; pos.sy=512; pos.sz=1024;	this.Add("space",{ type:"room", floor:"assets/wood.jpg" },pos);
var pos=this.InitPos();	pos.sx=100;pos.sy=50;pos.cy=25;pos.cx=100;pos.ry=45;this.Add("panel",{ type:"texture", src:"assets/america.jpg",wrap:false}, pos );
	}
	
	AddLight(style, pos)																		// ADD A LIGHT
	{
		this.lights.push({ pos:pos, style:style });													// Init object and add to doc
		app.sc.AddLight(style, pos);																// Add to scene
	} 

	Add(type, style, pos)																		// ADD AN OBJECT
	{
		this.models.push( { pos:pos, style:style, name:"" } );										// Init object and add to doc
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
		pos.cx=0;		pos.cy=0;		pos.cz=0;													// Center
		pos.rx=0;		pos.ry=0;		pos.rz=0;													// Rotation
		pos.sx=1;		pos.sy=1;		pos.sz=1;													// Scale
		pos.col="000000";				pos.a=1;													// Color / alpha
		return pos;																					// Return object reference
	}

	FindModelFrom3D(name3D)																		// FIND INDEX OF MIODEL FROM 3D OBJECT'S NAME
	{
		var i;
		for (i=0;i<this.models.length;++i)															// For each model
			if (this.models[i].style.objId == name3D)	return i;									// Retun if match
		return -1;																					// No match
	}


}	// DOC CLASS CLOSURE

