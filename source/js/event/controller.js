/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function ($window, event, eventsService, helpers, $scope, $rootScope, $q, $filter, $state) {


    $scope.event = event;
    $scope.event.open = JSON.parse(event.open);
    $scope.isEventClosed = function (){
        return !event.open;
    };

    //When we edit an event properties, upload it to server
    $scope.updateEvent = function (obj) {
        if (obj !== undefined) {
            for (var key in obj) {
                event[key] = obj[key];
            }
        }

        eventsService.update(event);
    };

    $scope.reloadView = function (){
        $state.reload();
    };
    
};
