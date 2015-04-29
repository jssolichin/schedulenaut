/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.eventPage', ['djds4rce.angular-socialshare'])
    .directive('saveDrops', require('./dropBackground'))
    .factory('eventHelpers', require('./helpers'))
    .run(function($FB){
      $FB.init('1445013459130564');
    });
