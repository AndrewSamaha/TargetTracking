var VIDistribution = function(mean, N) {
  this.intervals = [];
  this.generateIntervals = function(mean, N) {
    var p = 1 / mean;
    var sum = 0;
    console.log("generating VI with a mean of " + mean + " and " + N + " intervals.");
    for (var i = 1; i <= N; i++) {
      var t = 0;
      if (i == N) {
        t =  mean * (1 + Math.log(N)); //Math.pow( -Math.log(1-p), -1) * (1 + Math.log(N))
      } else {
        var a = 0, b = 0;
        a = mean; //Math.pow( -1 * Math.log(1-p), -1);
        b = (1 + Math.log(N) + (N - i) * Math.log(N - i) - (N - i + 1)*Math.log(N - i + 1));
        t = a * b;
      }
      this.intervals.push(t);
      sum += t;
      console.log("  " + t);
    }
    var obtainedAverage = sum / N;
    console.log("  obtainedAverage=" + obtainedAverage);
  }

  this.generateIntervals(mean, N);
}
