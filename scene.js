///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3D SYSTEM
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Scene {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		this.lastTime=0;																			// Used to throttle rendring
		this.models=[];																				// Holds models
		this.container=$("#"+div)[0];																// Div container														
		this.camera=null;																			// Camera object
		this.renderer=null;																			// Renderer object
		this.scene=null;																			// Scene object
		this.controls=null;																			// Controls object
		this.outliner=null;																			// Outline renderer
		this.floor="assets/wood.jpg";																// Floor texture
		this.aniTimer=0;																			// Timer for talking and fidgeting
		this.Init();																				// Init 3D system
		}

	Init()																						// INIT 3D SYSTEM
	{
		this.scene=new THREE.Scene();																// Alloc new scene
		this.manager=new THREE.LoadingManager();													// Loading manager
		this.textureLoader=new THREE.TextureLoader();												// Texture loader
		this.AddCamera(0,150,500,.4);																// Add camera
		this.renderer=new THREE.WebGLRenderer({ antialias: true });									// Init renderer
		this.renderer.setPixelRatio(window.devicePixelRatio);										// Set ratio
		this.AddLights();																			// Add lights
		this.Resize();																				// Resize 3D space
		this.container.appendChild(this.renderer.domElement);										// Add to div
		this.AddRoom();																				// Add room walls
	}

	AddLights()																					// ADD LIGHTS
	{
		var light=new THREE.DirectionalLight("#222222");											// Made directional light
		light.position.set(0,0,1);																	// Set angle
		this.scene.add(light);																		// Add directioal light
		this.scene.add(new THREE.AmbientLight(0xffffff, 1));										// Add ambient light
//		this.outliner=new THREE.OutlineEffect(this.renderer, { /*defaultThickness:.0035 */ });		// Add outliner
	}

	Resize()																					// RESIZE 3D SPACE
	{
		this.camera.aspect=window.innerWidth/window.innerHeight;									// Set aspect
		this.camera.updateProjectionMatrix();														// Reset matrix
		if (this.scene && this.scene.outliner) 	this.outliner.setSize(window.innerWidth,window.innerHeight-3);	// Reset render size		
		else if (this.scene)					this.renderer.setSize(window.innerWidth,window.innerHeight-3);	
	}

	AddCamera(x, y, z)																			// ADD CAMERA
	{
		this.camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,2000);	// Add 45 degree POV
		this.scene.add(this.camera);																// Add camera to scene
		this.SetCamera(x,y,z,0,0,0);																// Position camera
		this.controls=new THREE.OrbitControls(this.camera);											// Add orbiter control
		this.controls.damping=0.2;																	// Set dampening
	}

	SetCamera(x, y, z, xr, yr, zr)																	// SET CAMERA
	{
		this.camera.position.x=x;	this.camera.position.y=y;	this.camera.position.z=z;			// Camera position
		this.camera.rotation.x=xr;	this.camera.rotation.y=yr;	this.camera.rotation.z=zr;			// Rotation
	}

	AddRoom()																					// ADD ROOM TO SCENE
	{	
		var _this=this;																				// Save context
		if (this.floor) 		addWall(0,0,0,-Math.PI/2,0,0,1024,this.floor,1,this.cartoonScene);	// If a floor spec'd
		if (this.frontWall) 	addWall(0,128,512,0,Math.PI,0,256,this.frontWall,0,0);				// If a front wall spec'd
		if (this.backWall) 		addWall(0,128,-512,0,0,0,256,this.backWall,0,0);					// If a back wall spec'd
		if (this.leftWall) 		addWall(-512,128,0,0,Math.PI/2,0,256,this.leftWall,0,0);			// If a left wall spec'd
		if (this.rightWall)	 	addWall(512,128,0,0,-Math.PI/2,0,256,this.rightWall,0,0);			// If a right wall spec'd

		function addWall(x, y, z, xr, yr, zr, h, texture, wrap, cartoon) {							// ADD WALL
			var mat=new THREE.MeshPhongMaterial();													// Make material
			mat.color=new THREE.Color(cartoon ? 0xeeeeee : 0xffffff);								// Set color
			if (!cartoon) {																			// If a cartoon scene
				mat.userData.outlineParameters= { visible: false };									// Hide outline
				var tex=_this.textureLoader.load(texture);											// Load texture
				if (wrap) {																			// If wrapping
					tex.wrapS=tex.wrapT=THREE.RepeatWrapping;										// Wrap and repeat
					tex.repeat.set(4,4);															// 4 by 4
					}
				mat.map=tex;																		// Add texture
				}
			var cbg=new THREE.PlaneGeometry(1024,h,1,1);											// Make grid
			var mesh=new THREE.Mesh(cbg,mat);														// Make mesh
			mesh.rotation.x=xr;		mesh.rotation.y=yr;		mesh.rotation.z=zr;						// Rotate 
			mesh.position.x=x; 		mesh.position.y=y;		mesh.position.z=z;						// Position
			_this.scene.add(mesh);																	// Add to scene		
		}
	}

	AddModel(o)																					// ADD MODEL TO SCENE
	{
		var loader;
		var _this=this;																				// Save context
		if (o.src.match(/\.json/i))	loader=new THREE.ObjectLoader(this.manager);					// If JSON model format
		if (o.src.match(/\.obj/i))	loader=new THREE.OBJLoader(this.manager);						// If OBJ
		if (o.src.match(/\.gltf/i))	loader=new THREE.GLTFLoader(this.manager);						// If GLTF
		if (o.src.match(/\.dae/i))	loader=new THREE.ColladaLoader(this.manager);					// If DAE

		loader.load(o.src, (obj)=> { 																// Load model
			loadModel(obj);																			// Load it
			if (o.sex) 				_this.SetPose(o.id,"startUp");									// If a student set starting pose
			}, onProgress, onError );																// Load

		function onProgress(xhr) {}																	// ON PROGRESS

		function onError(err) {	console.log(err) };													// ON ERROR

		function loadModel(object) {															// ON LOAD
			var i=0,texture=null;
			if (object.scene)	object=object.scene;												// Point at scene if there (GLTF/DAE)			
			_this.models[o.id]=({ name:o.src, bones:[], model: object });							// Add new model	
			var cm=_this.models[o.id];																// Point at new model
			if (o.tex && isNaN(o.tex)) 																// If a texture
				texture=_this.textureLoader.load(o.tex);											// Load it

			object.traverse(function(child) {														// Go thru model
				if (child.isBone) {																	// If a bone,
					cm.bones[child.name]=child; 													// Add to list
					child.oxr=child.rotation.x;														// Save original x rotation
					child.oyr=child.rotation.y;														// Y
					child.ozr=child.rotation.z;														// Z
					}
				if (child.isMesh) { 																// If a mesh
					if (texture)		child.material.map=texture;									// If has texture, add it
					if (!isNaN(o.tex)) 																// If a cartoon shading
						child.material.color=new THREE.Color(o.tex);								// Set color
					if (child.material.userData)													// If user data
						child.material.userData.outlineParameters= { visible:app.sc.cartoonScene }; // Outline if cartoon
					}							
			});
			
			var loc=_this.seats[o.seat];															// Get location
			object.oxp=loc.x;		object.ozp=loc.y;		object.oyp=loc.z;	object.orp=loc.r;	// Save start pos's
			object.scale.x=object.scale.y=object.scale.z=o.s;										// Scale 
			object.position.x=loc.x;	object.position.z=loc.y;	object.position.y=loc.z;		// Position
			object.rotation.z=loc.r*Math.PI/180;													// Rotation
			if (o.sex) object.position.z-=12,object.ozp-=12;
			_this.scene.add(object);																// Add model to scene
		}
	}

	SetBone(model, bone, x, y, z)																// ROTATE A BONE
	{
		if (!this.models[model] || !this.models[model].bones[bone])	return;							// Quit on bad model or bone
		if (bone == "base") {																		// X and Z axes set model positon directly, not via the bone
			this.models[model].model.position.x=x-0+this.models[model].model.oxp+1.5;				// Set base X position via model (fudge)
			this.models[model].model.position.z=z-0+this.models[model].model.ozp;					// Z
			x=z=0;
			}
		x*=Math.PI/180;	y*=Math.PI/180;	z*=Math.PI/180;												// Convert degrees to radians
		x+=this.models[model].bones[bone].oxr;														// Add initial rotations
		y+=this.models[model].bones[bone].oyr;
		z+=this.models[model].bones[bone].ozr;
		this.models[model].bones[bone].rotation.x=x;												// Rotate 						
		this.models[model].bones[bone].rotation.y=y;													
		this.models[model].bones[bone].rotation.z=z;													
	}

	
