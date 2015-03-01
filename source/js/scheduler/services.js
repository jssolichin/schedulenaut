/**
 * Created by Jonathan on 2/27/2015.
 */

module.exports = angular.module('events', [])
    .service('eventsService', ['$http', '$q', function($http, $q) {
        this.createEvent = function(event) {
            event.dates = JSON.stringify(event.dates);
            var p = $q.defer();

            $http.post('/api/event', event).success(function(response) {
                p.resolve(response);
            });

            return p.promise;
        };

        this.getEvent = function(event) {
            return $http.get('/api/event/' + event);
        };

    }]);
