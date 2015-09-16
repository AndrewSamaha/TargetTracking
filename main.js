var outputdiv = null;
var shown = false;
var lastmessage = "notdefined";
var starttime = 0;
var orientationmsg = "notdefined";

var threejsscene;
var camera;
var remderer;
var cube;
var gamestarttime;
var material;
var geometry;



var xPosition;
var yPosition;
var xInitialPositions = [];
var yInitialPositions = [];
var xInitialPosition = 1010;
var yInitialPosition;
var xPositionUsable;
var yPositionUsable;
var numAccelSamples = 300;

var option_rowwidth = 5;
var option_numrows = 20;
var cube_size = 10;
var scene;
var user_ship;
var last_tic;

var Ship = function(x, y, z, speed) {
    this.shape = "pyramid";
    this.x = x;
    this.y = y;
    this.z = z;
    this.speed = speed;
    if (this.shape == "cube") {
                    //new THREE.CylinderGeometry( 1, cube_size*3, cube_size*3, 4 );
        this.geometry = new THREE.BoxGeometry( cube_size/3, cube_size/3, cube_size/3 );
        this.material = new THREE.MeshDepthMaterial(); //new THREE.MeshBasicMaterial( {color: 0xffff00 , wireframe:true} );
    } else if (this.shape == "pyramid") {
        this.geometry = new THREE.CylinderGeometry( 1, cube_size/3, cube_size/3, 4 );
        this.material = new THREE.MeshBasicMaterial( {color: 0xffff00 , wireframe:true} );
    }
    this.obj = new THREE.Mesh( this.geometry, this.material );
    this.firstcall = true;
    
    this.remove = function(jsscene) {
        jsscene.remove(this.obj);
    }
    this.add = function(jsscene) {
        jsscene.add(this.obj);
        this.obj.position.x = this.x;
        this.obj.position.y = this.y;
        this.obj.position.z = this.z;
    }
    this.tic = function(delta) {
        if (this.firstcall) {
            this.firstcall = false;
            return;
        }
        this.obj.position.z -= this.speed*delta;
        //if (Math.random() > .99) console.log(this.z);
    }
}

var Row = function(zposition, def) {
    this.cubes = [];
    this.zposition = zposition;
    this.contents_string = "";
    this.id = Math.floor(Math.random()*8000);
    
    
    //Init
    this.zposition = zposition;
    if (def) {
        for (var i = 0; i < def.length; i++) {
            var c = new THREE.Mesh( geometry, material );
            threejsscene.add(c);
            if (def[i]) this.cubes.push(c);
            else this.cubes.push(null);
        }
    } else {
        for (var i = 0; i < option_rowwidth; i++) {
            if (Math.random() > .75) {
                geometry = new THREE.BoxGeometry( cube_size, cube_size, cube_size );
                material = new THREE.MeshDepthMaterial();
                var c = new THREE.Mesh( geometry, material );
                threejsscene.add(c);
                this.cubes.push(c);
                this.contents_string += "X";
            } else {
                this.cubes.push(null);
                this.contents_string += " ";
            }
        }
    }
    console.log(this.contents_string + " creating row at z=" + zposition);
    for (var i = 0; i < this.cubes.length; i++) {
        if (this.cubes[i]) {
            this.cubes[i].position.x = i*cube_size - option_rowwidth*cube_size/2;
            this.cubes[i].position.z = zposition;
            //console.log("\tx,z = " + this.cubes[i].position.x + "," + this.cubes[i].position.z);
        }
    }
    
    
    this.setZ = function(newpos) {
        for (var i = 0; i < this.cubes.length; i++) {
            if (this.cubes[i]) this.cubes[i].position.z = newpos;
        }
    }
    
    this.remove = function() {
        for (var i = 0; i < this.cubes.length; i++) {
            if (this.cubes[i]) threejsscene.remove(this.cubes[i]);
        }
    }
}

var Scene = function(cameraz) {
    //Init
    this.rows = [];
    this.currentZ = cameraz-cube_size*option_numrows;
    for (var i = 0; i < option_numrows; i++) {
        //rows[0] is the furthest row
        var row = new Row(this.currentZ);
        this.rows.push(row);
        this.currentZ += cube_size;
    }
    
    this.setCameraZ = function(newz) {
        this.currentZ = newz;
        var toasted_rows = 0;
        for (var i = this.rows.length-1; i>=0; i--) {
            if (this.rows[i].zposition>this.currentZ) {
                console.log("removing row " + i);
                this.removeRow(i);
                toasted_rows++;
            } else break;
        }
        for (var i = 0; i < toasted_rows; i++) {
            var row = new Row(newz-cube_size*this.rows.length);
            this.rows.unshift(row); //add a new row to the beginning of the array
        }
    }
    
    this.removeRow = function(i) {
        this.rows[i].remove();
        this.rows.splice(i,1);
    }
}
function accelerometerUpdate(e) {
    //if (gamestarttime == -1) return;
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
        var sig = 100000;
        var scaler = 1;
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
                    //console.log(Date.now() + " updated center, no change");
                } else {
                    change_detected = true;
                    //console.log("updated center");
                    //console.log("\txInitialPosition = " + xInitialPosition + " xdelta=" + xdiff);
                    //console.log("\tyInitialPosition = " + yInitialPosition + " ydelta=" + ydiff);
                }
            }
        }
        
        xPositionUsable = Math.floor((xInitialPosition - xPosition)*sig/scaler)/sig;
        yPositionUsable = Math.floor((yInitialPosition - yPosition)*sig/scaler)/sig;
        
        if (/*update && !change_detected && */(xPositionUsable > 0 || yPositionUsable > 0)) {
            //console.log("\tchange occurred without detection!");
            //console.log("\t\txPositionUsable=" + xPositionUsable);
            //console.log("\t\tyPositionUsable=" + yPositionUsable);
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
    threejsscene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 150 );
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
    geometry = new THREE.BoxGeometry( cube_size+.1, cube_size+.1, cube_size+.1 );
//    var material = new THREE.MeshBasicMaterial( {  wireframe: true, color: 0x00ff00 } );
    material = new THREE.MeshDepthMaterial();
    //var material = new THREE.LineBasicMaterial({ linewidth: 1, wireframe: true}); //, color: 0x00ff00 });
    //cube = new THREE.Mesh( geometry, material );

    //threejsscene.add( cube );

    camera.position.z = 25;
    camera.position.y = 10;
    scene = new Scene(-camera.position.z);
    user_ship = new Ship(0,0,-50,.0150);
    user_ship.add(threejsscene);
    
    gamestarttime = Date.now();
    console.log("game started @" + gamestarttime);
}

function currenttime() {
    return Date.now() - starttime;
}


function tic() {
    requestAnimationFrame(tic);
    if (gamestarttime == -1) return;
    if (xInitialPosition == 1010) return;
    

    //if (xPositionUsable > 0) camera.position.z -= xPositionUsable;
                            //camera.position.x = camera.position.x - yPositionUsable*2;
    if (yPositionUsable != 0) user_ship.obj.position.x = user_ship.obj.position.x - yPositionUsable*2;
    user_ship.obj.position.x = Math.max(-30, Math.min(20, user_ship.obj.position.x));
    
    var delta = Date.now() - last_tic;

    //update the ship position and the camera
    user_ship.tic(delta);
    camera.position.z = user_ship.obj.position.z + 25;
    camera.position.x = user_ship.obj.position.x;
    scene.setCameraZ(camera.position.z); //update the scene

    
    renderer.render( threejsscene, camera );
    last_tic = Date.now();
}

window.onload=init;