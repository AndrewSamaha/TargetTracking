var Schedule = function() {
  // with respect to time and response requirements in the same schedule,
  // this object assumes the time requirement must always be met first,
  // and only then will a response count towards meeting the response
  // requirement
  this.type = "schedule";
  this.state = "undefined"; // possible values:
                              //undefined
                              //configured
                              //running
                              //paused
                              //timedout_waitingforuser
                              //timedout
  this.stateColors = [];
  this.debug = 1;
  this.childSchedules = [];
  this.lastTicTime = null;

  this.configure = function( configuration ) {
    if (!configuration) throw "No configuration passed to Schedule.configure";
    this.configuration = configuration;
    if (this.configuration.button) this.setButton( this.configuration.button );
    this.changeState("configured");
    if (!this.configuration.label) this.configuration.label = "no label!";
    if (this.configuration.distribution) {
      console.log("\tdistribution passed, n=" + this.configuration.distribution.length);
    }
    //some possible configuration parameters
    // .interval_ms = #ms
    // .responseRequirement = true/false
    // .div
    // .label (the text inside the div)
    // .stateColors = [], an array with a "state", and a "color"
    // .button
    // .waitForUserAfterTimeout = [true/false]
    // .timeout_callback = a function to call when the timeout happens
    console.log("new schedule configured: " + this.configuration.label);
  }

  this.start = function() {
    this.startTime = Date.now();
    this.pauses = [];
    this.responsesAfterTimer = [];
    this.allResponses = [];
    this.responseRequirementMet = false;
    console.log("STARTING " + this.configuration.label);
    if (this.configuration.distribution) {
      var val = this.configuration.distribution[
        Math.floor(Math.random()*this.configuration.distribution.length)
      ];
      console.log("schedule.start; using DISTRIBUTION VAL of " + val);
      this.configuration.interval_ms = val;
    }

    this.changeState("running");
  }
  this.setChildSchedules = function(children) {
    //child schedules pause and unpause with the parent schedule
    this.childSchedules = children;
  }
  this.setButton = function(button) {
    this.button = button;
    this.button.setOn( this.respond, this);
    this.configuration.div = this.button.div;
  }
  this.getState = function() {
    return this.state;
  }
  this.changeState = function( newState ) {
    this.state = newState.toLowerCase();
    if (!this.configuration.stateColors) {
      if (this.debug) console.log("bailing out of changeState, no stateColors defined");
      return;
    }
    if (!this.configuration.div) {
      if (this.debug) console.log("bailing out of changeState, no div defined");
      return;
    }
    console.log("changing sstate to " + this.state);
    var colorFound = false;
    for (var i = 0; i < this.configuration.stateColors.length; i++) {
      if (this.state == this.configuration.stateColors[i].state) {
        this.configuration.div.css(
          "background-color",
          this.configuration.stateColors[i].color
        );
        console.log("changing background color to: " + this.configuration.stateColors[i].color);
        colorFound = true;
        break;
      }
    }
    if (!colorFound) {
      this.configuration.div.css(
        "background-color",
        "pink"
      );
      console.log("going with default color");
    }
    this.updateText();
    if (this.state == "timedout_waitingforuser" && this.configuration.pretimeout_callback)
      this.configuration.pretimeout_callback( this );
  }

  this.updateText = function() {
    if (!this.configuration.div) return;
    var labelText = "<p>" + this.configuration.label + "</p>";
    var stateText = this.state;
    var timeText = "";
    var responseText = "";
    var HTML = "";
    switch (this.state) {
      case 'undefined':
      case 'configured':
      case 'timedout':
      case 'timedout_waitingforuser':
        HTML = labelText + stateText;
        break;
      case 'running':
      case 'paused':
        if (this.metTimeRequirement()) timeText = "time: done<br>";
        else timeText = "time: " + this.getDisplayTime() + "<br>";
        if (this.metResponseRequirement()) responseText = "beh: done<br>";
        else if (!this.metTimeRequirement()) responseText = "beh: waiting for time<br>";
        else responseText = "beh: ready";
        HTML = labelText + stateText + "<br>" + timeText + responseText;
        break;
      default:
        HTML = labelText + "Undefined State: " + stateText;
        break;
    }
    this.configuration.div.html(HTML);
  }

  this.metTimeRequirement = function() {
    if (this.configuration.extinction) return false;
    if (!this.configuration.interval_ms || this.configuration.interval_ms <= 0)
      return true;
    if (this.getCurrentTime() >= this.configuration.interval_ms)
      return true;
    return false;
  }

  this.metResponseRequirement = function() {
    if (!this.configuration.responseRequirement) return true;
    else if (this.responsesAfterTimer.length > 0) return true;
  }

  this.getTotalPauseTime = function() {
    if (!this.pauses) return 0;
    var totalPauseTime = 0;
    for (var i = 0; i < this.pauses.length; i++) {
      var pause = this.pauses[i];
      if (pause.stopTime) {
        totalPauseTime += pause.stopTime - pause.startTime;
      }
      else totalPauseTime += Date.now() - pause.stopTime;
    }
    return totalPauseTime;
  }

  this.isPaused = function() {
    if (!this.pauses || this.pauses.length == 0) return false;
    else if (this.pauses.length > 0 && this.pauses[this.pauses.length - 1].stopTime) return false;
    return true;
  }

  this.getCurrentTime = function() {
    if (this.configuration.extinction) return 0;
    var totalDuration = Date.now() - this.startTime - this.getTotalPauseTime();
    //if (this.debug) console.log(this.configuration.label + ".getCurrentTime=" + totalDuration);
    return totalDuration;
  }

  this.getDisplayTime = function() {
    if (this.configuration.extinction) return 0;
    return Math.floor( (this.configuration.interval_ms - this.getCurrentTime()) / 100 ) / 10;
  }

  this.meetResponseRequirement = function() {
    this.responseRequirementMet = true;
    if (this.configuration.waitForUserAfterTimeout) {
      this.changeState("timedout_waitingforuser");
    } else {
      this.timeout(); // this means the schedule stops running (Sr is delivered)
    }
  }

  this.pause = function() {
    if (this.isPaused()) {
      this.pauses[ this.pauses.length - 1 ].stopTime = Date.now();
    }
    this.pauses.push( {startTime: Date.now()} );
    this.changeState("paused");
    for (var i = 0; i < this.childSchedules.length; i++) this.childSchedules[i].pause();
  }

  this.unpause = function() {
    if (this.isPaused()) {
      this.pauses[ this.pauses.length - 1 ].stopTime = Date.now();
      this.changeState("running");
      for (var i = 0; i < this.childSchedules.length; i++) this.childSchedules[i].unpause();
    }
  }

  this.checkState = function( reason ) {
    // check to make sure we're in the expected state
    // if not, then go to the correct state
    // reason = "response" or "tic"


  }

  this.respond = function() {
    // step 1, check the state
    // step 2, respond according to the state
    var responseID = this.getCurrentTime() + Math.random();

    if (this.isPaused()) {
      if (this.debug) console.log("response, but we're paused");
    } else if (this.getState() == "timedout") {
      if (this.debug) console.log("response, but we're timedout");
    } else if (this.getState() == "timedout_waitingforuser") {
      this.timeout();
    } else if (this.getState() == "running") {
        this.allResponses.push( responseID );
        if (this.metTimeRequirement()) {
          this.responsesAfterTimer.push( responseID );
          console.log("RESPONSE " +responseID+ "allResponses=" + this.allResponses.length + " responsesAfterTimer=" + this.responsesAfterTimer.length);
          if (this.configuration.responseRequirement) this.meetResponseRequirement();
          return true;
        } else
        /*if (this.metResponseRequirement()) {
          //we shouldn't ever get here?
          console.log("met response requirement on " + this.configuration.label);
          console.log(this.configuration.label + ".respond() " + this.getCurrentTime() + " n=" + this.responses.length);
          if (this.configuration.waitForUserAfterTimeout)
            this.changeState("timedout_waitingforuser");
          else
            this.changeState("timedout");
        } else  */
        {
          console.log("RESPONSE " +responseID+ "allResponses=" + this.allResponses.length + " responsesAfterTimer=" + this.responsesAfterTimer.length);
        }
    } else {
      if (this.debug) console.log("response, but we're in state" + this.getState());
    }

    return false;
  }

  this.isSrAvailable = function() {
    return this.metTimeRequirement();
  }

  this.timeout = function() {
    console.log("TIMEOUT");
    this.timeoutTime = Date.now();
    this.changeState( "timedout" );
    if (this.configuration.timeout_callback) {
      console.log("calling timeout_callback");
      this.configuration.timeout_callback( this );
    } else {
      console.log("no timeout callback");
    }
  }

  this.tic = function(ticTime) {
    if (ticTime == this.lastTicTime) return;
    this.lastTimeTime = ticTime;

    if (this.getState() == "running") {
      if (this.metTimeRequirement()) {
        if (this.metResponseRequirement()) {
          if (this.configuration.waitForUserAfterTimeout) this.changeState("timedout_waitingforuser");
          else this.timeout();
        }
      }
    }
    this.updateText();
  }

  this.inactivate = function() {
    this.pause();
    this.button.hide();
  }

  this.activate = function() {
    this.button.show();
    this.unpause();
  }
}
