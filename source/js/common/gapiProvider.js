'use strict';

module.exports = angular.module('gapi', [])
    .factory('gapiProvider', ['$document', '$q', '$rootScope',
        function ($document, $q, $rootScope) {
            var d = $q.defer();


            window.checkAuth = function() {
                $rootScope.$apply(function () {
                    d.resolve(window.gapi);
                });
            };

            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = 'https://apis.google.com/js/client.js?onload=checkAuth';

            var s = $document[0].getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                gapi: function () {
                    return d.promise;
                }
            };
        }]);
