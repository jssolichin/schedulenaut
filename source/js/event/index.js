/**
 * Created by Jonathan on 1/25/2015.
 */

'use strict';

module.exports = angular.module('schedulenaut.eventPage', [require('../common/gapiProvider').name, 'djds4rce.angular-socialshare', 'facebook'])
    .directive('saveDrops', require('./directive.dropBackground'))
    .directive('importer', require('./directive.import'))
    .factory('eventHelpers', require('./helpers'))
    .config(function(FacebookProvider) {
        // Set your appId through the setAppId method or
        // use the shortcut in the initialize method directly.
        FacebookProvider.init('1447851412180102');
    })
    .run(function($FB){
      //$FB.init('1445013459130564');
    });
