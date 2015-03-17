module.exports = angular.module('filters', [])
    .filter('labelNewMonth', ['$filter', function ($filter) {
        return function (date, previousDate) {
            if (previousDate.getMonth() !== date.getMonth())
                return $filter('date')(date, 'MMMM');
            else
                return '';
        };
    }])
    .directive('popoverWrapper', [function () {
        var link = function (scope, el, attrs) {

            var id = Math.floor(Math.random() * 16777215).toString(16);
            var attachTo, clickOn;
            var popover = $(el[0].children[0]);

            var openPopover = function () {
                el
                    .css('display', 'block')
                    .css('left', attachTo[0].offsetLeft + attachTo[0].offsetWidth / 2)
                    .css('top', attachTo[0].offsetTop + attachTo[0].offsetHeight + parseInt(attrs.offsetY));
                if (scope.callback)
                    scope.callback();
            };

            var closePopover = function () {
                el.css('display', 'none');
            };

            //set what to attach the popover to
            if (attrs.attachTo === undefined)
                attachTo = $(el[0].parentNode);
            else
                attachTo = $(attrs.attachTo);

            //set starting css
            el
                .css('display', 'none')
                .css('width', parseInt(attrs.width));
            popover
                .addClass(attrs.pointTo)
                .css('padding', attrs.padding);

            ////create listeners

            //broadcast
            if (attrs.openListener) {
                scope.$on(attrs.openListener, function () {
                    openPopover();
                });
            }
            if (attrs.closeListener) {
                scope.$on(attrs.closeListener, function () {
                    closePopover();
                });
            }

            //clicks
            if (attrs.clickOn !== 'false') {
                if (attrs.clickOn !== undefined)
                    clickOn = attachTo.find(attrs.clickOn);
                else
                    clickOn = attachTo;

                clickOn.on('click.popover' + id, function () {
                    attachTo.addClass('active');
                    openPopover();
                });
            }

            //remove popover on click anywhere
            $(document).on('mousedown.popover' + id, function (event) {
                if (!$(event.target).closest(popover).length) {
                    attachTo.removeClass('active');
                    closePopover();
                }
            });

            el.on('$destroy', function () {
                attachTo.off('click.popover' + id);
                $(document).off('mousedown.popover' + id);
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

