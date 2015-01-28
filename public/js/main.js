(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var schedulenaut = angular.module('schedulenaut', [
    require('./scheduler').name
]);

schedulenaut.controller('main', function ($scope) {
    $scope.who = 'world';
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
});

},{"./scheduler":2}],2:[function(require,module,exports){
/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.scheduler', [])
    .directive('scrub', require('./scrub'));
    //.controller('ChartMgrCtrl', require('./ChartMgrCtrl'));

},{"./scrub":3}],3:[function(require,module,exports){
/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = function () {
    return {
        restrict: 'A',
        scope: {
            width: '@'
        },
        link: function (scope, element, attrs) {
            scope.el = d3.select(element[0]);

            var brushes = [];

            var newBrush = function (svg){
                var brush = d3.svg.brush()
                    .x(x)
                    .on("brush", brushed)
                    .on("brushend", brushend);

                brushes.push(brush);

                var gBrush = svg.insert("g", '.brush')
                    .attr("class", "brush")
                    .on("click", function() { d3.event.stopPropagation(); })
                    .call(brush);

                gBrush.selectAll("rect")
                    .attr("height", height);


                function brushed() {
                    var extent0 = brush.extent(),
                        extent1;

                    // if dragging, preserve the width of the extent
                    if (d3.event.mode === "move") {
                        var d0 = d3.time.day.round(extent0[0]),
                            d1 = d3.time.day.offset(d0, Math.round((extent0[1] - extent0[0]) / 864e5));
                        extent1 = [d0, d1];
                    }

                    // otherwise, if resizing, round both dates
                    else {
                        extent1 = extent0.map(d3.time.day.round);

                        // if empty when rounded, use floor & ceil instead
                        if (extent1[0] >= extent1[1]) {
                            extent1[0] = d3.time.day.floor(extent0[0]);
                            extent1[1] = d3.time.day.ceil(extent0[1]);
                        }
                    }

                    d3.select(this).call(brush.extent(extent1));

                }

                function brushend(){

                    gBrush.select('.background')
                        .style('pointer-events', 'none');

                    newBrush(svg);

                }
                return brush;
            };

            var margin = {top: 10, right: 10, bottom: 20, left: 10},
                width = parseInt(attrs.width) - margin.left - margin.right,
                height = parseInt(attrs.height) - margin.top - margin.bottom;

            var x = d3.time.scale()
                .domain([new Date(2013, 2, 1), new Date(2013, 2, 15) - 1])
                .range([0, width]);

            var svg = scope.el.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .on('click', function(){
                    newBrush(svg);
                });

            svg.append("rect")
                .attr("class", "grid-background")
                .attr("width", width)
                .attr("height", height);

            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(d3.time.hours, 12)
                    .tickSize(-height)
                    .tickFormat(""))
                .selectAll(".tick")
                .classed("minor", function(d) { return d.getHours(); });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(d3.time.days)
                    .tickPadding(0))
                .selectAll("text")
                .attr("x", 6)
                .style("text-anchor", null);

            var brushes = svg.append('g')
                .attr('class', 'brushes');

            newBrush(brushes);


        }
    };
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic291cmNlXFxqc1xcbWFpbi5qcyIsInNvdXJjZVxcanNcXHNjaGVkdWxlclxcaW5kZXguanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXHNjcnViLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzY2hlZHVsZW5hdXQgPSBhbmd1bGFyLm1vZHVsZSgnc2NoZWR1bGVuYXV0JywgW1xyXG4gICAgcmVxdWlyZSgnLi9zY2hlZHVsZXInKS5uYW1lXHJcbl0pO1xyXG5cclxuc2NoZWR1bGVuYXV0LmNvbnRyb2xsZXIoJ21haW4nLCBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAkc2NvcGUud2hvID0gJ3dvcmxkJztcclxuICAgICRzY29wZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgJHNjb3BlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxufSk7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IEpvbmF0aGFuIG9uIDEvMjUvMjAxNS5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdzY2hlZHVsZW5hdXQuc2NoZWR1bGVyJywgW10pXHJcbiAgICAuZGlyZWN0aXZlKCdzY3J1YicsIHJlcXVpcmUoJy4vc2NydWInKSk7XHJcbiAgICAvLy5jb250cm9sbGVyKCdDaGFydE1nckN0cmwnLCByZXF1aXJlKCcuL0NoYXJ0TWdyQ3RybCcpKTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMS8yNS8yMDE1LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIHdpZHRoOiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgc2NvcGUuZWwgPSBkMy5zZWxlY3QoZWxlbWVudFswXSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYnJ1c2hlcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5ld0JydXNoID0gZnVuY3Rpb24gKHN2Zyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgYnJ1c2ggPSBkMy5zdmcuYnJ1c2goKVxyXG4gICAgICAgICAgICAgICAgICAgIC54KHgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiYnJ1c2hcIiwgYnJ1c2hlZClcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJicnVzaGVuZFwiLCBicnVzaGVuZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYnJ1c2hlcy5wdXNoKGJydXNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZ0JydXNoID0gc3ZnLmluc2VydChcImdcIiwgJy5icnVzaCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImJydXNoXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGJydXNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBnQnJ1c2guc2VsZWN0QWxsKFwicmVjdFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJydXNoZWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4dGVudDAgPSBicnVzaC5leHRlbnQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgZHJhZ2dpbmcsIHByZXNlcnZlIHRoZSB3aWR0aCBvZiB0aGUgZXh0ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50Lm1vZGUgPT09IFwibW92ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkMCA9IGQzLnRpbWUuZGF5LnJvdW5kKGV4dGVudDBbMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDEgPSBkMy50aW1lLmRheS5vZmZzZXQoZDAsIE1hdGgucm91bmQoKGV4dGVudDBbMV0gLSBleHRlbnQwWzBdKSAvIDg2NGU1KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDEgPSBbZDAsIGQxXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgcmVzaXppbmcsIHJvdW5kIGJvdGggZGF0ZXNcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MSA9IGV4dGVudDAubWFwKGQzLnRpbWUuZGF5LnJvdW5kKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGVtcHR5IHdoZW4gcm91bmRlZCwgdXNlIGZsb29yICYgY2VpbCBpbnN0ZWFkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbnQxWzBdID49IGV4dGVudDFbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMF0gPSBkMy50aW1lLmRheS5mbG9vcihleHRlbnQwWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMV0gPSBkMy50aW1lLmRheS5jZWlsKGV4dGVudDBbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2FsbChicnVzaC5leHRlbnQoZXh0ZW50MSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBicnVzaGVuZCgpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBnQnJ1c2guc2VsZWN0KCcuYmFja2dyb3VuZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuZXdCcnVzaChzdmcpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBicnVzaDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDIwLCBsZWZ0OiAxMH0sXHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHBhcnNlSW50KGF0dHJzLndpZHRoKSAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gcGFyc2VJbnQoYXR0cnMuaGVpZ2h0KSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxuICAgICAgICAgICAgdmFyIHggPSBkMy50aW1lLnNjYWxlKClcclxuICAgICAgICAgICAgICAgIC5kb21haW4oW25ldyBEYXRlKDIwMTMsIDIsIDEpLCBuZXcgRGF0ZSgyMDEzLCAyLCAxNSkgLSAxXSlcclxuICAgICAgICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdmcgPSBzY29wZS5lbC5hcHBlbmQoXCJzdmdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcclxuICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0JydXNoKHN2Zyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJyZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZ3JpZC1iYWNrZ3JvdW5kXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBncmlkXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXHJcbiAgICAgICAgICAgICAgICAuY2FsbChkMy5zdmcuYXhpcygpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrcyhkMy50aW1lLmhvdXJzLCAxMilcclxuICAgICAgICAgICAgICAgICAgICAudGlja1NpemUoLWhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdChcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoXCIudGlja1wiKVxyXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJtaW5vclwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH0pO1xyXG5cclxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXNcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsXCIgKyBoZWlnaHQgKyBcIilcIilcclxuICAgICAgICAgICAgICAgIC5jYWxsKGQzLnN2Zy5heGlzKClcclxuICAgICAgICAgICAgICAgICAgICAuc2NhbGUoeClcclxuICAgICAgICAgICAgICAgICAgICAub3JpZW50KFwiYm90dG9tXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tzKGQzLnRpbWUuZGF5cylcclxuICAgICAgICAgICAgICAgICAgICAudGlja1BhZGRpbmcoMCkpXHJcbiAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKFwidGV4dFwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDYpXHJcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBicnVzaGVzID0gc3ZnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnYnJ1c2hlcycpO1xyXG5cclxuICAgICAgICAgICAgbmV3QnJ1c2goYnJ1c2hlcyk7XHJcblxyXG5cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4iXX0=
