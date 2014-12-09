
//
//
//
//Image library
//
//
//
var ImageLibrary = function(divid) {
    this.images = [];
    this.div = null;
    this.defaultWidth = 200;
    this.defaultHeight = 200;
    this.OPTION_compareZoomedImages = false;
    
    
    if (divid && document.getElementById(divid)) {
        this.div = document.getElementById(divid);
        console.log("ImageLibrary is initialized");
    } else {
        console.log("error initializing ImageLibrary");
    }
    
    this.init = function(divid) {
        if (divid && document.getElementById(divid)) {
            this.div = document.getElementById(divid);
            console.log("ImageLibrary is initialized");
        } else {
            console.log("error initializing ImageLibrary");
        }
    }
    
    this.add = function(newimage) {
        this.images.push(newimage);
    }
    this.draw = function() {
        console.log("imageLibrary.draw");
        console.log("\tremoving children");
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
        this.images.every((function(element, index, array) {
            if (!element.data) return;
            console.log("\tdrawing element " + index);
            var canvas = document.createElement("canvas");
            canvas.width =  this.defaultWidth;
            canvas.height = this.defaultHeight;
            canvas.id = "image"+index;
            canvas.className = "sample";
            //was here
            
            var context = canvas.getContext("2d");
            context.scale(1,1);
            context.putImageData(element.data, 0, 0);
            
            var containerdiv = document.createElement("div");
            containerdiv.id = "imagecontainer" + index;
            
            var captiondiv = document.createElement("div");
            captiondiv.id = "imagecaption" + index;
            captiondiv.innerHTML = "imagecaption" + index;
            captiondiv.className = "caption";
            
            containerdiv.appendChild(canvas);
            containerdiv.appendChild(captiondiv);
            
            if (this.div) this.div.appendChild(containerdiv);
            else console.log("\terror, this.div undefined");
            
            return true;
        }).bind(this));
    }
    this.storeIteration = function() {
        console.log("imageLibrary.storeIteration XX");
        drawable.context.imageSmoothingEnabled = false;
        drawable.context.webkitImageSmoothingEnabled = false;
        drawable.context.mozImageSmoothingEnabled = false;
        console.log("hashing image at 3 sizes, 1x1, 2x2, & 10x10:");
        imageHasher.getHashAtScale(drawable.canvas, 1);
        imageHasher.getHashAtScale(drawable.canvas, 2);
        imageHasher.getHashAtScale(drawable.canvas, 200);
        if (this.OPTION_compareZoomedImages) {
            var newImage = new Image();
            var data = imageHasher.getPreparedImage(drawable.canvas);
            newImage.data = data;
            imageLibrary.add(newImage);
            imageLibrary.draw();
        } else {
            var newImage = new Image();
            newImage.data = drawable.context.getImageData(0,0,drawable.imageWidth,drawable.imageHeight);
            imageLibrary.add(newImage);
            imageLibrary.draw();
        }
        
        //console.log("imageLibrary.size=" + Math.floor(this.size()/100000)/10 + " mb");
    }
    this.size= function() {
        /*

        sizeof.js

        A function to calculate the approximate memory usage of objects

        Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
        the terms of the CC0 1.0 Universal legal code:

        http://creativecommons.org/publicdomain/zero/1.0/legalcode

        */

        var objects = [this.images];
        var size    = 0;


        for (var index = 0; index < objects.length; index ++){
            switch (typeof objects[index]){
                case 'boolean': size += 4; break;
                case 'number': size += 8; break;
                case 'string': size += 2 * objects[index].length; break;
                case 'object':
                    // if the object is not an array, add the sizes of the keys
                    if (Object.prototype.toString.call(objects[index]) != '[object Array]'){
                        for (var key in objects[index]) size += 2 * key.length;
                    }

                    // loop over the keys
                    for (var key in objects[index]){

                    // determine whether the value has already been processed
                    var processed = false;
                    for (var search = 0; search < objects.length; search ++){
                        if (objects[search] === objects[index][key]){
                            processed = true;
                            break;
                        }
                    }

                    // queue the value to be processed if appropriate
                    if (!processed) objects.push(objects[index][key]);

                }
            }
        }


        return size;
    }
}

