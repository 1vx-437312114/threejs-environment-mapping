const degToRad = Math.PI / 180.0;

var rotationAngle = 0.0;
var elapsedTime = 0.0;
var timeNow = 0.0;
var lastTime = 0;
var timeStart = 0;


var tieFighterMesh1, tieFighterMesh2;
var milleniumFalconMesh;

var renderer, camera, scene, sceneCube, cubeMesh, textureCube;
var cloudCityMaterial, tieFighterMaterial1, tieFighterMaterial2;
var curve;
var t = 0.0;

var lastPos;
var lastTangent = new THREE.Vector2(0.0, 1.0);

var rotateX = 0.0;
var rotateY = 0.0;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

	
function start() {
	var sizeX = window.innerWidth - 10;
	var sizeY = window.innerHeight - 80;
	
    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(sizeX, sizeY);
    renderer.setFaceCulling(THREE.CullFaceNone);

    var canvasWidth = sizeX;
    var canvasHeight = sizeY;
    
    camera = new THREE.PerspectiveCamera(45.0, canvasWidth / canvasHeight, 1.0, 100000.0);
    camera.position.x = 50;
    camera.position.y = 120;
    camera.position.z = 8100;
    camera.up = new THREE.Vector3(0.0, 1.0, 0.0);
    camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    camera.updateProjectionMatrix();
    cameraCube = new THREE.PerspectiveCamera(70, canvasWidth / canvasHeight, 1.0, 10000.0);

    curve = new THREE.EllipseCurve(
		0.0,  0.0,            	// ax, aY
		2000.0, 7200.0,         // xRadius, yRadius
		0.0,  2.0 * Math.PI,  	// aStartAngle, aEndAngle
		false,            		// aClockwise
		0                 		// aRotation 
	);
	
    // create scene(s)
    scene = new THREE.Scene();
    sceneCube = new THREE.Scene();
    
    // lights
    var ambientLight = new THREE.AmbientLight(0xdddddd);
    scene.add(ambientLight);

    // textures
    var path = "textures/";
    var urls = [path + "px.jpg", path + "nx.jpg",
        path + "py.jpg", path + "ny.jpg",
        path + "pz.jpg", path + "nz.jpg"];
    
    textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;
    
    // materials
    var cubeShader = THREE.ShaderLib["cube"];

    var cubeMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    cubeMaterial.uniforms["tCube"].value = this.textureCube;

    // skybox
    cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(100.0, 100.0, 100.0), cubeMaterial);
    sceneCube.add(cubeMesh);

	loadModels();
    
    document.getElementById("WebGLCanvas").appendChild(this.renderer.domElement);
}


function loadModels() {
	loadCloudCityModel();
}


function loadCloudCityModel() {
    var loader = new THREE.ObjectLoader();
	
    cloudCityMaterial = new THREE.MeshPhongMaterial({ color: 0x4c4a41, transparent: false, side: THREE.DoubleSide });
     
    loader.load("models/bespin-star-wars-cloud-city.json", function (geometry) {

        geometry.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = cloudCityMaterial;
            }
        });

        geometry.scale.multiplyScalar(10.0);

        geometry.position.y -= 0.0;
        geometry.position.z -= 0.0;
              
        scene.add(geometry);
		
		loadTieFighterModel1();
    });	
	
}


function loadTieFighterModel1() {
    var loader = new THREE.ObjectLoader();
	
    tieFighterMaterial1 = new THREE.MeshPhongMaterial({ color: 0x555555, transparent: false, side: THREE.DoubleSide, envMap: this.textureCube });
    
    loader.load("models/star-wars-vader-tie-fighter.json", function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = tieFighterMaterial1;
                child.name = "tiefighter1";
            }
        });
        
        object.scale.multiplyScalar(10.0);
        object.position.y = 40.0;            
        object.position.z = 7500.0;
        object.rotateY(255.0);            
        object.name = "tiefighter1";
        
        tieFighterMesh1 = object;
        
        scene.add(object);

		loadTieFighterModel2();
    });
    
	
}


