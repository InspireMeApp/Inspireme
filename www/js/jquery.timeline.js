/*
 * jquery.timeline.js
 * Enqueue events in a timeline animation
 * This class requires jQuery
 * Written by Merijn van Wouden
 */

function timeline(queue) {
    this.queue = queue || {};
    return this;
}
;

timeline.prototype.get = function () {
    return this.queue;
};
timeline.prototype.add = function (ms, func) {
    while (this.queue.hasOwnProperty(ms)) {
        ms++;
    }
    this.queue[ms] = func;
    return this;
};
timeline.prototype.run = function (speed) {
    var speed = (1 / speed) || 1;
    //sort
    var points = [];
    var k;
    for (k in this.queue) {
        if (this.queue.hasOwnProperty(k)) {
            points.push(k);
        }
    }
    points.sort(function (a, b) {
        return a - b;
    });
    this.runLoop(points, 0, speed);
    return this;
};
timeline.prototype.runLoop = function (points, now, speed) {
    var $this = this;
    var next = points.shift();
    setTimeout(function () {
        $this.queue[next]();
        if (points.length) {
            $this.runLoop(points, Math.round(next * speed), speed);
        }
    }, Math.round((next - now) * speed));
};
