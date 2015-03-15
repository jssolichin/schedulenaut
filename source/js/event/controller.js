/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function (event, allLayers, usersService, eventsService, brushesService, helpers, $scope, $rootScope, $q) {

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

    var refreshUsers = function (callback) {
        usersService.withEvent(event.data.id).then(function (users) {
            $scope.users = users.data;

            if (callback)
                callback(users.data);
        });
    };
    var refreshAllLayers = function (callback) {
        brushesService.withEvent(event.data.id).then(function (layersPromise) {
            brushesService.parse(layersPromise);
            $scope.allLayers = layersPromise.data;

            if (callback)
                callback(layersPromise);
        });
    };
    var createLayer = function (user_id) {
        var promise = $q.defer();

        activeLayer.user_id = user_id;
        activeLayer.data = [];

        brushesService.create(activeLayer).then(function (layerId) {
            refreshAllLayers(function (d) {
                //id of layer in local layers stack
                $scope.activeLayerId = $scope.allLayers.map(function (d) {
                    return d.id;
                }).indexOf(layerId);

                //id of layer in server
                activeLayer.id = layerId;

                promise.resolve(layerId);

            });
        });

        return promise.promise;
    };

    $scope.createUser = function () {
        var user = {name: $scope.user.name, event_id: event.data.id, brushes_id: -1};
        var user_id_promise = usersService.create(user);

        user_id_promise.then(function (user_id) {
            var brushes_id_promise = createLayer(user_id);
            brushes_id_promise.then(function (d) {

                user.id = user_id;
                user.brushes_id = d;
                usersService.update(user);
            });
        });
    };

    $scope.deleteUser = function () {
        var user_id = parseInt(this.user.id);
        var brushes_id = parseInt(this.user.brushes_id);

        usersService.delete({id: user_id});
        brushesService.delete({id: brushes_id});

        refreshAllLayers();
        refreshUsers();

        $scope.activeLayerId = undefined;

    };

    $scope.editUser = function () {

        var brushes_id = parseInt(this.user.brushes_id);
        activeLayer.id = brushes_id;
        activeLayer.user_id = this.user.id;

        $scope.activeLayerId = $scope.allLayers.map(function (d) {
            return d.id;
        }).indexOf(brushes_id);

    };

    //When we finish brushing, this callback will upload to server
    $scope.endBrush = function () {

        //We just need to store the brush extent, and not the who brush function
        var x = $scope.allLayers[$scope.activeLayerId].data.map(function (brushWrappers) {
            return brushWrappers.map(function (brushWrapper, i) {
                return {
                    id: brushWrapper.id,
                    preferred: brushWrapper.preferred,
                    brush: helpers.getExtent(brushWrapper.brush)
                };
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
