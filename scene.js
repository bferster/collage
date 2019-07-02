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
		this.renderer2=null;																		// CSS renderer object
		this.scene=null;																			// Scene object
		this.scene2=null;																			// CSS object
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
		this.scene2=new THREE.Scene();																// Alloc new CSS scene
		this.manager=new THREE.LoadingManager();													// Loading manager
		this.textureLoader=new THREE.TextureLoader();												// Texture loader
		this.AddCamera(0,150,500,45);																// Add camera
		this.renderer=new THREE.WebGLRenderer({ antialias: true });									// Init renderer
		this.renderer.setPixelRatio(window.devicePixelRatio);										// Set ratio
		this.renderer2=new THREE.CSS3DRenderer();													// Init CSS renderer
		this.renderer2.domElement.style.position="absolute"; this.renderer2.domElement.style.top=0;	// Overlay CSS atop 3D
		this.renderer2.domElement.style.backgroundColor="none"
		this.renderer2.domElement.style.pointerEvents="none"
		this.outliner=new THREE.OutlineEffect(this.renderer, { /*defaultThickness:.0035 */ });		// Add outliner
		this.Resize();																				// Resize 3D space
		this.container.appendChild(this.renderer.domElement);										// Add to div
		this.container.appendChild(this.renderer2.domElement);										// Add to div

		this.transformControl=new THREE.TransformControls(this.camera, this.renderer.domElement);	// Add transform controller
		this.transformControl.addEventListener("dragging-changed", (e)=> { this.controls.enabled=!e.value; });	// Inhibit orbiter
		this.transformControl.addEventListener("change", ()=>{										// Render on change
			var o=app.doc.models[app.curModelIx]; 													// Point at model in doc
			if (o) {																				// Valid 
				var obj=this.scene.getObjectByName(o.id);											// Get object
				if (!obj)	return;																	// Nothing to move
				var r=180/Math.PI;																	// Radians to degrees
				o.pos.x=obj.position.x;		o.pos.y=obj.position.y;		o.pos.z=obj.position.z;		// Set position
				o.pos.sx=obj.scale.x;		o.pos.sy=obj.scale.y;		o.pos.sz=obj.scale.z;		// Set scale
				o.pos.rx=obj.rotation.x*r;	o.pos.ry=obj.rotation.y*r;	o.pos.rz=obj.rotation.z*r;	// Set rotation
				this.MoveObject(o.id, o.pos);														// Move
				}
			this.Render(); 																			// Render
			app.DrawTopMenu(true); 																	// Show pos
			});	
		window.addEventListener("keydown", (e)=> { if (!e.target.id) switch (e.keyCode) {			// On key down in body
			case 27:  																				// Esc to revert
				if 	(!this.transformControl.visible)	return;										// Quit if control not active															
				this.transformControl.detach();														// Quit
				this.MoveByMatrix(app.curModelObj.id,this.transMat);								// Restore matrix
				app.SetCurModelById();																// Reset
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
			var pos=app.curModelObj.pos;															// Get pos
			if (pos.pl && (this.transformControl.getMode() == "translate"))	{ PopUp("Position is locked!",2,"mainDiv"); return; }
			if (pos.sl && (this.transformControl.getMode() == "scale"))		{ PopUp("Size is locked!",2,"mainDiv"); 	return; }
			if (pos.rl && (this.transformControl.getMode() == "rotate"))	{ PopUp("Rotation is locked!",2,"mainDiv"); return; }
			this.transMat=obj.matrix.clone();														// Clone starting matrix
			this.scene.add(this.transformControl);													// Add control
			this.transformControl.attach(obj);														// Attach to control
			}
		}
		
	AddLight(style, pos, id)																	// ADD LIGHT
	{
		var light;
		if (style.type == "directional") {															// Directional light															
			light=new THREE.DirectionalLight(pos.col,pos.alpha);									// Made light
			light.position.set(pos.rx,pos.ry,pos.rz).normalize();									// Set angle
			}
		if (style.type == "ambient") 																// Ambient
			light=new THREE.AmbientLight(pos.col,pos.alpha);										// Make light		
		this.scene.add(light);																		// Add light
	}

	Resize()																					// RESIZE 3D SPACE
	{
		var div=$(this.container);																	// Point a 3D dib
		this.camera.aspect=div.width()/div.height();												// Set aspect
		this.camera.updateProjectionMatrix();														// Reset matrix
		if (this.scene && this.scene.outliner) 	this.outliner.setSize(div.width(),div.height());	// Reset outliner render size		
		else if (this.scene)					this.renderer.setSize(div.width(),div.height());	// Main size
		this.renderer2.setSize(div.width(),div.height());											// CSS size
	}

	AddCamera(x, y, z, fov)																		// ADD CAMERA
	{
		var div=$(this.container);																	// Point a 3D dib
		this.camera=new THREE.PerspectiveCamera(fov, div.width()/div.height(), 1, 2000);			// Make camera
		this.scene.add(this.camera);																// Add camera to scene
		this.scene2.add(this.camera);																// Add camera to CSS scene
		this.SetCamera(x,y,z);																		// Position camera
		this.controls=new THREE.OrbitControls(this.camera);											// Add orbiter control
		this.controls.damping=0.2;																	// Set dampening
		this.controls.addEventListener('change',()=> { 												// Show camera movement		
			var o=app.doc.models[0].pos;															// Point at model
			o.x=this.camera.position.x;	o.y=this.camera.position.y;  o.z=this.camera.position.z;	// Set position
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
		if (style.type == "cube") {																	// If a reflection cube
			var urls=[style.left,style.right,style.roof,style.floor,style.front,style.back];		// Order is L,R,T,B,F,R and must be 512 by 512
			var reflectionCube=new THREE.CubeTextureLoader().load((urls));							// Load cube texture
			reflectionCube.format=THREE.RGBFormat;													// Make image
			var shader=THREE.ShaderLib["cube"];														// Make shader
			shader.uniforms["tCube"].value=reflectionCube;
			var material=new THREE.ShaderMaterial( {
				fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader,
				uniforms: shader.uniforms, depthWrite: false, side: THREE.BackSide
				}),
			mesh=new THREE.Mesh(new THREE.BoxGeometry(pos.sx,pos.sy,pos.sz),material);
			mesh.position.y=256;		pos.y=256;													// Shift up
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
		this.scene.add(group);																		// Add to scene	

		function addWall(x, y, z, xr, yr, zr, h, texture) {											// ADD WALL
			var mat=new THREE.MeshPhongMaterial();													// Make material
			mat.userData.outlineParameters= { visible: false };										// Hide outline
//			mat.transparent=true;																	// Allow transparency
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
		var obj=new THREE.CSS3DObject(element);														// Add object
		element.style.background=style.back ? style.back : "";										// Background
		element.style.border=style.border ? style.border : "";										// Border
		element.id=id;																				// Name same as group
		if (style.src && style.src.match(/\/\//))													// If a url
			$(element).append("<iframe frameborder=0 scrolling='no' height='"+pos.sy+"' width='"+pos.sx+"'src='"+style.src+"'/>");
		else
			$(element).append("<iframe frameborder=0 scrolling='no' height='"+pos.sy+"' width='"+pos.sx+"'srcdoc='"+style.src+"'/>");
		var group2=new THREE.Group();																// Create new group for CSS
		group2.name=id;																				// Id to group
		group2.add(obj);																			// Add object to group2
		this.scene2.add(group2);																	// Add to scene2
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
		else if (style.src.match(/\.gltf/i))	loader=new THREE.GLTFLoader(this.manager);			// If GLTF
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
						m[i].userData.outlineParameters= { visible:style.outline ? true : false}; 	// Outline?
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

	Render() 																			// RENDER LOOP
	{
		var now=new Date().getTime();																// Get current time in ms
		if (now-app.sc.lastTime > 10)	{															// Don't go too fast
			app.sc.controls.update();																// Update control time
			app.sc.AnimateScene();																	// Animate models
			if (app.sc.outliner) 	app.sc.outliner.render(app.sc.scene, app.sc.camera );			// Render outline
			else					app.sc.renderer.render(app.sc.scene,app.sc.camera);				// Render scene
			app.sc.renderer2.render(app.sc.scene2,app.sc.camera);									// Render CSS
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
		if (name == "camera") {
			this.camera.position.x=pos.x;	this.camera.position.y=pos.y;  							// Set position
			this.camera.position.z=pos.z;
			return;																					// fov
			}
		var r=Math.PI/180;																			// Degrees to radians
		var obj=this.scene.getObjectByName(name).children[0];										// Get inner object
		if (!obj)	return;																			// Quit if empty group
		obj.position.x=pos.cx/pos.sx;  obj.position.y=pos.cy/pos.sy;  obj.position.z=pos.cz/pos.sz; // Pivot by unscaled center
		obj=this.scene.getObjectByName(name);														// Get group object
		obj.visible=pos.vis ? true : false;															// Set visibility
		obj.rotation.x=pos.rx*r;	obj.rotation.y=pos.ry*r;	obj.rotation.z=pos.rz*r;			// Rotate in radians
		obj.scale.x=pos.sx-0;		obj.scale.y=pos.sy-0;		obj.scale.z=pos.sz-0;				// Scale 
		obj.position.x=pos.x-0;		obj.position.y=pos.y-0;		obj.position.z=pos.z-0;				// Position
		if (obj.css) {																				// Had a CSS object attached
			var obj=this.scene2.getObjectByName(name).children[0];									// Get inner object
			obj.position.x=pos.cx/pos.sx;  obj.position.y=pos.cy/pos.sy;  obj.position.z=pos.cz/pos.sz; // Pivot by unscaled center
			obj=this.scene2.getObjectByName(name);													// Get group object
			obj.rotation.x=pos.rx*r;	obj.rotation.y=pos.ry*r;	obj.rotation.z=pos.rz*r;		// Rotate in radians
			obj.scale.x=pos.sx-0;		obj.scale.y=pos.sy-0;		obj.scale.z=pos.sz-0;			// Scale 
			obj.position.x=pos.x-0;		obj.position.y=pos.y-0;		obj.position.z=pos.z-0;			// Position
			$("#"+name).css("opacity",pos.vis ? pos.a : 0);											// Set alpha	
			}

		obj.traverse(function(child) {																// Set alpha for each object
			 if (child.material && child.isMesh) {													// If a mesh with material
				m=child.material;																	// Point at materal array
				if (!m[0]) m=[],m[0]=child.material;												// If only one, make into array
				for (i=0;i<m.length;++i) 	m[i].opacity=pos.a*m[i].origAlpha;						// Set alpha for each material
			}});	

		}

	SetVisibility(name, vis, alpha)																// SET OBJECT'S VISIBILITY
	{
		var obj=this.scene.getObjectByName(name);													// Get group object
		if (!obj)	return;																			// Quit if no obj
		obj.visible=vis ? true : false;																// Set visibility
		if (obj.css)  $("#"+name).css("opacity",vis ? alpha : 0);									// Set alpha on CSS
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
		app.SetCurModelById();																		// Assume none
		if (intersects.length) {																	// Got something
			if (intersects[0].object.parent.type == "Scene")										// If a child of the scene
				name=intersects[0].object.name;														// Use it											
			else 																					// Go up one
				name=intersects[0].object.parent.name;												// Send parent name
			if (name && edit) {																		// If editing a named object
				app.SetCurModelById(name);															// Set current model
				this.TransformController(name);														// Apply transform controller
				app.SetCurModelById(name);															// Set current model
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