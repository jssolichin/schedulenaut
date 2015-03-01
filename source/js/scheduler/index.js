/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.scheduler', [
    require('../common/d3Provider').name,
    require('../common/momentProvider').name,
    require('../common/filters').name,
    require('../scheduler/services').name
])
    .factory('helpers', require('./helpers'))
    .directive('calendar', require('./calendar'))
    .directive('scrub', require('./scrub'))
    .directive('popoverWrapper', require('./scrub-popoverWrapper'));
