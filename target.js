var PI2 = Math.PI * 2;
//a wrapper function to handle stimuli
var Target = function(params) {
    this.$element;// = $("#target");
    this.direction;
    this.speed;
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
    this.radius;
    this.maxRadius;
    this.growthRate;
    this.onDeath;
    this.startTime;
    this.dataCollector = null;
    this.lastMissTime;
    this.totalMisses;
    this.last_x;
    this.last_y;
    this.explosion_sound;
    
    this.setPosition = function(x,y,caller, other) {
        //if (this.pp.length > 10) return;
        //this.pp.push({t: this.delta_t, x:x, y:y});
        this.$element.offset({left: x, top: y});
        this.last_x = x;
        this.last_y = y;
        //console.log(caller + "\t" + this.delta_t + "\t" + x + "," + y + "\t" + (other ? JSON.stringify(other) : 0));
    }
    
    this.setRadius = function(r) {
        //console.log("setRadius: " + r + " maxRadius=" + this.maxRadius);
        r = Math.min(r, this.maxRadius);
        this.radius = r;
        this.$element.css("width", r*2);
        this.$element.css("height", r*2);
        this.$element.css("border-radius", r);
    }
    
    this.tic = function() {
        if (!this.alive) {
            return;
        }

        if (Date.now() < this.startAfter) {
            // console.log(`time remaining: ${Date.now() - this.startAfter}`);
            return;
        }

        this.$element.css('visibility', 'visible');
            
        
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
        //this.$element.offset({left: newx, top: newy});
        
        this.setRadius( this.radius + this.radius * this.growthRate * this.delta_t );
        this.lasttic = Date.now();
    }
    
    this.clickHandler = function(e) {
        if (!this.alive) return;
        //var s = new Shrapnel({x: this.$element.offset().left, y: this.$element.offset().top});
        //console.log("hit " + this.hits + " alive: " + this.alive);
        this.hits++;
        if (this.hits >= this.maxHits) {
            this.alive = 0;
            if (this.dataCollector)
                this.dataCollector.event({event: "targetHit", latency: Date.now() - this.startTime, radius: this.radius, speed: this.speed, misses: this.totalMisses});
            if (this.explosion_sound) {
                try {
                    this.explosion_sound.currentTime = 0;
                    this.explosion_sound.play();
                } catch (e) {
                    alert(JSON.stringify(e));
                }
            }
            if (this.shrapnelManager) 
                this.shrapnelManager.create(
                    Math.floor(this.radius/10 + Math.random()*6-3), 
                    {
                        x: this.$element.offset().left, 
                        y: this.$element.offset().top, 
                        radius: this.radius,
                        direction: this.direction, 
                        x_sign: this.x_sign, 
                        y_sign: this.y_sign
                    });
            if (this.onDeath) this.onDeath();
            if (this.$element.length) {
                this.$element.off();
                $("body").off();                
                this.$element.remove();
                this.alive = 0;
                //this.startIn(1500);
            }
        }
    }
    
    this.remove = function(e) {
        if (this.$element.length) {
            this.$element.off();
            $("body").off();                
            this.$element.remove();
            this.alive = 0;
            //this.startIn(1500);
        }
    }

    this.missHandler = function(e) {
        var mouseX = e.pageX;
        var mouseY = e.pageY;
        var offset = this.$element.offset();
        var distance = Math.floor(Math.sqrt(Math.pow(mouseX - (this.last_x+this.radius), 2) + Math.pow(mouseY - (this.last_y+this.radius), 2)));
        this.totalMisses++;
        if (this.dataCollector)
            this.dataCollector.event({
                event: "targetMiss",
                dist: distance,
                mousePos: [mouseX, mouseY],
                lastPos: [Math.floor(this.last_x), Math.floor(this.last_y)],
                latency: Date.now() - this.startTime,
                radius: this.radius,
                speed: this.speed,
                miss: this.totalMisses
            });
        this.lastMissTime = Date.now();
        return false;
    }
    
    this.startIn = (t) => {
        this.startAfter = Date.now() + t;
        console.log(`this.startAfter ${this.startAfter} alive: ${this.alive} t: ${t}`);
    }

    this.init = function(params) {
        console.log('target.init(), params=',params);
        this.startAfter = params.startAfter || 0;
        this.maxRadius = params.maxRadius || 200;
        this.initialRadius = params.initialRadius || 100;
        this.growthRate = params.growthRate;// || .0001;
        this.alive = params.alive || 1;
        this.hits = params.hits || 0;
        this.maxHits = params.maxHits || 1;
        this.direction = params.direction || Math.random() * PI2;
        this.speed = params.speed; // || .10; //px/s
        this.lasttic = Date.now();
        this.startTime = this.lasttic;
        this.totalMisses = 0;
        
        
        if ($("#explosion_sound").length != 0)
            this.explosion_sound = document.getElementById("explosion_sound");
        
        if (!this.$element || this.$element.length == 0) {
            this.$element = $("<div id=target></div>");
            this.$element.css('visibility', 'hidden');
            this.setRadius(this.initialRadius);
            $("body").append( this.$element );
        }
        const getInitialPosition = () => {
            const xmax = $( window ).width();
            const ymax = $( window ).height();
            return {
                x: Math.floor(Math.random()*( $( window ).width() - this.radius * 2)),
                y: Math.floor(Math.random()*( $( window ).height() - this.radius * 2))
            }
        }

        const initialPosition = getInitialPosition();
        this.setPosition( initialPosition.x,
                          initialPosition.y, 
                          "init");
        
        if (0) {
            this.$element.mousedown((function(e) {
               this.clickHandler(e);
               e.stopPropagation();
            }).bind(this));
            
            $("body").mousedown((function(e) {
                this.missHandler(e);
                e.stopPropagation();
            }).bind(this));
        } else {
            this.$element.bind('touchstart', (function(e) {
               this.clickHandler(e);
               e.stopPropagation();
            }).bind(this));
            this.$element.bind('mousedown', (function(e) {
               this.clickHandler(e);
               e.stopPropagation();
            }).bind(this));
            
            $("body").bind('touchstart', (function(e) {
                this.missHandler(e);
                e.stopPropagation();
            }).bind(this));
            $("body").bind('mousedown', (function(e) {
                this.missHandler(e);
                e.stopPropagation();
            }).bind(this));

        }
        
        if (params && params.dataCollector) {
            this.dataCollector = params.dataCollector;
            this.dataCollector.event({event: "newTarget", radius: this.radius, speed: this.speed});
        }
    }
    
    this.init(params);
}

export default Target;