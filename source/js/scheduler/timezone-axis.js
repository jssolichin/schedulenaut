'use strict';

module.exports = function (d3Provider, $filter) {
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

            var rawTzOptions;

            var addMinutes = function (date, minutes) {
                return new Date(date.getTime() + minutes * 60000);
            };

            var changeTimezone = function (oldDomain, timezone) {
                var add = 0;
                var dt = new timezoneJS.Date(oldDomain[0], jstz.determine().name());

                if (timezone && scope.tzOptions.length === rawTzOptions.length) {
                    //get the full timezone name
                    var index = scope.tzOptions.indexOf(timezone);
                    var rawTimezone = rawTzOptions[index];

                    //convert the timezone
                    var originalOffset = dt.getTimezoneOffset();
                    dt.setTimezone(rawTimezone);
                    var newOffset = dt.getTimezoneOffset();

                    add = (originalOffset - newOffset);

                }

                var begin = addMinutes(scope.scale.domain()[0], add);
                var end = addMinutes(scope.scale.domain()[1], add);

                return [begin, end];
            };

            //we need to load timezone files before we can render anything
            var init = function () {

                rawTzOptions = timezoneJS.timezone.getAllZones();
                var x = rawTzOptions
                    .map(function (option) {
                        return $filter('shortTimezone')(option);
                    });

                var uniqueNames = [];
                $.each(x, function (i, el) {
                    if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                });

                scope.tzOptions = uniqueNames;

                d3Provider.d3().then(function (d3) {
                    var timeFormat = d3.time.format.multi([
                        ["%I %p", function (d) {
                            return d.getHours();
                        }],
                        ["Day Change", function (d) {
                            return d.getDay();
                        }]
                    ]);

                    var height, svg, gridBackground, xAxisGen, xAxis, localScale;
                    var margin = {top: 0, right: 0, bottom: 0, left: 0};

                    var setUp = function () {
                        height = scope.height - margin.top - margin.bottom;

                        svg = d3.select(element[0]).select('.axis').selectAll('svg')
                            .data([0]);

                        svg.enter()
                            .append('svg')
                            .attr("height", height + margin.top + margin.bottom);

                        xAxis = svg.selectAll('g')
                            .data([0]);

                        xAxis.enter()
                            .append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        gridBackground = xAxis.append("rect")
                            .attr("class", "grid-background")
                            .attr("height", height);

                        localScale = d3.time.scale()
                            .clamp(true);

                        xAxisGen = d3.svg.axis()
                            .ticks(d3.time.hours, 6)
                            .orient("bottom")
                            .tickSize(height, 0)
                            //.tickFormat(timeFormat)
                            .tickPadding(0);


                    };

                    var update = function () {

                        if (scope.width > 0) {

                            var width = scope.width - margin.left - margin.right;

                            svg.attr("width", width + margin.left + margin.right);

                            var newDomain = changeTimezone(scope.scale.domain(), scope.timezone.zone);

                            if(scope.timezone.zone === undefined)
                                scope.timezone.zone = $filter('shortTimezone')(jstz.determine().name());

                            localScale
                                .domain(newDomain)
                                .range(scope.scale.range());

                            gridBackground
                                .transition()
                                .attr("width", width);

                            xAxisGen
                                .scale(localScale);

                            xAxis
                                .transition()
                                .call(xAxisGen)
                                .selectAll(".tick text")
                                .attr("y", height / 2 - 5)
                                .attr("x", 5)
                                .style("text-anchor", 'start');

                        }
                    };

                    scope.$watch('scale', setUp);
                    scope.$watch('width', update);
                    scope.$watch('timezone.zone', update);

                });
            };

            timezoneJS.timezone.zoneFileBasePath = 'tz';
//            timezoneJS.timezone.loadingScheme = timezoneJS.timezone.loadingSchemes.PRELOAD_ALL;
            var x = timezoneJS.timezone.init({callback: init});

            scope.$watch(function () {
                return timezoneJS.timezone.getAllZones().length;
            }, function () {
                if (timezoneJS.timezone.getAllZones().length > 0)
                    init();
            });

        }
    };
};
