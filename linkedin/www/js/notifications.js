angular.module('linkedin')
  .service("Notify", Notify);

function Notify($q, $rootScope, LinkedIn, $cordovaPush){
	
	var self = this;
	var error;

	// Must go in after device ready && user logged in.
	self.initialize = function(init){
	
		var deferred = $q.defer();

		if($rootScope.DEV || Meteor.user().profile.pushToken){
			console.log('in resolution at register');
			deferred.resolve();

		} else {

			var iosConfig = {
			    "sound": true,
			    "alert": true,
			};
	 
		    $cordovaPush.register(iosConfig).then(function(deviceToken) {
		 
		      console.log("deviceToken: " + deviceToken)
		      Meteor.users.update({ _id: Meteor.userId }, {$set: {'profile.pushToken' : deviceToken}});
		      deferred.resolve();

		    }, function(err) {
		       error = 'NOTIFICATIONS ERROR: registering for pushToken';
		       console.log(error);
		       console.log(err);
		       deferred.reject();
		    });
		}

		return deferred.promise;

	};

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