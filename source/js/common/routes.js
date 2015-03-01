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
                        return eventsService.getEvent($stateParams);
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
