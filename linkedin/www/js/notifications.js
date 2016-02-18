// @service: Notify
// Handles push notification registry, and does internal notifications management
angular.module('linkedin')
  .service("Notify", Notify);

function Notify($q, $rootScope, LinkedIn, GeoLocate, $cordovaPush){
	
	var self = this;
	var error;

	// @function: initialize
	// @return: promise
	// Registers for push notifications when user is new or there has been a new app install.
	// It seems like the tokens are somehow linked to that - possibly through the device settings or 
	// something. Resolves in the nearby route.
	self.initialize = function(){
	
		var deferred = $q.defer();

		if($rootScope.DEV || !Meteor.user()){

			deferred.resolve();

		} else if (!Meteor.user().profile.pushToken || window.localStorage['pl_newInstall'] === 'true') {
			MSLog('@Notify:initialize - attempting to register for APNS');

			var iosConfig = {
			    "sound": true,
			    "alert": true,
			};
	 		
		    $cordovaPush.register(iosConfig).then(function(deviceToken) {
		 
		      Meteor.users.update({ _id: Meteor.userId() }, {$set: {'profile.pushToken' : deviceToken}});
		      window.localStorage['pl_newInstall'] = 'false';
		      deferred.resolve();

		    }, function(err) {
		       MSLog('@Notify:initialize: failed push-notification register: ' + err);
		       deferred.resolve();
		    });
		    
		} else {
			MSLog('@Notify:initialize - already registered for APNS');
			deferred.resolve();
		}

		return deferred.promise;

	};

	// @function: sawProfile
	// @param: userId (a meteor userId)
	// Geolocates, generates a notification. 
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
					MSLog('@Notify:sawProfile: failed');
				}
			});
		});		
	};

	// @function: checkedNotifications
	// Toggles flag server side to disable badge in notifications tab 
	self.checkedNotifications = function(){

		Meteor.call('resetNotifyCounter', null, function(err, result){
			if (!err){
				return result;
			} else {
				MSLog('@Notify:checkedNotifications: failed ');
			}
		});
		return true;
	};

}