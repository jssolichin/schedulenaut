/**
 * Created by Jonathan on 2/27/2015.
 */

'use strict';

module.exports = function ($scope, mailServices, event, usersService) {

    usersService.withEvent(event.id).then(function (users) {
        $scope.users = users.data;
    });

	$scope.sendEmailToAll = function ($event){
        var eventName = event.name || 'an event you are invited to';
        
        var eachMail = function (user){
            var template = 
            	"<img src='http://schedulenaut.com/public/images/logo.png'><h1>Schedulenaut</h1>" + 
                "Hey " + user.name + ", <br>" + 
                "<br>" + 
                "Just wanted to let you know that the time and place for <b>" + eventName + "</b> has been set! Cool right? " + 
                "<br>" + 
                "<br>" + 
                "Lift off to <a href=http://schedulenaut.com/event/" + event.id  + ">the event page</a> to know the details. <br>" + 
                "<br>" + 
                "Thanks!" + 
                "<br>" + 
                "Schedulenaut";

            mailServices.sendMail({
                to: user.email,
                subject: 'The time for ' + eventName + ' has been set!',
                html: template,
            }).then(function (d){
                $($event.target).html('Message Sent!');
                $($event.target).attr('disabled', true);
            });
        };

        $scope.users.forEach(function(user){
            eachMail(user);
        });
	};
};
