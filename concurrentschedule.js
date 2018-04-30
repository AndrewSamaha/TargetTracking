var ConcurrentSchedule = function() {
  this.schedules = [];
  this.label = "";
  this.lastTicTime = null;
  this.type = "concurrentschedule";

  this.addSchedule = function(schedule) {
    this.schedules.push( schedule );
    console.log(this.label + " this.type=" + this.type);
    console.log("  adding new component, n=" + this.schedules.length);
    console.log("  schedule.type=" + schedule.type);
    console.log("  does schedule have property type? " + (schedule.hasOwnProperty("type")? "yes" : "no"));
  }
  this.setLabel = function(label) { this.label = label; }

  this.tic = function(ticTime) {
    if (ticTime == this.lastTicTime) return;
    this.lastTimeTime = ticTime;

    for (var i = 0; i < this.schedules.length; i++)
      this.schedules[i].tic( ticTime );
  }

  this.start = function() {
    console.log("starting concurrent schedule: " + this.label);
    console.log("  num components: " + this.schedules.length);
    for (var i = 0; i < this.schedules.length; i++)
      this.schedules[i].start();
  }

  this.pause = function() {
    for (var i = 0; i < this.schedules.length; i++)
      this.schedules[i].pause();
  }

  this.unpause = function() {
    for (var i = 0; i < this.schedules.length; i++)
      this.schedules[i].unpause();
  }

  this.activate = function() {
    for (var i = 0; i < this.schedules.length; i++)
      this.schedules[i].activate();
  }

  this.inactivate = function() {
    for (var i = 0; i < this.schedules.length; i++)
      this.schedules[i].inactivate();
  }
}
