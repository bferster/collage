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

	ProjectInit(tsv)																			// INIT NEW PROJECT
	{
		var i,v,data,pos,name,id;
		tsv=tsv.split("\n");																		// Split into lines
		this.models=[];																				// Clear models
		this.scenes=[];																				// Clear scenes
		this.settings={};																			// Clear settings
		app.sc.ClearScene();																		// Clear scene
		pos=this.InitPos();	pos.y=150;	pos.z=500;	pos.sx=45;										// Default camera pos
		this.Add("Scene","camera", {}, pos, 100);													// Add scene camera
		for (i=1;i<tsv.length;++i) {																// For each line
			v=tsv[i].split("\t");																	// Split into fields
			if (!v[0])	continue;																	// Skip if no type
			name=v[1] ? v[1] : "";																	// Get name
			id=v[2]   ? v[2] : this.MakeUniqueID();													// Get Id or make a new one
			data=v[3] ? JSON.parse(v[3]) : {};														// Get style
			pos=v[4] ? JSON.parse(v[4]) : {};														// Get pos
			if (v[0] == "light")		 	this.Add(name, v[0], data, pos, id);					// Add light
			else if (v[0] == "model")	 	this.Add(name, v[0], data, pos, id);					// Model
			else if (v[0] == "panel")	 	this.Add(name, v[0], data, pos, id);					// Panel
			else if (v[0] == "space")	 	this.Add(name, v[0], data, pos, id);					// Space
			else if (v[0] == "iframe")		this.Add(name, v[0], data, pos, id);					// Iframe
			else if (v[0] == "group")		this.Add(name, v[0], data, pos, id);					// Group
			else if (v[0] == "script")		this.Add(name, v[0], data, pos, id);					// Script
			else if (v[0] == "media")		this.Add(name, v[0], data, pos, id);					// Media
			else if (v[0] == "scene")	   	this.AddScene(name, data, v[4] ? pos : [], id);			// Scene
			else if (v[0] == "settings") 	this.settings=data;										// Settings
			}
		app.SetCurModelById();																		// Init model pointers
		this.InitScene(0);																			// Init scene
		app.Draw();																					// Redraw
	}

	InitScene(num)																				// INIT SCENE
	{
		var i,m,str="";
		var o=this.scenes[num].layers;																// Point at scene's layers
		for (i=0;i<this.models.length;++i) this.models[i].vis=0;									// Hide all layers
		for (i=0;i<o.length;++i) {																	// For each active layer
			if (!(m=this.FindModelById(o[i])))														// Point at layer
				continue;																			// Skip if null
			m.vis=1;																				// Set flag in pos object									
			}
		for (i=1;i<this.models.length;++i) {														// For each layers
			m=this.models[i];																		// Point at layer
			app.sc.SetVisibility(m.id,m.vis,m.pos.a)												// Hide or show layer
			}
		if (this.scenes[num].style.back) 															// If a background set
			str="<iframe id='mainBackIF' style='pointer-events:auto' frameborder=0 scrolling='no' height='"+$("#threeDiv").height()+"px' width='100%' src='"+this.scenes[num].style.back+"'/>"
		$("#mainBackDiv").html(str);																// Set iframe background
	}
	
	Add(name, type, style, pos, id)																// ADD AN OBJECT
	{
		var iPos=this.InitPos();																	// Identity pos
		for (var key in pos) iPos[key]=pos[key];													// Extract new positions
		this.models.push( { pos:iPos, sPos:pos, style:style, name:name ? name: "", id:id, type:type, vis:1 } );	// Init object and add to doc
		if (type == "panel")				app.sc.AddPanel(style, iPos, id);						// Add panel to scene
		else if (type == "model")			app.sc.AddModel(style, iPos, id);						// Add model
		else if (type == "iframe")			app.sc.AddProxy(style, iPos, id);						// Add iframe
		else if (type == "space")			app.sc.AddRoom(style,  iPos, id);						// Add room
		else if (type == "group")			app.sc.AddGroup(style, iPos, id);						// Add group
		else if (type == "light")			app.sc.AddLight(style, iPos, id);						// Add light
		else if (type == "media") {																	// Add/load media
			var o=this.FindModelById(id);															// Point at layer
			if (o.style.type == "audio") {															// If mp3
				app.media[o.id]={ type:"audio", start:style.start ? style.start-0 : 0  };			// Add media object
				app.media[o.id].obj=new Audio(ConvertFromGoogleDrive(o.style.src));					// Load mp3 file
				}
			}
		else if (type == "script") {																// Add script
			var xhr=new XMLHttpRequest();	xhr.open("GET",style.src);	 xhr.send();				// Ajax load
			xhr.onload=()=> {  this.ParseScript(xhr.responseText,style);   };		// When loaded
			}
	} 

	AddScene(name, data, keys, id)																// ADD A SCENE
	{
		var i,mod,pos;
		var o={ name:name ? name: "", id:id, layers:[] };											// Make new scene
		var sceneNum=this.scenes.length;															// Scene number
		o.keys=keys;																				// Add any keys
		o.style=data;																				// Add style data
		o.layers=data.layers;																		// Add any layers
		delete data.layers;																			// Remove layers from style
		this.scenes.push(o);																		// Add to doc
		if (!keys.some(e=> e.id.match(/100K/))) {													// If no camera
			pos=this.InitPos();	pos.y=150;	pos.z=500;	pos.sz=45;									// Camera pos
			}
		for (i=0;i<o.layers.length;++i)	{															// For each layer
			var rx=RegExp((""+o.layers[i]+"K").replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"));			// Search regex
			if (keys.some(e=> e.id.match(rx))) 			continue;									// Already has first key 					
			if (!(mod=this.FindModelById(o.layers[i])))	continue;									// Point at model
			pos=JSON.parse(JSON.stringify(mod.pos));												// Clone pos 
			}

	} 

	ParseScript(text, style)																	// PARSE TEXT TO INTERNAL CRIPT FORMAT
	{
		var i,j,o,v;
		if ((style.format != "WEBVTT") || !text) return [];											// If not right format or empty return null array
			text=text.replace(/\r/g,"");															// Remove CRs
		style.lines=[];																				// Create lines array
		var lines=text.split("\n");																	// Split by lines
		for (i=0;i<lines.length;++i) {																// For each
			if (!i || (lines[i] == ""))	{															// If blank or first, start new caption
				o={ s:0, e:0, w:"", h:"", t:"", c:"" };												// Blank line object	
				continue;																			// Skip
				}									
			if (lines[i].match(/--\>/)) {															// A time portion
				v=lines[i].split(" ");																// Get parts
				o.s= TimecodeToSeconds(v[0]);	o.e= TimecodeToSeconds(v[2]);						// Get start/end
				if (v.length > 2) 	o.style=v.slice(3).join(" ")									// If a style spec'd
				}	
			else if (o.s+o.e == 0) {																// A header line
				o.h=lines[i];																		// Add header
				continue;																			// Skip
				}
			else{																					// A text line
				v=lines[i].match(/(<.+>)(.+)/);														// Split tags from caption
				if (v[v.length-1])	o.t=v[v.length-1];												// Add  text
				for (j=1;j<v.length-1;++j)															// For each tag
					if (v[j].match(/<v /))	o.w=v[j].match(/<v (.+?)>/)[1];							// Get if a who
				style.lines.push(o);																// Add to style 
				}
			}		
		}

	CalcPos(layerId, keySet, time)																// CALCULATE NEW POSITION FROM TIME
	{
		var i,s,e,d,spos,epos,ease,pct=0;
		var pos=app.doc.InitPos();																	// Pos
		var keys=[];																				// Holds this layer's keys
		for (i=0;i<keySet.length;++i)  if ((""+keySet[i].id).match(layerId)) keys.push(i);			// Find only this layer's keys
		var e=keys.length-1;																		// End of keylist
		if (e < 0) 	return pos;																		// No keys yet
		for (s=e;s>0;--s)	if (keySet[keys[s]].time <= time) break;								// For each key, find starting key
		e=Math.min(e,s+1);																			// Get end
		d=(keySet[keys[e]].time-keySet[keys[s]].time);												// Get duration
		if (d) pct=Math.min((time-keySet[keys[s]].time)/d,1);										// % in move if a dur
		if (ease == 3)																				// Both
			pct=1.0-((Math.cos(3.1414*pct)+1)/2.0);													// Full cosine curve
		else if (ease = 1)																			// Slow in
			pct=1.0-(Math.cos(1.5707*pct));															// 1st quadrant of cosine curve
		else if (ease == 2)																			// Slow out
			pct=1.0-(Math.cos(1.5707+(1.5707*pct))+1.0);											// 2nd quadrant of cosine curve
		pct=Math.min(Math.max(pct,0),1);															// Cap 0-1

		spos=keySet[keys[s]].pos;		epos=keySet[keys[e]].pos;									  // Get start/end pos
		pos.x=calc(spos.x,epos.x);		pos.y=calc(spos.y,epos.y);		pos.z=calc(spos.z,epos.z);	  // Position
		pos.sx=calc(spos.sx,epos.sx);	pos.sy=calc(spos.sy,epos.sy);	pos.sz=calc(spos.sz,epos.sz); // Scale
		pos.rx=calc(spos.rx,epos.rx);	pos.ry=calc(spos.ry,epos.ry);	pos.rz=calc(spos.rz,epos.rz); // Rotation
		pos.cx=calc(spos.cx,epos.cx);	pos.cy=calc(spos.cy,epos.cy);	pos.cz=calc(spos.cz,epos.cz); // Center
		pos.a=calc(spos.a,epos.a);		pos.ease=spos.ease;											  // Alpha / ease
		function calc(a, b) {return a+((b-a)*pct); }												// CALC FACTOR
		return pos;
	}

	
// HELPERS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
		str+="settings\t\t\t"+JSON.stringify(this.settings)+"\t\n";									// Settings row
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
		gapi.load('client:auth2', function() {														// Start oauth
			gapi.client.init({																		// Init
				apiKey: app.doc.apiKey, clientId: app.doc.clientId,									// Key and client ID
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

	GetSpreadsheet(allFiles, callback)															// RUN GDRIVE PICKER
	{
		if (!document.URL.match(/https/i)) {														// Not secure
			PopUp("<b>Needs HTTPS!</b><br><br>Make sure you are running the secure version<br>(i.e. <b>https:</b>//viseyes.org/collage)",10);	// Show popup
			Sound("delete");																		// Sound
			return;
			}
		var oauthToken,pickerApiLoaded=false;
		gapi.load('auth', { callback: function() {													// LOAD AUTH
			window.gapi.auth.authorize({															// Authorize
				apiKey: app.doc.apiKey, client_id: app.doc.clientId,								// Key and client ID
				scope:"https://www.googleapis.com/auth/drive",immediate: false },					// Params
					function(authResult) {															// On auth return
						if (authResult && !authResult.error) {										// If OK
							oauthToken=authResult.access_token;										// Set token
							createPicker();															// Create picker
							}
					});																				// End auth.authorize()
				}																					// End callback()
			});																						// End auth()
			
		gapi.load('picker', {'callback': function() {												// LOAD PICKER							
				pickerApiLoaded=true;																// Set flag
				createPicker();																		// Create picker
				}
			});
		
		function createPicker() {																	// CREATE GDRIVE PICKER
			if (pickerApiLoaded && oauthToken) {													// If loaded and authed
				var view=new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).				// Make view
				setOwnedByMe(allFiles).setIncludeFolders(true);										// Params
				var picker=new google.picker.PickerBuilder().										// Make picker
					addView(view).setOAuthToken(oauthToken).										// Params
					setDeveloperKey(app.doc.apiKey).setCallback(pickerCallback).build();			// Do it
				picker.setVisible(true);															// Show picker
				}
			}
	
		function pickerCallback(data) {																// FILE CHOSEN CALLBACK
			if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {				// If picked
				var doc=data[google.picker.Response.DOCUMENTS][0];									// Get doc
				callback(doc.id,doc.name);															// Return name and id
				}
			}
	}																								// End closure
	
}	// DOC CLASS CLOSURE
