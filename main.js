var outputdiv = null;
var shown = false;
var lastmessage = "notdefined";
var starttime = 0;
var orientationmsg = "notdefined";

var scene;
var camera;
var remderer;
var cube;
var gamestarttime;

var xPosition;
var yPosition;
var xInitialPositions = [];
var yInitialPositions = [];
var xInitialPosition = 1010;
var yInitialPosition;
var xPositionUsable;
var yPositionUsable;
var numAccelSamples = 300;

function accelerometerUpdate(e) {
    if (gamestarttime == -1) return;
    var aX = event.accelerationIncludingGravity.x*1;
    var aY = event.accelerationIncludingGravity.y*1;
    var aZ = event.accelerationIncludingGravity.z*1;
    //The following two lines are just to calculate a
    // tilt. Not really needed. 
    xPosition = Math.atan2(aY, aZ);
    yPosition = Math.atan2(aX, aZ);
    
    if (xInitialPositions.length < numAccelSamples) {
        xInitialPositions.push(xPosition);
        yInitialPositions.push(yPosition);
    } else {
        var sig = 1000;
        var scaler = 10;
        var calc = "median";
        var update = false;
        var change_detected = false;
        var option_update = false;
        
        if (xInitialPosition == 1010) {
            var xsum = 0, xavg;
            var ysum = 0, yavg;
            
            if (calc == "average") {
                for (i = 0; i < xInitialPositions.length; i++) {
                    xsum += xInitialPositions[i];
                    ysum += yInitialPositions[i];
                }
                
                xInitialPosition = xsum / xInitialPositions.length;
                yInitialPosition = ysum / yInitialPositions.length;
            } else if (calc == "median") {
                xInitialPositions.sort();
                yInitialPositions.sort();
                xInitialPosition = xInitialPositions[Math.floor(xInitialPositions.length / 2)];
                yInitialPosition = yInitialPositions[Math.floor(yInitialPositions.length / 2)];
            }
            console.log("num samples=" + xInitialPositions.length);
            console.log("\txInitialPosition = " + xInitialPosition);
            console.log("\tyInitialPosition = " + yInitialPosition);
            console.log("initial positions calculated, sig=" + sig + " scaler=" + scaler);
            console.log("will update automatically");
        } else {
            if (option_update && calc == "median" && Math.random() < .05) {
                //update center
                update = true;
                var xLastInitialPosition = xInitialPosition;
                var yLastInitialPosition = yInitialPosition;
                xInitialPositions.shift();
                yInitialPositions.shift();
                xInitialPositions.push(xPosition);
                yInitialPositions.push(yPosition);
                xInitialPositions.sort();
                yInitialPositions.sort();
                xInitialPosition = xInitialPositions[Math.floor(xInitialPositions.length / 2)];
                yInitialPosition = yInitialPositions[Math.floor(yInitialPositions.length / 2)];
                var xdiff = xLastInitialPosition - xInitialPosition;
                var ydiff = yLastInitialPosition - yInitialPosition;
                if (xdiff == 0 && ydiff == 0) {
                    console.log(Date.now() + " updated center, no change");
                } else {
                    change_detected = true;
                    console.log("updated center");
                    console.log("\txInitialPosition = " + xInitialPosition + " xdelta=" + xdiff);
                    console.log("\tyInitialPosition = " + yInitialPosition + " ydelta=" + ydiff);
                }
            }
        }
        
        xPositionUsable = Math.floor((xInitialPosition - xPosition)*sig/scaler)/sig;
        yPositionUsable = Math.floor((yInitialPosition - yPosition)*sig/scaler)/sig;
        
        if (/*update && !change_detected && */(xPositionUsable > 0 || yPositionUsable > 0)) {
            console.log("\tchange occurred without detection!");
            console.log("\t\txPositionUsable=" + xPositionUsable);
            console.log("\t\tyPositionUsable=" + yPositionUsable);
        }
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
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    gamestarttime = -1;
    
    //goFS.addEventListener("touchstart", startgame, false);
    tic();
    
}




function startgame() {
    //window.scrollTo(0,1);
    document.getElementById("startbutton").style.visibility = "hidden";
    //document.body.requestFullscreen();
    document.body.appendChild( renderer.domElement );
    var geometry = new THREE.BoxGeometry( 10, 10, 10 );
//    var material = new THREE.MeshBasicMaterial( {  wireframe: true, color: 0x00ff00 } );
    var material = new THREE.MeshDepthMaterial();
    //var material = new THREE.LineBasicMaterial({ linewidth: 1, wireframe: true}); //, color: 0x00ff00 });
    cube = new THREE.Mesh( geometry, material );

    scene.add( cube );

    camera.position.z = 25;
    gamestarttime = Date.now();
}

function currenttime() {
    return Date.now() - starttime;
}


function tic() {
    requestAnimationFrame(tic);
    if (gamestarttime == -1) return;
    if (xInitialPosition == 1010) return;
    
    if (xPositionUsable != 0) cube.rotation.x -= xPositionUsable;
    if (yPositionUsable != 0) cube.rotation.y += yPositionUsable;
    renderer.render( scene, camera );
    /*if (currenttime() > 3000 && shown == false) {
        shown = true;
        if (outputdiv) alert("outputdiv exists");
        else alert("outputdiv does not exists");
        alert("lastmessage=" + lastmessage);
    }*/
}

window.onload=init;