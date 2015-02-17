'use strict';

module.exports = angular.module('d3', [])
    .factory('d3Provider', ['$document', '$q', '$rootScope',
        function($document, $q, $rootScope) {
            var d = $q.defer();
            function onScriptLoad(u){
                $rootScope.$apply(function(){d.resolve(window.d3);});
            }
            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = 'bower_components/d3/d3.js';
            scriptTag.onreadystatechange = function (){
                if(this.readyState == 'complete') onScriptLoad();
            };
            scriptTag.onload = onScriptLoad;
            var s = $document[0]. getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                d3: function(){ return d.promise;}
            };
        }]);
