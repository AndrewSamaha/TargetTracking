import jQuery from "jquery";
Object.assign(window, { $: jQuery, jQuery })

var PI2 = Math.PI * 2;
var Shrapnel = function(newposition) {
    this.$element;
    this.direction;
    this.speed;
    this.speedDecayRate;
    this.deathSpeed;
    this.x_sign = 1;
    this.y_sign = 1;
    this.lasttic;
    this.lastdistance;
    this.delta_x;
    this.delta_y;
    this.delta_t;
    this.pp = [];
    this.hits;
    this.maxHits;
    this.alive;
    this.size;
    this.minSize;
    this.maxSize;
    this.growthRate;
    this.onDeath;
    this.maxAge;
    this.startTime;
    this.rotation;
    this.rotationRate;
    this.red = 255; //not used
    this.alpha = 1;
    
    this.setPosition = function(x,y,caller, other) {
        if (this.pp.length > 10) return;
        this.pp.push({t: this.delta_t, x:x, y:y});
        this.$element.offset({left: x, top: y});
    }
    
    this.getAge = function() {
        if (!this.startTime) return 0;
        return Date.now() - this.startTime;
    }
    
    this.die = function() {
        this.alive = 0;
        if (this.$element.length) {
            this.$element.remove();
        }
    }
    
    this.tic = function() {
        if (this.alive == 0) return;
        if (this.getAge() >= this.maxAge || this.speed <= this.deathSpeed) {
            this.die();
            return;
        }
        
        if (this.$element.length == 0) {
            this.init();
        }
        
        this.delta_t = Date.now() - this.lasttic;
        if (this.delta_t > 500) this.delta_t = 500;
        
        var offset = this.$element.offset();
        var x = offset.left;
        var y = offset.top;
        
        var distance = this.delta_t * this.speed;
        this.lastdistance = distance;
        
        var newx = x + Math.cos(this.direction) * distance * this.x_sign;
        var newy = y + Math.sin(this.direction) * distance * this.y_sign;
        
        this.delta_x = newx - x;
        this.delta_y = newy - y;
        
        if (1) {
            if (this.delta_x > 0 && newx > $( window ).width() - this.$element.width()) this.x_sign = this.x_sign * -1;
            else if (this.delta_x < 0 && newx < 0) this.x_sign = this.x_sign * -1;

            if      (this.delta_y > 0 && newy > $( window ).height() - this.$element.height()) this.y_sign = this.y_sign * -1;
            else if (this.delta_y < 0 && newy < 0)  this.y_sign = this.y_sign * -1;
        }
        this.direction = this.direction % PI2;
        this.setPosition(newx, newy, "tic", {x: x, y: y, dist: distance, delta_t: this.delta_t});
        this.$element.offset({left: newx, top: newy});
        
        this.speed = this.speed - this.speed * this.speedDecayRate * this.delta_t;
        this.rotation += this.rotationRate * this.delta_t;
        this.rotationRate -= this.rotationRate * this.speedDecayRate * this.delta_t;
        
        this.$element.css("transform","rotate(" + this.rotation*10 + "deg)");
        
        this.lasttic = Date.now();
    }
    
    this.init = function(newposition) {
        this.startTime = Date.now();
        this.maxAge = 32000 - Math.random()*300;
        
        this.alive = 1;
        this.hits = 0;
        this.maxHits = 1;
        if (newposition.hasOwnProperty("direction")) {
            this.direction = newposition.direction + (Math.random() * 1 - .5);
            this.y_sign = newposition.y_sign;
            this.x_sign = newposition.x_sign;
        } else
            this.direction = Math.random() * PI2;
        
        this.speed = .07 + Math.pow(4 * Math.random(),-2)/2; //  px/ms
        this.speed = Math.min(this.speed, 1.0);
        this.speedDecayRate = .002;
        this.deathSpeed = .05;
        this.rotation = 0;
        this.rotationRate = Math.random()/3;
        this.minSize = 5;
        this.maxSize = 40;
        this.size = Math.random() * (this.maxSize - this.minSize) + this.minSize;
        this.lasttic = Date.now();
        
        if (!this.$element || this.$element.length == 0) {
            this.$element = $("<div id=shrapnel"+Math.floor(Math.random()*101010)+"></div>");
            this.$element.addClass("shrapnel");
            this.$element.css("border-left", this.size*.86 + "px solid transparent");
            this.$element.css("border-right", this.size*.86 + "px solid transparent");
            this.$element.css("border-top", this.size + "px solid #f00");
            $("body").append( this.$element );
        }

        this.setPosition( 
            newposition.x + Math.random() * newposition.radius * 2 - newposition.radius, 
            newposition.y + Math.random() * newposition.radius * 2 - newposition.radius,
            "init"
            );
        //console.log("creating shrapnel @ " + newposition.x + "," + newposition.y);
    }
    
    this.init(newposition);
}


var ShrapnelManager = function() {
    this.shrapnel = [];
    this.maxDuration = 10;
    this.lastIndex = 0;
    this.tics = 0;
    this.efficiency = 0;
    this.duration = 0;
    this.timePerIteration = [];
    this.dataCollector = null;
    this.debug = 0;
    this.create = function(n, position) {
        for (var i = 0; i < n; i++) this.shrapnel.push(new Shrapnel(position));
    }
    
    this.tic = function() {
        if (this.shrapnel.length == 0) return;
        var startTic = Date.now();
        this.tics = 0;
        if (debug == 1) this.timePerIteration = [];
        while (Date.now() - startTic < this.maxDuration && this.shrapnel.length > 0) {
            this.tics++;
            this.lastIndex = Math.max(-1,Math.min(this.lastIndex,this.shrapnel.length)-1);
            if (this.lastIndex == -1) this.lastIndex = this.shrapnel.length-1;
            
            if (this.shrapnel[this.lastIndex]._tic && this.shrapnel[this.lastIndex]._tic == startTic) break;
            this.shrapnel[this.lastIndex].tic();
            this.shrapnel[this.lastIndex]._tic = startTic; //mark this one so we know we've tic'd it
            if (!this.shrapnel[this.lastIndex].alive) this.shrapnel.splice(this.lastIndex,1);

            if (debug == 1) {
                if (this.timePerIteration.length == 0) this.timePerIteration.push(Date.now() - startTic);
                else this.timePerIteration.push(Date.now() - startTic /* - this.timePerIteration[this.timePerIteration.length - 1]*/);
            }
            
        }
        if (debug == 1 && this.dataCollector) this.dataCollector.event({debug: debug, event: "ShrapnelTic", timePerIter: this.timePerIteration});
        if (this.tics > 0) this.duration = (Date.now() - startTic);
        if (this.tics > 0) this.efficiency = this.tics / (this.duration);
        /*
        for (var i = this.shrapnel.length - 1; i >= 0; i--) {
            this.shrapnel[i].tic();
            if (!this.shrapnel[i].alive) this.shrapnel.splice(i,1);
        }
        */
    }
}

export default ShrapnelManager;