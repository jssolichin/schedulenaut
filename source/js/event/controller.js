/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function ($window, event, allLayers, discussion, usersService, eventsService, brushesService, discussionsService, helpers, $scope, $rootScope, $q, $filter, eventHelpers ) {

	var usersBlockHovered = [];

	$scope.isUsersBlockHovered = function (){
		return usersBlockHovered.indexOf(this.user.id) >= 0;
	};

	$scope.$on('highlightUser', function (event,data){
		if(!eventHelpers.arrayIsEqual(usersBlockHovered, data)){
			usersBlockHovered = data;
			$scope.$apply();
		}
	});

	$scope.highlightUserBlocks = function (){
		$scope.$broadcast('highlightUserBlocks', {id: parseInt(this.user.brushes_id), highlight: true});
	};

	$scope.dehighlightUserBlocks = function (){
		$scope.$broadcast('highlightUserBlocks', {id: parseInt(this.user.brushes_id), highlight: false});
	};

    $scope.$on('$dropletReady', function whenDropletReady() {
        $scope.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif']);
        $scope.interface.setRequestUrl('api/saveimage');
    });

    $scope.preferred = true;
    $scope.changeBrushPreference = function () {
        $scope.preferred = !$scope.preferred;
    };

    $scope.messages = discussion;
    $scope.updateDiscussion = function () {
        discussionsService.updateWithEvent($scope.messages);
    };
    $scope.sendMessage = function () {
        $scope.messages.data.push(
            {
                id: $scope.messages.data.length,
                user: $scope.activeLayerId,
                content: $scope.newMessage.content,
                timestamp: new Date()
            });
        $scope.newMessage.content = '';
        $scope.updateDiscussion();
    };
    $scope.starIt = function (id) {
        if ($scope.messages.star === undefined)
            $scope.messages.star = [];

        if ($scope.messages.star.indexOf(id) < 0) {
            $scope.messages.star.push(id);
            $scope.messages.data[id].star = true;
        }
        else {
            $scope.messages.star.splice($scope.messages.star.indexOf(id), 1);
            $scope.messages.data[id].star = false;
        }
    };
    $scope.highlightMessage = function (id) {
        var elId = '#message-' + id;
        $scope.bounce(elId);
    };

    $scope.bounce = function (elId) {
        var wrapper = $(elId);

        wrapper[0].scrollIntoView(true);
        wrapper.addClass('animated bounce');
        wrapper.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            wrapper.removeClass('animated bounce');
        });

    };

    $scope.timezones = event.timezones;

    //template for newUser
    $scope.newUser = {event_id: event.id, brushes_id: -1};

    //options
    $scope.selectedGranularity = 60;

    //list of users on this event
    usersService.withEvent(event.id).then(function (users) {
        $scope.users = users.data;
    });

    //list of layers on this event
    $scope.allLayers = allLayers;

    //index of layer to be modified from allLayers
    $scope.activeLayerId = undefined;

    $scope.event = event;

    $scope.addTimezone = function () {
        $scope.timezones.unshift({zone: undefined, id: $scope.timezones.length});
        $scope.updateEvent();
    };

    var activeLayer = {event_id: event.id};

    var refreshUsers = function (callback) {
        usersService.withEvent(event.id).then(function (users) {
            $scope.users = users.data;

            if (callback)
                callback(users.data);
        });
    };
    var refreshAllLayers = function (callback) {
        brushesService.withEvent(event.id).then(function (layersPromise) {
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

    //Deals with exit editing, or opening popover
    $scope.editHandler = function () {

        var brushes_id = parseInt(this.user.brushes_id);
        var indexInallLayers = $scope.allLayers.map(function (d) {
            return d.id;
        }).indexOf(brushes_id);

        if ($scope.activeLayerId == indexInallLayers)
            $scope.activeLayerId = undefined;
        else {
            $scope.$broadcast('open-' + this.$index);
            document.getElementById('secret').focus();
        }
    };

    //Authenticate user and activate layer if authorized
    $scope.editUser = function (user, secretWord, $index) {

        var wrapper = $('#popover-user-' + $index);
        var serverResponse = usersService.checkSecret(user.id, secretWord);
        serverResponse.then(function (d) {
            if (d.authenticated) {
                var indexInallLayers = $scope.allLayers.map(function (d) {
                    return d.id;
                }).indexOf(parseInt(user.brushes_id));

                activeLayer.id = user.brushes_id;
                activeLayer.user_id = user.id;
                $scope.activeLayerId = indexInallLayers;

                $scope.$broadcast('close-' + $index);
            }
            else {
                wrapper.addClass('animated shake');
                wrapper.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    wrapper.removeClass('animated shake');
                });
            }
        });

    };

    $scope.createUser = function () {
        var user_id_promise = usersService.create($scope.newUser);

        user_id_promise.then(function (user_id) {
            var brushes_id_promise = createLayer(user_id);
            brushes_id_promise.then(function (d) {
                var user = {};
                user.id = user_id;
                user.brushes_id = d;
                usersService.update(user);

                refreshUsers();
            });
        });

        //reset the form
        $scope.newUser = {name: undefined, secret: undefined, email: undefined};
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


    $scope.hideUser = function ($index) {

        //first time we toggle, we turn it off
        if ($scope.allLayers[$index].visible === undefined)
            $scope.allLayers[$index].visible = false;
        else
            $scope.allLayers[$index].visible = !$scope.allLayers[$index].visible;

        $scope.$broadcast('updateLayers');
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
    $scope.updateEvent = function (obj) {
        if (obj !== undefined) {
            for (var key in obj) {
                event[key] = obj[key];
            }
        }

        eventsService.update(event);
    };

    //make available the list of dates
    $scope.dates = event.dates;

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

    $scope.runDatepicker = function () {
        var $datepickerEl = $('#datepicker');

        $datepickerEl.datepicker({
            startDate: new Date(),
            multidate: true,
            todayHighlight: true
        });

        //only need to do once, after the first time, it has been populated and event listener set
        if ($datepickerEl.datepicker('getDates').length === 0) {

            //if current list of dates not empty, show that on the datepicker
            if ($scope.dates.length !== 0)
                $datepickerEl
                    .datepicker('setDates', $scope.dates);

            //set event listener to updates list of dates if datepicker is changed
            $datepickerEl
                .on('changeDate', function () {
                    $scope.dates = $(this).datepicker('getDates');

                    $scope.$apply();

                    //retranspose layers to include new dates
                    $scope.$broadcast('updateLayers');

                    //send new dates to server
                    event.dates = $scope.dates;
                    $scope.updateEvent();
                });
        }

        $datepickerEl.on('$destroy', function () {
            $(this).datepicker('remove');
        });

    };
};
