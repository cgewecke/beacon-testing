// A service for interacting w/ the LinkedIn api



// TO DO - in the middle of rewriting accounts to have public url. Check code in ionic serve.
//



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
    var authToken = "AQXfohqykdt1tw-ibGw3HrARScrAvrverPbO3sjG7eeek87qmA3X7x7uEDB0Qqzqxl1Kw-bNaf6R8OPM-OkQIvi0LmmQVs41aghmIDEUO3qqR_EALWbKRU8dUM_N-UpVB2nwiMUOyiWWYayNwyuft2wRMew73vyhwDBqZmqrPAgIgsH6Vw0"; 
  };
  

  // ------------------------------   PUBLIC ------------------------------------
	
  self.me = null;
	self.others = [];

	// setAuthToken: Convenience methods to set authToken when app is already
	// authenticated from previous use.
	self.setAuthToken = function(token){
		authToken = token;
	}

  // initialize(): Invoked in the routing resolve at app start - if user autologs into Meteor,
  // we still need to fetch a fresh linkedin profile for them . . . 
  self.initialize = function(){

    var d = $q.defer();

    if (!self.me){
      $auth.requireUser().then(

        function(userLoggedIn){

          self.setAuthToken(Meteor.user().profile.authToken);
          self.getMe().then(function(success){

            console.log('autologged in');
            Beacons.initialize();
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

	// authenticate: Logs user into LinkedIn, sets authToken, returns promise
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

	// getMe(authToken): returns promise - resolves the users profile object
	// Obj has additional field: [name].
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

	// getOther(authToken): returns promise - resolves arbitrary profile object
	// depending on 'id' param. Also pushes profile onto the self.others stack. 
	// Obj has additional field: [name].
	self.getOther = function(id, authToken){

		var deferred = $q.defer();
		var url = self_root + options + protocol + authToken;

		$http.jsonp(linkedInUrl)
      .success(function(result) {
      	
      	 result.name = result.firstName + " " + result.lastName;
      	 self.others.push(result);

      	 deferred.resolve(result);
      })
      .error(function(error){
      	 deferred.reject();
      });

     return deferred.promise;	
	}

	// findOther(id): Returns a profile obj if id matches the id of an object
	// in the others array
	self.findOther = function(id){

		for (var i = 0; i < self.others.length; i++){
			if (self.others[i].id === id )
				return self.others[i];
		}
		return undefined;
	}

	// removeOther(id): Remove a profile obj from the self.others array if 
	// a matching id is found. Returns true if successful, false otherwise
	self.removeOther = function(id){
    for (var i= 0; i < self.others.length; i++) {
        if (id === self.others[i].id) {
            self.others.splice(i, 1);
            return true;   
        }
    }
    return false;
	}
};