
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
    this.defaultWidth = 256;
    this.defaultHeight = 256;
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
            captiondiv.innerHTML = "imagecaption" + index + ": " + element.hash.id;
            captiondiv.className = "caption";
            
            containerdiv.appendChild(canvas);
            containerdiv.appendChild(captiondiv);
            
            if (this.div) this.div.appendChild(containerdiv);
            else console.log("\terror, this.div undefined");
            
            return true;
        }).bind(this));
        
        this.drawTable();
    }
    this.storeIteration = function() {
        console.log("imageLibrary.storeIteration XX n=" + this.images.length);
        drawable.context.imageSmoothingEnabled = false;
        drawable.context.webkitImageSmoothingEnabled = false;
        drawable.context.mozImageSmoothingEnabled = false;
        var hash = imageHasher.getHash(drawable.canvas);
        this.images.every((function(element, index, array) {
            //console.log("\tindex=" + index);
            console.log("distance between "+hash.id+" and " + element.hash.id + ": " + imageHasher.dist(hash, element.hash));
            return true;
        }).bind(this));
        
        console.log("hashing image at 3 sizes, 1x1, 2x2, & 10x10:");
        //console.log("HASH=" + JSON.stringify(hash));
        if (this.OPTION_compareZoomedImages) {
            var newImage = new Image();
            var data = imageHasher.getPreparedImage(drawable.canvas);
            newImage.data = data;
            newImage.hash = hash;
            imageLibrary.add(newImage);
            imageLibrary.draw();
        } else {
            var newImage = new Image();
            newImage.data = drawable.context.getImageData(0,0,drawable.imageWidth,drawable.imageHeight);
            newImage.hash = hash;
            imageLibrary.add(newImage);
            imageLibrary.draw();
        }
        
        //console.log("imageLibrary.size=" + Math.floor(this.size()/100000)/10 + " mb");
    }
    this.drawTable = function() {
        var table = document.createElement('TABLE');
        table.border = '1';
        
        var tableBody = document.createElement('TBODY');
        table.appendChild(tableBody);
        
        
        for (var rowi = -1; rowi < this.images.length; rowi++) {
        
            var tr = document.createElement('TR');
            tableBody.appendChild(tr);
            
            for (var coli = -1; coli < this.images.length; coli++) {
                var yimage = null;
                var ximage = null;
                
                if (rowi >= 0) yimage = testimages[rowi];
                if (coli >= 0) ximage = testimages[coli];
                
                var td = document.createElement('TD');
                td.width = '75';
                var cellNode = null;
                
                if (yimage == null || ximage == null) {
                    if (yimage || ximage) {
                        cellNode = document.createElement("img");
                        if (yimage) cellNode.src = yimage.src;
                        else if (ximage) cellNode.src = ximage.src;
                        cellNode.className = "tableimg";
                    } else if (!yimage && !ximage) {
                        cellNode = document.createTextNode("$$"); //upper left corner
                    } else {
                        cellNode = document.createTextNode("err");
                    }
                } else {
                    var text = "?";
                    text = Math.floor(imageHasher.dist(this.images[coli].hash, this.images[rowi].hash));
                    cellNode = document.createTextNode(text);
                }
                td.appendChild(cellNode);
                tr.appendChild(td);
            }
        }
        this.div.appendChild(table);
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
    this.maxWidth = 256;
    this.maxHeight = 256;
    
    this.init = function() {
        if (!this.context) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.maxWidth;
            this.canvas.height = this.maxHeight;
            this.context = this.canvas.getContext('2d');
            document.lastChild.appendChild(this.canvas);
        }
    }
    this.downScaleCanvas = function(cv, newwidth) {
        // taken from http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality
        scale = newwidth / cv.width;
        if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
        var sqScale = scale * scale; // square scale = area of source pixel within target
        var sw = cv.width; // source image width
        var sh = cv.height; // source image height
        var tw = Math.floor(sw * scale); // target image width
        var th = Math.floor(sh * scale); // target image height
        // EDIT (credits to @Enric ) : was ceil before, and creating artifacts :  
        //                           var tw = Math.ceil(sw * scale); // target image width
        //                           var th = Math.ceil(sh * scale); // target image height
        var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
        var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
        var tX = 0, tY = 0; // rounded tx, ty
        var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
        // weight is weight of current source point within target.
        // next weight is weight of current source point within next target's point.
        var crossX = false; // does scaled px cross its current px right border ?
        var crossY = false; // does scaled px cross its current px bottom border ?
        var sBuffer = cv.getContext('2d').
        getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
        var tBuffer = new Float32Array(3 * sw * sh); // target buffer Float32 rgb
        var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
        /* untested !
        var sA = 0;  //source alpha  */    

        for (sy = 0; sy < sh; sy++) {
            ty = sy * scale; // y src position within target
            tY = 0 | ty;     // rounded : target pixel's y
            yIndex = 3 * tY * tw;  // line index within target array
            crossY = (tY != (0 | ty + scale)); 
            if (crossY) { // if pixel is crossing botton target pixel
                wy = (tY + 1 - ty); // weight of point within target pixel
                nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
            }
            for (sx = 0; sx < sw; sx++, sIndex += 4) {
                tx = sx * scale; // x src position within target
                tX = 0 |  tx;    // rounded : target pixel's x
                tIndex = yIndex + tX * 3; // target pixel index within target array
                crossX = (tX != (0 | tx + scale));
                if (crossX) { // if pixel is crossing target pixel's right
                    wx = (tX + 1 - tx); // weight of point within target pixel
                    nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
                }
                sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
                sG = sBuffer[sIndex + 1];
                sB = sBuffer[sIndex + 2];

                /* !! untested : handling alpha !!
                   sA = sBuffer[sIndex + 3];
                   if (!sA) continue;
                   if (sA != 0xFF) {
                       sR = (sR * sA) >> 8;  // or use /256 instead ??
                       sG = (sG * sA) >> 8;
                       sB = (sB * sA) >> 8;
                   }
                */
                if (!crossX && !crossY) { // pixel does not cross
                    // just add components weighted by squared scale.
                    tBuffer[tIndex    ] += sR * sqScale;
                    tBuffer[tIndex + 1] += sG * sqScale;
                    tBuffer[tIndex + 2] += sB * sqScale;
                } else if (crossX && !crossY) { // cross on X only
                    w = wx * scale;
                    // add weighted component for current px
                    tBuffer[tIndex    ] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tX+1) px                
                    nw = nwx * scale
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                } else if (crossY && !crossX) { // cross on Y only
                    w = wy * scale;
                    // add weighted component for current px
                    tBuffer[tIndex    ] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tY+1) px                
                    nw = nwy * scale
                    tBuffer[tIndex + 3 * tw    ] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                } else { // crosses both x and y : four target points involved
                    // add weighted component for current px
                    w = wx * wy;
                    tBuffer[tIndex    ] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // for tX + 1; tY px
                    nw = nwx * wy;
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                    // for tX ; tY + 1 px
                    nw = wx * nwy;
                    tBuffer[tIndex + 3 * tw    ] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                    // for tX + 1 ; tY +1 px
                    nw = nwx * nwy;
                    tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 5] += sB * nw;
                }
            } // end for sx 
        } // end for sy

        // create result canvas
        var resCV = document.createElement('canvas');
        resCV.width = tw;
        resCV.height = th;
        var resCtx = resCV.getContext('2d');
        var imgRes = resCtx.getImageData(0, 0, tw, th);
        var tByteBuffer = imgRes.data;
        // convert float32 array into a UInt8Clamped Array
        var pxIndex = 0; //  
        for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
            tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
            tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
            tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
            tByteBuffer[tIndex + 3] = 255;
        }
        // writing result to canvas.
        resCtx.putImageData(imgRes, 0, 0);
        return resCV;
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
    this.getHashAtScaleOLD = function(canvas, newsize) {
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
        for (var i = 0; i < data.length; i=i+4) {
            if (data[i]==0) hash.push(0);
            else if (data[i]==64) hash.push(1);
            else if (data[i]==128) hash.push(2);
            else if (data[i]==191) hash.push(3);
            else if (data[i]==255) hash.push(4);
            else hash.push(data[i]);
        }
        console.log("getHashAtScale(" + newsize + ")= " + hash);
    }
    this.getHashAtScale = function(canvas, newsize) {
        var scaledCanvas = this.downScaleCanvas(canvas, newsize);
        var data = scaledCanvas.getContext('2d').getImageData(0,0,newsize,newsize).data;
        var hash = [];
        for (var i = 0; i < data.length; i=i+4) {
            /*if (data[i]==0) hash.push(0);
            else if (data[i]==64) hash.push(1);
            else if (data[i]==128) hash.push(2);
            else if (data[i]==191) hash.push(3);
            else if (data[i]==255) hash.push(4);
            else*/
            hash.push(data[i]);
        }
        return hash;
        //console.log("getHashAtScale2(" + newsize + ")= " + hash);
    }
    this.getHash = function(canvas) {
        var hash = [];
        for (var i = 1; i < 64; i=i*2) {
            var hashAtScale = this.getHashAtScale(canvas,i);
            hash.push({
                scale: i,
                hash: hashAtScale
            });
        }
        hash.id = Math.floor(Math.random()*100000);
        return hash;
    }
    this.diff = function(hash1, hash2) {
        if (hash1.length != hash2.length) {
            console.log("Hasher.diff ERROR, hashes are different lengths!");
            return;
        }
        var diff = [];
        for (var scale_index = 0; scale_index < hash1.length; scale_index++) {
            var diffThisScale = { };
            
            diffThisScale.scale = hash1[scale_index].scale;
            diffThisScale.hash = [];
            
            for (var i = 0; i < hash1[scale_index].hash.length; i++) {
                diffThisScale.hash[i] = Math.abs(hash1[scale_index].hash[i] - hash2[scale_index].hash[i]);
            }
            diff.push(diffThisScale);
        }
        return diff;
    }
    this.dist = function(hash1, hash2) {
        var diff = this.diff(hash1, hash2);
        var dimensions = [];
        
        for (var scale_index = 0; scale_index < diff.length; scale_index++) {
            var summary = 0;
            var weight = 1;
            
            weight = .00100 / (scale_index + 1)
            for (var i = 0; i < diff[scale_index].hash.length; i++) {
                summary += diff[scale_index].hash[i];
            }
            summary = summary * summary * weight;
            
            dimensions.push(summary);
        }
        
        var sum=0;
        for (var i = 0; i < dimensions.length; i++)
        {
            sum += dimensions[i];
        }
        
        return Math.sqrt(sum);

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
    this.imageWidth = 256;
    this.imageHeight = 256;
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
    this.scale = 4;
    
    //Options
    this.OPTION_storeAfterMouseUP = true;
    
    this.init = function(canvas, drawable) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        //this.context.scale(this.scale, this.scale);
        this.context.scale(1, 1);
        
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
            this.context.fillStyle = "white";
            this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
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
        /* http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
        var id = this.context.createImageData(1,1);
        var d = id.data;
        d[0] = 0;
        */
        
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
        //this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.clear();
        
    }
    this.clear = function() {
        this.context.fillStyle = "white";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
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

var testimages_filenames = [
    "images/bbdraw1.jpg",
    "images/bbdraw2.jpg",
    "images/hbdraw1.jpg",
    "images/bbhouse1.jpg",
    "images/bbhouse2.jpg",
    "images/Copy\ of\ hbdraw\ 5\ all\ slight\ move.jpg",
    "images/hbdraw\ 5\ slight\ move.jpg",
    "images/hbdraw2.jpg",
    "images/hbdraw3.jpg",
    "images/hbdraw4.jpg",
    "images/hbdraw5.jpg",
    "images/HBhouse1.jpg",
    "images/hbhouse2.jpg",
    "images/hbhouse3.jpg",
    "images/hbhouse5.jpg"
];

var testimages = [];
var testimagesloaded = 0;

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
        drawable.clear();
//        imageLibrary.storeIteration();
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
    
    if (testimages.length < testimages_filenames.length) {
        var stimulicanvas = document.getElementById("stimuli");
        
        
        var newimage = document.createElement("img");//new Image();
        
        newimage.onload = function(){
            var canvas = document.getElementById("stimuli");
            canvas.getContext("2d").drawImage(this,0,0);
            imageLibrary.storeIteration();
            console.log(".");
        };
        newimage.src = testimages_filenames[testimages.length];
        newimage.className = "hiddenimage";
        document.body.appendChild(newimage);
        console.log("reading " + testimages_filenames[testimages.length] + " cc1cc ");
        //console.log(newimage);
        
        
        testimages.push(newimage);
        //stimulicanvas.getContext("2d").drawImage(newimage,0,0);
        
        
        
        
    } else {
        //drawable.context.drawImage(testimages[0]);
    }
    //if (trial) trial.ticDraw(trialcontainerdiv);
}

window.onload=init;