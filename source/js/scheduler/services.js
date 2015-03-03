/**
 * Created by Jonathan on 2/27/2015.
 */

module.exports = angular.module('events', [])
    .service('eventsService', ['$http', '$q', function($http, $q) {
        this.create = function(event) {
            event.dates = JSON.stringify(event.dates);
            var p = $q.defer();

            $http.post('/api/event', event).success(function(response) {
                p.resolve(response);
            });

            return p.promise;
        };

        this.update = function (event){
            return $http.put('/api/event/' + event.id, JSON.stringify(event));
        };

        this.get = function(event) {
            return $http.get('/api/event/' + event.id);
        };

    }])
    .service('brushesService', ['$http', '$q', function ($http, $q) {
        this.create = function (brushes) {
            var p = $q.defer();

            $http.post('/api/brushes', brushes).success(function (response) {
                p.resolve(response);
            });

            return p.promise;
        };

        this.update = function (brushes) {
            return $http.put('/api/brushes/' + brushes.event_id, JSON.stringify(brushes));
        };

        this.get = function (brushes) {
            return $http.get('/api/brushes/' + brushes.id);
        };

    }]);
