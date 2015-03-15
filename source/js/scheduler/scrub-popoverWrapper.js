/**
 * Created by Jonathan on 2/20/2015.
 */

'use strict';

module.exports = function (d3Provider, momentProvider, $q) {
    return {
        restrict: 'C',
        templateUrl: 'public/directives/scrub-popoverWrapper.html',
        link: function (scope, element, attrs) {
            scope.y = -1 * (parseInt(element[0].offsetHeight)) + 7 + 'px';

            scope.$watch("x", function () {

                element
                    .css('left', (scope.x + 7) + 'px')
                    .css('top', scope.y);
            });

            var option = {
                'showDuration': true,
                'timeFormat': 'g:ia',
                'appendTo': element,
                'step': scope.step
            };

            var boundToEdge = function (time) {
                var finalTime = time;

                if (scope.edge[1] !== undefined && time.getTime() > scope.edge[1].getTime())
                    finalTime = scope.edge[1];
                if (scope.edge[0] !== undefined && time.getTime() < scope.edge[0].getTime())
                    finalTime = scope.edge[0];

                return finalTime;
            };

            var removePopover = function () {
                $(document).off('mousedown.popoverCloser');
                element.remove();
            };

            $('.time-picker .time').timepicker(option);

            $('.time-picker .start')
                .timepicker('setTime', scope.start)
                .timepicker('option', 'minTime', scope.edge[0])
                .timepicker('option', 'showDuration', false);

            $('.time-picker .end')
                .timepicker('option', 'maxTime', scope.edge[1])
                .timepicker('setTime', scope.end);

            $('.time-picker input')
                .on('changeTime timeRangeError', function (a) {
                    var isEnd = $(this).hasClass('end');

                    var selectedTime;
                    if (isEnd)
                        selectedTime = $(this).timepicker('getTime', scope.end);
                    else
                        selectedTime = $(this).timepicker('getTime', scope.start);

                    var boundedTime = boundToEdge(selectedTime);
                    $(this).timepicker('setTime', boundedTime);
                });

            $('.time-picker')
                .on('rangeSelected', function () {
                    scope.start = $('.time-picker .start').timepicker('getTime', scope.start);
                    scope.end = $('.time-picker .end').timepicker('getTime', scope.end);
                    scope.$apply();
                });

            $(document).on('mousedown.popoverCloser', function (event) {
                if (!$(event.target).closest(element[0]).length)
                    removePopover();
            });

            var datepair = new Datepair($('.time-picker')[0]);
            datepair.option('anchor', scope.link);

            scope.changeLink = function () {
                scope.link = scope.link == 'start' ? null : 'start';
                datepair.option('anchor', scope.link);
            };

            scope.deleteBrush = function () {
                scope.$emit('deleteBrush', true);
                removePopover();
            };
        }
    };
};
