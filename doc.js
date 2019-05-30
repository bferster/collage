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
		this.spaces=[];																				// Reset
		this.planes=[];																				// Reset 
		this.models=[];																				// Reset
		var pos=this.InitPos();
		pos.sx=pos.sy=pos.sz=20;
		this.AddModel({ src:"assets/desk.dae", tex:"lib/wgl/map.jpg"},pos);
	}
	
	AddPlane(style, pos)																		// ADD A PLANE
	{
	} 

	AddLight(style, pos)																		// ADD A LIGHT
	{
	} 

	AddSpace(style, pos)																		// ADD A SPACE
	{
	} 

	AddModel(style, pos)																		// ADD A MODEL
	{
		this.models.push({ pos:pos, type:"model", style:style });									// Init object and add to doc
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

