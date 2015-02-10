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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic291cmNlXFxqc1xcY29tbW9uXFxyb3V0ZXMuanMiLCJzb3VyY2VcXGpzXFxpbmRleFxcY29udHJvbGxlci5qcyIsInNvdXJjZVxcanNcXG1haW4uanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGNvbnRyb2xsZXIuanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGhlbHBlcnMuanMiLCJzb3VyY2VcXGpzXFxzY2hlZHVsZXJcXGluZGV4LmpzIiwic291cmNlXFxqc1xcc2NoZWR1bGVyXFxzY3J1Yi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ3JlYXRlZCBieSBKb25hdGhhbiBvbiAyLzMvMjAxNS5cclxuICovXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG4gICAgLy9cclxuICAgIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3N0YXRlMVxyXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9pbmRleFwiKTtcclxuICAgIC8vXHJcbiAgICAvLyBOb3cgc2V0IHVwIHRoZSBzdGF0ZXNcclxuICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcclxuICAgICAgICAgICAgdXJsOiBcIi9pbmRleFwiLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwdWJsaWMvcGFydGlhbHMvaW5kZXguaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiByZXF1aXJlKCcuLi9pbmRleC9jb250cm9sbGVyJylcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnc2NoZWR1bGVyJywge1xyXG4gICAgICAgICAgICB1cmw6IFwiL3NjaGVkdWxlclwiLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwdWJsaWMvcGFydGlhbHMvc2NoZWR1bGVyLmh0bWxcIixcclxuICAgICAgICAgICAgY29udHJvbGxlcjogcmVxdWlyZSgnLi4vc2NoZWR1bGVyL2NvbnRyb2xsZXInKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdhYm91dCcsIHtcclxuICAgICAgICAgICAgdXJsOiBcIi9hYm91dFwiLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwdWJsaWMvcGFydGlhbHMvYWJvdXQuaHRtbFwiXHJcbiAgICAgICAgfSk7XHJcbn07XHJcbiIsIi8qKlxyXG4gKlxyXG4gKiBDcmVhdGVkIGJ5IEpvbmF0aGFuIG9uIDIvOC8yMDE1LlxyXG4gKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJHNjb3BlKXtcclxuICAgICRzY29wZS5kYXRlcyA9IFtdO1xyXG4gICAgJHNjb3BlLmxvZ0luZm9zID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRlKXtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBwcmV2ZW50IHRoZSBzZWxlY3QgdG8gaGFwcGVuXHJcblxyXG4gICAgICAgIGlmKCFkYXRlLnNlbGVjdGVkKVxyXG4gICAgICAgICAgICAkc2NvcGUuZGF0ZXMucHVzaChkYXRlLnRvRGF0ZSgpKTtcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4PSAkc2NvcGUuZGF0ZXMuaW5kZXhPZihkYXRlLnRvRGF0ZSgpKTtcclxuICAgICAgICAgICAgJHNjb3BlLmRhdGVzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vcmVwcm9kdWNlIHRoZSBzdGFuZGFyZCBiZWhhdmlvclxyXG4gICAgICAgIGRhdGUuc2VsZWN0ZWQgPSAhZGF0ZS5zZWxlY3RlZDtcclxuICAgIH1cclxuXHJcbiAgICAvL3NjaGVkdWxlclxyXG4gICAgJHNjb3BlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGgtMzA7XHJcbiAgICAkc2NvcGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIHNjaGVkdWxlbmF1dCA9IGFuZ3VsYXIubW9kdWxlKCdzY2hlZHVsZW5hdXQnLCBbXHJcbiAgICAnbXVsdGlwbGVEYXRlUGlja2VyJyxcclxuICAgICd1aS5yb3V0ZXInLFxyXG4gICAgcmVxdWlyZSgnLi9zY2hlZHVsZXInKS5uYW1lXHJcbl0pLmNvbmZpZyhyZXF1aXJlKCcuL2NvbW1vbi9yb3V0ZXMnKSk7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IEpvbmF0aGFuIG9uIDIvOC8yMDE1LlxyXG4gKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkc2NvcGUpe1xyXG4gICAgJHNjb3BlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAkc2NvcGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgJHNjb3BlLm9wdGlvbkdyYW51bGFyaXR5ID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJzE1IG1pbnV0ZXMnLFxyXG4gICAgICAgICAgICB2YWx1ZTogMTVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ2hhbGYtaG91cicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAzMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnaG91cicsXHJcbiAgICAgICAgICAgIHZhbHVlOiA2MFxyXG4gICAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgJHNjb3BlLnNlbGVjdGVkR3JhbnVsYXJpdHkgPSA2MDtcclxuXHJcbiAgICB2YXIgc3RhcnREYXRlID0gbmV3IERhdGUoKTtcclxuICAgIHN0YXJ0RGF0ZS5zZXRIb3VycygwKTtcclxuICAgIHN0YXJ0RGF0ZS5zZXRNaW51dGVzKDApO1xyXG4gICAgc3RhcnREYXRlLnNldFNlY29uZHMoMCk7XHJcblxyXG4gICAgJHNjb3BlLmRhdGVzID0gW3N0YXJ0RGF0ZV07XHJcblxyXG4gICAgZm9yKHZhciBpID0gMTsgaSA8PSA3OyBpKyspe1xyXG4gICAgICAgIHZhciBsYXN0RGF0ZSA9ICRzY29wZS5kYXRlc1tpLTFdLmdldFRpbWUoKTtcclxuICAgICAgICB2YXIgbmV4dERhdGUgPSBuZXcgRGF0ZShsYXN0RGF0ZSk7XHJcbiAgICAgICAgbmV4dERhdGUuc2V0RGF0ZShuZXh0RGF0ZS5nZXREYXRlKCkrMSk7XHJcblxyXG4gICAgICAgICRzY29wZS5kYXRlcy5wdXNoKG5leHREYXRlKTtcclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMi85LzIwMTUuXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcm91bmQ6IGZ1bmN0aW9uIChkYXRlLCBpbnRlcnZhbCl7XHJcbiAgICAgICAgICAgIC8vZDMgZG9lcyBub3QgaGF2ZSBpbnRlcnZhbCBiZXR3ZWVuIG1pbnV0ZXMgYW5kIGhvdXJzLlxyXG4gICAgICAgICAgICAvL3RoaXMgZnVuY3Rpb24gaXMgYSBzaGltIHRvIGdldCBhcmJpdHJhcnkgbWludXRlcyBpbnRlcnZhbCAoZS5nLiAxNSBtaW51dGVzLCAzMCBtaW51dGVzIChoYWxmLWhvdXIpKS5cclxuICAgICAgICAgICAgLy9naXZlbiBhIGRhdGUgb2JqZWN0LCByb3VuZCB0byB0aGUgbmVhcmVzdCBtaW51dGUgaW50ZXJ2YWwuXHJcblxyXG4gICAgICAgICAgICB2YXIgbWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgICAgICB2YXIgaG91cnMgPSBkYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgIHZhciBtLGg7XHJcblxyXG4gICAgICAgICAgICBtID0gKCgobWludXRlcyArIChpbnRlcnZhbC8yKSkvaW50ZXJ2YWwgfCAwKSAqIGludGVydmFsKSAlIDYwO1xyXG4gICAgICAgICAgICBoID0gKCgoKG1pbnV0ZXMvKDEyMC1pbnRlcnZhbCkpICsgLjUpIHwgMCkgKyBob3VycykgJSAyNDtcclxuXHJcbiAgICAgICAgICAgIGQwID0gbmV3IERhdGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGQwLnNldE1pbnV0ZXMobSk7XHJcbiAgICAgICAgICAgIGQwLnNldEhvdXJzKGgpO1xyXG4gICAgICAgICAgICBkMC5zZXRTZWNvbmRzKDApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGQwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgSm9uYXRoYW4gb24gMS8yNS8yMDE1LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ3NjaGVkdWxlbmF1dC5zY2hlZHVsZXInLCBbIF0pXHJcbiAgICAuZmFjdG9yeSgnaGVscGVycycsIHJlcXVpcmUoJy4vaGVscGVycycpKVxyXG4gICAgLmRpcmVjdGl2ZSgnc2NydWInLCByZXF1aXJlKCcuL3NjcnViJykpO1xyXG4gICAgLy8uY29udHJvbGxlcignQ2hhcnRNZ3JDdHJsJywgcmVxdWlyZSgnLi9DaGFydE1nckN0cmwnKSk7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IEpvbmF0aGFuIG9uIDEvMjUvMjAxNS5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoZWxwZXJzKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAnQCcsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnQCcsXHJcbiAgICAgICAgICAgIGdyYW51bGFyaXR5OiAnPScsXHJcbiAgICAgICAgICAgIHNjcnViOiAnPSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgc2NvcGUuZWwgPSBkMy5zZWxlY3QoZWxlbWVudFswXSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYnJ1c2hlcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5ld0JydXNoID0gZnVuY3Rpb24gKGNvbnRhaW5lcil7XHJcbiAgICAgICAgICAgICAgICB2YXIgYnJ1c2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBleHRlbnQwID0gYnJ1c2guZXh0ZW50KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGRyYWdnaW5nLCBwcmVzZXJ2ZSB0aGUgd2lkdGggb2YgdGhlIGV4dGVudFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkMy5ldmVudC5tb2RlID09PSBcIm1vdmVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZDAsIGQxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2NvcGUuZ3JhbnVsYXJpdHkgPT0gNjApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDAgPSBkMy50aW1lLmhvdXIucm91bmQoZXh0ZW50MFswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMSA9IGQzLnRpbWUuaG91ci5vZmZzZXQoZDAsIE1hdGgucm91bmQoKGV4dGVudDBbMV0gLSBleHRlbnQwWzBdKSAvIDM2MDAwMDApICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMCA9IGhlbHBlcnMucm91bmQoZXh0ZW50MFswXSwgc2NvcGUuZ3JhbnVsYXJpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDEgPSBkMy50aW1lLm1pbnV0ZS5vZmZzZXQoZDAsIE1hdGgucm91bmQoKGV4dGVudDBbMV0gLSBleHRlbnQwWzBdKSAvIDYwMDAwKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxID0gW2QwLCBkMV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiByZXNpemluZywgcm91bmQgYm90aCBkYXRlc1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaG91ciB3ZSBjYW4gdXNlIGJ1aWx0IGluIGQzIGZ1bmN0aW9uIHRvIHJvdW5kIHVzZSBmbG9vciAmIGNlaWwgaW5zdGVhZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzY29wZS5ncmFudWxhcml0eSA9PSA2MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxID0gZXh0ZW50MC5tYXAoZDMudGltZS5ob3VyLnJvdW5kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbnQxWzBdID49IGV4dGVudDFbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxWzBdID0gZDMudGltZS5ob3VyLmZsb29yKGV4dGVudDBbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMV0gPSBkMy50aW1lLmhvdXIuY2VpbChleHRlbnQwWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSB3ZSBqdXN0IGFkZCBtaW51dGVzIG1hbnVhbGx5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW50MSA9IGV4dGVudDAuc2xpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnQxWzFdLnNldE1pbnV0ZXMoZXh0ZW50MVsxXS5nZXRNaW51dGVzKCkrc2NvcGUuZ3JhbnVsYXJpdHkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMF0gPSBoZWxwZXJzLnJvdW5kKGV4dGVudDBbMF0sIHNjb3BlLmdyYW51bGFyaXR5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVudDFbMV0gPSBoZWxwZXJzLnJvdW5kKGV4dGVudDBbMV0sIHNjb3BlLmdyYW51bGFyaXR5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jYWxsKGJydXNoLmV4dGVudChleHRlbnQxKSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBicnVzaGVuZCA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdCcnVzaC5zZWxlY3QoJy5iYWNrZ3JvdW5kJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vZmlndXJlIG91dCB3aGV0aGVyIHdlIG5lZWQgdG8gYWRkIGEgbmV3IGJydXNoIG9yIG5vdC5cclxuICAgICAgICAgICAgICAgICAgICAvL0lmIGxhc3QgYnJ1c2ggaGFzIGJlZW4gbW9kaWZpZWQsIHRoZW4gaXQncyBiZWVuIHVzZWQgYW5kIHdlIG5lZWQgdG8gYWRkIGEgbmV3IGJydXNoLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vRWxzZSBpdCdzIHN0aWxsIGVtcHR5LCBhbmQgd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZy5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdEJydXNoRXh0ZW50ID0gYnJ1c2hlc1ticnVzaGVzLmxlbmd0aC0xXS5leHRlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihsYXN0QnJ1c2hFeHRlbnRbMF0uZ2V0VGltZSgpICE9IGxhc3RCcnVzaEV4dGVudFsxXS5nZXRUaW1lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0JydXNoKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpXHJcbiAgICAgICAgICAgICAgICAgICAgLngoeClcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJicnVzaFwiLCBicnVzaGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImJydXNoZW5kXCIsIGJydXNoZW5kKTtcclxuXHJcbiAgICAgICAgICAgICAgICBicnVzaGVzLnB1c2goYnJ1c2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBnQnJ1c2ggPSBjb250YWluZXIuaW5zZXJ0KFwiZ1wiLCAnLmJydXNoJylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiYnJ1c2hcIilcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoYnJ1c2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIGdCcnVzaC5zZWxlY3RBbGwoXCJyZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJydXNoO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDEwfSxcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gcGFyc2VJbnQoc2NvcGUud2lkdGgpIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBwYXJzZUludChzY29wZS5oZWlnaHQpIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblxyXG4gICAgICAgICAgICB2YXIgZW5kRGF0ZSA9IG5ldyBEYXRlKHNjb3BlLnNjcnViLmdldFRpbWUoKSk7XHJcbiAgICAgICAgICAgIGVuZERhdGUuc2V0SG91cnMoZW5kRGF0ZS5nZXRIb3VycygpKzIzKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB4ID0gZDMudGltZS5zY2FsZSgpXHJcbiAgICAgICAgICAgICAgICAuZG9tYWluKFtzY29wZS5zY3J1YiwgZW5kRGF0ZV0pXHJcbiAgICAgICAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoXSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gc2NvcGUuZWwuYXBwZW5kKCdoMycpXHJcbiAgICAgICAgICAgICAgICAuaHRtbChmdW5jdGlvbiAoKXtyZXR1cm4gbW9tZW50KHNjb3BlLnNjcnViKS5mb3JtYXQoJ01NTU0gRG8nKX0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHN2ZyA9IHNjb3BlLmVsLmFwcGVuZChcInN2Z1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKVxyXG5cclxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJncmlkLWJhY2tncm91bmRcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGdyaWRcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsXCIgKyBoZWlnaHQgKyBcIilcIilcclxuICAgICAgICAgICAgICAgIC5jYWxsKGQzLnN2Zy5heGlzKClcclxuICAgICAgICAgICAgICAgICAgICAuc2NhbGUoeClcclxuICAgICAgICAgICAgICAgICAgIC5vcmllbnQoXCJib3R0b21cIilcclxuICAgICAgICAgICAgICAgICAgICAudGlja3MoZDMudGltZS5taW51dGUsIDMwKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrU2l6ZSgtaGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbChcIi50aWNrXCIpXHJcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcIm1pbm9yXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0SG91cnMoKTsgfSk7XHJcblxyXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpc1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIGhlaWdodCArIFwiKVwiKVxyXG4gICAgICAgICAgICAgICAgLmNhbGwoZDMuc3ZnLmF4aXMoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zY2FsZSh4KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vcmllbnQoXCJib3R0b21cIilcclxuICAgICAgICAgICAgICAgICAgICAudGlja1BhZGRpbmcoMCkpXHJcbiAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKFwidGV4dFwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDYpXHJcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBicnVzaGVzQ29udGFpbmVyID0gc3ZnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnYnJ1c2hlcycpO1xyXG5cclxuICAgICAgICAgICAgbmV3QnJ1c2goYnJ1c2hlc0NvbnRhaW5lcik7XHJcblxyXG5cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4iXX0=
