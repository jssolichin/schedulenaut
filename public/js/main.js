(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var schedulenaut = angular.module('schedulenaut', [
    'multipleDatePicker',
    'ui.router',
    require('./scheduler').name
]).config(require('./common/routes'));

},{"./common/routes":4,"./scheduler":8}],2:[function(require,module,exports){
'use strict';

module.exports = angular.module('d3', [])
    .factory('d3Provider', ['$document', '$q', '$rootScope',
        function($document, $q, $rootScope) {
            var d = $q.defer();
            function onScriptLoad(u){
                $rootScope.$apply(function(){d.resolve(window.d3);});
            }
            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = 'bower_components/d3/d3.js';
            scriptTag.onreadystatechange = function (){
                if(this.readyState == 'complete') onScriptLoad();
            };
            scriptTag.onload = onScriptLoad;
            var s = $document[0]. getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                d3: function(){ return d.promise;}
            };
        }]);

},{}],3:[function(require,module,exports){
'use strict';

module.exports = angular.module('moment', [])
    .factory('momentProvider', ['$document', '$q', '$rootScope',
        function($document, $q, $rootScope) {
            var d = $q.defer();
            function onScriptLoad(u){
                $rootScope.$apply(function(){d.resolve(window.moment);});
            }
            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = 'bower_components/moment/moment.js';
            scriptTag.onreadystatechange = function (){
                if(this.readyState == 'complete') onScriptLoad();
            };
            scriptTag.onload = onScriptLoad;
            var s = $document[0]. getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                moment: function(){ return d.promise;}
            };
        }]);

},{}],4:[function(require,module,exports){
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

},{"../index/controller":5,"../scheduler/controller":6}],5:[function(require,module,exports){
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
            $scope.dates.splice(index, 1);
        }

        //reproduce the standard behavior
        date.selected = !date.selected;
    };

    //scheduler
    $scope.width = window.innerWidth-30;
    $scope.height = window.innerHeight;

};

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
            h = ((((minutes/(120-interval)) + 0.5) | 0) + hours) % 24;

            d0 = new Date(date);
            d0.setMinutes(m);
            d0.setHours(h);
            d0.setSeconds(0);

            return d0;
        }
    };
};

},{}],8:[function(require,module,exports){
/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.scheduler', [
    require('../common/d3Provider').name,
    require('../common/momentProvider').name
])
    .factory('helpers', require('./helpers'))
    .directive('scrub', require('./scrub'));
    //.controller('ChartMgrCtrl', require('./ChartMgrCtrl'));

},{"../common/d3Provider":2,"../common/momentProvider":3,"./helpers":7,"./scrub":9}],9:[function(require,module,exports){
/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = function (helpers, d3Provider, momentProvider, $q) {
    return {
        restrict: 'A',
        scope: {
            height: '@',
            width: '@',
            granularity: '=',
            scrub: '='
        },
        link: function (scope, element, attrs) {

            var promises = [d3Provider.d3(), momentProvider.moment()];
            $q.all(promises).then(function (promise) {
                var d3 = promise[0];
                var moment = promise[1];

                scope.el = d3.select(element[0]);

                var brushes = [];

                var newBrush = function (container) {
                    var brushed = function () {
                        var extent0 = brush.extent(),
                            extent1;

                        // if dragging, preserve the width of the extent
                        if (d3.event.mode === "move") {
                            var d0, d1;

                            if (scope.granularity === 60) {
                                d0 = d3.time.hour.round(extent0[0]);
                                d1 = d3.time.hour.offset(d0, Math.round((extent0[1] - extent0[0]) / 3600000));
                            }
                            else {
                                d0 = helpers.round(extent0[0], scope.granularity);
                                d1 = d3.time.minute.offset(d0, Math.round((extent0[1] - extent0[0]) / 60000));
                            }

                            extent1 = [d0, d1];

                        }

                        // otherwise, if resizing, round both dates
                        else {

                            // if hour we can use built in d3 function to round use floor & ceil instead
                            if (scope.granularity === 60) {
                                extent1 = extent0.map(d3.time.hour.round);
                                if (extent1[0] >= extent1[1]) {
                                    extent1[0] = d3.time.hour.floor(extent0[0]);
                                    extent1[1] = d3.time.hour.ceil(extent0[1]);
                                }
                            }

                            // else we just add minutes manually
                            else {
                                extent1 = extent0.slice(0);
                                extent1[1].setMinutes(extent1[1].getMinutes() + scope.granularity);

                                extent1[0] = helpers.round(extent0[0], scope.granularity);
                                extent1[1] = helpers.round(extent0[1], scope.granularity);
                            }

                        }

                        //make sure that event blocks (brush) do not overlap
                        //brush.extent.start is a property created that holds the original extent of the bar when brush start
                        if (brush.extent.start) {
                            //time where we can not go pass as to not overlap
                            var edge = [];

                            //go through each event blocks and look for the 2 closest one on both side to the current one and store that to edge
                            for (var i = 0; i < brushes.length; i++) {
                                var otherBrush = brushes[i];

                                if (otherBrush !== brush) {
                                    if (otherBrush.extent()[1].getTime() <= brush.extent.start[0].getTime()) {
                                        if (edge[0] !== undefined && otherBrush.extent()[1].getTime() > edge[0].getTime() || edge[0] === undefined)
                                            edge[0] = otherBrush.extent()[1];
                                    }
                                    else if (otherBrush.extent()[0].getTime() > brush.extent.start[0].getTime()) {
                                        if (edge[1] !== undefined && otherBrush.extent()[0].getTime() < edge[1].getTime() || edge[1] === undefined)
                                            edge[1] = otherBrush.extent()[0];
                                    }
                                }
                            }

                            //if the current block gets brushed beyond the surrounding block, limit it so it does not go past
                            if (edge[1] !== undefined && extent1[1].getTime() > edge[1].getTime()) {
                                extent1[1] = edge[1];
                                //if we are moving, not only do we stop it from going past, but also keep the brush the same size
                                if (d3.event.mode === "move")
                                    extent1[0] = d3.time.hour.offset(extent1[1], -Math.round((brush.extent.start[1] - brush.extent.start[0]) / 3600000));
                            } else if (edge[0] !== undefined && extent1[0].getTime() < edge[0].getTime()) {
                                extent1[0] = edge[0];
                                if (d3.event.mode === "move")
                                    extent1[1] = d3.time.hour.offset(extent1[0], Math.round((brush.extent.start[1] - brush.extent.start[0]) / 3600000));
                            }
                        }

                        d3.select(this).call(brush.extent(extent1));
                    };

                    var brushend = function () {


                        gBrush.select('.background')
                            .style('pointer-events', 'none');

                        //When we finish brushing, the extent will be the starting extent for next time
                        //This is useful for determining what is surrounding the current block later
                        brush.extent.start = brush.extent();

                        //Figure out whether we need to add a new brush or not.
                        //If last brush has been modified, then it's been used and we need to add a new brush.
                        //Else it's still empty, and we don't need to do anything.
                        var lastBrushExtent = brushes[brushes.length - 1].extent();
                        if (lastBrushExtent[0].getTime() !== lastBrushExtent[1].getTime())
                            newBrush(container);
                    };

                    var brush = d3.svg.brush()
                        .x(x)
                        .on("brush", brushed)
                        .on("brushend", brushend);

                    brushes.push(brush);

                    var gBrush = container.insert("g", '.brush')
                        .attr("class", "brush")
                        .on("click", function () {
                            d3.event.stopPropagation();
                        })
                        .call(brush);

                    gBrush.selectAll("rect")
                        .attr("height", height);


                    return brush;
                };

                var margin = {top: 10, right: 10, bottom: 20, left: 10},
                    width = parseInt(scope.width) - margin.left - margin.right,
                    height = parseInt(scope.height) - margin.top - margin.bottom;

                var endDate = new Date(scope.scrub.getTime());
                endDate.setHours(endDate.getHours() + 23);

                var x = d3.time.scale()
                    .domain([scope.scrub, endDate])
                    .range([0, width]);

                var header = scope.el.append('h3')
                    .html(function () {
                        return moment(scope.scrub).format('MMMM Do');
                    });

                var svg = scope.el.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
                    .classed("minor", function (d) {
                        return d.getHours();
                    });

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

            }); //end promises
        } //end link function
    };
};


},{}]},{},[1]);

//# sourceMappingURL=main.js.map