/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function (globalHelpers, $window, event, eventsService, helpers, $scope, $rootScope, $q, $filter, $state) {
    $scope.currentUrl = window.location.href;
    //TODO: change editable/disabled automatically, without reloading--waiting for xeditable resolve #281

    //Locker Time
    $scope.lockTime = function (){

        if($scope.adminAuthenticated){

            if(event.time.startDate && event.time.startTime && event.time.endTime && event.time.endDate){
                event.details_confirmed.time = !event.details_confirmed.time; 
                $scope.updateEvent();
            }
            else{
                if(!event.time.startDate)
                    globalHelpers.bounce('#event-time-picker .date.start');
                if(!event.time.startTime)
                    globalHelpers.bounce('#event-time-picker .time.start');
                if(!event.time.endTime)
                    globalHelpers.bounce('#event-time-picker .time.end');
                if(!event.time.endDate)
                    globalHelpers.bounce('#event-time-picker .date.end');
            }

        }
        else globalHelpers.bounce('#event-settings');

    };

    //Locker Location
    $scope.lockLocation = function (){
        if($scope.adminAuthenticated){
            if(event.location !== undefined &&  event.location !== ''){
                event.details_confirmed.location = !event.details_confirmed.location; 
                $scope.updateEvent(); 
                $scope.reloadView();
            }
            else
                globalHelpers.bounce('#event-detail-location');
        }
        else globalHelpers.bounce('#event-settings');

    };

    $scope.authenticateAdmin = function (authenticated){
        $scope.adminAuthenticated =  authenticated;
    };

    $scope.checkAdminPass = function (id, event_pass, $event, callback, callbackData){
        var isAdminAuth = eventsService.checkAdminPass(id, event_pass);
        isAdminAuth.then(function(d){

            $scope.authenticateAdmin(d.authenticated);

            if(callback && d.authenticated === true)
                if(callbackData)
                    callback(callbackData);
                else
                    callback();

            if($scope.adminAuthenticated === false ){
                var wrapper =  $($event.currentTarget.offsetParent);
                wrapper.addClass('animated shake');
                wrapper.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    wrapper.removeClass('animated shake');
                });
            }
        });
    };

    $scope.event = event;
    $scope.event.open = JSON.parse(event.open);
    $scope.isEditEnabled = function (){
        if(event.open === false)
            return false;
        else {
            if(event.event_settings !== undefined && event.event_settings.editableEveryone === false)
                return $scope.adminAuthenticated;
            else
                return true;
        }
    };

    //When we edit an event properties, upload it to server
    $scope.updateEvent = function (obj) {
        if (obj !== undefined) {
            for (var key in obj) {
                event[key] = obj[key];
            }
        }

        //create a copy that can be modified to be passed to server
        var eventCopy = globalHelpers.cloneJSON(event);
        eventCopy.dates = event.dates;
        eventCopy.time = event.time;

        //only pass admin_pass if done manually (new password)
        if(obj === undefined || (obj !== undefined && obj.admin_pass === undefined))
            eventCopy.admin_pass = undefined;

        eventsService.update(eventCopy);
    };

    $scope.reloadView = function (){
        $state.reload();
    };

    $scope.finalizeEvent = function (setTo){
        if($scope.adminAuthenticated){
            if (setTo === true){

                var finalizeable = true;

                for (var detail in event.details_confirmed){
                    if(event.details_confirmed[detail] !== true){
                        globalHelpers.bounce('#event-detail-'+detail);
                        finalizeable = false;
                    }
                }

                if(finalizeable){
                    event.open = false;
                    $scope.updateEvent(); 
                    $scope.reloadView();
                }
            }
            else {
                event.open = true;
                $scope.updateEvent(); 
                $scope.reloadView();
            }
        }
        else {
            globalHelpers.bounce('#event-settings') ;
        }

        //if changing to false then make sure its authenticated or else bounce

    };

};
