///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3D SYSTEM
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Scene {																				 

	constructor(div)																			// CONSTRUCTOR
	{
		this.lastTime=0;																			// Used to throttle rendring
		this.container=$("#"+div)[0];																// Div container														
		this.camera=null;																			// Camera object
		this.renderer=null;																			// Renderer object
		this.scene=null;																			// Scene object
		this.controls=null;																			// Controls object
		this.outliner=null;																			// Outline renderer
		this.aniTimer=0;																			// Timer for talking and fidgeting
		this.transformControl;	this.transMat;														// Transform control				
		this.raycaster=new THREE.Raycaster();														// Alloc raycaster	
		this.Init();																				// Init 3D system
	
	}

	Init()																						// INIT 3D SYSTEM
	{
		this.scene=new THREE.Scene();																// Alloc new scene
		this.manager=new THREE.LoadingManager();													// Loading manager
		this.textureLoader=new THREE.TextureLoader();												// Texture loader
		this.AddCamera(0,150,500);																	// Add camera
		this.renderer=new THREE.WebGLRenderer({ antialias: true });									// Init renderer
		this.renderer.setPixelRatio(window.devicePixelRatio);										// Set ratio
		this.outliner=new THREE.OutlineEffect(this.renderer, { /*defaultThickness:.0035 */ });		// Add outliner
		this.Resize();																				// Resize 3D space
		this.container.appendChild(this.renderer.domElement);										// Add to div

		this.transformControl=new THREE.TransformControls(this.camera, this.renderer.domElement);	// Add transform controller
		this.transformControl.addEventListener("dragging-changed", (e)=> { this.controls.enabled=!e.value; });	// Inhibit orbiter
		this.transformControl.addEventListener("change", ()=>{ this.Render; app.DrawTopMenu(); });	// Render on change
		window.addEventListener("keydown", (e)=> { switch (e.keyCode) {								// On key down
			case 27:  																				// Esc to revert
				this.transformControl.detach();														// Quit
				this.MoveByMatrix(app.doc.models[app.curModel].style.objId,this.transMat);			// Restore matrix
				app.curModel=-1;																	// Clear current model
				app.DrawTopMenu();																	// Redraw props
				break;
			case 17:  this.transformControl.setTranslationSnap(10); this.transformControl.setRotationSnap(THREE.Math.degToRad(15));	break;	// Ctrl snap to grid
			case 82:  this.transformControl.setMode("rotate");							break;		// R to rotate
			case 77:  this.transformControl.setMode("translate");						break;		// M to translate
			case 83:  this.transformControl.setMode("scale");							break;		// S to scale
			case 187: this.transformControl.setSize(this.transformControl.size + 0.1);	break;		// + Make bigger
			case 189: this.transformControl.setSize(Math.max(this.transformControl.size-0.1,0.1)); 	break;		// - Make smaller
			} });
		window.addEventListener("keyup", (e)=> { switch (e.keyCode) {								// On key up
			case 17:  this.transformControl.setTranslationSnap(null); this.transformControl.setRotationSnap(null);	break;	// Ctrl snap to grid
			} });

		}
	
	MoveByMatrix(name, mat)																		// MOVE OBJECT TO MATRIX
	{
		var obj=this.scene.getObjectByName(name);													// Get object
		obj.matrix.identity();																		// Move to identity
		obj.applyMatrix(mat);																		// Set new matrix
	}
	
	TransformController(name)																	// APPLY TRANSFORM CONTROLS TO OBJECT
	{
		var obj=this.scene.getObjectByName(name);													// Get object
		this.transformControl.detach();																// Detach from control
		this.scene.remove(this.transformControl);													// Remove control from scene
		if (obj) {																					// If a valid object
			this.transMat=obj.matrix.clone();														// Clone starting matrix
			this.scene.add(this.transformControl);													// Add control
			this.transformControl.attach(obj);														// Attach to control
			}
		}
		
	AddLight(style, pos)																		// ADD LIGHT
	{
		var light;
		if (style.type == "directional") {															// Directional light															
			light=new THREE.DirectionalLight(pos.col,pos.alpha);									// Made light
			light.position.set(pos.rx,pos.ry,pos.rz).normalize();									// Set angle
			}
		if (style.type == "ambient") 																// Ambient
			light=new THREE.AmbientLight(pos.col,pos.alpha);										// Make light		
		this.scene.add(light);																		// Add light
		style.obj3D=[light];																		// Add link to 
	}

	Resize()																					// RESIZE 3D SPACE
	{
		var div=$(this.container);																	// Point a 3D dib
		this.camera.aspect=div.width()/div.height();												// Set aspect
		this.camera.updateProjectionMatrix();														// Reset matrix
		if (this.scene && this.scene.outliner) 	this.outliner.setSize(div.width(),div.height());	// Reset outliner render size		
		else if (this.scene)					this.renderer.setSize(div.width(),div.height());	// Main size
	}

	AddCamera(x, y, z)																			// ADD CAMERA
	{
		var div=$(this.container);																	// Point a 3D dib
		this.camera=new THREE.PerspectiveCamera(45,div.width()/div.height(),1,2000);				// Add 45 degree POV
		this.scene.add(this.camera);																// Add camera to scene
		this.SetCamera(x,y,z);																		// Position camera
		this.controls=new THREE.OrbitControls(this.camera);											// Add orbiter control
		this.controls.damping=0.2;																	// Set dampening
		this.controls.addEventListener('change',()=> { app.DrawTopMenu() });						// Show camera movement						
	}

	SetCamera(x, y, z)																			// SET CAMERA
	{
		this.camera.position.x=x;	this.camera.position.y=y;	this.camera.position.z=z;			// Camera position
	}

	AddRoom(style, pos)																			// ADD ROOM TO SCENE
	{	
		var _this=this;																				// Save context
		var group=new THREE.Group();																// Create new group
		style.objId=group.name="MOD-"+group.id;														// Id to doc and group
		this.scene.add(group);																		// Add to scene	
		if (style.floor) 	addWall(0,0,0,-Math.PI/2,0,0,pos.sz,style.floor,1,0);					// If a floor spec'd
		if (style.front) 	addWall(0,128,512,0,Math.PI,0,pos.sy,style.front,0,0);					// If a front wall spec'd
		if (style.back) 	addWall(0,128,-512,0,0,0,pos.sy,style.back,0,0);						// If a back wall spec'd
		if (style.left) 	addWall(-512,128,0,0,Math.PI/2,0,pos.sy,style.left,0,0);				// If a left wall spec'd
		if (style.right)	addWall(512,128,0,0,-Math.PI/2,0,pos.sy,style.right,0,0);				// If a right wall spec'd


		function addWall(x, y, z, xr, yr, zr, h, texture, wrap, outline) {							// ADD WALL
			var mat=new THREE.MeshPhongMaterial();													// Make material
			mat.color=new THREE.Color(outline ? 0xeeeeee : 0xffffff);								// Set color
			if (!outline) {																			// If an outline
				mat.userData.outlineParameters= { visible: false };									// Hide outline
				var tex=_this.textureLoader.load(texture);											// Load texture
				if (wrap) {																			// If wrapping
					tex.wrapS=tex.wrapT=THREE.RepeatWrapping;										// Wrap and repeat
					tex.repeat.set(4,4);															// 4 by 4
					}
				mat.map=tex;																		// Add texture
				}

			var cbg=new THREE.PlaneGeometry(pos.sx,h,1,1);											// Make grid
			var mesh=new THREE.Mesh(cbg,mat);														// Make mesh
			mesh.rotation.x=xr;		mesh.rotation.y=yr;		mesh.rotation.z=zr;						// Rotate 
			mesh.position.x=x; 		mesh.position.y=y;		mesh.position.z=z;						// Position
			group.add(mesh);																		// Add to scene		
		}
	}

	AddPanel(style, pos)																	// ADD A TEXTURED PANEL
	{
		var group=new THREE.Group();																// Create new group
		style.objId=group.name="MOD-"+group.id;														// Id to doc and group
		this.scene.add(group);																		// Add to scene
		var mat=new THREE.MeshPhongMaterial();														// Make material
		mat.userData.outlineParameters= { visible: false };											// Hide outline
		mat.color=new THREE.Color(0xffffff);														// Set color
		if (style.back)		mat.side=THREE.DoubleSide;												// Add texture to back
		var tex=this.textureLoader.load(style.src);													// Load texture
		if (style.wrap) {																			// If wrapping
			tex.wrapS=tex.wrapT=THREE.RepeatWrapping;												// Wrap and repeat
			tex.repeat.set(4,4);																	// 4 by 4
			}
		tex.minFilter=THREE.NearestFilter;
		mat.map=tex;																				// Add texture
		var cbg=new THREE.PlaneGeometry(pos.sx,pos.sy,1,1);											// Make grid
		var mesh=new THREE.Mesh(cbg,mat);															// Make mesh
		group.add(mesh);																			// Add to group	
		pos.sx=pos.sy=pos.sz=1;																		// Normal scaling
		this.MoveObject(group.name, pos);															// Move
	}

	AddModel(style, pos)																		// ADD MODEL TO SCENE
	{
		var loader;
		var _this=this;																				// Save context
		var group=new THREE.Group();																// Create new group
		style.objId=group.name="MOD-"+group.id;														// Id to doc and group
		this.scene.add(group);																		// Add to scene
		if (style.src.match(/\.json/i))	loader=new THREE.ObjectLoader(this.manager);				// If JSON model format
		if (style.src.match(/\.obj/i))	loader=new THREE.OBJLoader(this.manager);					// If OBJ
		if (style.src.match(/\.gltf/i))	loader=new THREE.GLTFLoader(this.manager);					// If GLTF
		if (style.src.match(/\.dae/i))	loader=new THREE.ColladaLoader(this.manager);				// If DAE

		loader.load(style.src, (obj)=> { 															// Load model
			loadModel(obj);																			// Load it
			}, onProgress, onError );																// Load

		function onProgress(xhr) {}																	// ON PROGRESS

		function onError(err) {	console.log(err) };													// ON ERROR

		function loadModel(object) {															// ON LOAD
			var texture=null;
			if (object.scene)					object=object.scene;								// Point at scene if there (GLTF/DAE)			
			if (style.tex && isNaN(style.tex)) 	texture=_this.textureLoader.load(style.tex);		// If a texture

			object.traverse(function(child) {														// Go thru model
				if (child.isMesh) { 																// If a mesh
					if (texture)			child.material.map=texture;								// If has texture, add it
					if (!isNaN(style.tex)) 	child.material.color=new THREE.Color(style.tex);		// If an outline
					if (child.material.userData)													// If user data
						child.material.userData.outlineParameters= { visible:style.outline ? true : false}; // Outline?
					}							
				});
			
			group.add(object);																		// Add object to it
			object.name=group.name;																	// KLUDGE!!!
			object.rotation.x=-90*Math.PI/180;														// Correct model angle
			_this.MoveObject(group.name, pos);														// Move
		}
	}


// ANIMATION ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Render() 																			// RENDER LOOP
	{
		var now=new Date().getTime();																// Get current time in ms
		if (now-app.sc.lastTime > 10)	{															// Don't go too fast
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
		var r=Math.PI/180;																			// Degrees to radians
		var obj=this.scene.getObjectByName(name);													// Get object
		obj.rotation.x=pos.rx*r;	obj.rotation.y=pos.ry*r;	obj.rotation.z=pos.rz*r;			// Rotate in radians
		obj.scale.x=pos.sx-0;		obj.scale.y=pos.sy-0;		obj.scale.z=pos.sz-0;				// Scale 
		obj.position.x=pos.x-0;		obj.position.y=pos.y-0;		obj.position.z=pos.z-0;				// Position
	}

	FindScreenObject(x, y, edit)																// FIND OBJECT BY SCREEN POSITION
	{
		var name="";
		var mouse={};
		var div=$(this.container);																	// Point a 3D div
		mouse.x=(x/div.width())*2-1;																// Save X 0-1
		mouse.y=-(y/div.height())*2+1;																// Y
		app.sc.raycaster.setFromCamera(mouse, app.sc.camera);										// Set ray
		var intersects=app.sc.raycaster.intersectObjects(app.sc.scene.children,true);				// Get intersects
		app.curModel=-1;																			// Assume none
		if (intersects.length) {																	// Got something
			if (intersects[0].object.parent.type == "Scene")										// If a child of the scene
				name=intersects[0].object.name;														// Use it											
			else 																					// Go up one
				name=intersects[0].object.parent.name;												// Send parent name

			if (name && edit) {																		// If editing a named object
				this.TransformController(name);														// Apply transform controller
				app.curModel=app.doc.FindModelFrom3D(name);											// Set current model
				}
			else 																					// Not named	
				this.transformControl.detach();														// Detach from control
			}
	}
	
	DeleteObject(name)																			// DELETE OBJECT FROM SCENE
	{
		this.transformControl.detach();																// Detach from control
		var obj=this.scene.getObjectByName(name);													// Get object
		if (obj)	this.scene.remove(obj);															// Remove it
		}

	}  // SCENE CLOSURE