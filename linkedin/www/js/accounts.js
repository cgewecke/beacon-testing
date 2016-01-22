/* SAMPLE LINKEDIN OUTPUT 
{"firstName":"Penelope",
  "headline":"Software Engineer at Cyclop.se",
  "id":"SA4tMdPaww",
  "lastName":"Cyclops",
  "location":{
    "country":{
      "code":"us"},
    "name":"Portland, Oregon Area" },
  "numConnections":0,
  "pictureUrl":"https://media.licdn.com/mpr/mprx/0_PotKeB6H-pimuLtZrperfXFHnVOmdNYvKaXOaGPd…UoO85keUUp7fKJzxMBu8_5kOUpafKkNMMBPwCKWzsdCLQxHzH3jI9YZYa6OQK15rV1y2pzo1_o",
  "siteStandardProfileRequest":{
    "url":"https://www.linkedin.com/profile/view?id=473444799&authType=name&authToken=gcD9&trk=api*a4769661*s5086301*"}}
  */



angular.module('linkedin')
  .controller("LoginCtrl", LoginCtrl);

function LoginCtrl ($scope, $http, $cordovaOauth, $ionicPlatform, $auth, $state, ionicToast ){
  
    $scope.login = function(){

        var token;
        var appHash = "Txc9";

        var options = ":(id,num-connections,picture-url,first-name,last-name,headline,location,site-standard-profile-request)";
        var protocol = "?callback=JSON_CALLBACK&format=jsonp&oauth2_access_token="
        var root = "https://api.linkedin.com/v1/people/~";
        var token = "AQV0d0RmptWuBrw9o0w9OIi7lVrjIKMuiguuFXJtRLVJG7oNujxzyIh2cQbPPLcclpQa6dWc-WK61wZ-Rpdzri1KyXNCs7kWach40r90KZRINCo4v9FeUJRmFq7NzooarHnae23pkW7LWV3Y2xye7byEiabPhpgasWpIESKBZ54jWVfHvag";
        
        var linkedInUrl = root + options + protocol + token; //A

        console.log('Logging in');
        
        // SignIn w/ LinkedIn, returns access_token.
        /*$ionicPlatform.ready(function() {
          $cordovaOauth.linkedin("75rttrx3oxeeii", "adcGXkzR4fH6e3zI", ["r_basicprofile"], "randomstring").then(function(result) {
                  
                // PRODUCTION: MOVE CODE BELOW WITHIN THIS LIVE LINKEDIN AUTH

              }, function(error) {
                  console.log(error);
              });
        });*/

        // Get LinkedIn Profile info
        $http.jsonp(linkedInUrl)
          .success(function(result) {

            // Save access token
            result.token = token;

            // User object
            var user = {
              username: result.id,
              password: result.lastName + '_' + appHash,
              profile: {
                info: result,
                appId: null,
                remember: null
              }
            };
          
            // Check registration
            Meteor.call('hasRegistered', user.username, function(err, registered ){
              
              if (!err){
                
                // REGISTERED: Login with password. Update our user w/current linkedIn profile
                // Set beacon major - local storage sometimes gets wiped. Redirect to . . .
                if ( registered ){

                  Meteor.loginWithPassword(user.username, user.password, function(err){
                    if (!err){
                      
                      $auth.waitForUser().then(function(){
              
                        window.localStorage['pl_major'] = Meteor.user().profile.appId;
                        Meteor.users.update(Meteor.userId(), { $set: { 'profile.info': user.profile.info } });
                        $state.go('tab.chats');
                        console.log('went to tab chats');

                      })
                    
                    } else {
                      ionicToast.show("Couldn't log in. (Password) Try again.", 'top', true, 2500);
                    }
                  })

                // NEW ACCOUNTS: Get unique beacon major for this app instance, create user and save
                // major there and in local storage. Redirect to . . . 
                } else {

                  Meteor.call( 'getUniqueAppId', function(err, val){ 
                    if (!err && val ){
                      
                      user.profile.appId = val;
                      
                      Accounts.createUser(user, function(err){
                        if (!err){
                          window.localStorage['pl_major'] = user.profile.appId;
                          // Redirect to chats;
                        } else{
                          ionicToast.show('Having connectivity problems (CreateUser) - try again', 'top', true, 2500);
                        }
                      })

                    } else{
                      ionicToast.show('Having connectivity problems (AppID) - try again', 'top', true, 2500);
                    }
                  });
                  
                }
              }
            })            
            console.log(JSON.stringify(result));
          })
          // CASE: LinkedIn api call failed, bad token
          .error(function(result){
            ionicToast.show("Couldn't get your LinkedIn profile. Try again.", 'top', true, 2500);
            console.log(JSON.stringify(result));
          });
    
    };
};