'use strict';

var schedulenaut = angular.module('schedulenaut', [
    'multipleDatePicker',
    'ui.router',
    require('./scheduler').name
]).config(require('./common/routes'));
