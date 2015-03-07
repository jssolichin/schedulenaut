'use strict';

module.exports = angular.module('moment', [])
    .factory('momentProvider', ['$document', '$q', '$rootScope',
        function ($document, $q, $rootScope) {
            var d = $q.defer();

            function onScriptLoad(u) {
                $rootScope.$apply(function () {
                    d.resolve(window.moment);
                });
            }

            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = 'bower_components/moment/moment.js';
            scriptTag.onreadystatechange = function () {
                if (this.readyState == 'complete') onScriptLoad();
            };
            scriptTag.onload = onScriptLoad;
            var s = $document[0].getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                moment: function () {
                    return d.promise;
                }
            };
        }]);
