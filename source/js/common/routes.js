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
            templateUrl: "public/partials/event.html",
            controller: require('../event/controller'),
            resolve: {
                redirect: ['$stateParams', 'eventsService', '$state', '$rootScope',
                    function($stateParams, eventsService, $state, $rootScope) {
                        var isOpenPromise = eventsService.get($stateParams, 'open');

                        isOpenPromise.then(function(data) {
                            var isOpen = JSON.parse(data.data.open);

                            var redirectLogicListener = $rootScope.$on('$stateChangeSuccess',
                                function(event, toState, toParams, fromState, fromParams) {

                                        if(isOpen){
                                            if(toState.name == 'event' || toState.name == 'event.invitation')
                                                $state.go('event.editing', $stateParams);
                                        }
                                        else {
                                            if (toState.name !== 'event.invitation' )
                                                $state.go('event.invitation', $stateParams);
                                        }

                                    redirectLogicListener();
                                }
                            );
                        });
                    }
                ],
				globalHelpers: ['global.helpers', function (globalHelpers){
					return globalHelpers;
				}],
                event: ['$stateParams', 'eventsService', '$q', 'global.helpers',
                    function($stateParams, eventsService, $q, globalHelpers) {
                        var p = $q.defer();
                        var serverData = eventsService.get($stateParams);

                        serverData.then(function(event) {

                            if (event.data.dates === null)
                                event.data.dates = [];
                            else
                                event.data.dates = JSON.parse(event.data.dates).map(function(d) {
                                    return new Date(d);
                                });

                            if(event.data.time !== null){
                                event.data.time = JSON.parse(event.data.time);
                                for(var key in event.data.time){
                                    if(event.data.time[key] !== null)
                                        event.data.time[key] = new Date(event.data.time[key]);
                                    else 
                                        event.data.time[key] = undefined;
                                }

                            }

                            if(event.data.details_confirmed === null)
                                event.data.details_confirmed = {};
                            else {
                                event.data.details_confirmed = JSON.parse(event.data.details_confirmed);
                            }

                            if (event.data.timezones === null)
                                event.data.timezones = [{
                                    zone: undefined,
                                    id: 0
                                }];
                            else
                                event.data.timezones = JSON.parse(event.data.timezones);

                            if (event.data.event_settings === null)
                                event.data.event_settings = {};
                            else
                                event.data.event_settings = JSON.parse(event.data.event_settings);

                            //sqlite stores undefined as null--we need to convert it back
                            var unNullifed = globalHelpers.unNullify(event.data);
                            p.resolve(unNullifed);
                        });

                        return p.promise;
                    }
                ]
            }
        })
        .state('event.editing', {
            views: {
                'content': {
                    controller: require('../event/controller.editing'),
                    templateUrl: "public/partials/event.editing.html",
                    resolve: {
                        allLayers: ['$stateParams', 'brushesService', '$q',
                            function($stateParams, brushesService, $q) {

                                var p = $q.defer();

                                //Date objects are stored in string in sqlite, we need to convert it back to date objects
                                var serverData = brushesService.withEvent($stateParams.id);
                                serverData.then(function(layersPromise) {
                                    brushesService.parse(layersPromise);
                                    p.resolve(layersPromise.data);
                                });

                                return p.promise;
                            }
                        ],
                        discussion: ['$stateParams', 'discussionsService', '$q', 'global.helpers',
                            function($stateParams, discussionsService, $q, globalHelpers) {
                                var p = $q.defer();
                                var serverData = discussionsService.withEvent($stateParams);

                                serverData.then(function(discussion) {

                                    if (discussion.data.data === null)
                                        discussion.data.data = [];
                                    else
                                        discussion.data.data = JSON.parse(discussion.data.data);

                                    if (discussion.data.star === null)
                                        discussion.data.star = [];
                                    else
                                        discussion.data.star = JSON.parse(discussion.data.star);

                                    //sqlite stores undefined as null--we need to convert it back
                                    p.resolve(discussion.data);
                                });

                                return p.promise;
                            }
                        ]
                    }
                }
            }
        })
        .state('event.invitation', {
            views: {
                'content': {
                    templateUrl: "public/partials/event.invitation.html",
                    controller: require('../event/controller.invitation'),
                }
            },
        })
        .state('about', {
            url: "/about",
            templateUrl: "public/partials/about.html"
        });
};
