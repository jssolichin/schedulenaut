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

                var newBrush = function (container, i, previousExtent) {
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
                            var edge = helpers.getEdge(brush, scope.layers[scope.activeLayerId].data);

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
                        var lastBrushExtent = scope.layers[scope.activeLayerId].data[scope.layers[scope.activeLayerId].data.length - 1].extent();
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

                            for (var i = 0; i < scope.layers[scope.activeLayerId].data.length - 1; i++) {
                                var otherBrush = scope.layers[scope.activeLayerId].data[i];
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
                        newScope.edge = helpers.getEdge(brush, scope.layers[scope.activeLayerId].data);
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
                            if (scope.layers[scope.activeLayerId].data[i] == brush)
                                scope.layers[scope.activeLayerId].data.splice(i, 1);
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

                    if (previousExtent)
                        brush.extent(previousExtent);

                    brush.preferred = true;

                    if (!isNaN(i))
                        scope.layers[scope.activeLayerId].data[i] = brush;
                    else
                        scope.layers[scope.activeLayerId].data.unshift(brush);

                    var gBrush = container.selectAll('.brush')
                        .data(scope.layers[scope.activeLayerId].data);

                    gBrush.enter()
                        .insert("g", '.brush')
                        .on('click', function () {
                            d3.event.stopPropagation();
                        });

                    gBrush
                        .attr("class", function (brush) {
                            if (brush && Object.prototype.toString.call(brush) == '[object Function]')
                                brush(d3.select(this));
                            return brush.preferred ? 'brush preferred' : 'brush';
                        });

                    //TODO: make sure pointer events is correct and that creating a new brush np.
                    //or some reason the select on background causes it not to work
                    //We need to somehow set background of set brushes to pointer events none
                    /*
                     .select('.background')
                     .style('pointer-events', function (d) {
                     console.log(this)
                     return 'all'
                     return d.extent()[0].getTime() == d.extent()[1].getTime() ? 'all' : 'none';
                     });
                     */


                    gBrush.exit()
                        .remove();

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
                        .data(function () {
                            var data;

                            //If there is an active layer, we need to remove it from the regular layer stack
                            if (scope.activeLayerId !== undefined) {
                                data = scope.layers.slice(0);
                                data.splice(scope.activeLayerId, 1);
                            }
                            else if (scope.layers)
                                data = scope.layers;
                            else
                                data = [];

                            return data;
                        }, function (d) {
                            return d.id;
                        });

                    layer
                        .enter()
                        .append('g')
                        .attr('class', 'layer');

                    layer.exit()
                        .remove();

                    layer.selectAll('rect')
                        .data(function (layer) {
                            return layer.data;
                        })
                        .enter()
                        .append('rect')
                        .attr('x', function (brush) {
                            if (brush && Object.prototype.toString.call(brush) == '[object Function]')
                                return x(brush.extent()[0]);
                            else
                                return x(brush[0]);
                        })
                        .attr('width', function (brush) {
                            if (brush && Object.prototype.toString.call(brush) == '[object Function]')
                                return x(brush.extent()[1]) - x(brush.extent()[0]);
                            else
                                return x(brush[1]) - x(brush[0]);
                        })
                        .attr('height', height);

                    //If we are editing a layer (activeLayerId is not undefined) then we need to add the brushes from those layers
                    if (scope.activeLayerId !== undefined && scope.layers[scope.activeLayerId] !== undefined) {
                        var extents = scope.layers[scope.activeLayerId].data;

                        //If there is some brush, check if the top layer is empty--if it is, don't add a new empty brush
                        if (extents.length > 0) {
                            var lastBrushExtent = helpers.getExtent(extents[extents.length - 1]);
                            if (lastBrushExtent[0].getTime() !== lastBrushExtent[1].getTime())
                                newBrush(brushesContainer);
                        }
                        else
                            newBrush(brushesContainer);
                        //add all the brushes from that layer
                        extents.forEach(function (previousExtent, i) {
                            previousExtent = helpers.getExtent(previousExtent);
                            newBrush(brushesContainer, i, previousExtent);
                        });

                    }

                };

                scope.$watch('layers', update);
                scope.$watch('activeLayerId', update);
                scope.$watch('width', update);
                scope.$on('resize', update);

            }); //end promises
        } //end link function
    };
};

