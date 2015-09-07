var outputdiv = null;
var shown = false;
var lastmessage = "notdefined";
var starttime = 0;
var orientationmsg = "notdefined";

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
    //goFS.addEventListener("touchstart", startgame, false);
    tic();
    
}

function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

function startgame() {
    window.scrollTo(0,1);
    document.getElementById("startbutton").style.visibility = "hidden";
    document.body.requestFullscreen();
    toggleFullScreen();
}

function currenttime() {
    return Date.now() - starttime;
}


function tic() {
    requestAnimationFrame(tic);
    /*if (currenttime() > 3000 && shown == false) {
        shown = true;
        if (outputdiv) alert("outputdiv exists");
        else alert("outputdiv does not exists");
        alert("lastmessage=" + lastmessage);
    }*/
}

window.onload=init;