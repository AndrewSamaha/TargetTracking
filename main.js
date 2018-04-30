var componentA;
var componentB;
var multipleschedule;
var changeover;

function init() {
  $('body').css({position: "fixed"});

  /*
  MULTA_button = new Button();
  MULTA_button.create();
  MULTA_button.setPosition(15, 15, $(window).width()-15, $(window).height() - 15);

  MULTB_button = new Button();
  MULTB_button.create();
  MULTB_button.setPosition(15, 15, $(window).width()-15, $(window).height() - 15);

  MULTA = new Schedule();
  MULTA.configure({
    interval_ms: 5000,
    responseRequirement: true,
    label: "MULTA",
    stateColors: [
      {state: "running", color: "blue"},
      {state: "paused",  color: "grey"},
      {state: "timedout", color: "green"}
    ],
    button: MULTA_button
  });


  MULTB = new Schedule();
  MULTB.configure({
    interval_ms: 5000,
    responseRequirement: true,
    label: "MULTB",
    stateColors: [
      {state: "running", color: "blue"},
      {state: "paused",  color: "grey"},
      {state: "timedout", color: "green"}
    ],
    button: MULTB_button
  });
*/
  changeover = (function() {
    var button = new Button();
    button.create();
    button.setPosition($(window).width()/3, $(window).height()*.5, $(window).width()*.4, 100);
    var d = new VIDistribution(30000, 12);

    var VT30 = new Schedule();
    VT30.configure({
      interval_ms: 10000, // this value is ignored because of the following line
      distribution: d.intervals,
      responseRequirement: false,
      label: "VT30sChangeover",
      stateColors: [
        {state: "running", color: "pink"},
        {state: "paused",  color: "grey"},
        {state: "timedout", color: "green"}
      ],
      button: button,
      waitForUserAfterTimeout: true,
      timeout_callback: function(s) { multipleschedule.toggleComponent(); s.start(); }
    });
    return VT30;
  })();

  componentA = new ConcurrentSchedule();
  componentA.setLabel("componentA");

  componentB = new ConcurrentSchedule();
  componentB.setLabel("componentA");

  componentA.addSchedule( (function() {
    var concurrent = new ConcurrentSchedule();
    concurrent.setLabel("concurrentscheduleA");
    concurrent.addSchedule( (function() {
      console.log("inside concurrent.addSchedule");
      var button = new Button();
      button.create();
      button.setPosition(15, 15, $(window).width()*.4, 100);

      var FR1 = new Schedule();
      FR1.configure({
        interval_ms: 0,
        responseRequirement: true,
        label: "BEH A IN COMPONENT A",
        stateColors: [
          {state: "running", color: "#ddff99"},
          {state: "paused",  color: "grey"},
          {state: "timedout", color: "green"}
        ],
        button: button,
        waitForUserAfterTimeout: false,
        //pretimeout_callback: function(s) { changeover.pause(); },
        timeout_callback: function(s) { /*changeover.unpause();*/ s.start(); }
      });
      return FR1;
    })() );
    /*
    concurrent.addSchedule( (function() {
      var button = new Button();
      button.create();
      button.setPosition($(window).width()/2, 15, $(window).width()*.4, 100);

      var ext = new Schedule();
      ext.configure({
        interval_ms: 10000,
        responseRequirement: true,
        extinction: true,
        label: "beh b in component a",
        stateColors: [
          {state: "running", color: "#cccccc"},
          {state: "paused",  color: "grey"},
          {state: "timedout", color: "green"}
        ],
        button: button,
        waitForUserAfterTimeout: false,
        //pretimeout_callback: function(s) { changeover.pause(); },
        timeout_callback: function(s) { //changeover.unpause();
        s.start(); }
      });
      return ext;
    })() );
    */
    return concurrent;
  })() );

  componentB.addSchedule( (function() {
    var concurrent = new ConcurrentSchedule();
    concurrent.setLabel("concurrentscheduleB");
    /*
    concurrent.addSchedule( (function() {
      var button = new Button();
      button.create();
      button.setPosition(15, 15, $(window).width()*.4, 100);

      var ext = new Schedule();
      ext.configure({
        interval_ms: 10000,
        responseRequirement: true,
        extinction: true,
        label: "beh a in component b",
        stateColors: [
          {state: "running", color: "#cccccc"},
          {state: "paused",  color: "grey"},
          {state: "timedout", color: "green"}
        ],
        button: button,
        waitForUserAfterTimeout: false,
        //pretimeout_callback: function(s) { changeover.pause(); },
        timeout_callback: function(s) {
        //changeover.unpause();
         s.start(); }
      });
      return ext;
    })() );
    */
    concurrent.addSchedule( (function() {
      var button = new Button();
      button.create();
      button.setPosition($(window).width()/2, 15, $(window).width()*.4, 100);

      var FR1 = new Schedule();
      FR1.configure({
        interval_ms: 0,
        responseRequirement: true,
        label: "BEH B IN COMPONENT B",
        stateColors: [
          {state: "running", color: "#b3e6ff"},
          {state: "paused",  color: "grey"},
          {state: "timedout", color: "green"}
        ],
        button: button,
        waitForUserAfterTimeout: false,
        //pretimeout_callback: function(s) { changeover.pause(); },
        timeout_callback: function(s) { //changeover.unpause();
           s.start(); }
      });
      return FR1;
    })() );
    return concurrent;
  })() );

  multipleschedule = new MultipleSchedule();
  multipleschedule.setLabel("multipleschedule");
  multipleschedule.addComponent( componentA );
  multipleschedule.addComponent( componentB );
  multipleschedule.addChangeOverSchedule( changeover );
  multipleschedule.start();



  console.log("init'd");
  window.requestAnimationFrame( tic );


}

function tic() {
  //console.log("tic " + Date.now());
  if (!multipleschedule.isRunning()) {
    console.log("tic! multipleschedule is not running yet");
    return;
  }
  //if (FT.getState() == "configured") FT.start();

  multipleschedule.tic( Date.now() );
  //FT.tic();
  window.requestAnimationFrame( tic );
}

$( document ).ready(function() {
  console.log("calling init");
  init();

});
