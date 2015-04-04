/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.eventPage', [])
    .directive('saveDrops', require('./dropBackground'))
    .factory('eventHelpers', require('./helpers'));
