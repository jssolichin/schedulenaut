module.exports = function(Facebook, $filter, gapiProvider) {
    return {
        scope: {
            dates: '=',
            importedLayers: '=',
            callback: '='
        },
        restrict: 'A',
        templateUrl: 'public/directives/directive-import.html',
        link: function($scope, element, attrs) {

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
            var sortedDates = $filter('orderBy')($scope.dates);
            var earliestDate = sortedDates[0].getTime() / 1000;
            var latestDate = sortedDates[sortedDates.length - 1].getTime() / 1000;

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

                            var fbColor = '#3B5998';
                            if(type == 'not_replied')
                            	fbColor = '#7d97cd';

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
};