/**
 * Created by Jonathan on 2/16/2015.
 */

'use strict';

module.exports = function (d3Provider, $q) {
    return {
        restrict: 'C',
        scope: {
            height: '=',
            granularity: '=',
            dates: '=',
            onEnd: '=',
            allLayers: '=',
            activeLayerId: '=',
            timezones: '=',
            onTimezoneChange: '=',
            preferred: '=',
            importedLayers: '='
        },
        templateUrl: 'public/directives/calendar.html',
        link: function (scope, element, attrs) {

            scope.removeTimezone = function () {
                scope.timezones.splice(this.$index, 1);
                scope.$parent.updateEvent();
            };

            d3Provider.d3().then(function (d3) {

                //We store data in the server per user to make it relational to the user table than events.
                //However, since each scrubber is seperate, we need to give each scrubber all users on that specific date.
                //So we need to transpose our layers list
                //Similarly, in imported calendars, each calendar source is equivalent to a user
                var groupByDay = function (groupedByType){
                   
                    //add "brushWrappers" array for every date to store brushes extent
                    groupedByType.forEach(function (layers) {
                        while (layers.data.length < scope.dates.length)
                            layers.data.push([]);
                    });

                    //transpose the layers so we group by date, than by users/calendar
                    var transposed = d3.transpose(groupedByType.map(function (layers) {
                        return layers.data;
                    }));

                    //Add again relevant brush data to the transposed data
                    var temp = [];
                    transposed.forEach(function (day, i) {
                        temp[i] = [];
                        day.forEach(function (layer, j) {

                            //brushes from schedulenaut has a visible property, whereas imported calendars has a color property
                            if(groupedByType[j].visible)
                                temp[i][j] = {id: scope.allLayers[j].id, data: layer, visible: scope.allLayers[j].visible};
                            else
                                temp[i][j] = {id: groupedByType[j].id, data: layer, color: groupedByType[j].color};
                        });
                    });

                    return temp;
                };

                var transposeLayers = function () {
                    scope.transposed = groupByDay(scope.allLayers);
                };

                //whenever there is a layer list change, we need to update our transposed layer list
                scope.$watch(function () {
                    return scope.allLayers.length;
                }, transposeLayers);

                scope.$on('updateLayers', function () {
                    transposeLayers();
                });

                //Imported Layers Data
                var transposeImports = function (){
                    scope.transposedImportedLayers = groupByDay(scope.importedLayers);
                    scope.$apply();
                };

                scope.$on('calendarsImported.change', transposeImports);

                //Calendar DOM

                var el = d3.select(element[0]);
                var rule = el.append('div')
                    .attr('class', 'rule');
                var tooltip = rule.append('div')
                    .attr('class', 'tooltip');
                var mouseX = 0;

                var margin = {top: 0, right: 0, bottom: 0, left: 0};
                var tooltipOffsetY = -30;

                var beginTime = new Date();
                beginTime.setHours(0);
                beginTime.setMinutes(0);
                beginTime.setSeconds(0);
                var endTime = new Date(beginTime.getTime());
                endTime.setDate(beginTime.getDate() + 1);
                endTime.setHours(beginTime.getHours() - 1);
                endTime.setMinutes(59);

                scope.x = d3.time.scale()
                    .domain([beginTime, endTime])
                    .clamp(true);

                var timeFormat = d3.time.format('%I:%M %p');

                /** Time Tooltip **/
                var mouseenter = function () {
                    rule.style('display', 'block');

                    scope.$broadcast('showTooltip');
                };
                var mouseover = function ($event) {
                    var td = d3.select(this).node();
                    mouseX = d3.mouse(this)[0] + td.offsetLeft;
                    var truePos = mouseX - margin.left - td.offsetLeft;
                    var rawTime = scope.x.invert(truePos);
                    var formattedTime = timeFormat(rawTime);

                    tooltip
                        .style('top', function () {
                            var posY = td.offsetTop + d3.event.offsetY + tooltipOffsetY;
                            return posY + 'px';
                        })
                        .style('opacity', function () {
                            var posY = td.offsetTop + d3.event.offsetY + tooltipOffsetY;

                            var tBodyTop = $(element[0]).find('tbody')[0].offsetTop - 15;
                            return posY < tBodyTop ? 0 : 1;
                        })
                        .html(formattedTime);

                    rule
                        .style('left', mouseX + 'px')
                        .style('display', 'block');

                    scope.$broadcast('moveTooltip', {timeFormat: timeFormat, truePos: truePos});

                };
                var mouseleave = function () {
                    rule.style('display', 'none');

                    scope.$broadcast('hideTooltip');
                };
                /*
                 var mouseUpdate = function () {
                 rule.transition()
                 .duration(5)
                 .ease('cubic-in-out')
                 .style('left', mouseX + 'px');
                 };
                 setInterval(mouseUpdate, 35);
                 */

                var hoverTime;

                var setUpHoverTime = function () {

                    hoverTime = d3.selectAll('.hover-time');

                    hoverTime
                        .on('mouseenter', mouseenter)
                        .on('mousemove', mouseover)
                        .on('mouseleave', mouseleave);

                };

                /** draw time axis **/
                var update = function () {

                    setUpHoverTime();

                    scope.width = element[0].offsetWidth - hoverTime.node().offsetLeft;
                    scope.x
                        .range([0, scope.width]);

                };

                scope.$watch('width', update);
                scope.$on('resize', update);
            });

        }
    };
};
