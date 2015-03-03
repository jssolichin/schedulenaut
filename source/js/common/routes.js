/**
 * Created by Jonathan on 2/3/2015.
 */
'use strict';

module.exports = function($stateProvider, $urlRouterProvider) {
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
                    function($stateParams, eventsService) {
                        return eventsService.get($stateParams);
                    }],
                previousExtents: ['$stateParams', 'brushesService', '$q',
                    function ($stateParams, brushesService, $q) {
                        var p = $q.defer();

                        //Date objects are stored in string in sqlite, we need to convert it back to date objects
                        var serverData = brushesService.get($stateParams);
                        serverData.then(function (stringTime) {
                            var convertedExtent = JSON.parse(stringTime.data.data).map(function (day) {
                                return day.map(function (block) {
                                    return block.map(function (extent) {
                                        return new Date(extent);
                                    });
                                });
                            });
                            p.resolve(convertedExtent);
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
