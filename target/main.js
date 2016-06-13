

var DataCollector = function() {
    this.$element = $("<div id=datacollector></div>");
    this.$element.css("position","fixed");
    this.$element.css("left","100px");
    this.$element.css("width","80%");
    this.$element.css("height", "100px");
    this.$element.css("bottom","100px");
    this.$element.css("overflow-y","scroll");
    this.$element.css("background","rgba(200,200,200,.5)");
    this.$element.css("padding","2px 2px 2px 2px");
    this.$element.css("border-style","solid");
    this.$element.css("border-width","1px");
    this.$element.css("font-size",".75em");
    $("body").append( this.$element );
    /*
    position: fixed;
                right: 200px;
                width: 300px;

                background-color: gray;
    */
    this.data = [];
    this.startTime = Date.now();
    
    this.event = function(datum) {
        if (!datum) datum = {undefined: true};
        if (!datum.hasOwnProperty("event")) datum.event = "undefined";
        if (!datum.hasOwnProperty("time")) datum.time = Date.now();
        this.data.push(datum);
        this.$element.prepend((Date.now() - this.startTime) + "\t" + JSON.stringify(datum) + "<br>");
//        this.$element.html(this.$element.html() + "<br>" + JSON.stringify(datum));
    }
    this.click = function(datum) {
        if (!datum.hasOwnProperty("event")) datum.event = "click";
        this.event(datum);
    }
}

var dataCollector;
var shrapnelManager;
var targetNum;
var target;
var distanceToTarget;
var lastTicTime;
var delta_t;
var mX;
var mY;
var lastError;

function calculateDistance(t, mouseX, mouseY) {

    return Math.floor(Math.sqrt(Math.pow(mouseX - (t.last_x+t.radius), 2) + Math.pow(mouseY - (t.last_y+t.radius), 2)));
}

function newTarget() {
    targetNum++;
    target = {};
    target = new Target({dataCollector: dataCollector});
    target.shrapnelManager = shrapnelManager;

    return target;
}

function init() {
    targetNum = 0;
    dataCollector = new DataCollector();
    shrapnelManager = new ShrapnelManager();
    shrapnelManager.dataCollector = dataCollector;
    
    newTarget();
    
    $(document).mousemove((function(e) {
        mX = e.pageX;
        mY = e.pageY;
        distanceToTarget = calculateDistance(target, mX, mY);
    })).bind(this);
    tic();
}

function tic() {
    requestAnimationFrame(tic);
    target.tic();
    
    //debug
    var dS = "";
    dS += "distanceToTarget : " + distanceToTarget;
    dS += "<br>liveCalculateDist: " + calculateDistance(target, mX, mY);
    dS += "<br>x: " + target.last_x;
    dS += "<br>y: " + target.last_y;
    dS += "<br>mouseX: " + mX;
    dS += "<br>mouseY: " + mY;
    dS += "<br>targetX: " + Math.floor(target.$element.offset().left);
    dS += "<br>targetY: " + Math.floor(target.$element.offset().top);
    dS += "<br>lastError: " + lastError;
    $("#debug").html(dS);
    
    shrapnelManager.tic();
    delta_t = Date.now() - lastTicTime;
    
    if (!target.alive) newTarget();
    lastTicTime = Date.now();
}

window.onload=init;