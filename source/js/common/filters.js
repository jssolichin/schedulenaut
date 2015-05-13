module.exports = angular.module('filters', [])
    .filter('labelNewMonth', ['$filter', function ($filter) {
        return function (date, previousDate) {
            if (previousDate.getMonth() !== date.getMonth())
                return $filter('date')(date, 'MMMM');
            else
                return '';
        };
    }])
    .filter('underscoreToSpace', ['$filter', function () {
        return function (string) {
            return string ? string.replace(/_/g, ' ') : string;

        };
    }])
    .filter('afterLastSlash', ['$filter', function () {
        return function (string) {
            return string ? string.replace(/^.*\//, '') : string;
        };
    }])
    .filter('shortTimezone', ['$filter', function ($filter) {
        return function (string) {
            var noUnderscore = $filter('underscoreToSpace')(string);
            return $filter('afterLastSlash')(noUnderscore);
        };
    }])
    .service('global.helpers', [function () {
        this.cloneJSON =
            function (obj) {
                //https://stackoverflow.com/questions/4120475/how-to-create-clone-a-json-in-javascript-jquery

                // basic type deep copy
                if (obj === null || obj === undefined || typeof obj !== 'object') {
                    return obj;
                }
                // array deep copy
                if (obj instanceof Array) {
                    var cloneA = [];
                    for (var i = 0; i < obj.length; ++i) {
                        cloneA[i] = this.cloneJSON(obj[i]);
                    }
                    return cloneA;
                }
                // object deep copy
                var cloneO = {};
                for (var j in obj) {
                    cloneO[j] = this.cloneJSON(obj[j]);
                }
                return cloneO;
            };
        this.unNullify = function (obj) {
            var obj_copy = this.cloneJSON(obj);
            for (var i in obj) {
                obj_copy[i] = obj[i] === 'null' || obj[i] === null ? undefined : obj[i];
            }
            return obj_copy;
        };
        this.bounce= function (elId){
            var wrapper = $(elId);

            wrapper[0].scrollIntoView(true);
            wrapper.addClass('animated bounce');
            wrapper.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                wrapper.removeClass('animated bounce');
            });
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