function loadTieFighterModel2() {
    var loader = new THREE.ObjectLoader();

    tieFighterMaterial2 = new THREE.MeshPhongMaterial({ color: 0x555555, transparent: false, side: THREE.DoubleSide, envMap: this.textureCube });
    
	loader.load("models/starwars-tie-fighter.json", function (object) {	
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = tieFighterMaterial2;
                child.name = "tiefighter2";
            }
        });
        
        object.scale.multiplyScalar(10.0);
		object.position.x += 300.0;
        object.position.y += 40.0;            
        object.position.z += 7000.0;
        object.rotateY(0.0);            
        object.name = "tiefighter2";
        
        tieFighterMesh2 = object;
        
        scene.add(object);
		        
		MIDIjs.play('midi/main_title.mid');
	
		run();
    });

}


function onWindowResize() {
    var aspectRatio = window.innerWidth / window.innerHeight;
    
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    cameraCube.aspect = aspectRatio;
    cameraCube.updateProjectionMatrix();
}


function render() {
    timeNow = performance.now();
    
    if (lastTime != 0) 
    {
        elapsedTime = (elapsedTime + (timeNow - lastTime)) / 2.0;
    
        rotationAngle = (elapsedTime) / 1000.0;
    }
        
    lastTime = timeNow;

    tieFighterMesh1.rotation.x += rotateX;
	tieFighterMesh1.rotation.y -= rotateY;
	
	rotateX = 0.0;
	rotateY = 0.0;
	
	t = (t + elapsedTime / 30000.0) ;
	
	if(t >= 1.0)
		t = 1.0 - t;
	
	
	var pos = curve.getPoint(t);
	var tangent = curve.getTangent(t).normalize();

	var angle = Math.atan( tangent.x / tangent.y);
	
	lastPos = pos;
	lastTangent = tangent;
	
	tieFighterMesh2.rotation.y = angle;
	
	tieFighterMesh2.position.x = pos.x;
	tieFighterMesh2.position.z = pos.y;

    requestAnimationFrame(function () { return render(); });

    //camera.lookAt(scene.position);
    //cameraCube.rotation.copy(camera.rotation);
    renderer.render(sceneCube, cameraCube);
    renderer.render(scene, camera);
};


function run() {
    window.addEventListener("resize", function () { return onWindowResize(); }, false);

	tieFighterMesh = this.scene.getObjectByName( "tiefighter", true );
		
	timeStart = performance.now();
    render();
}


function doKey(evt) 
{
	var rotationChanged = true;
	
	var rotX = 0.0;
	var rotY = 0.0;
	
	switch (evt.keyCode) 
	{
		case 37: rotX = -2.0; break;      // left arrow
		case 39: rotX =  2.0; break;      // right arrow
		case 38: rotY = -2.0; break;      // up arrow
		case 40: rotY =  2.0; break;      // down arrow
		
		case 13: rotX = rotY = 0; break;  // return
		case 36: rotX = rotY = 0; break;  // home
				
		default: rotationChanged = false;
	}

	if (rotationChanged) 
	{
		rotateX = degToRad * rotY;
		rotateY = degToRad * rotX;
	}
}


function handleMouseDown(event) 
{
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}


function handleMouseUp(event) 
{
	mouseDown = false;
}


function handleMouseMove(event) 
{
	if (!mouseDown) 
		return;
	
	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX;
	rotateY = degToRad * (deltaX / 2.0);
	
	var deltaY = newY - lastMouseY;
	rotateX = degToRad * (deltaY / 2.0);

	lastMouseX = newX
	lastMouseY = newY;
}


window.onload = function () {
	var canvas = document.getElementById("WebGLCanvas");		
			
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;

	        
    document.addEventListener("keydown", doKey, false);
		
	start();
};