var ImageHasher = function() {
    this.canvas = null;
    this.context = null;
    this.maxWidth = 200;
    this.maxHeight = 200;
    
    this.init = function() {
        if (!this.context) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.maxWidth;
            this.canvas.height = this.maxHeight;
            this.context = this.canvas.getContext('2d');
            document.lastChild.appendChild(this.canvas);
        }
    }
    this.getPreparedImage = function(canvas) {
        //returns a centered and zoomed image
        var width = canvas.width;
        var height = canvas.height;
        var context = canvas.getContext('2d');
        var image = context.getImageData(0,0,width,height);
        var data = image.data;
        
        //initialize some starting values
        var left = width;
        var right = 0;
        var bottom = 0;
        var top = height;
        var firstrow = "";
        
        var min = 255;
        var max = 0;
        var numFilled = 0;
        
        this.canvas.width = this.canvas.width;
        
        console.log("preparing image:");
        console.log("\tlength=" + data.length);
        console.log("\twidth=" + width);
        console.log("\theight=" + height);
        
        if (context) console.log("\tcontext=defined");
        else console.log("\tcontext=UNDEFINED!");
        
        if (data) console.log("\tdata=defined");
        else console.log("\tdata=UNDEFINED!");
        
        for (var i = 0; i <= data.length; i=i+4) {
            
            var x = (i/4) % width;
            var y = Math.floor((i/4) / width);
            if (y == 2) {
                if (data[i+3]) firstrow += "X";
                else firstrow += "-";
            }
            
            if (data[i+3]) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
            }
            if (x >= 1 && y >= 1) {
                min = Math.min(min,data[i+3]);
                max = Math.max(max,data[i+3]);
            }
        }
        
        console.log("firstrow:" + firstrow);
        console.log("prepared image:");
        console.log("\tleft-right: " + left + "-" + right);
        console.log("\ttop-bottom: " + top + "-" + bottom);
        console.log("\tmax: " + max);
        console.log("\tmin: " + min);
        
        if (left == width && right == 0 && bottom == 0 && top == height) {
            return image;
        } else {
            var scaled_width = right - left;
            var scaled_height = bottom - top;
            var scaleX = this.maxWidth / scaled_width;
            var scaleY = this.maxHeight / scaled_height;
            
            console.log("\tleft=" + left);
            console.log("\ttop=" + top);
            console.log("\tscaled_width=" + scaled_width);
            console.log("\tscaled_height=" + scaled_height);
            console.log("\tthis.maxWidth= [" + this.maxWidth + "]");
            console.log("\tthis.maxHeight=[" + this.maxHeight + "]");
            console.log("\tscaleX,y=" + scaleX + "," + scaleY);

            
            //image = context.getImageData(left, top, scaled_width, scaled_height);
            
            /*
            //this works but it doesn't rescale the image
            this.context.putImageData(image, 0, 0);
            return this.context.getImageData(0, 0, this.maxWidth, this.maxHeight);
            */
            
            /*
            //works, but only rescales the original image
            var newcanvas = document.createElement("canvas");
            newcanvas.width = image.width;
            newcanvas.height= image.height;
            newcanvas.getContext('2d').putImageData(image,0,0);
            context.scale( this.maxWidth/ scaled_width, this.maxHeight / scaled_height);
            context.drawImage(newcanvas, 0, 0);
            return newcanvas.getContext('2d').getImageData(0, 0, scaled_width, scaled_height);
            */
            
            var newcanvas = document.createElement("canvas");
            newcanvas.width = image.width;
            newcanvas.height= image.height;
            newcanvas.getContext('2d').drawImage(
                canvas,
                left, top, scaled_width, scaled_height,
                0, 0, this.maxWidth, this.maxHeight
            );
            return newcanvas.getContext('2d').getImageData(0, 0, this.maxWidth, this.maxHeight);

        }
    }
    this.getHashAtScale = function(canvas, newsize) {
        var width = canvas.width;
        var height = canvas.height;
        var context = canvas.getContext('2d');
        var image = context.getImageData(0,0,width,height);
        var data = image.data;
        
        //initialize some starting values
        var left = width;
        var right = 0;
        var bottom = 0;
        var top = height;
        var firstrow = "";
        
        var min = 255;
        var max = 0;
        var numFilled = 0;
        
        this.canvas.width = this.canvas.width;
        
        

        
        var newcanvas = document.createElement("canvas");
        newcanvas.width = image.width;
        newcanvas.height= image.height;
        newcanvas.getContext('2d').drawImage(
            canvas,
            0, 0, width, height,
            0, 0, newsize, newsize
        );
        
        data = newcanvas.getContext('2d').getImageData(0,0,newsize,newsize).data;
        var hash = [];
        for (var i = 0; i < data.length; i=i+1) {
            hash.push(data[i]);
        }
        console.log("getHashAtScale(" + newsize + ")= " + hash);
    }
}
function hash(data) {
    var hash = [];
    var rsum = 0;
    var gsum = 0;
    var bsum = 0;
    var asum = 0;
    for (var i = 0; i < data.length; i+=4) {
        rsum+=data[i];
        gsum+=data[i+1];
        bsum+=data[i+2];
        asum+=data[i+3]
    }
}



//
//
//
//Image
//
//
//
var Image = function() {
    this.data = [];
}





