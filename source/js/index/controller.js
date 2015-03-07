/**
 *
 * Created by Jonathan on 2/8/2015.
 */
'use strict';

module.exports = function ($scope, eventsService, brushesService, $state) {
    $scope.event = {};

    $('#calendar').datepicker({
        startDate: new Date(),
        multidate: true,
        todayHighlight: true
    })
        .on('changeDate', function () {
            $scope.event.dates = $(this).datepicker('getDates');
            $scope.$apply();
        });

    $scope.submitData = function (event) {
        var p = eventsService.create(event);
        p.then(function (d) {
            $state.go('event', {id: d.id});
        });
    };
};
