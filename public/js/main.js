(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by Jonathan on 2/3/2015.
 */
'use strict';

module.exports = function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/index");
    //
    // Now set up the states
    $stateProvider
        .state('index', {
            url: "/index",
            templateUrl: "public/partials/index.html",
            controller: require('../index/controller')
        })
        .state('scheduler', {
            url: "/scheduler",
            templateUrl: "public/partials/scheduler.html",
            controller: require('../scheduler/controller')
        })
        .state('about', {
            url: "/about",
            templateUrl: "public/partials/about.html"
        });
};

},{"../index/controller":2,"../scheduler/controller":4}],2:[function(require,module,exports){
/**
 *
 * Created by Jonathan on 2/8/2015.
 */
'use strict';

module.exports = function ($scope){
    $scope.dates = [];
    $scope.logInfos = function (event, date){
        event.preventDefault(); // prevent the select to happen

        if(!date.selected)
            $scope.dates.push(date.toDate());
        else {
            var index= $scope.dates.indexOf(date.toDate());
            $scope.dates.splice(index, 1)
        }

        //reproduce the standard behavior
        date.selected = !date.selected;
    }

    //scheduler
    $scope.width = window.innerWidth-30;
    $scope.height = window.innerHeight;

};

},{}],3:[function(require,module,exports){
'use strict';

var schedulenaut = angular.module('schedulenaut', [
    'multipleDatePicker',
    'ui.router',
    require('./scheduler').name
]).config(require('./common/routes'));

},{"./common/routes":1,"./scheduler":6}],4:[function(require,module,exports){
/**
 * Created by Jonathan on 2/8/2015.
 */
'use strict';
module.exports = function ($scope){
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
    $scope.optionGranularity = [
        {
            name: '15 minutes',
            value: 15
        },
        {
            name: 'half-hour',
            value: 30
        },
        {
            name: 'hour',
            value: 60
        }
    ];

    $scope.selectedGranularity = 60;

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
};

},{}],5:[function(require,module,exports){
/**
 * Created by Jonathan on 2/9/2015.
 */

module.exports = function (){
    return {
        round: function (date, interval){
            //d3 does not have interval between minutes and hours.
            //this function is a shim to get arbitrary minutes interval (e.g. 15 minutes, 30 minutes (half-hour)).
            //given a date object, round to the nearest minute interval.

            var minutes = date.getMinutes();
            var hours = date.getHours();
            var m,h;

            m = (((minutes + (interval/2))/interval | 0) * interval) % 60;
            h = ((((minutes/(120-interval)) + .5) | 0) + hours) % 24;

            d0 = new Date(date);
            d0.setMinutes(m);
            d0.setHours(h);
            d0.setSeconds(0);

            return d0;
        }
    }
};

},{}],6:[function(require,module,exports){
/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.scheduler', [ ])
    .factory('helpers', require('./helpers'))
    .directive('scrub', require('./scrub'));
    //.controller('ChartMgrCtrl', require('./ChartMgrCtrl'));

},{"./helpers":5,"./scrub":7}],7:[function(require,module,exports){
/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = function (helpers) {
    return {
        restrict: 'A',
        scope: {
            height: '@',
            width: '@',
            granularity: '=',
            scrub: '='
        },
        link: function (scope, element, attrs) {
            scope.el = d3.select(element[0]);

            var brushes = [];

            var newBrush = function (container){
                var brushed = function() {
                    var extent0 = brush.extent(),
                        extent1;

                    // if dragging, preserve the width of the extent
                    if (d3.event.mode === "move") {
                        var d0, d1;

                        if(scope.granularity == 60){
                            d0 = d3.time.hour.round(extent0[0]);
                            d1 = d3.time.hour.offset(d0, Math.round((extent0[1] - extent0[0]) / 3600000) );
                        }
                        else {
                            d0 = helpers.round(extent0[0], scope.granularity);
                            d1 = d3.time.minute.offset(d0, Math.round((extent0[1] - extent0[0]) / 60000) );
                        }

                        extent1 = [d0, d1];

                    }

                    // otherwise, if resizing, round both dates
                    else {

                        // if hour we can use built in d3 function to round use floor & ceil instead
                        if(scope.granularity == 60){
                            extent1 = extent0.map(d3.time.hour.round);
                            if (extent1[0] >= extent1[1]) {
                                extent1[0] = d3.time.hour.floor(extent0[0]);
                                extent1[1] = d3.time.hour.ceil(extent0[1]);
                            }
                        }

                        // else we just add minutes manually
                        else {
                            extent1 = extent0.slice(0);
                            extent1[1].setMinutes(extent1[1].getMinutes()+scope.granularity);

                            extent1[0] = helpers.round(extent0[0], scope.granularity);
                            extent1[1] = helpers.round(extent0[1], scope.granularity);
                        }

                    }

                    //make sure that event blocks (brush) do not overlap
                    //brush.extent.start is a property created that holds the original extent of the bar when brush start
                    if(brush.extent.start) {
                        //time where we can not go pass as to not overlap
                        var edge = [];

                        //go through each event blocks and look for the 2 closest one on both side to the current one and store that to edge
                        for (var i = 0; i < brushes.length; i++) {
                            var otherBrush = brushes[i];

                            if (otherBrush != brush) {
                                if (otherBrush.extent()[1].getTime() <= brush.extent.start[0].getTime()) {
                                    if (edge[0] != undefined && otherBrush.extent()[1].getTime() > edge[0].getTime() || edge[0] == undefined)
                                        edge[0] = otherBrush.extent()[1]
                                }
                                else if (otherBrush.extent()[0].getTime() > brush.extent.start[0].getTime()) {
                                    if (edge[1] != undefined && otherBrush.extent()[0].getTime() < edge[1].getTime() || edge[1] == undefined)
                                        edge[1] = otherBrush.extent()[0]
                                };
                            }
                        };

                        //if the current block gets brushed beyond the surrounding block, limit it so it does not go past
                        if (edge[1] != undefined && extent1[1].getTime() > edge[1].getTime()) {
                            extent1[1] = edge[1];
                            //if we are moving, not only do we stop it from going past, but also keep the brush the same size
                            if (d3.event.mode === "move")
                                extent1[0] = d3.time.hour.offset(extent1[1], -Math.round((brush.extent.start[1] - brush.extent.start[0]) / 3600000));
                        } else if (edge[0] != undefined && extent1[0].getTime() < edge[0].getTime()) {
                            extent1[0] = edge[0];
                            if (d3.event.mode === "move")
                                extent1[1] = d3.time.hour.offset(extent1[0], Math.round((brush.extent.start[1] - brush.extent.start[0]) / 3600000));
                        };
                    }

                    d3.select(this).call(brush.extent(extent1));
                };

                var brushend = function(){


                    gBrush.select('.background')
                        .style('pointer-events', 'none');

                    //When we finish brushing, the extent will be the starting extent for next time
                    //This is useful for determining what is surrounding the current block later
                    brush.extent.start = brush.extent();

                    //Figure out whether we need to add a new brush or not.
                    //If last brush has been modified, then it's been used and we need to add a new brush.
                    //Else it's still empty, and we don't need to do anything.
                    var lastBrushExtent = brushes[brushes.length-1].extent();
                    if(lastBrushExtent[0].getTime() != lastBrushExtent[1].getTime())
                        newBrush(container);
                };

                var brush = d3.svg.brush()
                    .x(x)
                    .on("brush", brushed)
                    .on("brushend", brushend);

                brushes.push(brush);

                var gBrush = container.insert("g", '.brush')
                    .attr("class", "brush")
                    .on("click", function() { d3.event.stopPropagation(); })
                    .call(brush);

                gBrush.selectAll("rect")
                    .attr("height", height);


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

            var header = scope.el.append('h3')
                .html(function (){return moment(scope.scrub).format('MMMM Do')});

            var svg = scope.el.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

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
                    .tickPadding(0))
                .selectAll("text")
                .attr("x", 6)
                .style("text-anchor", null);

            var brushesContainer = svg.append('g')
                .attr('class', 'brushes');

            newBrush(brushesContainer);


        }
    };
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic291cmNlXFxqc1xcY29tbW9uXFxyb3V0ZXMuanMiLCJzb3VyY2VcXGpzXFxpbmRleFxcY29udHJvbGxlci5qcyIsInNvdXJjZVxcanNcXG1haW4uanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGNvbnRyb2xsZXIuanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGhlbHBlcnMuanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGluZGV4LmpzIiwic291cmNlXFxqc1xcc2NoZWR1bGVyXFxzY3J1Yi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IEpvbmF0aGFuIG9uIDIvMy8yMDE1LlxyXG4gKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvc3RhdGUxXHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2luZGV4XCIpO1xyXG4gICAgLy9cclxuICAgIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xyXG4gICAgICAgICAgICB1cmw6IFwiL2luZGV4XCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInB1YmxpYy9wYXJ0aWFscy9pbmRleC5odG1sXCIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IHJlcXVpcmUoJy4uL2luZGV4L2NvbnRyb2xsZXInKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdzY2hlZHVsZXInLCB7XHJcbiAgICAgICAgICAgIHVybDogXCIvc2NoZWR1bGVyXCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInB1YmxpYy9wYXJ0aWFscy9zY2hlZHVsZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiByZXF1aXJlKCcuLi9zY2hlZHVsZXIvY29udHJvbGxlcicpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2Fib3V0Jywge1xyXG4gICAgICAgICAgICB1cmw6IFwiL2Fib3V0XCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInB1YmxpYy9wYXJ0aWFscy9hYm91dC5odG1sXCJcclxuICAgICAgICB9KTtcclxufTtcclxuIiwiLyoqXHJcbiAqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMi84LzIwMTUuXHJcbiAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkc2NvcGUpe1xyXG4gICAgJHNjb3BlLmRhdGVzID0gW107XHJcbiAgICAkc2NvcGUubG9nSW5mb3MgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGUpe1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGhlIHNlbGVjdCB0byBoYXBwZW5cclxuXHJcbiAgICAgICAgaWYoIWRhdGUuc2VsZWN0ZWQpXHJcbiAgICAgICAgICAgICRzY29wZS5kYXRlcy5wdXNoKGRhdGUudG9EYXRlKCkpO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXg9ICRzY29wZS5kYXRlcy5pbmRleE9mKGRhdGUudG9EYXRlKCkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0ZXMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9yZXByb2R1Y2UgdGhlIHN0YW5kYXJkIGJlaGF2aW9yXHJcbiAgICAgICAgZGF0ZS5zZWxlY3RlZCA9ICFkYXRlLnNlbGVjdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vc2NoZWR1bGVyXHJcbiAgICAkc2NvcGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aC0zMDtcclxuICAgICRzY29wZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc2NoZWR1bGVuYXV0ID0gYW5ndWxhci5tb2R1bGUoJ3NjaGVkdWxlbmF1dCcsIFtcclxuICAgICdtdWx0aXBsZURhdGVQaWNrZXInLFxyXG4gICAgJ3VpLnJvdXRlcicsXHJcbiAgICByZXF1aXJlKCcuL3NjaGVkdWxlcicpLm5hbWVcclxuXSkuY29uZmlnKHJlcXVpcmUoJy4vY29tbW9uL3JvdXRlcycpKTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMi84LzIwMTUuXHJcbiAqL1xyXG4ndXNlIHN0cmljdCc7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSl7XHJcbiAgICAkc2NvcGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICRzY29wZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAkc2NvcGUub3B0aW9uR3JhbnVsYXJpdHkgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnMTUgbWludXRlcycsXHJcbiAgICAgICAgICAgIHZhbHVlOiAxNVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnaGFsZi1ob3VyJyxcclxuICAgICAgICAgICAgdmFsdWU6IDMwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdob3VyJyxcclxuICAgICAgICAgICAgdmFsdWU6IDYwXHJcbiAgICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICAkc2NvcGUuc2VsZWN0ZWRHcmFudWxhcml0eSA9IDYwO1xyXG5cclxuICAgIHZhciBzdGFydERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgc3RhcnREYXRlLnNldEhvdXJzKDApO1xyXG4gICAgc3RhcnREYXRlLnNldE1pbnV0ZXMoMCk7XHJcbiAgICBzdGFydERhdGUuc2V0U2Vjb25kcygwKTtcclxuXHJcbiAgICAkc2NvcGUuZGF0ZXMgPSBbc3RhcnREYXRlXTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAxOyBpIDw9IDc7IGkrKyl7XHJcbiAgICAgICAgdmFyIGxhc3REYXRlID0gJHNjb3BlLmRhdGVzW2ktMV0uZ2V0VGltZSgpO1xyXG4gICAgICAgIHZhciBuZXh0RGF0ZSA9IG5ldyBEYXRlKGxhc3REYXRlKTtcclxuICAgICAgICBuZXh0RGF0ZS5zZXREYXRlKG5leHREYXRlLmdldERhdGUoKSsxKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmRhdGVzLnB1c2gobmV4dERhdGUpO1xyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBKb25hdGhhbiBvbiAyLzkvMjAxNS5cclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByb3VuZDogZnVuY3Rpb24gKGRhdGUsIGludGVydmFsKXtcclxuICAgICAgICAgICAgLy9kMyBkb2VzIG5vdCBoYXZlIGludGVydmFsIGJldHdlZW4gbWludXRlcyBhbmQgaG91cnMuXHJcbiAgICAgICAgICAgIC8vdGhpcyBmdW5jdGlvbiBpcyBhIHNoaW0gdG8gZ2V0IGFyYml0cmFyeSBtaW51dGVzIGludGVydmFsIChlLmcuIDE1IG1pbnV0ZXMsIDMwIG1pbnV0ZXMgKGhhbGYtaG91cikpLlxyXG4gICAgICAgICAgICAvL2dpdmVuIGEgZGF0ZSBvYmplY3QsIHJvdW5kIHRvIHRoZSBuZWFyZXN0IG1pbnV0ZSBpbnRlcnZhbC5cclxuXHJcbiAgICAgICAgICAgIHZhciBtaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIHZhciBob3VycyA9IGRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICAgICAgdmFyIG0saDtcclxuXHJcbiAgICAgICAgICAgIG0gPSAoKChtaW51dGVzICsgKGludGVydmFsLzIpKS9pbnRlcnZhbCB8IDApICogaW50ZXJ2YWwpICUgNjA7XHJcbiAgICAgICAgICAgIGggPSAoKCgobWludXRlcy8oMTIwLWludGVydmFsKSkgKyAuNSkgfCAwKSArIGhvdXJzKSAlIDI0O1xyXG5cclxuICAgICAgICAgICAgZDAgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgICAgICAgICAgZDAuc2V0TWludXRlcyhtKTtcclxuICAgICAgICAgICAgZDAuc2V0SG91cnMoaCk7XHJcbiAgICAgICAgICAgIGQwLnNldFNlY29uZHMoMCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBKb25hdGhhbiBvbiAxLzI1LzIwMTUuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnc2NoZWR1bGVuYXV0LnNjaGVkdWxlcicsIFsgXSlcclxuICAgIC5mYWN0b3J5KCdoZWxwZXJzJywgcmVxdWlyZSgnLi9oZWxwZXJzJykpXHJcbiAgICAuZGlyZWN0aXZlKCdzY3J1YicsIHJlcXVpcmUoJy4vc2NydWInKSk7XHJcbiAgICAvLy5jb250cm9sbGVyKCdDaGFydE1nckN0cmwnLCByZXF1aXJlKCcuL0NoYXJ0TWdyQ3RybCcpKTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMS8yNS8yMDE1LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhlbHBlcnMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICdAJyxcclxuICAgICAgICAgICAgd2lkdGg6ICdAJyxcclxuICAgICAgICAgICAgZ3JhbnVsYXJpdHk6ICc9JyxcclxuICAgICAgICAgICAgc2NydWI6ICc9J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgICAgICBzY29wZS5lbCA9IGQzLnNlbGVjdChlbGVtZW50WzBdKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBicnVzaGVzID0gW107XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV3QnJ1c2ggPSBmdW5jdGlvbiAoY29udGFpbmVyKXtcclxuICAgICAgICAgICAgICAgIHZhciBicnVzaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4dGVudDAgPSBicnVzaC5leHRlbnQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgZHJhZ2dpbmcsIHByZXNlcnZlIHRoZSB3aWR0aCBvZiB0aGUgZXh0ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50Lm1vZGUgPT09IFwibW92ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkMCwgZDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzY29wZS5ncmFudWxhcml0eSA9PSA2MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMCA9IGQzLnRpbWUuaG91ci5yb3VuZChleHRlbnQwWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQxID0gZDMudGltZS5ob3VyLm9mZnNldChkMCwgTWF0aC5yb3VuZCgoZXh0ZW50MFsxXSAtIGV4dGVudDBbMF0pIC8gMzYwMDAwMCkgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQwID0gaGVscGVycy5yb3VuZChleHRlbnQwWzBdLCBzY29wZS5ncmFudWxhcml0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMSA9IGQzLnRpbWUubWludXRlLm9mZnNldChkMCwgTWF0aC5yb3VuZCgoZXh0ZW50MFsxXSAtIGV4dGVudDBbMF0pIC8gNjAwMDApICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDEgPSBbZDAsIGQxXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIHJlc2l6aW5nLCByb3VuZCBib3RoIGRhdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBob3VyIHdlIGNhbiB1c2UgYnVpbHQgaW4gZDMgZnVuY3Rpb24gdG8gcm91bmQgdXNlIGZsb29yICYgY2VpbCBpbnN0ZWFkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNjb3BlLmdyYW51bGFyaXR5ID09IDYwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDEgPSBleHRlbnQwLm1hcChkMy50aW1lLmhvdXIucm91bmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVudDFbMF0gPj0gZXh0ZW50MVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMF0gPSBkMy50aW1lLmhvdXIuZmxvb3IoZXh0ZW50MFswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MVsxXSA9IGQzLnRpbWUuaG91ci5jZWlsKGV4dGVudDBbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIHdlIGp1c3QgYWRkIG1pbnV0ZXMgbWFudWFsbHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxID0gZXh0ZW50MC5zbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMV0uc2V0TWludXRlcyhleHRlbnQxWzFdLmdldE1pbnV0ZXMoKStzY29wZS5ncmFudWxhcml0eSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MVswXSA9IGhlbHBlcnMucm91bmQoZXh0ZW50MFswXSwgc2NvcGUuZ3JhbnVsYXJpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MVsxXSA9IGhlbHBlcnMucm91bmQoZXh0ZW50MFsxXSwgc2NvcGUuZ3JhbnVsYXJpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9tYWtlIHN1cmUgdGhhdCBldmVudCBibG9ja3MgKGJydXNoKSBkbyBub3Qgb3ZlcmxhcFxyXG4gICAgICAgICAgICAgICAgICAgIC8vYnJ1c2guZXh0ZW50LnN0YXJ0IGlzIGEgcHJvcGVydHkgY3JlYXRlZCB0aGF0IGhvbGRzIHRoZSBvcmlnaW5hbCBleHRlbnQgb2YgdGhlIGJhciB3aGVuIGJydXNoIHN0YXJ0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoYnJ1c2guZXh0ZW50LnN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGltZSB3aGVyZSB3ZSBjYW4gbm90IGdvIHBhc3MgYXMgdG8gbm90IG92ZXJsYXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ28gdGhyb3VnaCBlYWNoIGV2ZW50IGJsb2NrcyBhbmQgbG9vayBmb3IgdGhlIDIgY2xvc2VzdCBvbmUgb24gYm90aCBzaWRlIHRvIHRoZSBjdXJyZW50IG9uZSBhbmQgc3RvcmUgdGhhdCB0byBlZGdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnJ1c2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG90aGVyQnJ1c2ggPSBicnVzaGVzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvdGhlckJydXNoICE9IGJydXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVyQnJ1c2guZXh0ZW50KClbMV0uZ2V0VGltZSgpIDw9IGJydXNoLmV4dGVudC5zdGFydFswXS5nZXRUaW1lKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVkZ2VbMF0gIT0gdW5kZWZpbmVkICYmIG90aGVyQnJ1c2guZXh0ZW50KClbMV0uZ2V0VGltZSgpID4gZWRnZVswXS5nZXRUaW1lKCkgfHwgZWRnZVswXSA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGdlWzBdID0gb3RoZXJCcnVzaC5leHRlbnQoKVsxXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvdGhlckJydXNoLmV4dGVudCgpWzBdLmdldFRpbWUoKSA+IGJydXNoLmV4dGVudC5zdGFydFswXS5nZXRUaW1lKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVkZ2VbMV0gIT0gdW5kZWZpbmVkICYmIG90aGVyQnJ1c2guZXh0ZW50KClbMF0uZ2V0VGltZSgpIDwgZWRnZVsxXS5nZXRUaW1lKCkgfHwgZWRnZVsxXSA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGdlWzFdID0gb3RoZXJCcnVzaC5leHRlbnQoKVswXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBjdXJyZW50IGJsb2NrIGdldHMgYnJ1c2hlZCBiZXlvbmQgdGhlIHN1cnJvdW5kaW5nIGJsb2NrLCBsaW1pdCBpdCBzbyBpdCBkb2VzIG5vdCBnbyBwYXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlZGdlWzFdICE9IHVuZGVmaW5lZCAmJiBleHRlbnQxWzFdLmdldFRpbWUoKSA+IGVkZ2VbMV0uZ2V0VGltZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxWzFdID0gZWRnZVsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgd2UgYXJlIG1vdmluZywgbm90IG9ubHkgZG8gd2Ugc3RvcCBpdCBmcm9tIGdvaW5nIHBhc3QsIGJ1dCBhbHNvIGtlZXAgdGhlIGJydXNoIHRoZSBzYW1lIHNpemVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkMy5ldmVudC5tb2RlID09PSBcIm1vdmVcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxWzBdID0gZDMudGltZS5ob3VyLm9mZnNldChleHRlbnQxWzFdLCAtTWF0aC5yb3VuZCgoYnJ1c2guZXh0ZW50LnN0YXJ0WzFdIC0gYnJ1c2guZXh0ZW50LnN0YXJ0WzBdKSAvIDM2MDAwMDApKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlZGdlWzBdICE9IHVuZGVmaW5lZCAmJiBleHRlbnQxWzBdLmdldFRpbWUoKSA8IGVkZ2VbMF0uZ2V0VGltZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxWzBdID0gZWRnZVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkMy5ldmVudC5tb2RlID09PSBcIm1vdmVcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxWzFdID0gZDMudGltZS5ob3VyLm9mZnNldChleHRlbnQxWzBdLCBNYXRoLnJvdW5kKChicnVzaC5leHRlbnQuc3RhcnRbMV0gLSBicnVzaC5leHRlbnQuc3RhcnRbMF0pIC8gMzYwMDAwMCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNhbGwoYnJ1c2guZXh0ZW50KGV4dGVudDEpKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGJydXNoZW5kID0gZnVuY3Rpb24oKXtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdCcnVzaC5zZWxlY3QoJy5iYWNrZ3JvdW5kJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vV2hlbiB3ZSBmaW5pc2ggYnJ1c2hpbmcsIHRoZSBleHRlbnQgd2lsbCBiZSB0aGUgc3RhcnRpbmcgZXh0ZW50IGZvciBuZXh0IHRpbWVcclxuICAgICAgICAgICAgICAgICAgICAvL1RoaXMgaXMgdXNlZnVsIGZvciBkZXRlcm1pbmluZyB3aGF0IGlzIHN1cnJvdW5kaW5nIHRoZSBjdXJyZW50IGJsb2NrIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgYnJ1c2guZXh0ZW50LnN0YXJ0ID0gYnJ1c2guZXh0ZW50KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vRmlndXJlIG91dCB3aGV0aGVyIHdlIG5lZWQgdG8gYWRkIGEgbmV3IGJydXNoIG9yIG5vdC5cclxuICAgICAgICAgICAgICAgICAgICAvL0lmIGxhc3QgYnJ1c2ggaGFzIGJlZW4gbW9kaWZpZWQsIHRoZW4gaXQncyBiZWVuIHVzZWQgYW5kIHdlIG5lZWQgdG8gYWRkIGEgbmV3IGJydXNoLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vRWxzZSBpdCdzIHN0aWxsIGVtcHR5LCBhbmQgd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZy5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdEJydXNoRXh0ZW50ID0gYnJ1c2hlc1ticnVzaGVzLmxlbmd0aC0xXS5leHRlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihsYXN0QnJ1c2hFeHRlbnRbMF0uZ2V0VGltZSgpICE9IGxhc3RCcnVzaEV4dGVudFsxXS5nZXRUaW1lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0JydXNoKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpXHJcbiAgICAgICAgICAgICAgICAgICAgLngoeClcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJicnVzaFwiLCBicnVzaGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImJydXNoZW5kXCIsIGJydXNoZW5kKTtcclxuXHJcbiAgICAgICAgICAgICAgICBicnVzaGVzLnB1c2goYnJ1c2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBnQnJ1c2ggPSBjb250YWluZXIuaW5zZXJ0KFwiZ1wiLCAnLmJydXNoJylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiYnJ1c2hcIilcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoYnJ1c2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIGdCcnVzaC5zZWxlY3RBbGwoXCJyZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJydXNoO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDEwfSxcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gcGFyc2VJbnQoc2NvcGUud2lkdGgpIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBwYXJzZUludChzY29wZS5oZWlnaHQpIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblxyXG4gICAgICAgICAgICB2YXIgZW5kRGF0ZSA9IG5ldyBEYXRlKHNjb3BlLnNjcnViLmdldFRpbWUoKSk7XHJcbiAgICAgICAgICAgIGVuZERhdGUuc2V0SG91cnMoZW5kRGF0ZS5nZXRIb3VycygpKzIzKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB4ID0gZDMudGltZS5zY2FsZSgpXHJcbiAgICAgICAgICAgICAgICAuZG9tYWluKFtzY29wZS5zY3J1YiwgZW5kRGF0ZV0pXHJcbiAgICAgICAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoXSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gc2NvcGUuZWwuYXBwZW5kKCdoMycpXHJcbiAgICAgICAgICAgICAgICAuaHRtbChmdW5jdGlvbiAoKXtyZXR1cm4gbW9tZW50KHNjb3BlLnNjcnViKS5mb3JtYXQoJ01NTU0gRG8nKX0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHN2ZyA9IHNjb3BlLmVsLmFwcGVuZChcInN2Z1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKVxyXG5cclxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJncmlkLWJhY2tncm91bmRcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGdyaWRcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsXCIgKyBoZWlnaHQgKyBcIilcIilcclxuICAgICAgICAgICAgICAgIC5jYWxsKGQzLnN2Zy5heGlzKClcclxuICAgICAgICAgICAgICAgICAgICAuc2NhbGUoeClcclxuICAgICAgICAgICAgICAgICAgICAub3JpZW50KFwiYm90dG9tXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tzKGQzLnRpbWUubWludXRlLCAzMClcclxuICAgICAgICAgICAgICAgICAgICAudGlja1NpemUoLWhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdChcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoXCIudGlja1wiKVxyXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJtaW5vclwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH0pO1xyXG5cclxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXNcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsXCIgKyBoZWlnaHQgKyBcIilcIilcclxuICAgICAgICAgICAgICAgIC5jYWxsKGQzLnN2Zy5heGlzKClcclxuICAgICAgICAgICAgICAgICAgICAuc2NhbGUoeClcclxuICAgICAgICAgICAgICAgICAgICAub3JpZW50KFwiYm90dG9tXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tQYWRkaW5nKDApKVxyXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbChcInRleHRcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCA2KVxyXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYnJ1c2hlc0NvbnRhaW5lciA9IHN2Zy5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2JydXNoZXMnKTtcclxuXHJcbiAgICAgICAgICAgIG5ld0JydXNoKGJydXNoZXNDb250YWluZXIpO1xyXG5cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuIl19
