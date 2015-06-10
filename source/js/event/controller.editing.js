/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function ($window, event, allLayers, discussion, mailServices, usersService, eventsService, brushesService, discussionsService, helpers, $scope, $rootScope, $q, $filter, eventHelpers ) {
    //TODO: break this up lol
    //TODO: use global.helpers bounce

	//Help
    var checkAllUserHasPassword = function (){
        var allHasPassword = false;

        $scope.users.forEach(function (user){
            allHasPassword = user.secret !== null;
        });

        return allHasPassword;

    };

    var checkAtLeastOneBrush = function (){
        var atLeastOneBrush = false;

        $scope.allLayers.forEach(function (layer){
            layer.data.forEach(function(day){
                if(day.length > 1 || day[0].brush[0].getTime() !== day[0].brush[1].getTime())
                    atLeastOneBrush = true;
            });
        });

        return atLeastOneBrush;
    };

    $scope.generateStepsStatus = function (){
        $scope.helpSteps = [
            {title: 'Set at least one possible date', helpElement: '#edit-dates-button', status: (event.dates && event.dates.length > 0)},
            {title: 'Invite at least one guest', helpElement: '#add-guests-button', status: ($scope.users && $scope.users.length > 0)},
            {title: 'Make sure all guests know and have access', helpElement: '#notify-all, #notify-all-disabled', status: checkAllUserHasPassword()},
            {title: 'Activate a user', helpElement: '#guests-list #edit', status: ($scope.activeLayerId !== undefined)},
            {title: 'Brush in time available', helpElement: '.calendar', status: checkAtLeastOneBrush()},
            {title: 'Set time of event', helpElement: '#event-detail-time', status: (event.time.startDate && event.time.startTime && event.time.endTime && event.time.endDate)},
            {title: 'Lock time information', helpElement: '#event-detail-time .ion-unlocked', status: (event.details_confirmed.time)},
            {title: 'Finalize event and invite', helpElement: '#event-status .combo-button', status: (!event.open)},
            {title: '(optional) Change who can edit what', helpElement: '#event-settings', status: (event.admin_pass)},
        ];
    };



    //Send Password
    $scope.notifyAllUsers = function ($event){

		console.log('notifying');
        //http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript  
        var randomPasswordGenerator = function (){
            var length = 5,
                charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }

            return retVal;
        };

        var eachMail = function (user){
            var passwordInfo;

            if(user.secret === null){
                var secret = randomPasswordGenerator(); 
                usersService.update({id: user.id, secret: secret});
                passwordInfo = secret;
            }
            else 
                passwordInfo = "<em>has been given to you</em>";

            var template = 
            	"<img src='http://schedulenaut.com/public/images/logo.png'><h1>Schedulenaut</h1>" + 
                "Hey " + user.name + ", <br>" + 
                "<br>" + 
                "You've been invited to <b>" + eventName + "</b>! Cool right? " + 
                "But, we need to know when you're available to have the best time for everybody. <br>" + 
                "<br>" + 
                "Lift off to <a href=http://schedulenaut.com/" + event.id  + ">the event page</a> and you can easily add your availability! <br>" + 
                "<br>" + 
                "Edit your information by editing your user by clicking on the pencil next to your username on the sidebar. Use the information below: <br>" +
                "<br>" + 
                "<b>USER: </b>" + user.name + "<br>" + 
                "<b>SECRET WORD: </b>" + passwordInfo + "<br>" + 
                "<br>" + 
                "Once you have signed in, you can click and drag on the calendar to mark your availability! <br>" + 
                "<br>" + 
                "Easy peasy right? <br>" + 
                "<br>" + 
                "Thanks!" + 
                "<br>" + 
                "Schedulenaut";

            mailServices.sendMail({
                to: user.email,
                subject: '[Schedulenaut] You have been invited to '  + eventName +  '! When are you available?',
                html: template 
            }).then(function (d){
                $($event.target).html('Message Sent!');
                $($event.target).attr('disabled', true);
            });

        };

        var eventName = event.name || 'an event!';
        $scope.users.forEach(function(user){
            eachMail(user);
        });
            
    };

    //Time Picker
	//TODO: When clear input, update time
    var startDateEl = $('#event-time-picker .date.start');
    var startTimeEl = $('#event-time-picker .time.start');
    var endTimeEl = $('#event-time-picker .time.end');
    var endDateEl = $('#event-time-picker .date.end');

    $('#event-time-picker .time').timepicker({
        'showDuration': true,
        'timeFormat': 'g:ia',
        'step': 30
    });

    $('#event-time-picker .date').datepicker({
        'format': 'm/d/yyyy',
        'autoclose': true
    });

    var eventTimePickerEl = document.getElementById('event-time-picker');
    var eventDatepair = new Datepair(eventTimePickerEl);

    startTimeEl
        .timepicker('option', 'showDuration', false);

    $('#event-time-picker')
        .on('rangeSelected', function () {
			//$scope.bounce('#event-status');
            $scope.updateEvent();
        });

    startDateEl.on('changeDate', function (){
        event.time.startDate = startDateEl.datepicker('getDate');
        event.time.startTime = startTimeEl.timepicker('getTime', new Date(event.time.startDate));
        $scope.updateEvent();
    });
    endDateEl.on('changeDate', function (){
        event.time.endDate = endDateEl.datepicker('getDate');
        event.time.endTime = endTimeEl.timepicker('getTime', new Date(event.time.endDate));
        $scope.updateEvent();
    });

    //deal with start time

    if(event.time.startTime !== undefined)
        startTimeEl.timepicker('setTime', event.time.startTime);
    if(event.time.endTime !== undefined)
        endTimeEl.timepicker('setTime', event.time.endTime);
    if(event.time.startDate !== undefined)
        startDateEl.datepicker('setDate', event.time.startDate);
    if(event.time.endDate !== undefined)
        startDateEl.datepicker('setDate', event.time.endDate);

    startTimeEl
        .on('changeTime', function (){
            var startTemp, endTemp;

            if(event.time.Time !== undefined)
                startTemp = startTimeEl.timepicker('getTime', new Date(event.time.startDate));
            else
                startTemp = startTimeEl.timepicker('getTime', new Date());

            event.time.startTime = startTemp;

            $scope.updateEvent({time: event.time});
        });

    endTimeEl
        .on('changeTime', function (){
            var startTemp, endTemp;

            if(event.time.Time !== undefined)
                endTemp = endTimeEl.timepicker('getTime', new Date(event.time.endDate));
            else
                endTemp = endTimeEl.timepicker('getTime', new Date());

            event.time.endTime = endTemp;

            $scope.updateEvent({time: event.time});
        });

    //Importer Module

    $scope.importedLayers = [];
    $scope.updateImported = function (){
        $scope.$broadcast('calendarsImported.change');
    };

    //User module

	$scope.sendEmail = function ($event, users, email){
        var to = users.map(function(d){return d.email;});
        var eventName = event.name || 'Event Notification';
		var content = "<img src='http://schedulenaut.com/public/images/logo.png'><h1>Schedulenaut</h1>" + 
		"A message has been sent from an <a href=http://schedulenaut.com/" + event.id  + ">event</a> you are invited to: " +
		"<br><br>" +
			email.text;

		mailServices.sendMail({
			to: to,
			subject: "[Schedulenaut] " + eventName + ': ' + email.sub,
			html: content 
		}).then(function (d){
                $($event.target).html('Message Sent!');
                $($event.target).attr('disabled', true);
            });
	};


	var usersBlockHovered = [];

	$scope.isUsersBlockHovered = function (){
		return usersBlockHovered.indexOf(parseInt(this.user.brushes_id)) >= 0;
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
    $scope.changeBrushPreference = function (setTo) {
        if(setTo != undefined)
            $scope.preferred = setTo;
        else
            $scope.preferred = !$scope.preferred;
    };

    //Messaging module

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
    $scope.selectedGranularity = 30;

    //list of users on this event
    usersService.withEvent(event.id).then(function (users) {
        $scope.users = users.data;
    });

    //list of layers on this event
    $scope.allLayers = allLayers;

    //index of layer to be modified from allLayers
    $scope.activeLayerId = undefined;

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

    //seperate create from activating
    var createLayer = function (user_id, setActive) {
        var promise = $q.defer();

        activeLayer.user_id = user_id;
        activeLayer.data = [];

        brushesService.create(activeLayer).then(function (layerId) {
			refreshAllLayers(function (d) {
				if(setActive){
					//id of layer in local layers stack
					$scope.activeLayerId = $scope.allLayers.map(function (d) {
						return d.id;
					}).indexOf(layerId);
				}

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
        var user = $scope.newUser;
        var user_id_promise = usersService.create(user);

        user_id_promise.then(function (user_id) {
            var brushes_id_promise = createLayer(user_id, user.secret);
            brushes_id_promise.then(function (d) {
                var user = {};
                user.id = user_id;
                user.brushes_id = d;
                usersService.update(user);
            });

            refreshUsers();
        });

        //reset the form
        $scope.newUser = {event_id: event.id, brushes_id: -1, name: undefined, secret: undefined, email: undefined};
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
