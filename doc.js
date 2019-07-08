///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOC CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Doc {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.doc=this;																				// Set name
		this.models=[];																				// Holds models
		this.scenes=[];																				// Holds scenes
		this.Init();																				// Init
	}

	Init()																						// INIT DOC
	{
		this.models=[];																				// Models
		this.scenes=[];																				// Scenes
	}

	ProjectInit(tsv)																			// INIT NEW PROJECT
	{
		var i,v,data,pos,name,id;
		tsv=tsv.split("\n");																		// Split into lines
		pos=this.InitPos();	pos.y=150;	pos.z=500;	pos.sx=45;										// Default camera pos
		this.Add("Scene","camera", {}, pos, 100);													// Add scene camera
		for (i=1;i<tsv.length;++i) {																// For each line
			v=tsv[i].split("\t");																	// Split into fields
			if (!v[0])	continue;																	// Skip if no type
			name=v[1] ? v[1] : "";																	// Get name
			id=v[2]   ? v[2] : this.MakeUniqueID();													// Get Id or make a new one
			data=v[3] ? JSON.parse(v[3]) : {};														// Get style
			pos=v[4] ? JSON.parse(v[4]) : {};														// Get pos
			if (v[0] == "light")		this.Add(name, v[0], data, pos, id);						// Add light
			else if (v[0] == "model")	this.Add(name, v[0], data, pos, id);						// Model
			else if (v[0] == "panel")	this.Add(name, v[0], data, pos, id);						// Panel
			else if (v[0] == "space")	this.Add(name, v[0], data, pos, id);						// Space
			else if (v[0] == "iframe")	this.Add(name, v[0], data, pos, id);						// Iframe
			else if (v[0] == "group")	this.Add(name, v[0], data, pos, id);						// Group
			else if (v[0] == "scene")	this.AddScene(name, data, v[4] ? pos : [], id);				// Scene
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
	
	Add(name, type, style, pos, id)																// ADD AN OBJECT
	{
		var iPos=this.InitPos();																	// Identity pos
		for (var key in pos)		iPos[key]=pos[key];												// Extract new positions
		this.models.push( { pos:iPos, sPos:pos, style:style, name:name ? name: "", id:id, type:type } );	// Init object and add to doc
		if (type == "panel")				app.sc.AddPanel(style, iPos, id);						// Add panel to scene
		else if (type == "model")			app.sc.AddModel(style, iPos, id);						// Add model
		else if (type == "iframe")			app.sc.AddProxy(style, iPos, id);						// Add iframe
		else if (type == "space")			app.sc.AddRoom(style,  iPos, id);						// Add room
		else if (type == "group")			app.sc.AddGroup(style, iPos, id);						// Add group
		else if (type == "light")			app.sc.AddLight(style, iPos, id);						// Add light
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

	AddScene(name, data, keys, id)																// ADD A SCENE
	{
		var i;
		var o={ name:name ? name: "", id:id, layers:[] };											// Make new scene
		var sceneNum=this.scenes.length;															// Scene number
		o.keys=keys;																				// Add any keys
		o.style=data;																				// Add style data
		o.layers=data.layers;																		// Add any layers
		delete data.layers;																			// Remove layers from style
		this.scenes.push(o);																		// Add to doc
		if (!keys.length) {																			// If no keys
			app.tim.AddKey(sceneNum,"100",app.doc.InitPos(),-1);									// Add first key to camera
			for (i=0;i<o.layers.length;++i)															// For each layer
				app.tim.AddKey(sceneNum, o.layers[i],app.doc.InitPos(),-1);							// Add first key 
			}
	} 

	CalcPos(layer, time)																		// CALCULATE NEW POSITION FROM TIME
	{
		var pos=this.InitPos();
		return pos;
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

// SAVE & LOAD  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

	Save()																						// SAVE PROJECT
	{
		var i,d=[];
		var v=app.doc.MakeTabFile().split("\n");													// Split into rows
		for (i=0;i<v.length;++i)	d.push(v[i].split("\t"));										// For each row, add array of fields
		app.doc.SaveSpreadsheet(app.gid,d)															// Savr												
	}

	MakeTabFile()																				// MAKE TAB-DELINEATED FILE OF PROJECT
	{
		var i,o,s;
		var str="type\tname\tid\tdata\tpos\n";														// Add header
		for (i=1;i<this.models.length;++i) 															// For each model
			if (this.models[i].type == "light") makeRow(this.models[i])								// Save lights first
		for (i=1;i<this.models.length;++i) 															// For each model
			if (this.models[i].type != "light") makeRow(this.models[i])								// Save models second
		for (i=0;i<this.scenes.length;++i) {														// For each scene	
			o=this.scenes[i];																		// Point
			str+="scene\t";																			// Save type
			s=o.name;					str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";		// Save name
			s=o.id;						str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";		// Save id
			o.style.layers=o.layers;																// Add layers
			s=JSON.stringify(o.style);	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";		// Save style data
			delete o.style.layers;																	// Remove layers from style
			s=JSON.stringify(o.keys);	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t\n";	// Save key data
			}		
		
		function makeRow(o) {																		// MAKE TSV ROW
			var s=o.type;				str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";		// Save type
			s=o.name;					str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";		// Save name
			s=o.id;						str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";		// Save id
			s=JSON.stringify(o.style);	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";		// Save style data
			s=JSON.stringify(o.sPos);	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t\n";	// Save original pos data
			}		

		
		return str;
		}
	
	SaveSpreadsheet(id, data)																	// CLEAR AND SAVE DATA TO GDRIVE
	{
		if (!id)	return;																			// Quit if no id
		if (!document.URL.match(/https/i)) {														// Not secure
			PopUp("<b>Needs HTTPS!</b><br><br>Make sure you are running the secure version<br>(i.e. <b>https:</b>//viseyes.org/collage)",10);	// Show popup
			Sound("delete");																		// Sound
			return;
			}
		gapi.load('client:auth2', function() {														// Start oauto
				gapi.client.init({																	// Init
				apiKey: "AIzaSyD0jrIlONfTgL-qkfnMTNdjizsNbLBBjTk",									// Key
				clientId: "453812393680-8tb3isinl1bap0vqamv45cc5d9c7ohai.apps.googleusercontent.com", // Google client id 
				scope:"https://www.googleapis.com/auth/drive",										// Scope
				discoveryDocs:["https://sheets.googleapis.com/$discovery/rest?version=v4"],			// API discovery
				}).then(function () {																// When initted, listen for sign-in state changes.
					gapi.auth2.getAuthInstance().isSignedIn.listen(doIt);							// Try						
					doIt(gapi.auth2.getAuthInstance().isSignedIn.get());							// Try
		
					function doIt(isSignedIn) {														// Do action
						if (!isSignedIn) 															// If not signed in yet														
							gapi.auth2.getAuthInstance().signIn();									// Sign in
						else{																		// Clear and save
							var params= { spreadsheetId:id, range: "A1:ZZZ100000" };				// Where to save it
							var body= { majorDimension: "ROWS", values: data };						// Data to save
							var request=gapi.client.sheets.spreadsheets.values.clear(params);		// Clear first
							request.then(function(r) { 												// When cleared
								params.valueInputOption="RAW";										// Send raw data
								trace(body)
								var request=gapi.client.sheets.spreadsheets.values.update(params,body);	// Send new data
								request.then(function(r) {											// Good save
									Sound("ding");													// Ding
									PopUp("Project<br>copied to Google Drive");						// Show popup
									}, 
									function(e) { trace(e.result.error.message); })					// Error reporting for send
								}, 
							function(e) { trace(e.result.error.message); });						// Error reporting for clear
							}
					}			
				});
			});
	}

}	// DOC CLASS CLOSURE
