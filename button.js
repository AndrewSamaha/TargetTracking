var Button = function() {
  this.div = $(document.createElement('div'));
  this.div.attr('id',"button" + Math.random());
  this.div.css({
    position: 'fixed',
    visibility: "visible"
  });
  this.childButtons = [];

  this.setPosition = function(x,y,width,height) {
    this.div.css({
      top: y,
      left: x,
      height: height,
      width: width
    });
  }

  this.setOn = function(fun, schedule) {
    console.log("touchstart and click event set");
    this.div.on('touchstart click', (fun).bind(schedule));
    this.schedule = schedule;
  }

  this.create = function() {
    $('body').append(this.div);
  }

  this.setChildButtons = function(children) {
    this.childButtons = children;
  }

  this.hide = function() { this.div.css({ visibility: "hidden" }); }

  this.show = function() { this.div.css({ visibility: "visible" }); }

  this.getVisibility = function() { return this.div.css("visibility"); }

}
