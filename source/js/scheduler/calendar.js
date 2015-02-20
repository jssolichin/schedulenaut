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
            dates: '='
        },
        templateUrl: 'public/directives/calendar.html',
        link: function (scope, element, attrs) {

            var promises = [d3Provider.d3(), momentProvider.moment()];
            $q.all(promises).then(function (promise) {
                var d3 = promise[0];
                var moment = promise[1];


                var el = d3.select(element[0]);
                var hoverTime = d3.selectAll('.hover-time');
                var rule = el.append('div')
                    .attr('id', 'rule');
                var tooltip = rule.append('div')
                    .attr('id', 'tooltip');
                var mouseX = 0;


                var margin = {top: 10, right: 10, bottom: 20, left: 10};
                var height = scope.height - margin.top - margin.bottom;
                var tooltipOffsetY = -100;

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
                    //mouseX = d3.mouse(this)[0];
                    mouseX = d3.event.pageX - 9;
                    var el = d3.select(this).node();
                    var truePos = mouseX - margin.left - el.offsetLeft;
                    var rawTime = x.invert(truePos);
                    var momentTime= moment(rawTime);

                    tooltip
                        .style('top', (el.offsetTop + d3.event.offsetY + tooltipOffsetY) +'px')
                        .html(momentTime.format('hh:mm a'));

                    if(truePos < x.range()[0] || truePos > x.range()[1])
                        rule.style('display', 'none');
                    else
                        rule.style('display', 'block');


                };
                var mouseleave = function () {
                    rule.style('display', 'none');
                };

                var mouseUpdate = function (){
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

                var svg = d3.select('.timeline').append('svg')
                    .attr("height", height + margin.top + margin.bottom);

                var g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var gridBackground = g.append("rect")
                    .attr("class", "grid-background")
                    .attr("height", height);

                var xAxis = g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")");

                xAxis
                    .selectAll("text")
                    .attr("x", 6)
                    .style("text-anchor", null);

                var update = function (){
                    scope.width = window.innerWidth - hoverTime.node().offsetLeft - 40;
                    var width = scope.width - margin.left - margin.right;

                    x.range([0, width]);

                    svg.attr("width", width + margin.left + margin.right);

                    gridBackground
                        .transition()
                        .attr("width", width);

                    xAxis
                        .transition()
                        .call(d3.svg.axis()
                            .scale(x)
                            .ticks(d3.time.hours, 6)
                            .orient("top")
                            .tickPadding(0));
                };

                update();
                scope.$on('resize', update);
            });

        }
    };
};
