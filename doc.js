///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CDOC CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Doc {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.doc=this;																				// Set name
		this.models=[];																				// Holds models
		this.scenes=[];																				// Holds scenes
		this.settings={};																			// Holds settings
		this.apiKey="AIzaSyD0jrIlONfTgL-qkfnMTNdjizsNbLBBjTk";										// Google API hey
		this.clientId="453812393680-8tb3isinl1bap0vqamv45cc5d9c7ohai.apps.googleusercontent.com";	// Google client id 
	
	}

	ProjectInit()																			// INIT NEW PROJECT
	{
		this.models=[];																				// Clear models
		this.scenes=[];																				// Clear scenes
		this.settings={};																			// Clear settings
		app.sc.ClearScene();																		// Clear scene
		app.sc.AddModel();																			// Add model to scene
	}


// HELPERS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

	FindModelById(id, o)																		// FIND MODEL FROM ID
	{
		var i;
		if (!o)	o=this.models;																		// Look in models
		for (i=0;i<o.length;++i)																	// For each item
			if (o[i].id == id)	 return o[i];														// If a match, return model
		return null;																				// Not found
	}
	
	FindPosById(id, o)																			// FIND POS FROM ID
	{
		var i;
		if (!o)	o=this.models;																		// Look in models
		for (i=0;i<o.length;++i)																	// For each item
			if (o[i].id == id)	 return o[i].pos;													// If a match, return pos
		return null;																				// Not found
	}


	InitPos(pos)																				// INIT POS OBJECT
	{
		if (!pos) 		pos={};																		// Make object if null
		pos.x=0;		pos.y=0;		pos.z=0;													// Position
		pos.rx=0;		pos.ry=0;		pos.rz=0;													// Rotation
		pos.sx=1;		pos.sy=1;		pos.sz=1;													// Scale
		pos.cx=0;		pos.cy=0;		pos.cz=0;													// Center
		pos.col="#000000";	pos.a=1;	pos.ease=0;													// Color / alpha / ease
		pos.pl=pos.cl=pos.sl=pos.rl=pos.al=0;														// Locks
		return pos;																					// Return object reference
	}

	CopyPos(from, to)																			// COPY POS OBJECT
	{
		to=JSON.parse(JSON.stringify(from));														// Clone
		return to;																					// Return object reference
	}

// SAVE & LOAD  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	
}	// DOC CLASS CLOSURE
