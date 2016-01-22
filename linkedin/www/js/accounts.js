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

function LoginCtrl ($scope, $http, $cordovaOauth, $ionicPlatform, $auth ){
  
    $scope.login = function(){

        var token;

        var options = ":(id,num-connections,picture-url,first-name,last-name,headline,location,site-standard-profile-request)";
        var protocol = "?callback=JSON_CALLBACK&format=jsonp&oauth2_access_token="
        var root = "https://api.linkedin.com/v1/people/~";
        var token = "AQV0d0RmptWuBrw9o0w9OIi7lVrjIKMuiguuFXJtRLVJG7oNujxzyIh2cQbPPLcclpQa6dWc-WK61wZ-Rpdzri1KyXNCs7kWach40r90KZRINCo4v9FeUJRmFq7NzooarHnae23pkW7LWV3Y2xye7byEiabPhpgasWpIESKBZ54jWVfHvag";
        
        var linkedInUrl = root + options + protocol + token;

        console.log('Logging in');
        
        // SignIn w/ LinkedIn, returns access_token.
        /*$ionicPlatform.ready(function() {
          $cordovaOauth.linkedin("75rttrx3oxeeii", "adcGXkzR4fH6e3zI", ["r_basicprofile"], "randomstring").then(function(result) {
                  
                  console.log(JSON.stringify(result));
                  linkedInUrl = linkedInUrl + result.access_token;

                  $http.jsonp(linkedInUrl)
                    .success(function(result) {
                      log_test = result;
                      console.log(JSON.stringify(result));
                    })
                    .error(function(result){
                      console.log(JSON.stringify(result));
                    });

              }, function(error) {
                  console.log(error);
              });
        });*/

        // Get LinkedIn Profile info
        $http.jsonp(linkedInUrl)
          .success(function(result) {

            result.token = token;

            var user = {
              username: result.id,
              password: result.lastName + result.id,
              profile: result,
            };

            user.profile.firstName = 'Alexander';
          
            // Check registration
            Meteor.call('hasRegistered', user.username, function(err, registered ){
              
              if (!err){
                // Registered
                if ( registered ){
                  console.log('logging in again: ' + registered);

                  Meteor.loginWithPassword(user.username, user.password, function(err){
                    if (!err){
                      
                      $auth.waitForUser().then(function(){

                        Meteor.users.update(Meteor.userId(), { $set: { profile: user.profile } });
                        console.log('updated user');
                        // Deposit major into local storage
                        // Redirect to chats;
                      })
                      
                    } else {
                      console.log('login with password failed: ' + err);
                    // Error toast
                    }
                  })

                // New Accounts
                } else {

                  
                  Meteor.call( 'getUniqueAppId', function(err, val){ 
                    if (!err){
                      user.profile.appId = val;
                      console.log('uniqueId generated: ' + val );
                    }
                    else{
                      console.log('uniqueAppId failed');
                    }
                  });


                  Accounts.createUser(user, function(err){
                    if (!err){
                      console.log('Created User');
                      // Deposit major into local storage
                      // Redirect to chats;
                    } else{
                      console.log('Couldnt create user');
                      // Error toast
                    }
                  })
                }
              }
            })
            
            console.log(JSON.stringify(result));
          })
          .error(function(result){
            // Toast: Couldn't connect to linkedin, try again. 
            console.log(JSON.stringify(result));
          });
    
    };
};