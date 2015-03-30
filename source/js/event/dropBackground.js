/**
 * Created by Jonathan on 3/29/2015.
 */

'use strict';

module.exports = function ($window, $q) {
    return {
        require: 'droplet',
        restrict: 'A',
        link: function ($scope, element, attrs) {

            var showHint = function () {
                element
                    .css('background-image', 'none');
                element.find('.middle')
                    .css('opacity', '.4');
                element.find('#drop-hint-wrapper')
                    .css('display', 'block');
            };
            var hideHint = function (event) {
                if (event.type !== 'drop')
                    element
                        .css('background-image', 'url(' + $scope.event.image + ')');
                element.find('.middle')
                    .css('opacity', '1');
                element.find('#drop-hint-wrapper')
                    .css('display', 'none');
            };

            element[0].addEventListener("dragover", showHint, false);
            element[0].addEventListener("dragleave", hideHint, false);
            element[0].addEventListener("drop", hideHint, false);

            var saveImage = function (image) {

                var promise = $q.defer();

                var xhr = new XMLHttpRequest();

                // Open the connection.
                xhr.open('POST', 'api/saveimage', true);

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        // File(s) uploaded.
                        promise.resolve(xhr.response);
                    } else {
                        console.log('An error occurred!');
                    }
                };

                xhr.send(image);

                return promise.promise;
            };

            $scope.$on('$dropletFileAdded', function (event, model) {
                if (model.isImage()) {
                    // Initialise the loading of the image into the file reader.
                    fileReader.readAsDataURL(model.file);
                }
            });

            var fileReader = new $window.FileReader();
            fileReader.onload = function onload(event) {
                $scope.$apply(function apply() {
                    // Voila! Define the image data.
                    $scope.image = event.target.result;

                    var response = saveImage($scope.image);
                    response.then(function (d) {
                        $scope.updateEvent({image: d});
                    });

                });
            };

        }
    };
};
