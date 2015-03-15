var schedulenaut = angular.module('schedulenaut', [
        'ui.router',
        'xeditable',
        'ngFx',
        require('./scheduler').name
    ],
    require('./common/http-request-transformer'))
    .controller('mainController', function ($scope, $rootScope, $state) {
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

        $scope.$state = $state;
    })
    .config(require('./common/routes'));
