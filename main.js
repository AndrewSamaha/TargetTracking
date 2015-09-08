var outputdiv = null;
var shown = false;
var lastmessage = "notdefined";
var starttime = 0;
var orientationmsg = "notdefined";

var scene;
var camera;
var remderer;
var gamestarttime;

function accelerometerUpdate(e) {
   var aX = event.accelerationIncludingGravity.x*1;
   var aY = event.accelerationIncludingGravity.y*1;
   var aZ = event.accelerationIncludingGravity.z*1;
   //The following two lines are just to calculate a
   // tilt. Not really needed. 
   xPosition = Math.atan2(aY, aZ);
   yPosition = Math.atan2(aX, aZ);
   if (outputdiv) {
        outputdiv.innerHTML = lastmessage = xPosition + "<br>" + yPosition + "<br>" + orientationmsg;
       
   }
}

function init() {
    if (document.getElementById("xtrialcontainer")) {
        outputdiv = document.getElementById("xtrialcontainer");
    }
    
    if (window.DeviceMotionEvent == undefined) {
        //No accelerometer is present. Use buttons. 
        //alert("no accelerometer");
    }
    else {
        //alert("accelerometer found");
        window.addEventListener("devicemotion", accelerometerUpdate, true);
        
    }
    starttime = Date.now();
    
    try {
        if (window.screen.lockOrientation("landscape")) {
            orientationmsg = "landscape locked";
        } else {
            orientationmsg = "langscape NOT locked";
        }
    } catch (e) {
        orientationmsg = "";
    }
    
    var goFS = document.getElementById("startbutton");
    goFS.addEventListener("click", startgame, false);
    goFS.addEventListener("touchend", startgame, false);
    
    var maincanvas = document.getElementById("maincanvas");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    gamestarttime = -1;
    
    //goFS.addEventListener("touchstart", startgame, false);
    tic();
    
}




function startgame() {
    window.scrollTo(0,1);
    document.getElementById("startbutton").style.visibility = "hidden";
    document.body.requestFullscreen();
    document.body.appendChild( renderer.domElement );
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;
    gamestarttime = Date.now();
}

function currenttime() {
    return Date.now() - starttime;
}


function tic() {
    requestAnimationFrame(tic);
    renderer.render( scene, camera );
    /*if (currenttime() > 3000 && shown == false) {
        shown = true;
        if (outputdiv) alert("outputdiv exists");
        else alert("outputdiv does not exists");
        alert("lastmessage=" + lastmessage);
    }*/
}

window.onload=init;