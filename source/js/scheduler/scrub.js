/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = function (helpers, d3Provider, $q, $compile) {
    return {
        restrict: 'A',
        scope: {
            height: '=',
            width: '=',
            granularity: '=',
            scrub: '=',
            onEnd: '=',
            layers: '=',
            activeLayerId: '='
        },
        link: function (scope, element, attrs) {

            d3Provider.d3().then(function (d3) {

                scope.el = d3.select(element[0]);

                var newBrush = function (container) {
                    var brushstart = function () {
                        if (d3.event.sourceEvent)
                            brush.mouseStart = d3.event.sourceEvent.x;
                    };

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
                            var edge = helpers.getEdge(brush, scope.layers[scope.activeLayerId]);

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

                        //Callback function
                        scope.onEnd();

                        //if mouse hasn't moved since mouse down, it is a click (brush doesn't have a click event, so we fake one)
                        if (d3.event.sourceEvent && brush.mouseStart == d3.event.sourceEvent.x)
                            popoverHandler();

                        gBrush.select('.background')
                            .style('pointer-events', 'none');

                        //When we finish brushing, the extent will be the starting extent for next time
                        //This is useful for determining what is surrounding the current block later
                        brush.extent.start = brush.extent();

                        //Figure out whether we need to add a new brush or not.
                        //If last brush has been modified, then it's been used and we need to add a new brush.
                        //Else it's still empty, and we don't need to do anything.
                        //Requires mouseStart to exist, otherwise is based on previous
                        var lastBrushExtent = scope.layers[scope.activeLayerId][scope.layers[scope.activeLayerId].length - 1].extent();
                        if (brush.mouseStart && lastBrushExtent[0].getTime() !== lastBrushExtent[1].getTime()) {
                            newBrush(container);
                        }
                    };

                    var popoverHandler = function () {
                        var calculateMidpoint = function () {
                            var brushOffsetX = parseInt(gBrush.select('.extent').attr('x'));
                            var brushWidth = parseInt(gBrush.select('.extent').attr('width'));
                            return parseInt(margin.left + brushOffsetX + (brushWidth / 2));
                        };

                        var getOtherBrushesExtent = function () {
                            var otherExistingBrush = [];

                            for (var i = 0; i < scope.layers[scope.activeLayerId].length - 1; i++) {
                                var otherBrush = scope.layers[scope.activeLayerId][i];
                                if (otherBrush !== brush)
                                    otherExistingBrush.push(otherBrush.extent());
                            }

                            return otherExistingBrush;
                        };

                        var newScope = scope.$new(true);
                        newScope.x = calculateMidpoint();
                        newScope.start = brush.extent()[0];
                        newScope.end = brush.extent()[1];
                        newScope.preferred = brush.preferred;
                        newScope.step = scope.granularity;
                        newScope.disabled = getOtherBrushesExtent();
                        newScope.edge = helpers.getEdge(brush, scope.layers[scope.activeLayerId]);
                        newScope.link = "start";

                        var $el = $compile('<div class="popover-wrapper"></div>')(newScope);

                        newScope.$watch("preferred", function () {
                            brush.preferred = newScope.preferred;
                            updatePreferred();
                        });
                        newScope.$watchGroup(['start', 'end'], function () {
                            updateExtent([newScope.start, newScope.end]);
                        });
                        newScope.$on('deleteBrush', deleteBrush);

                        angular.element(scope.el.node()).append($el);
                    };

                    var deleteBrush = function () {
                        for (var i = 0; i < scope.layers[scope.activeLayerId].length; i++) {
                            if (scope.layers[scope.activeLayerId][i] == brush)
                                scope.layers[scope.activeLayerId].splice(i, 1);
                        }
                        gBrush.remove();
                    };

                    var updatePreferred = function () {
                        gBrush
                            .attr("class", function () {
                                return brush.preferred ? 'brush preferred' : 'brush';
                            });
                    };

                    var updateExtent = function (extent) {
                        gBrush.call(brush.extent(extent));
                        brush.extent.start = brush.extent();
                    };

                    var brush = d3.svg.brush()
                        .x(x)
                        .on("brushstart", brushstart)
                        .on("brush", brushed)
                        .on("brushend", brushend);

                    brush.preferred = true;

                    scope.layers[scope.activeLayerId].push(brush);

                    var gBrush = container.insert("g", '.brush')
                        .on('click', function () {
                            d3.event.stopPropagation();
                        })
                        .attr("class", function () {
                            return brush.preferred ? 'brush preferred' : 'brush';
                        })
                        .call(brush);

                    gBrush.selectAll('rect')
                        .attr("height", height);

                    return brush;
                };

                var margin = {top: 10, right: 10, bottom: 10, left: 10};
                var width;
                var height = parseInt(scope.height) - margin.top - margin.bottom;

                var endDate = new Date(scope.scrub.getTime());
                endDate.setHours(endDate.getHours() + 23);

                var x = d3.time.scale()
                    .domain([scope.scrub, endDate]);

                var svg = scope.el.append("svg");

                var g = svg
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var gridBackground = g.append("rect")
                    .attr("class", "grid-background");

                var xgrid = g.append("g")
                    .attr("class", "x grid")
                    .attr("transform", "translate(0," + height + ")");

                xgrid
                    .selectAll(".tick")
                    .classed("minor", function (d) {
                        return d.getHours();
                    });

                var layers = g.append('g')
                    .attr('class', 'layers');

                /*
                 var xaxis = g.append("g")
                 .attr("class", "x axis")
                 .attr("transform", "translate(0," + height + ")");

                 xaxis
                 .selectAll("text")
                 .attr("x", 6)
                 .style("text-anchor", null);
                 */

                var brushesContainer = g.append('g')
                    .attr('class', 'brushes');


                var update = function () {
                    width = parseInt(scope.width) - margin.left - margin.right;
                    height = parseInt(scope.height) - margin.top - margin.bottom;

                    x.range([0, width]);

                    xgrid
                        .transition()
                        .call(d3.svg.axis()
                            .scale(x)
                            .orient("bottom")
                            .ticks(d3.time.hour)
                            .tickSize(-height)
                            .tickFormat(""));

                    /*
                     xaxis
                     .transition()
                     .call(d3.svg.axis()
                     .scale(x)
                     .orient("bottom")
                     .tickPadding(0));
                     */

                    svg
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);

                    gridBackground
                        .transition()
                        .attr("width", width)
                        .attr("height", height);

                    var layer = layers.selectAll('.layer')
                        .data(scope.layers)
                        .enter()
                        .append('g')
                        .attr('class', 'layer');

                    layer.selectAll('rect')
                        .data(function (layer) {
                            return layer;
                        })
                        .enter()
                        .append('rect')
                        .attr('x', function (d) {
                            return x(d[0]);
                        })
                        .attr('width', function (d) {
                            return x(d[1]) - x(d[0]);
                        })
                        .attr('height', height);

                    if (scope.activeLayerId !== undefined)
                        newBrush(brushesContainer);

                };

                scope.$watch('layers', update);
                scope.$watch('activeLayerId', update);
                scope.$watch('width', update);
                scope.$on('resize', update);

            }); //end promises
        } //end link function
    };
};

