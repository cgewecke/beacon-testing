angular.module('linkedin')
  .service("Notify", Notify);

function Notify(LinkedIn){
	
	var self = this;
	var error;

	// sawProfile: param user is the user seen
	self.sawProfile = function(userId){
		
		if (!LinkedIn.me) return;

		var info = {
			target: userId,
			notification: {
				type: 'sawProfile',
				sender: Meteor.userId(),
				pictureUrl: LinkedIn.me.pictureUrl,
				name: LinkedIn.me.firstName + ' ' + LinkedIn.me.lastName,
				location: null,
				timestamp: new Date()
			}
			
		};

		console.log('calling notify in client:' + JSON.stringify(info));
		Meteor.call('notify', info, function(err, result){
			if (!err){
				return result;
			} else {
				error = 'NOTIFICATIONS ERROR: calling meteor in "seeProfile"';
				console.log(error);
			}
		});
	};

	self.chatted = function(user){
		Meteor.call('notify', user, function(err, result){
			if (!err){
				return result;
			} else {
				error = 'NOTIFICATIONS ERROR: calling meteor in "chatted"';
				console.log(error);
			}
		});
	};

	self.checkedNotifications = function(){

		Meteor.call('resetNotifyCounter', null, function(err, result){
			if (!err){
				return result;
			} else {
				error = 'NOTIFICATIONS ERROR: calling meteor in "checkedNotifications"';
				console.log(error);
			}
		});
		return true;
	};

}