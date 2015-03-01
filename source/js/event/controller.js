/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function (event, $scope, $rootScope){
    $scope.name = event.data.name;
};
