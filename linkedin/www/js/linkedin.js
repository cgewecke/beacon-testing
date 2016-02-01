// A service for interacting w/ the LinkedIn api

angular.module('linkedin')
  .service("LinkedIn", LinkedIn);


function LinkedIn($http, $q, $auth, $cordovaOauth, $ionicPlatform){

	var self = this;

	// ------------------------------   PRIVATE  ------------------------------------
	
	// LinkedIn profile data api call
  var options = ":(id,num-connections,picture-url,first-name,last-name,headline,location,industry,specialties,positions,summary,email-address)";
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
  //var authToken = "AQUJhAcbjyNryn9IXT5pzVG55RnJatko_BWqEfF3K25JFxRC-G8l7d9XAXysHqbPcdUfgSv-wWZzkk06mJuqYAWCGSNVduRzmuhWerFgW20n7jEZaxremlVk4WbowLgcifH45AdKvH937oyuJA2EA4Ss7bVXXHf5CFiV4Fq8tlmyLFPDSRE";
  //var authToken = "AQV-oc8wPTyhOYwS-YgpWHnIWIZ-6hbAEngzsyXP2vMRG6-JszhUVS8dQ7FMWReZ20_BJG5IXvRc1Zcurg14r5amIAD4AxuquClVRQes8SOFiHXxUAcyL43OpAZ9dWIRiYY-NtoB1eo0S0xPdgMGqxpzFGK-BIS6ZjV0NHF-4sfLfBMSTD4";
  //var authToken = "AQXazFMVa1RYDvKYmEBsbiJPHceRDQ5Rw_ZXKDxLet1Hrtuyv2k3PdZt3YEgwIswTmJ93V0IhbSQv8ZzzH9djwWyI9EAttfjiyqpv80nPYPP7NjC_SG3hck429vNzG2gtFIcfE83BPQTiFlHZFRwsLhff7ouxGy-CrM7AYeb_KBRBtZ0Qu4";
  //var authToken = "AQUQx7XeK5AksUBUfQnQkJkBA2uM3Xg5t-GzcIkamlSq6YMFeUk3Z1stLd130C1TezHVKKZ_KaOq7xBQPZ1VBG9Gl_hPhYygFeLj1Ih2Py_c8CETkW6L6eFII0BFERk5k6oh3NR_tHfXEj-B48i-pdOwCQYPzYJwkdEukcAfvoFMyDlT2hs";
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