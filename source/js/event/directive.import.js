module.exports = ['Facebook', '$filter', 'gapiProvider', 'global.helpers', function(Facebook, $filter, gapiProvider, globalHelpers) {
    return {
        scope: {
            dates: '=',
            importedLayers: '=',
            callback: '='
        },
        restrict: 'A',
        templateUrl: 'public/directives/directive-import.html',
        link: function($scope, element, attrs) {

        	$scope.showNoEventInfo = false;
            $scope.fbColor = '#3B5998';
            $scope.fbColor_light = '#7d97cd';

            var sortedDates, earliestDate, latestDate;

            var getBoundingDates = function (){
                if($scope.dates.length > 0){
                    sortedDates = $filter('orderBy')($scope.dates);
                    earliestDate = sortedDates[0].getTime() / 1000;
                    latestDate = sortedDates[sortedDates.length - 1].getTime() / 1000;
                }
            };

            $scope.$watch('dates', getBoundingDates);

        	//COMMON
        	var groupExtentsIntoLayers = function(extents) {
                //create layers to file events in
                var layerDates = sortedDates.map(function(d) {
                    return d.getDate();
                });
                var brushes = [];
                for (var i = 0; i < sortedDates.length; i++) {
                    brushes.push([]);
                }

                extents.forEach(function(extent) {
                    //TODO: What if multi day event?

                    var dateIndex = layerDates.indexOf(extent[0].getDate());

                    if(dateIndex >= 0)
	                    brushes[dateIndex].push(extent);
                });

                return brushes;
            };

            var toggleImportedLayer = function (layer){
            	var indexInStack = $scope.importedLayers.map(function(d){return d.id;}).indexOf(layer.id);

	            	if(indexInStack <0)
		            	$scope.importedLayers.push(layer);
	            	else
	            		$scope.importedLayers.splice(indexInStack, 1);

        		$scope.$apply();
        		$scope.callback();
            };

            //FACEBOOK

            $scope.getLoginStatus = function() {
                Facebook.getLoginStatus(function(response) {
                    if (response.status === 'connected') {
                        $scope.loggedIn = true;
                    } else {
                        $scope.loggedIn = false;
                    }
                });
            };

            $scope.getFacebookEvents = function(type) {
                FB.api(
                    "/me/events/" + type + "?&since=" + earliestDate + "&until=" + latestDate,
                    function(response) {
                        if (response && !response.error) {
                            
                            var extents = [];

                            response.data.forEach(function(d) {
                                //TODO: What if multi day event?

                                if(d.start_time !== undefined && d.end_time !== undefined){

	                                var extent = [new Date(d.start_time), new Date(d.end_time)];

	                                extents.push(extent);
                                }

                            });

                            var brushes = groupExtentsIntoLayers(extents);

                            var fbColor = $scope.fbColor;
                            if(type == 'not_replied')
                            	fbColor = $scope.fbColor_light;

                            toggleImportedLayer({id: 'facebook_'+type,data: brushes, color: fbColor}, true);

                        }

                    }
                );
            };

            $scope.getLoginStatus();


            //GOOGLE

            gapiProvider.gapi().then(function(gapi) {
                var CLIENT_ID = '454648231582-8imdrg02jf261ue97ttddqfjdn4cp3j3.apps.googleusercontent.com';
                var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

                var listCalendars = function (){
                	var request = gapi.client.calendar.calendarList.list();

                	request.execute(function (resp){
                		$scope.googleCalendarList = resp.items;
                		$scope.$apply();

                	});
                };

                $scope.listUpcomingEvents = function(calendarId, color) {
                	var calId = calendarId || 'primary';
                	console.log(calId);

                    var request = gapi.client.calendar.events.list({
                        'calendarId': calId,
                        'timeMin': (sortedDates[0]).toISOString(),
                        'timeMax': (sortedDates[sortedDates.length - 1]).toISOString(),
                        'showDeleted': false,
                        'singleEvents': true,
                        'maxResults': 30,
                        'orderBy': 'startTime'
                    });

                    request.execute(function(resp) {
                        var events = resp.items;

                        if (events.length > 0) {
                            var extents = [];

                            events.forEach(function(event){
                                if (event.start.dateTime !== undefined) {
                                    var extent = [new Date(event.start.dateTime), new Date(event.end.dateTime)];
                                    extents.push(extent);
                                }
                            });

                            var brushes = groupExtentsIntoLayers(extents);

                            toggleImportedLayer({id: 'google_'+calId, data: brushes, color: color}, true);

                        } else {
                        	$scope.showNoEventInfo = true;
                        	$scope.$apply();
                        	globalHelpers.bounce('#no-event-info');
                        	window.setTimeout(function (){
                        		$scope.showNoEventInfo = false;
                        		$scope.$apply();
                        	}, 3000);

                            console.log('No upcoming events found.');
                        }

                    });
                };

                var gapiInit = function (){
                	$scope.gapiLoaded = true;
                	listCalendars();
                };

                var loadCalendarApi = function() {
                    gapi.client.load('calendar', 'v3', gapiInit);
                };

                var handleAuthResult = function(authResult) {
                    if (authResult && !authResult.error) {
                        $scope.googleLoggedIn = true;
                        loadCalendarApi();
                    } else {
                        $scope.googleLoggedIn = false;
                    }
                };

                var checkAuth = function() {
                    gapi.auth.authorize({
                        'client_id': CLIENT_ID,
                        'scope': SCOPES,
                        'immediate': true
                    }, handleAuthResult);
                };

                $scope.handleAuthClick = function(event) {
                    gapi.auth.authorize({
                            client_id: CLIENT_ID,
                            scope: SCOPES,
                            immediate: false
                        },
                        handleAuthResult);
                    return false;
                };

                checkAuth();
            });

        }
    };
}];