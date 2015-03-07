/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function (event, allLayers, usersService, eventsService, brushesService, $scope, $rootScope) {

    //options
    $scope.selectedGranularity = 60;

    //list of users on this event
    usersService.withEvent(event.data.id).then(function (users) {
        $scope.users = users.data;
    });

    //list of layers on this event
    $scope.allLayers = allLayers;

    //index of layer to be modified from allLayers
    $scope.activeLayerId = undefined;

    $scope.event = event.data;

    var activeLayer = {event_id: event.data.id};

    var refreshAllLayers = function (callback) {
        brushesService.withEvent(event.data.id).then(function (d) {
            d.data.forEach(function (layer) {
                layer.data = JSON.parse(layer.data);
            });
            $scope.allLayers = d.data;
            callback(d);
        });
    };
    var createLayer = function (user_id) {
        activeLayer.data = [];

        brushesService.create(activeLayer).then(function (layerId) {
            refreshAllLayers(function (d) {
                $scope.allLayers = d.data;
                $scope.activeLayerId = $scope.allLayers.map(function (d) {
                    return d.id;
                }).indexOf(layerId);

                activeLayer.user_id = user_id;
                //id of layer in database
                activeLayer.id = layerId;
            });
        });

    };

    $scope.createUser = function () {
        var user = {name: $scope.user.name, event_id: event.data.id, brushes_id: -1};
        user = usersService.create(user);

        user.then(function (user_id) {
            createLayer(user_id);
            //TODO: update user's brush_id once layer is created
        });
    };

    //When we finish brushing, this callback will upload to server
    $scope.endBrush = function () {

        //We just need to store the brush extent, and not the who brush function
        var x = $scope.allLayers[$scope.activeLayerId].data.map(function (d) {
            return d.map(function (d) {
                return d.extent();
            });
        });

        activeLayer.data = JSON.stringify(x);

        //send it to the server
        brushesService.update(activeLayer);
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
