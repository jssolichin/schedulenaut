/**
 *
 * Created by Jonathan on 2/8/2015.
 */
'use strict';

module.exports = function ($scope, eventsService, brushesService, $state) {

    var placeholders = ['Create a new event...', 'Name your event...'];

    var removeExtendedForm = function () {
        $(document).off('mousedown.hideExtendedForm');
        $scope.placeholder = placeholders[0];
        $scope.formExpanded = false;

        $scope.$apply();
    };

    $scope.event = {public: true};

    $scope.formExpanded = false;

    $scope.placeholder = placeholders[0];

    $scope.addFormHider = function () {
        $(document).on('mousedown.hideExtendedForm', function (event) {
            if (!$(event.target).closest('form').length) {
                removeExtendedForm();
            }
        });
        $scope.placeholder = placeholders[1];
    };

    $scope.submitData = function (event) {
        var p = eventsService.create(event);
        p.then(function (d) {
            $state.go('event', {id: d.id});
        });
    };

    $('#calendar').datepicker({
        startDate: new Date(),
        multidate: true,
        todayHighlight: true
    })
        .on('changeDate', function () {
            $scope.event.dates = $(this).datepicker('getDates');
            $scope.$apply();
        });


};
