/**
 * Created by Jonathan on 2/27/2015.
 */

module.exports = angular.module('events', [])
    .service('eventsService', ['$http', '$q', 'global.helpers', 'discussionsService', function ($http, $q, globalHelpers, discussionsService) {
        this.create = function (event) {
            //We need to create a copy or else it will replace the "event" variable in the "event" page
            //The cloneJSON function clones only JSON objects--so we need to stringify the date from
            //the original event and store in the copy's dates.
            eventCopy = globalHelpers.cloneJSON(event);
            eventCopy.dates = JSON.stringify(event.dates);
            eventCopy.timezones = JSON.stringify(event.timezones);
            eventCopy.event_settings = JSON.stringify(event.event_settings);

            var p = $q.defer();

            $http.post('/api/event', eventCopy).success(function (response) {
                discussionsService.create({event_id: response.id, data: undefined, star: undefined});
                p.resolve(response);
            });

            return p.promise;
        };

        this.update = function (event) {
            //See eventsService.create
            eventCopy = globalHelpers.cloneJSON(event);
            eventCopy.dates = JSON.stringify(event.dates);
            eventCopy.timezones = JSON.stringify(event.timezones);
            eventCopy.event_settings = JSON.stringify(event.event_settings);

            return $http.put('/api/event/' + event.id, JSON.stringify(eventCopy));
        };

        this.get = function (event, property) {
            if(property !== undefined)
                return $http.get('/api/event/' + event.id + '/' + property);
            else
                return $http.get('/api/event/' + event.id);
        };

        this.checkAdminPass = function (id, admin_pass) {
            var p = $q.defer();

            var secretObj = {admin_pass: admin_pass};

            $http.post('/api/event/' + id + '/admin_pass', secretObj).success(function (response) {
                p.resolve(response);
            });

            return p.promise;
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

        this.delete = function (brushes) {
            $http.delete('/api/brushes/' + brushes.id);
        };

        this.parse = function (layersPromise) {
            layersPromise.data.forEach(function (layer) {
                layer.data = JSON.parse(layer.data);
                layer.data.forEach(function (day) {
                    day.forEach(function (brushWrapper) {
                        brushWrapper.brush[0] = new Date(brushWrapper.brush[0]);
                        brushWrapper.brush[1] = new Date(brushWrapper.brush[1]);
                    });
                });
            });
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

        this.update = function (user) {
            $http.put('/api/user/' + user.id, JSON.stringify(user)).success(function (response) {
                console.log('user updated');
            });
        };

        this.delete = function (user) {
            $http.delete('/api/user/' + user.id);
        };

        this.withEvent = function (event_id) {
            return $http.get('/api/user/event/' + event_id);
        };

        this.checkSecret = function (id, secret) {
            var p = $q.defer();

            var secretObj = {secret: secret};

            $http.post('/api/user/' + id + '/secret', secretObj).success(function (response) {
                p.resolve(response);
            });

            return p.promise;
        };

    }])
    .service('discussionsService', ['$http', '$q', 'global.helpers', function ($http, $q, globalHelpers) {
        this.create = function (discussion) {
            //We need to create a copy or else it will replace the "event" variable in the "event" page
            //The cloneJSON function clones only JSON objects--so we need to stringify the date from
            //the original event and store in the copy's dates.
            discussion_copy = globalHelpers.cloneJSON(discussion);
            discussion_copy.data = JSON.stringify(discussion.data);
            discussion_copy.star = JSON.stringify(discussion.star);

            var p = $q.defer();

            $http.post('/api/discussion', discussion_copy).success(function (response) {
                p.resolve(response);
            });

            return p.promise;
        };

        this.updateWithEvent = function (discussion) {
            //See eventsService.create
            discussion_copy = globalHelpers.cloneJSON(discussion);
            discussion_copy.data = JSON.stringify(discussion.data);
            discussion_copy.star = JSON.stringify(discussion.star);

            return $http.put('/api/discussion/event/' + discussion.event_id, JSON.stringify(discussion_copy));
        };

        this.withEvent = function (event) {
            return $http.get('/api/discussion/event/' + event.id);
        };

    }]);
