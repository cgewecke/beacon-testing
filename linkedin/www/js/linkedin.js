// @service: LinkedIn
// A service for interacting w/ the LinkedIn api

angular.module('linkedin')
  .service("LinkedIn", LinkedIn);


function LinkedIn($rootScope, $http, $q, $auth, $cordovaOauth, $ionicPlatform, Beacons){

	var self = this;

	// ------------------------------   PRIVATE  ------------------------------------
	
	// LinkedIn profile data api call
  var options = ":(id,num-connections,picture-url,first-name,last-name,headline,location,industry,specialties,positions,summary,email-address,public-profile-url)";
  var protocol = "?callback=JSON_CALLBACK&format=jsonp&oauth2_access_token="
  var me_root = "https://api.linkedin.com/v1/people/~";
  var other_root = null;

  // Keys
  var id = "75rttrx3oxeeii"; // Security . . . .
  var sec = "adcGXkzR4fH6e3zI";
  var perm = ["r_basicprofile", "r_emailaddress"];
  var state = "randomstring";

  // PRODUCTION 
  var authToken = null;

  // DEVELOPMENT
  if ($rootScope.DEV){
    var authToken = "AQUhpB0zusNI_MMuDyGDG5RCrhQtyYiassagwNZW77FZxRSzd6pedNm9chjocw88Mqx9uDLzvLj7TalF9nmoUgv9KU_nC3BerAwWxJ7BUnWf0l2VpzW9yEjI37sjvPyUWI-4vAx8_k3uzyJvU9rxGa04iDbZfm8rawM0Zji3NoNChJmFzs0";
    //var authToken = "AQUl56nBFIjZQ8Oaa0v6HP7L2i7jTxPYfex0zxzCURmUBAuxtA0e0GoUXwh4diqdWLoWEWqjgUdoSV-AoGUuMONt4r5tfkWwT8terrwGSt3FvHk7vHHSjn8Yg1wcH8plajefoPUn_RMRnlKnQvTppKy9z6UeIqK_959_1nzVSLss0BEPVuU";
    ///var authToken = "AQWFvIL0cz5QjMQSF7HI7R1iVpd62p_-lsxPmv9pm4SfmJ-WH00GV4vaLExhWJsLN_HJio_b-fYYxFnzn1qRMZXeUMvX9XyryH3mGBsUX7Qdi_RnqHna-O5bVpxLbay9VjDLWwfteLU83i-oaRbq-nsj2Jzbr43nLsZ_k8EirlVYycpUJKQ"
  };
  

  // ------------------------------   PUBLIC ------------------------------------
	
  self.me = null;
	
	// @function: setAuthToken: 
  // @param: token
  // Convenience methods to set authToken when app is already authenticated from previous use.
	self.setAuthToken = function(token){
		authToken = token;
	}

  // @function: initialize
  // Invoked in the routing resolve at app start - if user autologs into Meteor,
  // we still need to fetch a fresh linkedin profile for them. Only initializes
  // if self.me doesn't exist yet.
  self.initialize = function(){

    var d = $q.defer();

    if (!self.me){
      $auth.requireUser().then(

        function(userLoggedIn){

          self.setAuthToken(Meteor.user().profile.authToken);
          self.getMe().then(function(success){

            console.log('autologged in');
            d.resolve(true);
          }, function(error){
            console.log('couldnt get profile')
            d.reject('AUTH_REQUIRED');
          }); 
        }, 
        function(userLoggedOut){
          console.log('requireUser error: ' + userLoggedOut);
          d.reject('AUTH_REQUIRED');
        }
      );
    } else {
      d.resolve(true);
    }

    return d.promise;
    

  }

	// @function: authenticate: 
  // @return: promise (rejects if $cordovaOauth fails)
  // Logs user into LinkedIn via inAppBroswer. sets authToken
	self.authenticate = function(){
		var deferred = $q.defer();
		$ionicPlatform.ready(function() {

      $cordovaOauth.linkedin(id, sec, perm, state, {redirect_uri: "http://cyclop.se/help"}).then(
      function(result) {
     		  authToken = result.access_token;
          console.log('authToken = ' + authToken);
      		deferred.resolve();

    	}, function(error) {
          deferred.reject(error);
      });
    });

		return deferred.promise;	
	}

	// @function: getMe
  // @return: promise 
  // LinkedIn API call to get the user profile. Resolves self.me.
	self.getMe = function(){
		
		var deferred = $q.defer();
		var url = me_root + options + protocol + authToken;

		$http.jsonp(url)
      .success(function(result) {

      	 self.me = result;
      	 self.me.name = result.firstName + " " + result.lastName;
         self.me.authToken = authToken;
         console.log("Checking obj in getME: " + JSON.stringify(self.me));
      	 deferred.resolve(self.me);
      })
      .error(function(error){
      	 deferred.reject(error);
      });

    return deferred.promise;		

	}

};