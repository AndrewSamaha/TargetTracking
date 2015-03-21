
function conditionallog(p) { if (1) console.log(p); }
//
//
//
//Image library
//
//
//
var ImageLibrary = function(divid) {
    this.historic_images = [];
    this.lag = 20;
    this.minimumPercentile = .8;
    this.images = [];
    this.div = null;
    this.defaultWidth = 256;
    this.defaultHeight = 256;
    this.OPTION_compareZoomedImages = false;
    this.nodes = [];
    this.links = [];
    
    if (divid && document.getElementById(divid)) {
        this.div = document.getElementById(divid);
        conditionallog("ImageLibrary is initialized");
    } else {
        conditionallog("error initializing ImageLibrary");
    }
    
    this.init = function(divid) {
        if (divid && document.getElementById(divid)) {
            this.div = document.getElementById(divid);
            conditionallog("ImageLibrary is initialized for " + divid);
        } else {
            conditionallog("error initializing ImageLibrary for " + divid);
        }
    }
    
    this.add = function(newimage) {
        this.images.push(newimage);
        if (this.images.length > this.lag) this.historic_images.push(this.images.shift());
    }
    this.draw = function() {
        conditionallog("imageLibrary.draw");
        conditionallog("\tremoving children");
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
        this.images.every((function(element, index, array) {
            if (!element.data) return;
            //conditionallog("\tdrawing element " + index);
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
            else conditionallog("\terror, this.div undefined");
            
            return true;
        }).bind(this));
        
        this.drawTable();
    }
    this.storeIteration = function(meta) {
    
        conditionallog("imageLibrary.storeIteration XX n=" + this.images.length);
        //conditionallog("\tmeta=" + JSON.stringify(meta));

        drawable.context.imageSmoothingEnabled = false;
        drawable.context.webkitImageSmoothingEnabled = false;
        drawable.context.mozImageSmoothingEnabled = false;

        var sourcecanvas = drawable.canvas;
        
        if (meta && meta.sourcecanvas) {
            sourcecanvas = meta.sourcecanvas;
            delete meta.sourcecanvas;
        }
        
        conditionallog("hashing image at 3 sizes, 1x1, 2x2, & 10x10:");
        //conditionallog("HASH=" + JSON.stringify(hash));
        
        var newImage = new Image();
        if (meta) newImage.meta = meta;
        
        //var data;
        var preparedimage = null;
        if ((meta && meta.crop) || (this.OPTION_compareZoomedImages))
            var preparedimage = imageHasher.getPreparedImage(sourcecanvas);

        var hash = null;
        
        if (preparedimage) {
            var preparedimage = imageHasher.getPreparedImage(sourcecanvas);
            newImage.data = preparedimage.imagedata;
            if (!newImage.meta) newImage.meta = {dataURL: preparedimage.canvas.toDataURL()};
            else newImage.meta.dataURL = preparedimage.canvas.toDataURL();
            hash = imageHasher.getHash(preparedimage.canvas);
        } else {
            newImage.data = sourcecanvas.getContext("2d").getImageData(0,0,sourcecanvas.width,sourcecanvas.height);
            if (!newImage.meta) newImage.meta = {dataURL: sourcecanvas.toDataURL()};
            else newImage.meta.dataURL = sourcecanvas.toDataURL();
            hash = imageHasher.getHash(sourcecanvas);
        }
        
        newImage.hash = hash;
        this.add(newImage);
        
        
        /*
        if (meta && meta.source) hash = imageHasher.getHash(meta.source);
        else hash = imageHasher.getHash(drawable.canvas);
        */
        
        //hash = imageHasher.getHash(sourcecanvas);
        
        var meetsCriterion = false;
        
        // Determine if the last response meets criterion for reinforcement
        if (meta && meta.testForSr)
            if (this.images.length < this.lag) {
                // if we have fewer responses than our lag value, then use a RR schedule = minimumPercentile
                if (Math.random() >= this.minimumPercentile) meetsCriterion = true;
            } else {
                var sumOfSums = 0;
                var numSums = 0;
                var startTime = Date.now();
                this.images.every((function(elementA, indexA, arrayA) {
                    elementA.distanceSum = 0;
                    this.images.every((function(elementB, indexB, arrayB) {
                        elementA.distanceSum += imageHasher.dist(elementA.hash, elementB.hash);
                        return true;
                    }).bind(this));
                    numSums++;                          //don't need
                    sumOfSums += elementA.distanceSum;  //don't need
                    //conditionallog("\tindex=" + index);
                    //conditionallog("distance between "+hash.id+" and " + element.hash.id + ": " + imageHasher.dist(hash, element.hash));
                    return true;
                }).bind(this));
                
                var targetNumLowerThan = this.minimumPercentile * this.images.length;
                var numLowerThan = 0;
                var numTested = 0;
                var reason = "";
                var largerThans = [];
                this.images.every((function(elementA, indexA, arrayA) {
                    if (elementA.distanceSum <= newImage.distanceSum) {
                        numLowerThan++;
                        if (numLowerThan >= targetNumLowerThan) {
                            meetsCriterion = true;
                            return false;
                        }
                    } else {
                        largerThans.push(elementA.distanceSum);
                        numTested++;
                    }
                    
                    if (numTested > (this.images.length - targetNumLowerThan)) {
                        //reason = "found " + numTested + ","+largerThans.length+" items larger than the target ("+newImage.distanceSum+") [n="+(this.images.length)+" targetNumLowerThan="+targetNumLowerThan+"]: ";
                        for (var i = 0; i < largerThans.length; i++) reason += largerThans + ",";
                        return false;
                    }
                    return true;
                }).bind(this));
                
                var duration = Date.now() - startTime;
                
                console.log("imageLibrary.storeIteration - time to calculate sr: " + duration + " ms");
                if (meetsCriterion) console.log("\tSr+");
                else console.log("\text - " + reason);
            
            
            }
        
        this.draw();
        
        
        return meetsCriterion;
        //conditionallog("imageLibrary.size=" + Math.floor(this.size()/100000)/10 + " mb");
    }
    this.drawForce = function() {
        //create the data structure
        conditionallog("drawForce: creating data structure for nodes and links");
        this.nodes = [];
        this.links = [];
        
        for (var rowi = 0; rowi < this.images.length; rowi++) {
            this.nodes.push({name: this.images[rowi].meta.name, group: this.images[rowi].meta.group, image: this.images[rowi]});
        }
        
        for (var rowi = 0; rowi < this.nodes.length; rowi++) {
            for (var coli = 0; coli < this.nodes.length; coli++) {
                
                var exists = false;
                for (var li = 0; li < this.links.length; li++) {
                    var link = this.links[li];
                    if ((link.source == rowi && link.target == coli) || (link.source == coli && link.target == rowi)) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    var value = Math.floor(
                                    Math.pow(
                                        imageHasher.dist(this.nodes[coli].image.hash, this.nodes[rowi].image.hash),4
                                    )
                                );
                    this.links.push({source: coli, target: rowi, value: value});
                }
            }
        }
        
        //normalize link values between 0 and 1
        var max = -1;
        for (var i = 0; i < this.links.length; i++)
            if (this.links[i].value > max) max = this.links[i].value;
    
        for (var i = 0; i < this.links.length; i++)
            this.links[i].value = this.links[i].value / max;
        
        
        // Draw the force
        var width = 960,
            height = 500;

        var color = d3.scale.category20();

        var force = d3.layout.force()
            .charge(-12)
//            .linkDistance(300)
            .linkDistance(function(d) { return d.value*200; })
            .size([width, height]);

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

    
        force
            .nodes(this.nodes)
            .links(this.links)
            .start();

        var link = svg.selectAll(".link")
                .data(this.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) { return 1; /*Math.sqrt(Math.sqrt(Math.sqrt(d.value)));*/ });

        var node = svg.selectAll(".node")
            .data(this.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });

    
    }
    
    this.drawForcePercentile = function(p) {
        //create the data structure

        conditionallog("drawForcePercentile: creating data structure for nodes and links, p = " + p);
        this.nodes = [];
        this.links = [];
        maxLinks = 2;
        
        function linksort(a,b) {
            if (a.value < b.value) return -1;
            else if (a.value > b.value) return 1;
            else return 0;
        }
        
        for (var rowi = 0; rowi < this.images.length; rowi++) {
            this.nodes.push({name: this.images[rowi].meta.name, group: this.images[rowi].meta.group, image: this.images[rowi]});
        }
        
        for (var rowi = 0; rowi < this.nodes.length; rowi++) {
            for (var coli = 0; coli < this.nodes.length; coli++) {
                
                var exists = false;
                for (var li = 0; li < this.links.length; li++) {
                    var link = this.links[li];
                    if ((coli == rowi) || (link.source == rowi && link.target == coli) || (link.source == coli && link.target == rowi)) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    var value;
                    value = Math.floor(
                                    Math.pow(
                                        10,imageHasher.dist(this.nodes[coli].image.hash, this.nodes[rowi].image.hash)
                                    )
                                );
                    value = Math.floor(
                                    Math.log(
                                        imageHasher.dist(this.nodes[coli].image.hash, this.nodes[rowi].image.hash)
                                    )
                                );
                    value = imageHasher.dist(this.nodes[coli].image.hash, this.nodes[rowi].image.hash);
                    this.links.push({source: coli, target: rowi, value: value});
                }
            }
        }
        
        
        //sort the links
        if (this.links.length >= 10) {
            this.links.sort(linksort);
            var starting_index = Math.max(0,Math.min(1,p));
            starting_index = Math.round(p*this.links.length);
            conditionallog("chopping links");
            conditionallog("\toriginal  size=" + this.links.length + " p=" + p);
            conditionallog("\tstarting index=" + starting_index);
            conditionallog("\tnumber of elements to cut=" + (this.links.length-starting_index));

            this.links.splice(starting_index, this.links.length-starting_index);
        }
        
        //normalize link values between 0 and 1
        var max = -1;
        var min = "undefined";
        for (var i = 0; i < this.links.length; i++) {
            if (min == "undefined") {
                conditionallog("\tmin == undefined, now setting min to something else");
                min = this.links[i].value;
            }

            if (this.links[i].value > max) max = this.links[i].value;
            else if (this.links[i].value < min) min = this.links[i].value;
            
            if (min != "undefined" && this.links[i].value < min) min = this.links[i].value;
        }
        conditionallog("rangeX: " + min + " to " + max);
        if (min == "undefined")
            for (var i = 0; i < this.links.length; i++)
                this.links[i].value = (this.links[i].value) / max;
        else
            for (var i = 0; i < this.links.length; i++)
                this.links[i].value = (this.links[i].value-min) / max;

        // Draw the force
        var width = 960,
            height = 500;

        var color = d3.scale.category20();

        var force = d3.layout.force()
            .charge(-10 *this.links.length) //-1000
//            .linkDistance(300)
//            .linkDistance(function(d) { return d.value*200; })
            //.linkDistance(50)
            .linkStrength(function(d) { return 1-d.value; })
            .size([width, height]);

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

    
        force
            .nodes(this.nodes)
            .links(this.links)
            .start();

        var link = svg.selectAll(".link")
                .data(this.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) { return 1; /*Math.sqrt(Math.sqrt(Math.sqrt(d.value)));*/ });

        var node = svg.selectAll(".node")
            .data(this.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) { return "wacka flacka"; });
        
        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
                
            //node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });

    
    }
    
    this.drawForcePercentile_Dist_Weight = function(p,dist_f,weight_f) {
        //create the data structure

        conditionallog("drawForcePercentile: creating data structure for nodes and links, p = " + p);
        this.nodes = [];
        this.links = [];
        maxLinks = 2;
        
        function linksort(a,b) {
            if (a.value < b.value) return -1;
            else if (a.value > b.value) return 1;
            else return 0;
        }
        
        for (var rowi = 0; rowi < this.images.length; rowi++) {
            this.nodes.push({name: this.images[rowi].meta.name, group: this.images[rowi].meta.group, image: this.images[rowi], dataURL: this.images[rowi].meta.dataURL});
        }
        
        for (var rowi = 0; rowi < this.nodes.length; rowi++) {
            for (var coli = 0; coli < this.nodes.length; coli++) {
                
                var exists = false;
                for (var li = 0; li < this.links.length; li++) {
                    var link = this.links[li];
                    if ((coli == rowi) || (link.source == rowi && link.target == coli) || (link.source == coli && link.target == rowi)) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    var value;
                    value = dist_f(this.nodes[coli].image.hash, this.nodes[rowi].image.hash, weight_f);
                    this.links.push({source: coli, target: rowi, value: value});
                }
            }
        }
        
        
        //sort the links
        if (this.links.length >= 10) {
            this.links.sort(linksort);
            var starting_index = Math.max(0,Math.min(1,p));
            starting_index = Math.round(p*this.links.length);
            conditionallog("chopping links");
            conditionallog("\toriginal  size=" + this.links.length + " p=" + p);
            conditionallog("\tstarting index=" + starting_index);
            conditionallog("\tnumber of elements to cut=" + (this.links.length-starting_index));

            this.links.splice(starting_index, this.links.length-starting_index);
        }
        
        //normalize link values between 0 and 1
        var max = -1;
        var min = "undefined";
        for (var i = 0; i < this.links.length; i++) {
            if (min == "undefined") {
                conditionallog("\tmin == undefined, now setting min to something else");
                min = this.links[i].value;
            }

            if (this.links[i].value > max) max = this.links[i].value;
            else if (this.links[i].value < min) min = this.links[i].value;
            
            if (min != "undefined" && this.links[i].value < min) min = this.links[i].value;
        }
        conditionallog("rangeX: " + min + " to " + max);
        if (min == "undefined")
            for (var i = 0; i < this.links.length; i++)
                this.links[i].value = (this.links[i].value) / max;
        else
            for (var i = 0; i < this.links.length; i++)
                this.links[i].value = (this.links[i].value-min) / max;

        // Draw the force
        var width = 960,
            height = 800;

        var color = d3.scale.category20();
// Works ok:
/*
    .charge(-10 *this.links.length) //-1000
    .linkStrength(function(d) { return 1-d.value; })
*/

// i don't know
/*
    .charge(-1000) //-1000
    .linkDistance(function(d) { return d.value*200; })

    
 
*/
        var force_type = 1; //1 = as link distance, 2 = as link strength
        var force;
/*
        var force = d3.layout.force()
            .charge(-1000) //-1000
//            .linkDistance(300)
            .linkDistance(function(d) { return d.value*200; })
            //.linkDistance(50)
            //.linkStrength(function(d) { return 1-d.value; })
            .size([width, height]);
*/
        var force;
        if (force_type == 2) {
            // = d3.layout.force()
            force = d3.layout.force()
                .linkDistance(function(d) { return d.value*200; })
                .size([width, height]);
        } else {
            force = d3.layout.force()
                .charge(-4000) //-1000
                .linkStrength(function(d) { return 1-d.value; })
                .size([width, height]);
        }
        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);
        
       /* svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "red");
*/
    
        //Create a backup copy of the links array
        this.links_backup = JSON.parse(JSON.stringify(this.links));
        
        force
            .gravity(.2) //default is .1
            .nodes(this.nodes)
            .links(this.links)
            .start();

        var link = svg.selectAll(".link")
                .data(this.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) { return 1; /*Math.sqrt(Math.sqrt(Math.sqrt(d.value)));*/ });

        var node = svg.selectAll(".node")
            .data(this.nodes)
            //.enter().append("circle")
            .enter().append("g")
            .attr("class", "node")
