/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function (event, $scope, $rootScope){
    $scope.name = event.data.name;
    $scope.description = event.data.description || "Add a Description";
    $scope.dates = eval(event.data.dates).map(function(d){return new Date(d);});

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
};
