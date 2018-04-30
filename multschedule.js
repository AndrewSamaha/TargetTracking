var MultipleSchedule = function() {
  this.components = []; // expects a schedule, or a concurrent schedule
  this.label = "";
  this.activeComponent = null;
  this.changeOverSchedule = null;
  this.lastTicTime = null;
  this.started = false;
  this.type = "multipleschedule";

  this.addComponent = function(component) { this.components.push( component ); }
  this.addChangeOverSchedule = function(schedule) { this.changeOverSchedule = schedule; }
  this.setLabel = function(label) { this.label = label; }

  this.tic = function( ticTime ) {
    if (ticTime == this.lastTicTime) return;
    this.lastTimeTime = ticTime;

    if (this.changeOverSchedule) this.changeOverSchedule.tic( ticTime );
    for (var i = 0; i < this.components.length; i++)
      this.components[i].tic( ticTime );
  }

  this.getRandomComponent = function() {
    if (!this.components.length) throw "attempting to get a random component, but no components exist!";
    return this.components[Math.floor(this.components.length * Math.random())];
  }

  this.start = function( activeComponent ) {
    if (this.components.length <= 0) throw "Trying to start a multiple schedule without any components";
    if (!activeComponent) { activeComponent = this.getRandomComponent(); }
    for (var i = 0; i < this.components.length; i++) {
      this.components[i].start();
      if (this.components[i] != activeComponent) this.components[i].inactivate();
    }
    if (this.changeOverSchedule) this.changeOverSchedule.start();
    this.activeComponent = activeComponent;
    this.activeComponent.activate();
    this.started = true;
  }

  this.isRunning = function() { return this.started; }

  this.pause = function() {
    for (var i = 0; i < this.components.length; i++)
      this.components[i].pause();
  }

  this.changeComponent = function( newComponent ) {
    if (!newComponent) throw "Trying to change component, but no new component was specified";
    if (newComponent == this.activeComponent) throw "The indicated component is already active!";
    var foundComponent = null;
    for (var i = 0; i < this.components.length; i++) {
      if (this.components[i] == newComponent)
        foundComponent = this.components[i];
    }
    if (!foundComponent) throw "Could not find the newComponent in the list of this schedule's components!";
    this.activeComponent.inactivate();
    this.activeComponent = newComponent;
    newComponent.activate();
  }

  this.toggleComponent = function() {
    if (this.components.length <= 0) throw "Trying to toggle components, but there aren't any!";
    if (this.components.length > 2) throw "Trying to toggle components, but there are more than two!";
    var foundComponent = null;
    var foundComponentIndex = -1;
    var activeComponentIndex = -1;
    for (var i = 0; i < this.components.length; i++) {
      if (this.components[i] == this.activeComponent) {
        activeComponentIndex = i;
        if (i == this.components.length-1) foundComponentIndex = 0;
        else foundComponentIndex = i + 1;
        break;
      }
    }
    console.log("multschedule.");
    console.log("\tfoundComponentIndex =" + foundComponentIndex);
    console.log("\tactiveComponentIndex=" + activeComponentIndex);
    if (foundComponentIndex == activeComponentIndex) throw "Could not find a component other than the active one!!";
    foundComponent = this.components[foundComponentIndex];
    if (!foundComponent) throw "Could not find a component other than the active one!!";
    this.activeComponent.inactivate()
    this.activeComponent = foundComponent;
    foundComponent.activate();
  }
}
