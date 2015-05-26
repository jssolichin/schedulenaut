var schedulenaut = angular.module('schedulenaut', [
        'ui.router',
        'xeditable',
        'ngFx',
        'ui.select',
        'ngSanitize',
        'ngDroplet',
        require('./scheduler').name,
        require('./event').name
    ],
    require('./common/http-request-transformer'))
    .controller('mainController', ['$scope', '$rootScope', '$state', 'eventsService', function ($scope, $rootScope, $state, eventsService) {
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

        $scope.event = {
            public: true,
            event_settings: {editableEveryone: true, inviteEveryone: true, timezoneEveryone: true, availableDatesEveryone: true}
        };

        $scope.scheduleEvent = function () {
            var p = eventsService.create($scope.event);
            p.then(function (d) {
                $state.go('event', {id: d.id});
            });
        };
    }])
    .config(require('./common/routes'))
    .config(function ($locationProvider) {
        $locationProvider.html5Mode(true);
    });


