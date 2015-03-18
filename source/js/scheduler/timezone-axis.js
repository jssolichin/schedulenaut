'use strict';

module.exports = function (d3Provider, $q) {
    return {
        restrict: 'A',
        scope: {
            scale: '=',
            height: '=',
            width: '=',
            timezone: '=',
            tzOptions: '='
        },
        link: function (scope, element, attrs) {
            var addMinutes = function (date, minutes) {
                return new Date(date.getTime() + minutes * 60000);
            };

            var changeTimezone = function (oldDomain, timezone) {
                var add = 0;
                var dt = new timezoneJS.Date(oldDomain[0]);

                if (timezone) {
                    var originalOffset = dt.getTimezoneOffset();
                    dt.setTimezone(timezone);
                    var newOffset = dt.getTimezoneOffset();

                    add = -1 * (originalOffset - newOffset);
                }

                var begin = addMinutes(scope.scale.domain()[0], add);
                var end = addMinutes(scope.scale.domain()[1], add);

                return [begin, end];
            };

            //we need to load timezone files before we can render anything
            var init = function () {

                scope.tzOptions = timezoneJS.timezone.getAllZones();

                d3Provider.d3().then(function (d3) {
                    var timeFormat = d3.time.format.multi([
                        ["%I %p", function (d) {
                            return d.getHours();
                        }],
                        ["Day Change", function (d) {
                            return d.getDay();
                        }],
                    ]);

                    var height, svg, g, gridBackground, xAxisGen, xAxis, localScale;
                    var margin = {top: 0, right: 0, bottom: 0, left: 0};

                    var setUp = function () {
                        height = scope.height - margin.top - margin.bottom;

                        svg = d3.select(element[0]).select('.axis').selectAll('svg').data([0]).enter().append('svg')
                            .attr("height", height + margin.top + margin.bottom);

                        g = svg.append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        gridBackground = g.append("rect")
                            .attr("class", "grid-background")
                            .attr("height", height);

                        var newDomain = changeTimezone(scope.scale.domain(), scope.timezone.zone);

                        localScale = d3.time.scale()
                            .domain(newDomain)
                            .clamp(true);

                        xAxisGen = d3.svg.axis()
                            .scale(localScale)
                            .ticks(d3.time.hours, 6)
                            .orient("bottom")
                            .tickSize(height, 0)
                            .tickFormat(timeFormat)
                            .tickPadding(0);

                        xAxis = g.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + 0 + ")");

                    };

                    var update = function () {
                        var width = scope.width - margin.left - margin.right;

                        svg.attr("width", width + margin.left + margin.right);

                        var newDomain = changeTimezone(scope.scale.domain(), scope.timezone.zone);

                        localScale
                            .domain(newDomain)
                            .range([0, width]);

                        gridBackground
                            .transition()
                            .attr("width", width);

                        xAxis
                            .transition()
                            .call(xAxisGen)
                            .selectAll(".tick text")
                            .attr("y", height/2-5)
                            .attr("x", 5)
                            .style("text-anchor", 'start');

                    };

                    scope.$watch('scale', setUp);
                    scope.$watch('width', function () {
                        if (scope.width > 0)
                            update();
                    });
                    scope.$watch('timezone.zone', update)

                });
            };

            timezoneJS.timezone.zoneFileBasePath = 'tz';
            var x = timezoneJS.timezone.init({callback: init});

            scope.$watch(function(){
                return timezoneJS.timezone.getAllZones().length
            }, init)

        }
    };
};
