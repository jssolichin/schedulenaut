/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function ($scope, mailServices) {
	$scope.sendEmailToAll = function (event){
		mailServices.sendMail({
			to: 'jssolichin@gmail.com',
			subject: 'The time for ' + event.name + ' has been set!',
			html: event.description + ' <br> ' + event.location
		})
	}
};
