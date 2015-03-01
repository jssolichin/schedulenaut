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

        this.updateEvent = function (event){
            return $http.put('/api/event/' + event.id, JSON.stringify(event));
        };

        this.getEvent = function(event) {
            return $http.get('/api/event/' + event.id);
        };

    }]);
