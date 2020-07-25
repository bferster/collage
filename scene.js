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
		this.models=[];																				// Clear models
		this.ClearScene();																			// Clear scene
		this.AddModel();																			// Add model to scene
		}
	
	ClearScene()																				// CLEAR ALL CONTENT FROM SCENES
	{
		this.scene.remove.apply(this.scene, this.scene.children);									// Remove 3D scene children
		this.AddLights();																			// Add lighting
	}

	MoveByMatrix(name, mat)																		// MOVE OBJECT TO MATRIX
	{
		var obj=this.scene.getObjectByName(name);													// Get object
		obj.matrix.identity();																		// Move to identity
		obj.applyMatrix(mat);																		// Set new matrix
	}
	
	AddLights()																					// ADD LIGHTING
	{
		let light=new THREE.DirectionalLight("#222222",1);											// Make light
		light.position.set(0,0,1).normalize();														// Set angle
		light.name="dlight";																		// Set name	
		this.scene.add(light);																		// Add light
		light=new THREE.AmbientLight("#ffffff",1);													// Make light		
		light.name="alight"																			// Name
		this.scene.add(light);																		// Add light
		this.AddWall(0,-96,0,-Math.PI/2,0,0,0,"assets/grass.jpg*");									// Add floor
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
	}

	SetCamera(x, y, z)																		// SET CAMERA
	{
		this.camera.position.x=x;	this.camera.position.y=y;	this.camera.position.z=z;			// Camera position
	}

	AddModel()																					// ADD MODEL TO SCENE
	{
		var loader;
		var _this=this;																				// Save context
		var group=new THREE.Group();																// Create new group
		group.name="model3d";																		// Id to model
		this.scene.add(group);																		// Add to scene
		let src="assets/Caboose.dae";
		let tex="assets/Cabomap.jpg";
		let pos=this.InitPos()
		pos.sx=pos.sy=pos.sz=50;
		pos.x=-250; pos.y=-100;	
		if (src.match(/\.json/i))		loader=new THREE.ObjectLoader(this.manager);				// If JSON model format
		else if (src.match(/\.obj/i))	loader=new THREE.OBJLoader(this.manager);					// If OBJ
		else							loader=new THREE.ColladaLoader(this.manager);				// If DAE
	
		var url=ConvertFromGoogleDrive(src);														// Make direct link if gDrive
		if (url.match(/\/\//))	url="proxy.php?url="+url;											// Add proxy if not local

		loader.load(url, (obj)=> { 																	// Load model
			loadModel(obj);																			// Load it
			}, onProgress, onError );																// Load

		function onProgress(xhr) {}																	// ON PROGRESS

		function onError(err) {	console.log(err) };													// ON ERROR

		function loadModel(object) {																// ON LOAD
			let i,m;
			let texture=null;
			if (object.scene)	object=object.scene;												// Point at scene if there (GLTF/DAE)			
			if (tex) 			texture=_this.textureLoader.load(tex);								// If a texture

			object.traverse(function(child) {														// Go thru model
				if (child.isMesh) { 																// If a mesh
					m=child.material;																// Point at materal array
					if (!m[0]) m=[],m[0]=child.material;											// If only one, make into array
					for (i=0;i<m.length;++i) {														// For each maqterial
						m[i].transparent=true;														// Allow transparency
						m[i].origAlpha=m[i].opacity;												// Save original alpha
						if (texture)			m[i].map=texture;									// If has texture, add it
						}
					}							
				});
			
			group.add(object);																		// Add object to it
			object.name=group.name;																	// KLUDGE!!!
			_this.MoveObject(group.name, pos);														// Move
		}
	}
	
	AddWall(x, y, z, xr, yr, zr, h, texture) 													// ADD WALL
	{
		var mat=new THREE.MeshPhongMaterial();														// Make material
		mat.userData.outlineParameters= { visible: false };											// Hide outline
		mat.transparent=true;																		// Allow transparency
		var tex=this.textureLoader.load(texture.replace(/\*/g,""));									// Load texture after removing *'s
		if (texture.match(/\*/)) {																	// If wrapping
			tex.wrapS=tex.wrapT=THREE.RepeatWrapping;												// Wrap and repeat
			tex.repeat.set(4,4);																	// 4 by 4
			}
		mat.map=tex;																				// Add texture
		mat.origAlpha=1;																			// Save original alpha
		var cbg=new THREE.PlaneGeometry(4096,2048,1);												// Make grid
		var mesh=new THREE.Mesh(cbg,mat);															// Make mesh
		mesh.rotation.x=xr;		mesh.rotation.y=yr;		mesh.rotation.z=zr;							// Rotate 
		mesh.position.x=x; 		mesh.position.y=y;		mesh.position.z=z;							// Position
		this.scene.add(mesh);																		// Add to scene		
	}

	SetCameraSide(side)																			// SET CAMERA BASED ON SIDE
	{
		if (!side)					return;
		side=side.replace(/Cupula /i,"").toLowerCase();												// Remove cupula
		if (side == "roof")			this.SetCamera(0,500,0);										// Top
		else if (side == "floor")	this.SetCamera(0,500,0);										// Top
		else if (side == "head")	this.SetCamera(-500,0,0);										// Left
		else if (side == "front")	this.SetCamera(0,150,500);										// Front
		else if (side == "back")	this.SetCamera(0,150,-500);										// Back		
		else if (side == "tail")	this.SetCamera(500,0,0);										// Right	
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

	MoveObject(name, pos)																		// MOVE OBJECT
	{
		let i,m,r=Math.PI/180;																		// Degrees to radians
		let obj=this.scene.getObjectByName(name);													// Get group object
		if (obj) {
			m=this.FindModelById(name);																// Point at model
			obj.visible=true;																		// Set visibility
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

	FindModelById(id, o)																		// FIND MODEL FROM ID
	{
		var i;
		if (!o)	o=this.models;																		// Look in models
		for (i=0;i<o.length;++i)																	// For each item
			if (o[i].id == id)	 return o[i];														// If a match, return model
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


}  // SCENE CLOSURE