'use strict';

require('angular');

var schedulenaut = angular.module('schedulenaut', [
    require('./scheduler').name
]);

schedulenaut.controller('main', function ($scope) {
    $scope.who = 'world';
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
});