// ANIMATION ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Render() 																			// RENDER LOOP
	{
		var now=new Date().getTime();																// Get current time in ms
		if (now-app.sc.lastTime > 100)	{															// Don't go too fast
			app.sc.controls.update();																// Update control time
			app.sc.AnimateScene();																	// Animate models
			if (app.sc.outliner) 	app.sc.outliner.render(app.sc.scene, app.sc.camera );			// Render outline
			else					app.sc.renderer.render(app.sc.scene,app.sc.camera);				// Render scene
			app.sc.lastTime=now;																	// Then is now
			}
		requestAnimationFrame(app.sc.Render);														// Recurse
	}

	AnimateScene()																				// CALLED EVERY FRAME BY ANIMATE FUNCTION
	{
		++app.sc.aniTimer;																			// Advance timer
	}

	StartAnimation(model, seqs)																	// QUEUE UP ACTION SEQUENCE
	{
	}

	GetScreenPos(obj)																			// GET SCREEN POS OF 3D OBJECT
	{	
		var w=window.innerWidth/2, h=window.innerHeight/2;
		var pos=new THREE.Vector3();
		pos=pos.setFromMatrixPosition(obj.matrixWorld);		
		pos.project(this.camera);																	// Project pos
		pos.x=(pos.x*w)+w;																			// In screen coords X
		pos.y=-(pos.y*h)+h;																			// Y
		return pos;																					// Return pos
	}

}  // SCENE CLOSURE