//
//
//
//Image library
//
//
//
var Drawable = function() {
    //pass a canvas, make it drawable
    this.imageDatas = [];
    this.imageWidth = 200;
    this.imageHeight = 200;
    this.maxShapes = 8;
    this.minShapes = 5;
    this.canvas = null;
    this.context = null;
    this.ready = false;
    this.numImagesToCreate = 0;
    this.numImagesCreated = 0;
    this.numToCreateEachTic = 5;
    this.imageCreationTimeCeiling = 50;
    this.ticLengths = [];
    this.readyCallback = null;
    this.mouseDown = false;
    this.scale = 1;
    
    //Options
    this.OPTION_storeAfterMouseUP = true;
    
    this.init = function(canvas, drawable) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.scale(this.scale, this.scale);
        this.ready = false;
        if (!this.canvas) {
            console.log("ImageLibrary error, initialized with null canvas!");
        }
        if (drawable) {
            this.canvas.addEventListener("click", this.click.bind(this), false);
            this.canvas.addEventListener("mousedown", this.mousedown.bind(this), false);
            this.canvas.addEventListener("mouseup", this.mouseup.bind(this), false);
            this.canvas.addEventListener("mouseout", this.mouseout.bind(this), false);
            this.canvas.addEventListener("dblclick", this.dblclick.bind(this), false);
            this.canvas.addEventListener("mousemove", this.mousemove.bind(this), false);
            //this.imageDatas = drawable.getImageData(0,0,this.imageWidth,this.imageHeight);
            console.log("drawable inited.");
        }
    }
    this.getmousepos = function(event) {
        event = event || window.event; // IE-ism
        var mousePos = {
            x: Math.floor(event.clientX/this.scale - this.canvas.offsetLeft/this.scale),
            y: Math.floor(event.clientY/this.scale - this.canvas.offsetTop/this.scale)
        };

        return mousePos;
    }
    this.drawPoint = function(mousePos) {
        
        this.context.fillStyle="black";
        this.context.fillRect(mousePos.x, mousePos.y, 1, 1);
        
        /*
        this.context.beginPath();
        this.context.strokeStyle = "black";
        this.context.lineWidth = .1;
        this.context.lineHeight = .1;
        this.context.moveTo(mousePos.x-.1, mousePos.y);
        this.context.lineTo(mousePos.x, mousePos.y);
        this.context.stroke();
        this.context.closePath();
        //*/
    }
    this.mousedown = function(event) {
        this.mouseDown = true;
        
        var mousePos = this.getmousepos(event);
        this.drawPoint(mousePos);
    }
    this.mouseup = function(event) {
        this.mouseDown = false;
        if (this.OPTION_storeAfterMouseUP) imageLibrary.storeIteration();
    }
    this.mouseout = function(event) {
        this.mouseDown = false;
        if (this.OPTION_storeAfterMouseUP && this.mouseDown) imageLibrary.storeIteration();
    }
    this.mousemove = function(event) {
        if (!this.mouseDown) return;
        var mousePos = this.getmousepos(event);
        //this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.drawPoint(mousePos);
    }
    this.click = function(event) {
        var mousePos = this.getmousepos(event);
        //this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.drawPoint(mousePos);
        console.log("click - " + this.canvas.offsetLeft);
    }
    this.dblclick = function(event) {
        console.log("double click");
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
    this.draw = function() {
        
    }
}


var lastTicTime = 0;
var drawable;
var imageLibrary = null;
var imageHasher = null;
var index = 0;
var trial = null;
var trialcontainerdiv = null;


var corrects = 0;
var incorrects = 0;
var trialaccuracy = [];

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function keypress(event) {
    if (event.keyCode == 115) {
        // 's'
        /*
        var newImage = new Image();
        //var data = drawable.context.getImageData(0,0,drawable.imageWidth, drawable.imageHeight);
        var data = imageHasher.getPreparedImage(drawable.canvas);
        newImage.data = data;
        imageLibrary.add(newImage);
        imageLibrary.draw();
        */
        imageLibrary.storeIteration();
    } else if (event.keyCode == 99) {
        
    } else {
        console.log(event.keyCode);
    }
}

function init() {
    lastTicTime = Date.now();
    
    trialcontainerdiv = document.getElementById("trialcontainer");
    
    
    var stimulicanvas = document.getElementById("stimuli");
    
    document.onkeypress = keypress;
    
    drawable = new Drawable();
    drawable.init(stimulicanvas, true);

    imageLibrary = new ImageLibrary("librarycontainer");
    imageLibrary.init("librarycontainer");
    
    imageHasher = new ImageHasher();
    imageHasher.init();
    
    tic();
    
}
function tic() {
    requestAnimationFrame(tic);
    //
    
    var delta = Date.now() - lastTicTime;
    lastTicTime = Date.now();
    //if (trial) trial.ticDraw(trialcontainerdiv);
}

window.onload=init;