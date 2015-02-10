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

},{"./common/routes":1,"./scheduler":5}],4:[function(require,module,exports){
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
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.scheduler', [])
    .directive('scrub', require('./scrub'));
    //.controller('ChartMgrCtrl', require('./ChartMgrCtrl'));

},{"./scrub":6}],6:[function(require,module,exports){
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
                            d0 = d3.time.hour.round(extent0[0]),
                            d1 = d3.time.hour.offset(d0, Math.round((extent0[1] - extent0[0]) / 3600000) );
                        }
                        else {
                            var minutes = extent0[0].getMinutes();
                            var hours = extent0[0].getHours();
                            var m,h;

                            if(scope.granularity == 15){
                                m = (((minutes + 7.5)/15 | 0) * 15) % 60;
                                h = ((((minutes/105) + .5) | 0) + hours) % 24;
                            }
                            else if (scope.granularity == 30){
                                m = (((minutes + 15)/30 | 0) * 30) % 60;
                                h = ((((minutes/90) + .5) | 0) + hours) % 24;
                            }

                            d0 = new Date(extent0[0]);
                            d0.setMinutes(m);
                            d0.setHours(h);
                            d0.setSeconds(0);

                            d1 = d3.time.minute.offset(d0, Math.round((extent0[1] - extent0[0]) / 60000) );
                        }

                        extent1 = [d0, d1];
                    }

                    // otherwise, if resizing, round both dates
                    else {
                        extent1 = extent0.map(d3.time.hour.round);

                        // if empty when rounded, use floor & ceil instead
                        if (extent1[0] >= extent1[1]) {
                            extent1[0] = d3.time.hour.floor(extent0[0]);
                            extent1[1] = d3.time.hour.ceil(extent0[1]);
                        }
                    }

                    d3.select(this).call(brush.extent(extent1));
                };

                var brushend = function(){

                    gBrush.select('.background')
                        .style('pointer-events', 'none');

                    //figure out whether we need to add a new brush or not.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic291cmNlXFxqc1xcY29tbW9uXFxyb3V0ZXMuanMiLCJzb3VyY2VcXGpzXFxpbmRleFxcY29udHJvbGxlci5qcyIsInNvdXJjZVxcanNcXG1haW4uanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGNvbnRyb2xsZXIuanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGluZGV4LmpzIiwic291cmNlXFxqc1xcc2NoZWR1bGVyXFxzY3J1Yi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IEpvbmF0aGFuIG9uIDIvMy8yMDE1LlxyXG4gKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvc3RhdGUxXHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2luZGV4XCIpO1xyXG4gICAgLy9cclxuICAgIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xyXG4gICAgICAgICAgICB1cmw6IFwiL2luZGV4XCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInB1YmxpYy9wYXJ0aWFscy9pbmRleC5odG1sXCIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IHJlcXVpcmUoJy4uL2luZGV4L2NvbnRyb2xsZXInKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdzY2hlZHVsZXInLCB7XHJcbiAgICAgICAgICAgIHVybDogXCIvc2NoZWR1bGVyXCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInB1YmxpYy9wYXJ0aWFscy9zY2hlZHVsZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiByZXF1aXJlKCcuLi9zY2hlZHVsZXIvY29udHJvbGxlcicpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2Fib3V0Jywge1xyXG4gICAgICAgICAgICB1cmw6IFwiL2Fib3V0XCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInB1YmxpYy9wYXJ0aWFscy9hYm91dC5odG1sXCJcclxuICAgICAgICB9KTtcclxufTtcclxuIiwiLyoqXHJcbiAqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMi84LzIwMTUuXHJcbiAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkc2NvcGUpe1xyXG4gICAgJHNjb3BlLmRhdGVzID0gW107XHJcbiAgICAkc2NvcGUubG9nSW5mb3MgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGUpe1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGhlIHNlbGVjdCB0byBoYXBwZW5cclxuXHJcbiAgICAgICAgaWYoIWRhdGUuc2VsZWN0ZWQpXHJcbiAgICAgICAgICAgICRzY29wZS5kYXRlcy5wdXNoKGRhdGUudG9EYXRlKCkpO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXg9ICRzY29wZS5kYXRlcy5pbmRleE9mKGRhdGUudG9EYXRlKCkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0ZXMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9yZXByb2R1Y2UgdGhlIHN0YW5kYXJkIGJlaGF2aW9yXHJcbiAgICAgICAgZGF0ZS5zZWxlY3RlZCA9ICFkYXRlLnNlbGVjdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vc2NoZWR1bGVyXHJcbiAgICAkc2NvcGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aC0zMDtcclxuICAgICRzY29wZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc2NoZWR1bGVuYXV0ID0gYW5ndWxhci5tb2R1bGUoJ3NjaGVkdWxlbmF1dCcsIFtcclxuICAgICdtdWx0aXBsZURhdGVQaWNrZXInLFxyXG4gICAgJ3VpLnJvdXRlcicsXHJcbiAgICByZXF1aXJlKCcuL3NjaGVkdWxlcicpLm5hbWVcclxuXSkuY29uZmlnKHJlcXVpcmUoJy4vY29tbW9uL3JvdXRlcycpKTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMi84LzIwMTUuXHJcbiAqL1xyXG4ndXNlIHN0cmljdCc7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSl7XHJcbiAgICAkc2NvcGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICRzY29wZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAkc2NvcGUub3B0aW9uR3JhbnVsYXJpdHkgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnMTUgbWludXRlcycsXHJcbiAgICAgICAgICAgIHZhbHVlOiAxNVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnaGFsZi1ob3VyJyxcclxuICAgICAgICAgICAgdmFsdWU6IDMwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdob3VyJyxcclxuICAgICAgICAgICAgdmFsdWU6IDYwXHJcbiAgICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICAkc2NvcGUuc2VsZWN0ZWRHcmFudWxhcml0eSA9IDYwO1xyXG5cclxuICAgIHZhciBzdGFydERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgc3RhcnREYXRlLnNldEhvdXJzKDApO1xyXG4gICAgc3RhcnREYXRlLnNldE1pbnV0ZXMoMCk7XHJcbiAgICBzdGFydERhdGUuc2V0U2Vjb25kcygwKTtcclxuXHJcbiAgICAkc2NvcGUuZGF0ZXMgPSBbc3RhcnREYXRlXTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAxOyBpIDw9IDc7IGkrKyl7XHJcbiAgICAgICAgdmFyIGxhc3REYXRlID0gJHNjb3BlLmRhdGVzW2ktMV0uZ2V0VGltZSgpO1xyXG4gICAgICAgIHZhciBuZXh0RGF0ZSA9IG5ldyBEYXRlKGxhc3REYXRlKTtcclxuICAgICAgICBuZXh0RGF0ZS5zZXREYXRlKG5leHREYXRlLmdldERhdGUoKSsxKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmRhdGVzLnB1c2gobmV4dERhdGUpO1xyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBKb25hdGhhbiBvbiAxLzI1LzIwMTUuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnc2NoZWR1bGVuYXV0LnNjaGVkdWxlcicsIFtdKVxyXG4gICAgLmRpcmVjdGl2ZSgnc2NydWInLCByZXF1aXJlKCcuL3NjcnViJykpO1xyXG4gICAgLy8uY29udHJvbGxlcignQ2hhcnRNZ3JDdHJsJywgcmVxdWlyZSgnLi9DaGFydE1nckN0cmwnKSk7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IEpvbmF0aGFuIG9uIDEvMjUvMjAxNS5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICdAJyxcclxuICAgICAgICAgICAgd2lkdGg6ICdAJyxcclxuICAgICAgICAgICAgZ3JhbnVsYXJpdHk6ICc9JyxcclxuICAgICAgICAgICAgc2NydWI6ICc9J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgICAgICBzY29wZS5lbCA9IGQzLnNlbGVjdChlbGVtZW50WzBdKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBicnVzaGVzID0gW107XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV3QnJ1c2ggPSBmdW5jdGlvbiAoY29udGFpbmVyKXtcclxuICAgICAgICAgICAgICAgIHZhciBicnVzaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4dGVudDAgPSBicnVzaC5leHRlbnQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgZHJhZ2dpbmcsIHByZXNlcnZlIHRoZSB3aWR0aCBvZiB0aGUgZXh0ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50Lm1vZGUgPT09IFwibW92ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkMCwgZDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzY29wZS5ncmFudWxhcml0eSA9PSA2MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMCA9IGQzLnRpbWUuaG91ci5yb3VuZChleHRlbnQwWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQxID0gZDMudGltZS5ob3VyLm9mZnNldChkMCwgTWF0aC5yb3VuZCgoZXh0ZW50MFsxXSAtIGV4dGVudDBbMF0pIC8gMzYwMDAwMCkgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaW51dGVzID0gZXh0ZW50MFswXS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cnMgPSBleHRlbnQwWzBdLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbSxoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNjb3BlLmdyYW51bGFyaXR5ID09IDE1KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gKCgobWludXRlcyArIDcuNSkvMTUgfCAwKSAqIDE1KSAlIDYwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGggPSAoKCgobWludXRlcy8xMDUpICsgLjUpIHwgMCkgKyBob3VycykgJSAyNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjb3BlLmdyYW51bGFyaXR5ID09IDMwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gKCgobWludXRlcyArIDE1KS8zMCB8IDApICogMzApICUgNjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCA9ICgoKChtaW51dGVzLzkwKSArIC41KSB8IDApICsgaG91cnMpICUgMjQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDAgPSBuZXcgRGF0ZShleHRlbnQwWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQwLnNldE1pbnV0ZXMobSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMC5zZXRIb3VycyhoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQwLnNldFNlY29uZHMoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDEgPSBkMy50aW1lLm1pbnV0ZS5vZmZzZXQoZDAsIE1hdGgucm91bmQoKGV4dGVudDBbMV0gLSBleHRlbnQwWzBdKSAvIDYwMDAwKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxID0gW2QwLCBkMV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIHJlc2l6aW5nLCByb3VuZCBib3RoIGRhdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDEgPSBleHRlbnQwLm1hcChkMy50aW1lLmhvdXIucm91bmQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgZW1wdHkgd2hlbiByb3VuZGVkLCB1c2UgZmxvb3IgJiBjZWlsIGluc3RlYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVudDFbMF0gPj0gZXh0ZW50MVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MVswXSA9IGQzLnRpbWUuaG91ci5mbG9vcihleHRlbnQwWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMV0gPSBkMy50aW1lLmhvdXIuY2VpbChleHRlbnQwWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNhbGwoYnJ1c2guZXh0ZW50KGV4dGVudDEpKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGJydXNoZW5kID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ0JydXNoLnNlbGVjdCgnLmJhY2tncm91bmQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9maWd1cmUgb3V0IHdoZXRoZXIgd2UgbmVlZCB0byBhZGQgYSBuZXcgYnJ1c2ggb3Igbm90LlxyXG4gICAgICAgICAgICAgICAgICAgIC8vSWYgbGFzdCBicnVzaCBoYXMgYmVlbiBtb2RpZmllZCwgdGhlbiBpdCdzIGJlZW4gdXNlZCBhbmQgd2UgbmVlZCB0byBhZGQgYSBuZXcgYnJ1c2guXHJcbiAgICAgICAgICAgICAgICAgICAgLy9FbHNlIGl0J3Mgc3RpbGwgZW1wdHksIGFuZCB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0QnJ1c2hFeHRlbnQgPSBicnVzaGVzW2JydXNoZXMubGVuZ3RoLTFdLmV4dGVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGxhc3RCcnVzaEV4dGVudFswXS5nZXRUaW1lKCkgIT0gbGFzdEJydXNoRXh0ZW50WzFdLmdldFRpbWUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QnJ1c2goY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKClcclxuICAgICAgICAgICAgICAgICAgICAueCh4KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImJydXNoXCIsIGJydXNoZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiYnJ1c2hlbmRcIiwgYnJ1c2hlbmQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGJydXNoZXMucHVzaChicnVzaCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGdCcnVzaCA9IGNvbnRhaW5lci5pbnNlcnQoXCJnXCIsICcuYnJ1c2gnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJicnVzaFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY2FsbChicnVzaCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZ0JydXNoLnNlbGVjdEFsbChcInJlY3RcIilcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnJ1c2g7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogMTB9LFxyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBwYXJzZUludChzY29wZS53aWR0aCkgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodCxcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KHNjb3BlLmhlaWdodCkgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcbiAgICAgICAgICAgIHZhciBlbmREYXRlID0gbmV3IERhdGUoc2NvcGUuc2NydWIuZ2V0VGltZSgpKTtcclxuICAgICAgICAgICAgZW5kRGF0ZS5zZXRIb3VycyhlbmREYXRlLmdldEhvdXJzKCkrMjMpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHggPSBkMy50aW1lLnNjYWxlKClcclxuICAgICAgICAgICAgICAgIC5kb21haW4oW3Njb3BlLnNjcnViLCBlbmREYXRlXSlcclxuICAgICAgICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoZWFkZXIgPSBzY29wZS5lbC5hcHBlbmQoJ2gzJylcclxuICAgICAgICAgICAgICAgIC5odG1sKGZ1bmN0aW9uICgpe3JldHVybiBtb21lbnQoc2NvcGUuc2NydWIpLmZvcm1hdCgnTU1NTSBEbycpfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3ZnID0gc2NvcGUuZWwuYXBwZW5kKFwic3ZnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpXHJcblxyXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwicmVjdFwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImdyaWQtYmFja2dyb3VuZFwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggZ3JpZFwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIGhlaWdodCArIFwiKVwiKVxyXG4gICAgICAgICAgICAgICAgLmNhbGwoZDMuc3ZnLmF4aXMoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zY2FsZSh4KVxyXG4gICAgICAgICAgICAgICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrcyhkMy50aW1lLm1pbnV0ZSwgMzApXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tTaXplKC1oZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoXCJcIikpXHJcbiAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKFwiLnRpY2tcIilcclxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwibWlub3JcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRIb3VycygpOyB9KTtcclxuXHJcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXHJcbiAgICAgICAgICAgICAgICAuY2FsbChkMy5zdmcuYXhpcygpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrUGFkZGluZygwKSlcclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJ0ZXh0XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgNilcclxuICAgICAgICAgICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJydXNoZXNDb250YWluZXIgPSBzdmcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdicnVzaGVzJyk7XHJcblxyXG4gICAgICAgICAgICBuZXdCcnVzaChicnVzaGVzQ29udGFpbmVyKTtcclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcbiJdfQ==
