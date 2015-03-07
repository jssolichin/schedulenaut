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
            return $http.put('/api/brushes/' + brushes.id, JSON.stringify(brushes));
        };

        this.get = function (brushes) {
            return $http.get('/api/brushes/' + brushes.id);
        };

        this.withEvent = function (event_id) {
            return $http.get('/api/brushes/event/' + event_id);
        };

    }])
    .service('usersService', ['$http', '$q', function ($http, $q) {
        this.create = function (user) {
            var p = $q.defer();

            $http.post('/api/user', user).success(function (response) {
                p.resolve(response);
            });

            return p.promise;
        };

        this.withEvent = function (event_id) {
            return $http.get('/api/user/event/' + event_id);
        };

    }]);
