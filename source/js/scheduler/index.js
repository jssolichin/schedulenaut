/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.scheduler', [ ])
    .factory('helpers', require('./helpers'))
    .directive('scrub', require('./scrub'));
    //.controller('ChartMgrCtrl', require('./ChartMgrCtrl'));
