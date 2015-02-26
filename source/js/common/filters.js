module.exports = angular.module('filters', [])
    .filter('firstOfMonth', ['$filter', function ($filter) {
        return function (date) {
            if (date.getDate() === 1)
                return $filter('date')(date, 'MMMM');
            else
                return '';
        };
    }]);

