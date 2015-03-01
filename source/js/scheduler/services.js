/**
 * Created by Jonathan on 2/27/2015.
 */

module.exports = angular.module('events', [])
    .service('eventsService', ['$http', function($http) {
        this.saveEvent = function(event) {
            if(event.name)
                return $http.post('/api/event/'+event.name, event);
            else
                return $http.post('/api/event', event);
        };

        this.getEvent = function(event) {
            return $http.get('/api/event/' + event);
        };

    }]);
