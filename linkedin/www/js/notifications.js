angular.module('linkedin')
  .service("Notify", Notify);

function Notify($q, $rootScope, LinkedIn, GeoLocate, $cordovaPush){
	
	var self = this;
	var error;

	// Must go in after device ready && user logged in.
	self.initialize = function(init){
	
		var deferred = $q.defer();

		if($rootScope.DEV || !Meteor.user()){

			deferred.resolve();

		} else if (!Meteor.user().profile.pushToken || window.localStorage['pl_newInstall'] === 'true') {

			var iosConfig = {
			    "sound": true,
			    "alert": true,
			};
	 		console.log('Entering notify initialize');
		    $cordovaPush.register(iosConfig).then(function(deviceToken) {
		 
		      console.log("deviceToken: " + deviceToken + 'newInstall: ' + window.localStorage['pl_newInstall']);
		      Meteor.users.update({ _id: Meteor.userId() }, {$set: {'profile.pushToken' : deviceToken}});
		      window.localStorage['pl_newInstall'] = 'false';
		      deferred.resolve();

		    }, function(err) {
		       error = 'NOTIFICATIONS ERROR: registering for pushToken';
		       console.log(error);
		       console.log(err);
		       deferred.resolve();
		    });
		    
		} else {
			deferred.resolve();
		}

		return deferred.promise;

	};

	// sawProfile: param user is the user seen
	self.sawProfile = function(userId){
		
		if (!LinkedIn.me) return;

		GeoLocate.getAddress().then(function(location){
			
			var info = {
				target: userId,
				notification: {
					type: 'sawProfile',
					sender: Meteor.userId(),
					pictureUrl: LinkedIn.me.pictureUrl,
					name: LinkedIn.me.firstName + ' ' + LinkedIn.me.lastName,
					location: location, 
					timestamp: new Date()
				}
				
			};

			Meteor.call('notify', info, function(err, result){
				if (!err){
					return result;
				} else {
					error = 'NOTIFICATIONS ERROR: calling meteor in "seeProfile"';
					console.log(error);
				}
			});
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