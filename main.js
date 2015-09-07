var outputdiv = null;

function accelerometerUpdate(e) {
   var aX = event.accelerationIncludingGravity.x*1;
   var aY = event.accelerationIncludingGravity.y*1;
   var aZ = event.accelerationIncludingGravity.z*1;
   //The following two lines are just to calculate a
   // tilt. Not really needed. 
   xPosition = Math.atan2(aY, aZ);
   yPosition = Math.atan2(aX, aZ);
   if (outputdiv) {
        outputdiv.innerHTML = xPosition + "<br>" + yPosition;
   }
}

function init() {
    if (window.DeviceMotionEvent == undefined) {
        //No accelerometer is present. Use buttons. 
        alert("no accelerometer");
    }
    else {
        alert("accelerometer found");
        window.addEventListener("devicemotion", accelerometerUpdate, true);
        if (document.getElementById("xtrialcontainer")) {
            outputdiv = document.getElementById("xtrialcontainer");
        }
    }
    
    tic();
    
}



function tic() {
    requestAnimationFrame(tic);
}

window.onload=init;