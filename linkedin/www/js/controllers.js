var log_test;

angular.module('linkedin')
  .controller('ChatsCtrl', ChatsCtrl)
  .controller('ChatDetailCtrl', ChatDetailCtrl)
  .controller("LoginCtrl", LoginCtrl);

/* TO DO:

  'Work through rest of tutorial . . . '

  1. Break this out into a service
  2. Test & Handle case on app launch where access_token has been revoked or is expired 
  3. Create user accounts with name = random number, password = linkedIn id, 
  4. Profile needs all options info
  5. Server needs to create a unique major
  6. Generate 3 uuids for this app: generic transmit, 'profile peeking', chat
  7. Profile needs history (?)
  8. Profile needs 'people you want to remember'

*/
function LoginCtrl ($scope, $http, $cordovaOauth, $ionicPlatform ){
  console.log('login controller created')
  $scope.login = function(){

    var token;

    var options = ":(id,num-connections,picture-url,first-name,last-name,headline,location,site-standard-profile-request)";
    var protocol = "?callback=JSON_CALLBACK&format=jsonp&oauth2_access_token="
    var root = "https://api.linkedin.com/v1/people/~";
    var token = "AQV0d0RmptWuBrw9o0w9OIi7lVrjIKMuiguuFXJtRLVJG7oNujxzyIh2cQbPPLcclpQa6dWc-WK61wZ-Rpdzri1KyXNCs7kWach40r90KZRINCo4v9FeUJRmFq7NzooarHnae23pkW7LWV3Y2xye7byEiabPhpgasWpIESKBZ54jWVfHvag";
    
    //var linkedInUrl = "https://api.linkedin.com/v1/people/~?callback=JSON_CALLBACK&format=jsonp&oauth2_access_token=" 
    
    var linkedInUrl = root + options + protocol + token;

    console.log('Logging in');
    
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

    $http.jsonp(linkedInUrl)
      .success(function(result) {
        log_test = result;
        console.log(JSON.stringify(result));
      })
      .error(function(result){
        console.log(JSON.stringify(result));
      });
    

  };
};


function ChatsCtrl ($scope){
  
  $scope.helpers({
    chats: function () {
      return Chats.find();
    }
  });
 
  $scope.remove = remove;
 
  function remove (chat) {
    Chats.remove(chat);
  }
};


function ChatDetailCtrl($scope, $stateParams, Chats) {
  $scope.helpers({

    chat: function () {
      return Chats.findOne($stateParams.chatId);
    },
    messages: function () {
      return Messages.find({ chatId: $stateParams.chatId });
    }
  
  });
};