//            .attr("r", 5)
//            .style("fill", function(d) { return color(d.group); })
            .on("click", click)
            .call(force.drag);

        node.append("image")
            .attr("xlink:href", function(d) {return d.dataURL;})
            //.attr("xlink:href", function(d) {return d.name;}) //"https://github.com/favicon.ico")
            .attr("x", -25)
            .attr("y", -25)
            .attr("width", 50)
            .attr("height", 50)
            .attr("border", 10);
        
        node.append("rect")
            .attr("x",-27)
            .attr("y", -27)
            .attr("width",52)
            .attr("height", 52)
            .attr("fill","none")
            .attr("stroke", "black");
  
  /*
        node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            //.attr("x", function(d) { return d.x; })
            //.attr("y", function(d) { return d.y; })
            .text(function(d) { return d.name; });
    */
        node.append("title")
            .text(function(d) { return d.name; });
        
        
      
        
        
        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
                
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
        
        function click(d) {
            links = force.links();
            nodes = force.nodes();
            
            conditionallog("simulating the deletion of links:");
            links.forEach(function(link, index, array) {
                if (link.target != d && link.source != d) { conditionallog("delete link " + index); }
            });
            
            //delete all links
            nodes.forEach(function(target) {
                
            });
            //restart();
            //*/
        }
        
        this.drawHistogram((function() {
            var links = force.links();
            var nodes = force.nodes();
            var values = [];
            links.forEach(function(link,index,array) {
                values.push(link.value);
            });
            return values;
        })());
        
        this.drawHistogram((function() {
            var links = force.links();
            var nodes = force.nodes();
            var values = [];
            var names = [];
            nodes.forEach(function(node, nodeindex, nodearray) {
                var nodeSum = 0;
                var numLinks = 0;
                links.forEach(function(link, linkindex, linkarray) {
                    if (Math.random() > .8) {
//                        conditionallog("comparing nodeindex["+nodeindex+"] to link.source["+link.source+"] and link.target["+link.target+"]");
                    }
                    if (link.source == node || link.target == node) {
                        nodeSum += link.value;
                        numLinks++;
                    }
                });
                values.push(nodeSum / numLinks);
                names.push(node.name);
            });
            return {values: values, extras: names};
        })());
    }
    
    this.drawHistogram = function(values) {
        // Generate a Bates distribution of 10 random variables.
        //var values = d3.range(1000).map(d3.random.bates(10));
        //
        /*

        
        
        
        
        //*/
        
        var extras = null;
        if (values.hasOwnProperty("values")) {
            extras = values.extras;
            values = values.values;
        }
        
        conditionallog("drawHistogram, value=" + values);
        // A formatter for counts.
        var formatCount = d3.format(",.0f");
        
        var margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = (960 - margin.left - margin.right)/2,
        height = (500 - margin.top - margin.bottom) / 2;
        
        var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, width]);
        
        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
        .bins(x.ticks(20))
        (values);
        
        conditionallog(JSON.stringify(data));
        
        var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([height, 0]);
        
        var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        
        var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
        
        bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function(d) { return height - y(d.y); });
        
        bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", x(data[0].dx) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) {
            //return formatCount(d.y);
            conditionallog("d"+d.x+">"+JSON.stringify(d));
            if (extras) return JSON.stringify(extras);
            return (d.x);
        });
        
        var histogram_images = [];
        if (extras) extras.forEach(function(filename) {
            for (var x = 0; x < 1; x+=.05) {
                    
            }
        });
        
        if (extras && 0) {
            bar.append("image")
            .attr("xlink:href", function(d) {
                
                return d.name;
            })
            .attr("x", -25)
            .attr("y", -25)
            .attr("width", 50)
            .attr("height", 50)
            .attr("border", 10);
        }
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    }

    
    this.drawTable = function() {
        conditionallog("imageLibrary.drawTable");
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
                
                if (rowi >= 0) yimage = this.images[rowi]; //testimages[rowi];
                if (coli >= 0) ximage = this.images[coli]; //testimages[coli];
                
                var td = document.createElement('TD');
                td.width = '75';
                var cellNode = null;
                
                if (yimage == null || ximage == null) {
                    if (yimage || ximage) {
                        cellNode = document.createElement("img");
                        if (yimage) {
                            if (yimage.meta.dataURL) {
                                cellNode.src = yimage.meta.dataURL;
                                //conditionallog("\tdataURL: " + yimage.meta.dataURL);
                            } else cellNode.src = yimage.src;
                        } else if (ximage) {
                            if (ximage.meta.dataURL) {
                                cellNode.src = ximage.meta.dataURL;
                            } else cellNode.src = ximage.src;
                        }
                        cellNode.className = "tableimg";
                    } else if (!yimage && !ximage) {
                        cellNode = document.createTextNode("$$"); //upper left corner
                    } else {
                        cellNode = document.createTextNode("err");
                    }
                } else {
                    var text = "?";
                    //conditionallog("\tcomparing " + coli + " to " + rowi);
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
                // OLD, I changed this because my data are actually
                // in the alpha bits
                /*
                sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
                sG = sBuffer[sIndex + 1];
                sB = sBuffer[sIndex + 2];
                */
                sR = sBuffer[sIndex + 3];   // retrieving r,g,b for curr src px.
                sG = sBuffer[sIndex + 3];
                sB = sBuffer[sIndex + 3];
                
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
        var secondrow = "";
        var thirdrow = "";
        var fourthrow = "";
        var min = 255;
        var max = 0;
        var numFilled = 0;
        
        this.canvas.width = this.canvas.width;
        
        conditionallog("getPreparedImage - preparing image:");
        conditionallog("\tlength=" + data.length);
        conditionallog("\twidth=" + width);
        conditionallog("\theight=" + height);
        
        if (context) conditionallog("\tcontext=defined");
        else conditionallog("\tcontext=UNDEFINED!");
        
        if (data) conditionallog("\tdata=defined");
        else conditionallog("\tdata=UNDEFINED!");
        
        for (var i = 0; i <= data.length; i=i+4) {
            
            var x = (i/4) % width;
            var y = Math.floor((i/4) / width);
            if (y == 2) {
                firstrow += data[i];
                secondrow += data[i+1];
                thirdrow += data[i+2];
                fourthrow += data[i+3];
            }
                /*
                if (data[i+3]) firstrow += "X";
                else firstrow += "-";*/
        
            
            if (data[i+3]) {
                if (x >= 1) {
                    //conditionallog("left (old, new): " + left + "," + x);
                    left = Math.min(left, x);
                }
                right = Math.max(right, x);
                top = Math.min(top, y);
                if (y <= 255) bottom = Math.max(bottom, y);
            }
            if (x >= 1 && y >= 1) {
                min = Math.min(min,data[i]);
                max = Math.max(max,data[i]);
            }
        }
        
        if ((bottom - top) > (right - left)) right = left + (bottom - top);
        else bottom = top + (right - left);
        
        /*conditionallog("firstrow: " + firstrow);
        conditionallog("secondrow:" + secondrow);
        conditionallog("thirdrow: " + thirdrow);
        conditionallog("fourthrow:" + fourthrow);
        */
        conditionallog("prepared image:");
        conditionallog("\tleft-right: " + left + "-" + right);
        conditionallog("\ttop-bottom: " + top + "-" + bottom);
        conditionallog("\tmax: " + max);
        conditionallog("\tmin: " + min);
        
        if (left == width && right == 0 && bottom == 0 && top == height) {
            return image;
        } else {
            var scaled_width = right - left;
            var scaled_height = bottom - top;
            var scaleX = this.maxWidth / scaled_width;
            var scaleY = this.maxHeight / scaled_height;
            
            conditionallog("\tleft=" + left);
            conditionallog("\ttop=" + top);
            conditionallog("\tscaled_width=" + scaled_width);
            conditionallog("\tscaled_height=" + scaled_height);
            conditionallog("\tthis.maxWidth= [" + this.maxWidth + "]");
            conditionallog("\tthis.maxHeight=[" + this.maxHeight + "]");
            conditionallog("\tscaleX,y=" + scaleX + "," + scaleY);

            
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
            return {imagedata: newcanvas.getContext('2d').getImageData(0, 0, this.maxWidth, this.maxHeight), canvas: newcanvas};

        }
    }
    
    this.getCroppedImage = function(canvas) {
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
        
        conditionallog("getCroppedImage - preparing image:");
        conditionallog("\tlength=" + data.length);
        conditionallog("\twidth=" + width);
        conditionallog("\theight=" + height);
        
        if (context) conditionallog("\tcontext=defined");
        else conditionallog("\tcontext=UNDEFINED!");
        
        if (data) conditionallog("\tdata=defined");
        else conditionallog("\tdata=UNDEFINED!");
        
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
        
        conditionallog("firstrow:" + firstrow);
        conditionallog("prepared image:");
        conditionallog("\tleft-right: " + left + "-" + right);
        conditionallog("\ttop-bottom: " + top + "-" + bottom);
        conditionallog("\tmax: " + max);
        conditionallog("\tmin: " + min);
        
        if (left == width && right == 0 && bottom == 0 && top == height) {
            return image;
        } else {
            var scaled_width = right - left;
            var scaled_height = bottom - top;
            var scaleX = this.maxWidth / scaled_width;
            var scaleY = this.maxHeight / scaled_height;
            
            conditionallog("\tleft=" + left);
            conditionallog("\ttop=" + top);
            conditionallog("\tscaled_width=" + scaled_width);
            conditionallog("\tscaled_height=" + scaled_height);
            conditionallog("\tthis.maxWidth= [" + this.maxWidth + "]");
            conditionallog("\tthis.maxHeight=[" + this.maxHeight + "]");
            conditionallog("\tscaleX,y=" + scaleX + "," + scaleY);

            
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
        //conditionallog("getHashAtScale(" + newsize + ")= " + hash);
    }
    this.getHashAtScale = function(canvas, newsize) {
        var scaledCanvas = this.downScaleCanvas(canvas, newsize);
        var data = scaledCanvas.getContext('2d').getImageData(0,0,newsize,newsize).data;
        var hash = [];
        var numpixels = 0;
        for (var i = 0; i < data.length; i=i+4) {
            /*if (data[i]==0) hash.push(0);
            else if (data[i]==64) hash.push(1);
            else if (data[i]==128) hash.push(2);
            else if (data[i]==191) hash.push(3);
            else if (data[i]==255) hash.push(4);
            else*/
            
            
            hash.push(data[i]);
            if (data[i] == 0) numpixels++;
        }
        //conditionallog("getHashAtScale(" + newsize + ").numpixels = " + numpixels);
        return hash;
        //conditionallog("getHashAtScale2(" + newsize + ")= " + hash);
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
            conditionallog("Hasher.diff ERROR, hashes are different lengths!");
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
        //conditionallog("ImageHasher.dist");
        var diff = this.diff(hash1, hash2);
        //conditionallog("\tdiff=" + JSON.stringify(diff));
        var dimensions = [];
        
        for (var scale_index = 0; scale_index < diff.length; scale_index++) {
            var summary = 0;
            var weight = 1;
            
 //           weight = .00100 / (scale_index + 1);
            weight = .00010 / (scale_index + 1);
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
    this.distWeighted = function(hash1, hash2, weight_function) {
        var diff = this.diff(hash1, hash2);
        var dimensions = [];
        
        for (var scale_index = 0; scale_index < diff.length; scale_index++) {
            var summary = 0;
            var weight = 1;
            
 //           weight = .00100 / (scale_index + 1);
            weight = weight_function(scale_index);
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
    this.weightFunction = function(scaleIndex) {
        return (.00010 / (scaleIndex + 1));
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
    this.imageWidth = 256; //256
    this.imageHeight = 256; //256
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
    this.scale = 4; //4 (seems to be important for loading images from files)
    this.container = null;
    this.progressbar_outside = null;
    this.progressbar_inside = null;
    this.startTime = 0;
    this.maxTime = 10000;
    this.finishedCanvases = [];
    this.drawingcontainer = null;
    this.summatedcanvas = null;
    this.summatedcontext = null;
    this.lastStoreTime = 0;
    this.feedbackdiv = null;
    this.lastFeedbackStart = 0;
    this.feedbackDuration = 800;
    //Options
    this.OPTION_storeAfterMouseUP = true;
    
    this.init = function(canvas, drawable) {
        if (document.getElementById("drawingcontainer")) this.drawingcontainer = document.getElementById("drawingcontainer");
        if (document.getElementById("progressbar_outside")) this.progressbar_outside = document.getElementById("progressbar_outside");
        if (document.getElementById("progressbar_inside")) this.progressbar_inside = document.getElementById("progressbar_inside");
        if (document.getElementById("summatedcanvas")) this.summatedcanvas = document.getElementById("summatedcanvas");
        if (document.getElementById("feedback")) this.feedbackdiv = document.getElementById("feedback");
        
        //Set progressbar size
        if (this.progressbar_outside && this.progressbar_inside) {
            this.progressbar_outside.setAttribute("style","width: " + this.imageWidth + "px");
            this.setProgress(.5);
        }
        
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.summatedcontext = this.summatedcanvas.getContext("2d");
        
        this.prepareNewCanvas();
        this.prepareSummatedCanvas();
    }
    
    this.prepareNewCanvas = function() {
        this.canvas.width = this.imageWidth;
        this.canvas.height = this.imageHeight;
        //this.context.scale(this.scale, this.scale);
        this.context.scale(1, 1);
        
        this.ready = false;
        if (!this.canvas) {
            conditionallog("ImageLibrary error, initialized with null canvas!");
        }
        if (drawable) {
            this.canvas.addEventListener("click", this.click.bind(this), false);
            this.canvas.addEventListener("mousedown", this.mousedown.bind(this), false);
            this.canvas.addEventListener("mouseup", this.mouseup.bind(this), false);
            this.canvas.addEventListener("mouseout", this.mouseout.bind(this), false);
            this.canvas.addEventListener("dblclick", this.dblclick.bind(this), false);
            this.canvas.addEventListener("mousemove", this.mousemove.bind(this), false);
            //this.imageDatas = drawable.getImageData(0,0,this.imageWidth,this.imageHeight);
            
            //Trying to make the image transparent
            //this.context.fillStyle = "white";
            //this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
            conditionallog("drawable inited.");
        }
        this.clear();
    }
    
    this.prepareSummatedCanvas = function() {
        this.summatedcanvas.width = this.imageWidth;
        this.summatedcanvas.height = this.imageHeight;
    }
    
    this.setProgress = function(percent) {
        this.progressbar_inside.setAttribute("style","width: " + (percent*this.imageWidth) + "px");
    }
    
    this.getmousepos = function(event) {
        var rect = this.canvas.getBoundingClientRect();
        event = event || window.event; // IE-ism
        var mousePos = {
            x: (event.clientX - rect.left) / this.scale,
            y: (event.clientY - rect.top) / this.scale
            /*
            x: Math.floor(event.clientX/this.scale - this.canvas.offsetLeft/this.scale),
            y: Math.floor(event.clientY/this.scale - this.canvas.offsetTop/this.scale)*/
        };

        return mousePos;
    }
    
    this.startTimer = function() {
        this.startTime = Date.now();
    }
    
    this.drawPoint = function(mousePos) {
        if (Date.now() - this.lastStoreTime < 100) return;
        if (this.startTime == 0) this.startTimer();
        this.context.fillStyle="black";
        this.context.fillStyle="rgba(0,0,0,255)";
        this.context.fillRect(mousePos.x*this.scale, mousePos.y*this.scale, this.scale, this.scale);
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
        if (this.OPTION_storeAfterMouseUP) this.store();
    }
    
    this.mouseout = function(event) {
        this.mouseDown = false;
        if (this.OPTION_storeAfterMouseUP && this.mouseDown) this.store();
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
        conditionallog("click - " + this.canvas.offsetLeft);
    }
    
    this.dblclick = function(event) {
        conditionallog("double click");
        //this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.clear();
        
    }
    
    this.addCanvasToSummation = function(newcanvas) {
        var summatedcanvas  = this.summatedcanvas;
        var summatedcontext = summatedcanvas.getContext("2d");
        var summatedimage = summatedcontext.getImageData(0,0,this.imageWidth,this.imageHeight);
        var summateddata = summatedimage.data;

        var newcontext = newcanvas.getContext("2d");
        var newimage = newcontext.getImageData(0,0,this.imageWidth,this.imageHeight);
        var newdata = newimage.data;
        
        if (newdata.length != summateddata.length)
            throw("addCanvasToSummation: ERROR! newdata.length(" + newdata.length+") != summateddata.length(" + summateddata.length + ")");
        
        conditionallog("addCanvasToSummation: newimage.data.length=" + newdata.length + " summateddata.length=" + summateddata.length);
        for (var i = 0; i < newdata.length; i=i+1) {
            /*if (Math.max(summateddata[i], newdata[i]))
                if (i % 7 == 0) conditionallog("\t" + i + ". " + summateddata[i] + " <> " + newdata[i] + " = " + Math.max(summateddata[i], newdata[i]));
                */
            summateddata[i] = Math.max(summateddata[i], newdata[i]);
        }
        conditionallog("addCanvasToSummation: newimage.data.length=" + newdata.length + " summateddata.length=" + summateddata.length);
        summatedcontext.putImageData(summatedimage, 0, 0);
    }
    
    this.createNewCanvas = function() {
        this.canvas.id = "finishedCanvas" + this.finishedCanvases.length;
        this.finishedCanvases.push(this.canvas);
        
        var newcanvas = document.createElement("canvas");
        newcanvas.width =  this.defaultWidth;
        newcanvas.height = this.defaultHeight;
        newcanvas.id = "stimuli";
        newcanvas.className = "drawable";
        this.canvas = newcanvas;
        
        var context = newcanvas.getContext("2d");
        this.context = context;
        
        this.drawingcontainer.appendChild(newcanvas);
        this.prepareNewCanvas();
    }
    
    
    
    this.reset = function() {
        var summatedcanvas  = this.summatedcanvas;
        var summatedcontext = summatedcanvas.getContext("2d");
        var summatedimage = summatedcontext.getImageData(0,0,this.imageWidth,this.imageHeight);
        var summateddata = summatedimage.data;

        for (var i = 0; i < summateddata.length; i=i+1) summateddata[i] = 0;
        summatedcontext.putImageData(summatedimage, 0, 0);
        
        for (var i = 0; i < this.finishedCanvases.length; i++) this.finishedCanvases[i].remove();
        this.finishedCanvases = [];
        
        this.clear();
    }
    
    this.store = function() {
        this.addCanvasToSummation(this.canvas);     //add the last stroke to our summated image
        var getsReinforced = strokeLibrary.storeIteration({crop: true, dataURL: this.canvas.toDataURL(), sourcecanvas: this.canvas, testForSr: true}); //add the stroke to the stroke library
        if (getsReinforced) {
            this.feedbackdiv.className = "srplusfeedback";
            this.lastFeedbackStart = Date.now();
        }
        this.createNewCanvas();                     //create a new canvas to draw on
//        this.clear();
        conditionallog("saved in strokeLibrary");
        this.lastStoreTime = Date.now();
    }
    
    this.clear = function() {
        this.context.fillStyle = "white";
        this.context.fillStyle = "rgba(255,255,255,0)";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
    }
    
    this.timesUp = function() {
        this.startTime = 0;
        this.setProgress(0);
        this.addCanvasToSummation(this.canvas);
        imageLibrary.storeIteration({source: this.summatedcanvas, dataURL: this.summatedcanvas.toDataURL(), sourcecanvas: this.summatedcanvas});
        this.clear();
        this.reset();
    }
    
    this.draw = function() {
        if (this.startTime != 0) {
            if (Date.now() - this.startTime >= this.maxTime) {
                this.timesUp();
            } else {
                this.setProgress((Date.now() - this.startTime) / this.maxTime);
            }
        }
        if (this.lastFeedbackStart != 0) {
            if (Date.now() - this.lastFeedbackStart >= this.feedbackDuration) {
                this.feedbackdiv.className = "nofeedback";
                this.lastFeedbackStart = 0;
            }
        }
    }
}


var lastTicTime = 0;
var drawable;
var imageLibrary = null;
var strokeLibrary = null;
var imageHasher = null;
var index = 0;
var trial = null;
var trialcontainerdiv = null;


var corrects = 0;
var incorrects = 0;
var trialaccuracy = [];

var testimages_filenames = [
    /*{name: "images/bbdraw1.jpg", group: 1},
    {name: "images/bbdraw2.jpg", group: 2},
    {name: "images/hbdraw1.jpg", group: 2},*/
    {name: "images/bbhouse1.jpg", group: 3},
    {name: "images/bbhouse2.jpg", group: 3},
    {name: "images/HBhouse1.jpg", group: 3},
    {name: "images/hbhouse2.jpg", group: 3},
    {name: "images/hbhouse3.jpg", group: 3},
    {name: "images/hbhouse5.jpg", group: 3}
/*        {name: "images/Copy\ of\ hbdraw\ 5\ all\ slight\ move.jpg", group: 4},
    {name: "images/hbdraw\ 5\ slight\ move.jpg", group: 4},
    {name: "images/hbdraw2.jpg", group: 4},
    {name: "images/hbdraw3.jpg", group: 4},
    {name: "images/hbdraw4.jpg", group: 4},
    {name: "images/hbdraw5.jpg", group: 4},

    {name: "images/IMG_0001.jpg", group: 5},
    {name: "images/IMG_0002.jpg", group: 5},
    {name: "images/IMG_0003.jpg", group: 5}*/
];

var testimages = [];
var testimagesloaded = 0;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var percentile = 1;
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
 /*

 */
        drawable.clear();
//        imageLibrary.storeIteration();
    } else if (event.keyCode == 99) {
    } else if (event.keyCode == 32) {
        imageLibrary.drawForcePercentile_Dist_Weight(percentile, imageHasher.distWeighted.bind(imageHasher),
            function(scaleIndex) {
                return (.00010 / (scaleIndex + 1));
            }
        );
        imageLibrary.drawForcePercentile_Dist_Weight(percentile, imageHasher.distWeighted.bind(imageHasher),
            function(scaleIndex) {
                return 1;//(.00010 / (scaleIndex + 1));
            }
        );
        imageLibrary.drawForcePercentile_Dist_Weight(percentile, imageHasher.distWeighted.bind(imageHasher),
            function(scaleIndex) {
                return (scaleIndex + 1);
            }
        );
        imageLibrary.drawForcePercentile_Dist_Weight(percentile, imageHasher.distWeighted.bind(imageHasher),
            function(scaleIndex) {
                return (Math.pow(10,scaleIndex + 1));
            }
        );
        percentile = percentile - .05;
    } else {
        conditionallog(event.keyCode);
    }
}

function init() {
    lastTicTime = Date.now();
    
    trialcontainerdiv = document.getElementById("trialcontainer");
   
    
    var stimulicanvas = document.getElementById("stimuli");
    
    document.onkeypress = keypress;
    
    drawable = new Drawable();
    drawable.init(stimulicanvas, true);

    strokeLibrary = new ImageLibrary("strokecontainer");
    strokeLibrary.init("strokecontainer");


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
    
    if (0 && testimages.length < testimages_filenames.length) {
        var stimulicanvas = document.getElementById("stimuli");
        
        
        var newimage = document.createElement("img");//new Image();
        
        newimage.onload = function(){
            var canvas = document.getElementById("stimuli");
            canvas.getContext("2d").drawImage(this,0,0);
            imageLibrary.storeIteration({name: this.name, group: this.group});
            conditionallog(".");
        };
        newimage.src = testimages_filenames[testimages.length].name;
        newimage.name = testimages_filenames[testimages.length].name;
        newimage.group = testimages_filenames[testimages.length].group;
        newimage.className = "hiddenimage";
        document.body.appendChild(newimage);
        conditionallog("reading " + testimages_filenames[testimages.length] + " cc1cc ");
        //conditionallog(newimage);
        
        
        testimages.push(newimage);
        //stimulicanvas.getContext("2d").drawImage(newimage,0,0);
        
        
        
        
    } else {
        //drawable.context.drawImage(testimages[0]);
        drawable.draw();
    }
    //if (trial) trial.ticDraw(trialcontainerdiv);
}

window.onload=init;