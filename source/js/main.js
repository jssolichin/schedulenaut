var schedulenaut = angular.module('schedulenaut', [
    'multipleDatePicker',
    'ui.router',
    require('./scheduler').name
])
    .controller('mainController', function ($scope, $rootScope) {
        var resizeDelay = 250;
        window.resizeEvt = undefined;

        var resizeHandler = function () {
            clearTimeout(window.resizeEvt);
            window.resizeEvt = setTimeout(function () {
                $scope.$apply(function () {
                    $rootScope.$broadcast('resize', true);
                });
                //code to do after window is resized
            }, resizeDelay);
        };

        window.addEventListener('resize', resizeHandler, true);
        $scope.$on('requestWindowSize', resizeHandler);

    })
    .config(require('./common/routes'));
