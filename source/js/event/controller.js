/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function (globalHelpers, $window, event, eventsService, helpers, $scope, $rootScope, $q, $filter, $state) {
	$scope.currentUrl = window.location.href;
	//TODO: change editable/disabled automatically, without reloading--waiting for xeditable resolve #281

    $scope.checkAdminPass = function (id, event_pass, $event){
        var isAdminAuth = eventsService.checkAdminPass(id, event_pass);
        isAdminAuth.then(function(d){
            
           $scope.adminAuthenticated =  d.authenticated;
           
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

    $scope.finalizeEvent = function (){
        var finalizeable = true;
        
        for (var detail in event.details_confirmed){
            if(event.details_confirmed[detail] !== true){
                globalHelpers.bounce('#event-detail-'+detail);
                finalizeable = false;
            }
        }

        if(finalizeable){
            event.open = !event.open; 
            $scope.updateEvent(); 
            $scope.reloadView();
        }
    };
    
};
