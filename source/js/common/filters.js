module.exports = angular.module('filters', [])
    .filter('labelNewMonth', ['$filter', function ($filter) {
        return function (date, previousDate) {
            if (previousDate.getMonth() !== date.getMonth() )
                return $filter('date')(date, 'MMMM');
            else
                return '';
        };
    }])
    .directive('popoverWrapper', [function(){
        var link = function (scope, el, attrs){
            var attachTo = $(attrs.attachTo);
            var popover = $(el[0].children[0]);

            el
                .css('display', 'none')
                .css('left', attachTo[0].offsetLeft + attachTo[0].offsetWidth/2)
                .css('top', attachTo[0].offsetTop + attachTo[0].offsetHeight);

            popover
                .addClass(attrs.pointTo)
                .css('padding', 10);

            attachTo.on('click.popover'+attachTo[0].id, function(){
                attachTo.addClass('active');
                el
                    .css('display', 'block')
                    .css('top', attachTo[0].offsetTop + attachTo[0].offsetHeight);
            });

            $(document).on('mousedown.hideExtendedForm', function (event) {
                if (!$(event.target).closest(popover).length) {
                    attachTo.removeClass('active');
                    el.css('display', 'none')
                }

                scope.callback();
            });

            el.on('$destroy', function (){
                attachTo.off('click.popover'+attachTo[0].id);
            });

        };
        return {
            restrict: 'C',
            template: '<div><div class="popover" ng-transclude></div></div>',
            replace: true,
            transclude: true,
            scope: {
                callback: '='
            },
            link: link
        };
    }])
    ;

