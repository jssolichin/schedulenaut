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

            var margin = {top: 10, right: 10, bottom: 20, left: 10},
                width = parseInt(attrs.width) - margin.left - margin.right,
                height = parseInt(attrs.height) - margin.top - margin.bottom;

            var x = d3.time.scale()
                .domain([new Date(2013, 2, 1), new Date(2013, 2, 15) - 1])
                .range([0, width]);

            var brush = d3.svg.brush()
                .x(x)
                .extent([new Date(2013, 2, 2), new Date(2013, 2, 3)])
                .on("brush", brushed);

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

            var gBrush = svg.append("g")
                .attr("class", "brush")
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
        }
    };
};
