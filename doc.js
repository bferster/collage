///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOC CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Doc {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		this.lights=[];																				// Holds lights
		this.spaces=[];																				// Holds spaces
		this.planes=[];																				// Holds planes
		this.models=[];																				// Holds models
		this.Init();																				// Init
		}

	Init()																						// INIT DOC
	{
		this.lights=[];																				// Reset lights
		this.spaces=[];																				// Spaces
		this.planes=[];																				// Planes 
		this.models=[];																				// Models
var pos=this.InitPos();	pos.sx=1024; pos.sy=512; pos.sz=1024;	this.AddSpace({ type:"room", floor:"assets/wood.jpg" },pos);
var pos=this.InitPos();	pos.sx=pos.sy=pos.sz=20;	this.AddModel({ src:"assets/desk.dae", tex:"lib/wgl/map.jpg" },pos);
var pos=this.InitPos();	pos.col=0x222222; pos.rx=0; pos.ry=0; pos.rz=1;	this.AddLight({ type:"directional"}, pos );
var pos=this.InitPos();	pos.col=0xffffff;			this.AddLight({ type:"ambient" }, pos);
var pos=this.InitPos();	pos.sx=100;pos.sy=50;pos.cy=25;pos.cx=100;pos.ry=45;this.AddPlane({ type:"texture", src:"assets/america.jpg",wrap:false}, pos );
	}
	
	AddPlane(style, pos)																		// ADD A PLANE
	{
		this.planes.push({ pos:pos, style:style });													// Init object and add to doc
		app.sc.AddPlane(style, pos);																// Add to scene
	} 

	AddLight(style, pos)																		// ADD A LIGHT
	{
		this.lights.push({ pos:pos, style:style });													// Init object and add to doc
		app.sc.AddLight(style, pos);																// Add to scene
	} 

	AddSpace(style, pos)																		// ADD A SPACE
	{
		this.spaces.push({ pos:pos, style:style });													// Init object and add to doc
		if (style.type == "room")	app.sc.AddRoom(style, pos);										// Add to scene
	} 

	AddModel(style, pos)																		// ADD A MODEL
	{
		this.models.push({ pos:pos, style:style });													// Init object and add to doc
		app.sc.AddModel(style, pos);																// Add to scene
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


}	// DOC CLASS CLOSURE

