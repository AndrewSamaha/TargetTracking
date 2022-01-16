var DataCollector = function() {
    this.debug = 0;
    if (this.debug) {
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
    }
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
        if (this.debug)
            this.$element.prepend((Date.now() - this.startTime) + "\t" + JSON.stringify(datum) + "<br>");
    }
    this.click = function(datum) {
        if (!datum.hasOwnProperty("event")) datum.event = "click";
        this.event(datum);
        console.log(datum);
    }
}

export default DataCollector;