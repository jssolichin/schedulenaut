/**
 * Created by Jonathan on 2/16/2015.
 */

'use strict';

module.exports = function (d3Provider, momentProvider, $q) {
    return {
        restrict: 'C',
        scope: {
            height: '=',
            granularity: '=',
            dates: '=',
            onEnd: '=',
            allLayers: '=',
            activeLayerId: '='
        },
        templateUrl: 'public/directives/calendar.html',
        link: function (scope, element, attrs) {

            var promises = [d3Provider.d3(), momentProvider.moment()];
            $q.all(promises).then(function (promise) {
                var d3 = promise[0];
                var moment = promise[1];

                //We store data in the server per user to make it relational to the user table than events.
                //However, since each scrubber is seperate, we need to give each scrubber all users on that specific date.
                //So we need to transpose our layers list
                var transposeLayers = function () {
                    //add "brushes" array for every date to store brushes extent
                    scope.allLayers.forEach(function (layers) {
                        while (layers.data.length < scope.dates.length)
                            layers.data.push([]);
                    });

                    //transpose the layers so we group by date, than by users
                    scope.transposed = d3.transpose(scope.allLayers.map(function (layers) {
                        return layers.data;
                    }));

                    //Add again relevant data to the transposed data
                    var temp = [];
                    scope.transposed.forEach(function (day, i) {
                        temp[i] = [];
                        day.forEach(function (layer, j) {
                            temp[i][j] = {id: scope.allLayers[j].id, data: layer, visible: scope.allLayers[j].visible};
                        });
                    });
                    scope.transposed = temp;

                };

                //whenever there is a layer list change, we need to update our transposed layer list
                scope.$watch(function () {
                    return scope.allLayers.length;
                }, transposeLayers);

                scope.$on('updateLayers', function () {
                    transposeLayers();
                });

                var el = d3.select(element[0]);
                var hoverTime = d3.selectAll('.hover-time');
                var rule = el.append('div')
                    .attr('id', 'rule');
                var tooltip = rule.append('div')
                    .attr('id', 'tooltip');
                var mouseX = 0;

                var margin = {top: 0, right: 10, bottom: 0, left: 10};
                var height = scope.height - margin.top - margin.bottom;
                var tooltipOffsetY = -30;

                var beginTime = new Date();
                beginTime.setHours(0);
                beginTime.setMinutes(0);
                beginTime.setSeconds(0);
                var endTime = new Date(beginTime.getTime());
                endTime.setHours(beginTime.getHours() + 23);

                var x = d3.time.scale()
                    .domain([beginTime, endTime])
                    .clamp(true);

                var mouseenter = function () {
                    rule.style('display', 'block');
                };
                var mouseover = function ($event) {
                    var el = d3.select(this).node();
                    mouseX = d3.mouse(this)[0] + el.offsetLeft;
                    var truePos = mouseX - margin.left - el.offsetLeft;
                    var rawTime = x.invert(truePos);
                    var momentTime = moment(rawTime);

                    tooltip
                        .style('top', function () {
                            var posY = el.offsetTop + d3.event.offsetY + tooltipOffsetY;

                            //limit tooltip from going above
                            return (posY < 20 ? 20 : posY ) + 'px';
                        })
                        .html(momentTime.format('hh:mm a'));

                    if (truePos < x.range()[0] || truePos > x.range()[1])
                        rule.style('display', 'none');
                    else
                        rule.style('display', 'block');


                };
                var mouseleave = function () {
                    rule.style('display', 'none');
                };

                var mouseUpdate = function () {
                    rule.transition()
                        .duration(5)
                        .ease('cubic-in-out')
                        .style('left', mouseX + 'px');
                };

                setInterval(mouseUpdate, 35);

                hoverTime
                    .on('mouseenter', mouseenter)
                    .on('mousemove', mouseover)
                    .on('mouseleave', mouseleave);

                var svg = d3.select('.timeline').selectAll('svg').data([0]).enter().append('svg')
                    .attr("height", height + margin.top + margin.bottom);

                var g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var gridBackground = g.append("rect")
                    .attr("class", "grid-background")
                    .attr("height", height);

                var xAxisGen = d3.svg.axis()
                    .scale(x)
                    .ticks(d3.time.hours, 6)
                    .orient("bottom")
                    .tickSize(height, 0)
                    .tickPadding(0);

                var xAxis = g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + 0 + ")");

                var update = function () {
                    scope.width = element[0].offsetWidth - hoverTime.node().offsetLeft;
                    var width = scope.width - margin.left - margin.right;

                    x.range([0, width]);

                    svg.attr("width", width + margin.left + margin.right);

                    gridBackground
                        .transition()
                        .attr("width", width);

                    xAxis
                        .transition()
                        .call(xAxisGen)
                        .selectAll(".tick text")
                        .attr("y", 10)
                        .attr("x", 5)
                        .style("text-anchor", 'start');

                };

                update();
                scope.$watch('width', update);
                scope.$on('resize', update);
            });

        }
    };
};
