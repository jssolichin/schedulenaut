/**
 * Created by Jonathan on 2/3/2015.
 */
'use strict';

module.exports = function ($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/index");
    //
    // Now set up the states
    $stateProvider
        .state('index', {
            url: "/index",
            templateUrl: "public/partials/index.html",
            controller: require('../index/controller')
        })
        .state('scheduler', {
            url: "/scheduler",
            templateUrl: "public/partials/scheduler.html",
            controller: require('../scheduler/controller')
        })
        .state('event', {
            url: "/event/:id",
            resolve: {
                event: ['$stateParams', 'eventsService',
                    function ($stateParams, eventsService) {
                        return eventsService.get($stateParams);
                    }],
                allLayers: ['$stateParams', 'brushesService', '$q',
                    function ($stateParams, brushesService, $q) {
                        var p = $q.defer();

                        //Date objects are stored in string in sqlite, we need to convert it back to date objects
                        var serverData = brushesService.withEvent($stateParams.id);
                        serverData.then(function (layersPromise) {
                            layersPromise.data.forEach(function (layer) {
                                layer.data = JSON.parse(layer.data);
                                layer.data.forEach(function (day) {
                                    day.forEach(function (brush) {
                                        brush[0] = new Date(brush[0]);
                                        brush[1] = new Date(brush[1]);
                                    });
                                });
                            });
                            p.resolve(layersPromise.data);
                        });

                        return p.promise;
                    }]
            },
            templateUrl: "public/partials/event.html",
            controller: require('../event/controller')
        })
        .state('about', {
            url: "/about",
            templateUrl: "public/partials/about.html"
        });
};
