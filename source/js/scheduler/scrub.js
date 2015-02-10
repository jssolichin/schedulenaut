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
