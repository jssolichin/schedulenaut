'use strict';

var schedulenaut = angular.module('schedulenaut', [
    require('./scheduler').name
]);

schedulenaut.controller('main', function ($scope) {
    $scope.who = 'world';
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;

    var startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);


    $scope.dates = [startDate];

    for(var i = 1; i <= 7; i++){
        var lastDate = $scope.dates[i-1].getTime();
        var nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate()+1);

        $scope.dates.push(nextDate);
    }

});
