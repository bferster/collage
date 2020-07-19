///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3D SYSTEM
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Scene {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		app.sc=this;																				// Make access variable
		this.lastTime=0;																			// Used to throttle rendring
		this.container=$("#"+div)[0];																// Div container														
		this.camera=null;																			// Camera object
		this.renderer=null;																			// Renderer object
		this.scene=null;																			// Scene object
		this.controls=null;																			// Controls object
		this.aniTimer=0;																			// Timer for talking and fidgeting
		this.transMat;	this.transRot=[0,0,0];														// Transform control				
		this.raycaster=new THREE.Raycaster();														// Alloc raycaster	
		this.Init();																				// Init 3D system
	}

	Init()																						// INIT 3D SYSTEM
	{
		this.scene=new THREE.Scene();																// Alloc new scene
		this.manager=new THREE.LoadingManager();													// Loading manager
		this.textureLoader=new THREE.TextureLoader();												// Texture loader
		this.AddCamera(0,150,500,45);																// Add camera
		this.renderer=new THREE.WebGLRenderer({ antialias: true, alpha:true });						// Init renderer
		this.renderer.setPixelRatio(window.devicePixelRatio);										// Set ratio
		this.Resize();																				// Resize 3D space
		this.container.appendChild(this.renderer.domElement);										// Add to div
	}
	
	ClearScene()																				// CLEAR ALL CONTENT FROM SCENES
	{
		this.scene.remove.apply(this.scene, this.scene.children);									// Remove 3D scene children
	}

	MoveByMatrix(name, mat)																		// MOVE OBJECT TO MATRIX
	{
		var obj=this.scene.getObjectByName(name);													// Get object
		obj.matrix.identity();																		// Move to identity
		obj.applyMatrix(mat);																		// Set new matrix
	}
	
	AddLight(style, pos, id)																	// ADD LIGHT
	{
		var light;
		if (style.type == "directional") {															// Directional light															
			light=new THREE.DirectionalLight(pos.col,pos.alpha);									// Made light
			light.position.set(pos.x,pos.y,pos.z).normalize();										// Set angle
			}
		if (style.type == "ambient") 																// Ambient
			light=new THREE.AmbientLight(pos.col,pos.alpha);										// Make light		
		light.name=id;																				// Id to doc and group
		this.scene.add(light);																		// Add light
	}

	Resize()																					// RESIZE 3D SPACE
	{
		var div=$(this.container);																	// Point a 3D dib
		this.camera.aspect=div.width()/div.height();												// Set aspect
		this.camera.updateProjectionMatrix();														// Reset matrix
		this.renderer.setSize(div.width(),div.height());											// Main size
	}

	AddCamera(x, y, z, fov)																		// ADD CAMERA
	{
		var div=$(this.container);																	// Point a 3D dib
		this.camera=new THREE.PerspectiveCamera(fov, div.width()/div.height(), 1, 2000);			// Make camera
		this.scene.add(this.camera);																// Add camera to scene
		this.SetCamera(x,y,z);																		// Position camera
		this.controls=new THREE.OrbitControls(this.camera);											// Add orbiter control
		this.controls.damping=0.2;																	// Set dampening
	
		this.controls.addEventListener('start',()=> { if (!app.cameraLock) app.Do(); });			// ON START CAMERA MOVE, save undo
		this.controls.addEventListener('end',()=> { 												// ON END CAMERA MOVE		
			if ((app.curModelId != "100") || app.cameraLock)	return;								// Only for an unlocked camera
			var o=app.doc.models[0].pos;															// Point at model
			o.x=this.camera.position.x;	o.y=this.camera.position.y;  o.z=this.camera.position.z;	// Set position
			app.SaveState();																		// Save current state
			app.DrawTopMenu(true);																	// Update menu
			});									
	}

	SetCamera(x, y, z, fov)																		// SET CAMERA
	{
		this.camera.position.x=x;	this.camera.position.y=y;	this.camera.position.z=z;			// Camera position
	}

	AddRoom(style, pos, id)																		// ADD ROOM TO SCENE
	{	
		var _this=this;																				// Save context
		var group=new THREE.Group();																// Create new group
		group.name=id;																				// Id to doc and group
		this.scene.add(group);																		// Add to scene

		if (style.type == "cube") {																	// If a reflection cube
			var urls=[style.left,style.right,style.roof,style.floor,style.front,style.back];		// Order is L,R,T,B,F,R and must be 512 by 512
			var reflectionCube=new THREE.CubeTextureLoader().load((urls));							// Load cube texture
			reflectionCube.format=THREE.RGBFormat;													// Make image
			var shader=THREE.ShaderLib["cube"];														// Make shader
			shader.uniforms["tCube"].value=reflectionCube;											// Set uniforms
			var mat=new THREE.ShaderMaterial({														// Create material
				fragmentShader:shader.fragmentShader, vertexShader: shader.vertexShader,
				uniforms:shader.uniforms, depthWrite:false, side:THREE.BackSide
				});
			var mesh=new THREE.Mesh(new THREE.BoxGeometry(pos.sx,pos.sy,pos.sz),mat);				// Create mesh
			group.add(mesh);																		// Add to group
			}
		else{																						// A square room
			if (style.floor) 	addWall(0,0,0,-Math.PI/2,0,0,pos.sz,style.floor);					// If a floor spec'd
			if (style.front) 	addWall(0,128,512,0,Math.PI,0,pos.sy,style.front);					// If a front wall spec'd
			if (style.back) 	addWall(0,128,-512,0,0,0,pos.sy,style.back);						// If a back wall spec'd
			if (style.left) 	addWall(-512,128,0,0,Math.PI/2,0,pos.sy,style.left);				// If a left wall spec'd
			if (style.right)	addWall(512,128,0,0,-Math.PI/2,0,pos.sy,style.right);				// If a right wall spec'd
			}
		pos.sx=pos.sy=pos.sz=1;																		// Normal scaling

		function addWall(x, y, z, xr, yr, zr, h, texture) {											// ADD WALL
			var mat=new THREE.MeshPhongMaterial();													// Make material
			mat.userData.outlineParameters= { visible: false };										// Hide outline
			mat.transparent=true;																	// Allow transparency
			var tex=_this.textureLoader.load(texture.replace(/\*/g,""));							// Load texture after removing *'s
			if (texture.match(/\*/)) {																// If wrapping
				tex.wrapS=tex.wrapT=THREE.RepeatWrapping;											// Wrap and repeat
				tex.repeat.set(4,4);																// 4 by 4
				}
			mat.map=tex;																			// Add texture
			mat.origAlpha=1;																		// Save original alpha
			var cbg=new THREE.PlaneGeometry(pos.sx,h,1,1);											// Make grid
			var mesh=new THREE.Mesh(cbg,mat);														// Make mesh
			mesh.rotation.x=xr;		mesh.rotation.y=yr;		mesh.rotation.z=zr;						// Rotate 
			mesh.position.x=x; 		mesh.position.y=y;		mesh.position.z=z;						// Position
			group.add(mesh);																		// Add to scene		
		}
	}

	AddPanel(style, pos, id)																	// ADD A TEXTURED PANEL
	{
		var group=new THREE.Group();																// Create new group
		group.name=id;																				// Id to doc and group
		this.scene.add(group);																		// Add to scene
		var mat=new THREE.MeshPhongMaterial();														// Make material
		mat.userData.outlineParameters= { visible: false };											// Hide outline
		mat.color=new THREE.Color(0xffffff);														// Set color
		mat.transparent=true;																		// Allow transparency
		if (style.back)		mat.side=THREE.DoubleSide;												// Add texture to back
		var tex=this.textureLoader.load(style.src);													// Load texture
		if (style.wrap) {																			// If wrapping
			tex.wrapS=tex.wrapT=THREE.RepeatWrapping;												// Wrap and repeat
			tex.repeat.set(4,4);																	// 4 by 4
			}
		tex.minFilter=THREE.NearestFilter;
		mat.map=tex;																				// Add texture
		mat.origAlpha=1;																			// Save original alpha
		var cbg=new THREE.PlaneGeometry(pos.sx,pos.sy,1,1);											// Make grid
		var mesh=new THREE.Mesh(cbg,mat);															// Make mesh
		group.add(mesh);																			// Add to group	
		pos.sx=pos.sy=pos.sz=1;																		// Normal scaling
		this.MoveObject(group.name, pos);															// Move
	}

	AddGroup(style, pos, id)																	// ADD A GROUP
	{
		var group=new THREE.Group();																// Create new group
		group.name=id;																				// Id to doc and group
		this.scene.add(group);																		// Add to scene
		this.SetGroupMembers(id,style.layers);														// Add members
		this.MoveObject(group.name, pos);															// Move
	}

	SetGroupMembers(id, members)																// ADD MEMBERS TO A GROUP
	{
		var i,o;
		var group=this.scene.getObjectByName(id);													// Get group object
		for (i=0;i<group.children.length;++i) 														// For each child in group
			if (!members.includes(group.children[i].name)) {										// Child not in group
				o=group.children[i];																// Point at it
				group.remove(o);																	// Remove from group
				this.scene.add(o);																	// Add back to scene
				}
		for (i=0;i<members.length;++i) 																// For each memeber
			group.add(this.scene.getObjectByName(members[i]));										// Add children
	}

	AddProxy(style, pos, id)																	// ADD A PROXY PANEL FOR IFRAME/CSS OBJECT
	{
		var group=new THREE.Group();																// Create new group
		group.name=id;																				// Id to doc and group
		group.css=1;																				// Has a CSS attached
		this.scene.add(group);																		// Add to scene
		var mat=new THREE.MeshBasicMaterial();	mat.opacity=.0001;	mat.transparent=true;			// Make helper invisible material
		var cbg=new THREE.PlaneGeometry(pos.sx,pos.sy,1,1);											// Grid
		var mesh=new THREE.Mesh(cbg,mat);															// Mesh
		group.add(mesh);																			// Add help to group	
		var element=document.createElement("div");													// Add div
		$(element).width(pos.sx);	$(element).height(pos.sy);										// Size
		element.style.background=style.back ? style.back : "";										// Background
		element.style.border=style.border ? style.border : "";										// Border
		element.id="CSSDiv-"+id;																	// Name same as group
		if (style.src && style.src.match(/.mp4|.m4v/i))	{											// If an mp4 file
			$(element).append("<video id='MEDIA-"+id+"' style='pointer-events:auto' height='"+pos.sy+"' width='"+pos.sx+"'src='"+style.src+"'></video>");
			app.media[id]={ type:"video", obj:null, start:style.start ? style.start-0 : 0  };		// Add media object
			}
		else if (style.src && style.src.match(/\/\//))												// If a url
			$(element).append("<iframe style='pointer-events:auto' frameborder=0 scrolling='no' height='"+pos.sy+"' width='"+pos.sx+"'src='"+style.src+"'/>");
		else
			$(element).append("<iframe frameborder=0 scrolling='no' height='"+pos.sy+"' width='"+pos.sx+"'srcdoc='"+style.src+"'/>");
		pos.sx=pos.sy=pos.sz=1;																		// Normal scaling
		this.MoveObject(group.name, pos);															// Move
	}

	AddModel(style, pos, id)																	// ADD MODEL TO SCENE
	{
		var loader;
		var _this=this;																				// Save context
		var group=new THREE.Group();																// Create new group
		group.name=id;																				// Id to doc and group
		this.scene.add(group);																		// Add to scene
		if (style.src.match(/\.json/i))			loader=new THREE.ObjectLoader(this.manager);		// If JSON model format
		else if (style.src.match(/\.obj/i))		loader=new THREE.OBJLoader(this.manager);			// If OBJ
		else									loader=new THREE.ColladaLoader(this.manager);		// If DAE
		var url=ConvertFromGoogleDrive(style.src);													// Make direct link if gDrive
		if (url.match(/\/\//))	url="proxy.php?url="+url;											// Add proxy if not local
	
		loader.load(url, (obj)=> { 																	// Load model
			loadModel(obj);																			// Load it
			}, onProgress, onError );																// Load

		function onProgress(xhr) {}																	// ON PROGRESS

		function onError(err) {	console.log(err) };													// ON ERROR

		function loadModel(object) {																// ON LOAD
			var i,m;
			var texture=null;
			if (object.scene)					object=object.scene;								// Point at scene if there (GLTF/DAE)			
			if (style.tex && isNaN(style.tex)) 	texture=_this.textureLoader.load(style.tex);		// If a texture

			object.traverse(function(child) {														// Go thru model
				if (child.isMesh) { 																// If a mesh
					m=child.material;																// Point at materal array
					if (!m[0]) m=[],m[0]=child.material;											// If only one, make into array
					for (i=0;i<m.length;++i) {														// For each maqterial
						m[i].transparent=true;														// Allow transparency
						m[i].origAlpha=m[i].opacity;												// Save original alpha
						if (texture)			m[i].map=texture;									// If has texture, add it
						if (!isNaN(style.tex)) 	m[i].color=new THREE.Color(style.tex-0);			// If a number, apply color
						}
					}							
				});
			
			group.add(object);																		// Add object to it
			object.name=group.name;																	// KLUDGE!!!
			pos.rx-=90*Math.PI/180;																	// Correct model angle
			_this.MoveObject(group.name, pos);														// Move
		}
	}

// ANIMATION ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Render() 																				// RENDER LOOP
	{
		var now=new Date().getTime();																// Get current time in ms
		if (now-app.sc.lastTime > 10)	{															// Don't go too fast
			app.sc.controls.update();																// Update control time
			app.sc.AnimateScene();																	// Animate models
			app.sc.renderer.render(app.sc.scene,app.sc.camera);										// Render scene
			app.sc.lastTime=now;																	// Then is now
			}
		requestAnimationFrame(app.sc.Render);														// Recurse
		}

	AnimateScene()																				// CALLED EVERY FRAME BY ANIMATE FUNCTION
	{
		++app.sc.aniTimer;																			// Advance timer
	}

// HELPERS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	GetScreenPos(obj)																			// GET SCREEN POS OF 3D OBJECT
	{	
		var div=$(this.container);																	// Point a 3D div
		var w=div.width()/2, h=div.height()/2;
		var pos=new THREE.Vector3();
		pos=pos.setFromMatrixPosition(obj.matrixWorld);		
		pos.project(this.camera);																	// Project pos
		pos.x=(pos.x*w)+w;																			// In screen coords X
		pos.y=-(pos.y*h)+h;																			// Y
		return pos;																					// Return pos
	}

	MoveObject(name, pos)																		// MOVE OBJECT
	{
		var i,m;
		if (name == "100") {
			if (app.cameraLock)	return;																// Don't animate if locked
			this.camera.position.x=pos.x;	this.camera.position.y=pos.y;  							// Set position
			this.camera.position.z=pos.z;
			return;																					
			}
		var r=Math.PI/180;																			// Degrees to radians
		var obj=this.scene.getObjectByName(name);													// Get outer object
		if (obj) { 																					// If valid
			obj=obj.children[0];																	// Get inner object
			if (obj) {																				// If valid
				obj.position.x=pos.cx/pos.sx; 														// Pivot by unscaled center
				obj.position.y=pos.cy/pos.sy;  		obj.position.z=pos.cz/pos.sz; 
				}
			}
		obj=this.scene.getObjectByName(name);														// Get group object
		if (obj) {
			m=app.doc.FindModelById(name);															// Point at model
			obj.visible=m.vis ? true : false;														// Set visibility
			obj.rotation.x=pos.rx*r;	obj.rotation.y=pos.ry*r;	obj.rotation.z=pos.rz*r;		// Rotate in radians
			obj.scale.x=pos.sx-0;		obj.scale.y=pos.sy-0;		obj.scale.z=pos.sz-0;			// Scale 
			obj.position.x=pos.x-0;		obj.position.y=pos.y-0;		obj.position.z=pos.z-0;			// Position
			obj.traverse(function(child) {															// Set alpha for each object
				if (child.material && child.isMesh) {												// If a mesh with material
					m=child.material;																// Point at materal array
					if (!m[0]) m=[],m[0]=child.material;											// If only one, make into array
					for (i=0;i<m.length;++i) 	m[i].opacity=pos.a*m[i].origAlpha;					// Set alpha for each material
				}});	
			}
		}

	SetVisibility(name, vis, alpha)																// SET OBJECT'S VISIBILITY
	{
		var obj=this.scene.getObjectByName(name);													// Get object
		if (!obj)	return;																			// Quit if no obj
		obj.visible=vis ? true : false;																// Set visibility
		if (obj.css)  $("#CSSDiv-"+name).css("opacity",vis ? alpha : 0);							// Set alpha on CSS
	}


}  // SCENE CLOSURE