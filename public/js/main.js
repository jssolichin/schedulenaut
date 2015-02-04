(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var schedulenaut = angular.module('schedulenaut', [
    require('./scheduler').name
]);

schedulenaut.controller('main', function ($scope) {
    $scope.who = 'world';
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;

    var startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);


    $scope.dates = [startDate];

    for(var i = 1; i <= 7; i++){
        var lastDate = $scope.dates[i-1].getTime();
        var nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate()+1);

        $scope.dates.push(nextDate);
    }

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
            height: '@',
            width: '@',
            scrub: '='
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
                        var d0 = d3.time.hour.round(extent0[0]),
                            d1 = d3.time.hour.offset(d0, Math.round((extent0[1] - extent0[0]) / 864e5));
                        extent1 = [d0, d1];
                    }

                    // otherwise, if resizing, round both dates
                    else {
                        extent1 = extent0.map(d3.time.day.round);

                        // if empty when rounded, use floor & ceil instead
                        if (extent1[0] >= extent1[1]) {
                            extent1[0] = d3.time.hour.floor(extent0[0]);
                            extent1[1] = d3.time.hour.ceil(extent0[1]);
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
                width = parseInt(scope.width) - margin.left - margin.right,
                height = parseInt(scope.height) - margin.top - margin.bottom;

            var endDate = new Date(scope.scrub.getTime());
            endDate.setHours(endDate.getHours()+23);

            var x = d3.time.scale()
                .domain([scope.scrub, endDate])
                .range([0, width]);

            var header = scope.el.append('h2')
                .html(scope.scrub);

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
                    .ticks(d3.time.minute, 30)
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
                    .ticks(d3.time.hours)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic291cmNlXFxqc1xcbWFpbi5qcyIsInNvdXJjZVxcanNcXHNjaGVkdWxlclxcaW5kZXguanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXHNjcnViLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzY2hlZHVsZW5hdXQgPSBhbmd1bGFyLm1vZHVsZSgnc2NoZWR1bGVuYXV0JywgW1xyXG4gICAgcmVxdWlyZSgnLi9zY2hlZHVsZXInKS5uYW1lXHJcbl0pO1xyXG5cclxuc2NoZWR1bGVuYXV0LmNvbnRyb2xsZXIoJ21haW4nLCBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAkc2NvcGUud2hvID0gJ3dvcmxkJztcclxuICAgICRzY29wZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgJHNjb3BlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICB2YXIgc3RhcnREYXRlID0gbmV3IERhdGUoKTtcclxuICAgIHN0YXJ0RGF0ZS5zZXRIb3VycygwKTtcclxuICAgIHN0YXJ0RGF0ZS5zZXRNaW51dGVzKDApO1xyXG4gICAgc3RhcnREYXRlLnNldFNlY29uZHMoMCk7XHJcblxyXG5cclxuICAgICRzY29wZS5kYXRlcyA9IFtzdGFydERhdGVdO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDE7IGkgPD0gNzsgaSsrKXtcclxuICAgICAgICB2YXIgbGFzdERhdGUgPSAkc2NvcGUuZGF0ZXNbaS0xXS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdmFyIG5leHREYXRlID0gbmV3IERhdGUobGFzdERhdGUpO1xyXG4gICAgICAgIG5leHREYXRlLnNldERhdGUobmV4dERhdGUuZ2V0RGF0ZSgpKzEpO1xyXG5cclxuICAgICAgICAkc2NvcGUuZGF0ZXMucHVzaChuZXh0RGF0ZSk7XHJcbiAgICB9XHJcblxyXG59KTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMS8yNS8yMDE1LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ3NjaGVkdWxlbmF1dC5zY2hlZHVsZXInLCBbXSlcclxuICAgIC5kaXJlY3RpdmUoJ3NjcnViJywgcmVxdWlyZSgnLi9zY3J1YicpKTtcclxuICAgIC8vLmNvbnRyb2xsZXIoJ0NoYXJ0TWdyQ3RybCcsIHJlcXVpcmUoJy4vQ2hhcnRNZ3JDdHJsJykpO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBKb25hdGhhbiBvbiAxLzI1LzIwMTUuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAnQCcsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnQCcsXHJcbiAgICAgICAgICAgIHNjcnViOiAnPSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgc2NvcGUuZWwgPSBkMy5zZWxlY3QoZWxlbWVudFswXSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYnJ1c2hlcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5ld0JydXNoID0gZnVuY3Rpb24gKHN2Zyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgYnJ1c2ggPSBkMy5zdmcuYnJ1c2goKVxyXG4gICAgICAgICAgICAgICAgICAgIC54KHgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiYnJ1c2hcIiwgYnJ1c2hlZClcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJicnVzaGVuZFwiLCBicnVzaGVuZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYnJ1c2hlcy5wdXNoKGJydXNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZ0JydXNoID0gc3ZnLmluc2VydChcImdcIiwgJy5icnVzaCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImJydXNoXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGJydXNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBnQnJ1c2guc2VsZWN0QWxsKFwicmVjdFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJydXNoZWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4dGVudDAgPSBicnVzaC5leHRlbnQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgZHJhZ2dpbmcsIHByZXNlcnZlIHRoZSB3aWR0aCBvZiB0aGUgZXh0ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50Lm1vZGUgPT09IFwibW92ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkMCA9IGQzLnRpbWUuaG91ci5yb3VuZChleHRlbnQwWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQxID0gZDMudGltZS5ob3VyLm9mZnNldChkMCwgTWF0aC5yb3VuZCgoZXh0ZW50MFsxXSAtIGV4dGVudDBbMF0pIC8gODY0ZTUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MSA9IFtkMCwgZDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiByZXNpemluZywgcm91bmQgYm90aCBkYXRlc1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxID0gZXh0ZW50MC5tYXAoZDMudGltZS5kYXkucm91bmQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgZW1wdHkgd2hlbiByb3VuZGVkLCB1c2UgZmxvb3IgJiBjZWlsIGluc3RlYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVudDFbMF0gPj0gZXh0ZW50MVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MVswXSA9IGQzLnRpbWUuaG91ci5mbG9vcihleHRlbnQwWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMV0gPSBkMy50aW1lLmhvdXIuY2VpbChleHRlbnQwWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNhbGwoYnJ1c2guZXh0ZW50KGV4dGVudDEpKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnJ1c2hlbmQoKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ0JydXNoLnNlbGVjdCgnLmJhY2tncm91bmQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3QnJ1c2goc3ZnKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnJ1c2g7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogMTB9LFxyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBwYXJzZUludChzY29wZS53aWR0aCkgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodCxcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KHNjb3BlLmhlaWdodCkgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcbiAgICAgICAgICAgIHZhciBlbmREYXRlID0gbmV3IERhdGUoc2NvcGUuc2NydWIuZ2V0VGltZSgpKTtcclxuICAgICAgICAgICAgZW5kRGF0ZS5zZXRIb3VycyhlbmREYXRlLmdldEhvdXJzKCkrMjMpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHggPSBkMy50aW1lLnNjYWxlKClcclxuICAgICAgICAgICAgICAgIC5kb21haW4oW3Njb3BlLnNjcnViLCBlbmREYXRlXSlcclxuICAgICAgICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoZWFkZXIgPSBzY29wZS5lbC5hcHBlbmQoJ2gyJylcclxuICAgICAgICAgICAgICAgIC5odG1sKHNjb3BlLnNjcnViKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdmcgPSBzY29wZS5lbC5hcHBlbmQoXCJzdmdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcclxuICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0JydXNoKHN2Zyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJyZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZ3JpZC1iYWNrZ3JvdW5kXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBncmlkXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXHJcbiAgICAgICAgICAgICAgICAuY2FsbChkMy5zdmcuYXhpcygpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrcyhkMy50aW1lLm1pbnV0ZSwgMzApXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tTaXplKC1oZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoXCJcIikpXHJcbiAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKFwiLnRpY2tcIilcclxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwibWlub3JcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRIb3VycygpOyB9KTtcclxuXHJcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXHJcbiAgICAgICAgICAgICAgICAuY2FsbChkMy5zdmcuYXhpcygpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrcyhkMy50aW1lLmhvdXJzKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrUGFkZGluZygwKSlcclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJ0ZXh0XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgNilcclxuICAgICAgICAgICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJydXNoZXMgPSBzdmcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdicnVzaGVzJyk7XHJcblxyXG4gICAgICAgICAgICBuZXdCcnVzaChicnVzaGVzKTtcclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcbiJdfQ==
