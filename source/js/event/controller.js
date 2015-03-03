/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function (event,previousExtents,  eventsService, brushesService, $scope, $rootScope) {

    //options
    $scope.selectedGranularity = 60;

    $scope.brushes = {event_id: event.data.id, user_id: '-1', data: []};
    $scope.event = event.data;
    $scope.previousExtents = previousExtents;

    //When we finish brushing, this callback will upload to server
    $scope.endBrush = function () {

        //We just need to store the brush extent, and not the who brush function
        var x = $scope.brushes.data.map(function (d) {
            return d.map(function(d){return d.extent();});
        });

        //send it to the server
        brushesService.update({event_id: event.data.id, data: x});
    };

    //When we edit an event properties, upload it to server
    $scope.updateEvent = function () {
        eventsService.update(event.data);
    };

    //convert date string stored on server into date objects
    $scope.dates = JSON.parse(event.data.dates).map(function (d) {
        return new Date(d);
    });

    $scope.optionGranularity = [
        {
            name: '15 minutes',
            value: 15
        },
        {
            name: 'half-hour',
            value: 30
        },
        {
            name: 'hour',
            value: 60
        }
    ];

};
