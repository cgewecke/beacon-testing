// A service for interacting w/ the LinkedIn api

angular.module('linkedin')
  .service("LinkedIn", LinkedIn);


function LinkedIn($http, $q, $cordovaOauth, $ionicPlatform){

	var self = this;

	// ------------------------------   PRIVATE  ------------------------------------
	
	// LinkedIn profile data api call
    var options = ":(id,num-connections,picture-url,first-name,last-name,headline,location,industry,specialties,summary,email-address)";
    var protocol = "?callback=JSON_CALLBACK&format=jsonp&oauth2_access_token="
    var me_root = "https://api.linkedin.com/v1/people/~";
    var other_root = null;

    // Keys
    var id = "75rttrx3oxeeii"; // Security . . . .
    var sec = "adcGXkzR4fH6e3zI";
    var perm = ["r_basicprofile", "r_emailaddress"];
    var state = "randomstring";

    // DEVELOPMENT
    var authToken = "AQV0d0RmptWuBrw9o0w9OIi7lVrjIKMuiguuFXJtRLVJG7oNujxzyIh2cQbPPLcclpQa6dWc-WK61wZ-Rpdzri1KyXNCs7kWach40r90KZRINCo4v9FeUJRmFq7NzooarHnae23pkW7LWV3Y2xye7byEiabPhpgasWpIESKBZ54jWVfHvag";
    
    // PRODUCTION 
    //var authToken = null;
    

    // ------------------------------   PUBLIC ------------------------------------
	self.me = null;
	self.others = [];

	// setAuthToken: Convenience methods to set authToken when app is already
	// authenticated from previous use.
	self.setAuthToken = function(token){
		self.me.authToken = authToken = token;
	}

	// authenticate: Logs user into LinkedIn, sets authToken, returns promise
	self.authenticate = function(){
		var deferred = $q.defer();
		$ionicPlatform.ready(function() {
          $cordovaOauth.linkedin(id, sec, perm, state).then(
         	function(result) {
         		authToken = result.access_token;
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
          	deferred.reject(error);
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
        for (var i= 0; i < self.others; i++) {
            if (id === self.others[i].id) {
                self.others.splice(i, 1);
                return true;   
            }
        }
        return false;
	}
	
};