/**
 * Created by Jonathan on 2/8/2015.
 */
'use strict';
module.exports = function ($scope, $rootScope) {

    $scope.optionGranularity = [
        {
            name: '15 minutes',
            value: 15
        },
        {
            name: 'half-hour',
            value: 30
        },
        {
            name: 'hour',
            value: 60
        }
    ];

    $scope.selectedGranularity = 60;

    var startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);

    $scope.dates = [startDate];

    for (var i = 1; i <= 7; i++) {
        var lastDate = $scope.dates[i - 1].getTime();
        var nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 1);

        $scope.dates.push(nextDate);
    }

    $scope.$emit('requestWindowSize', true);

};
