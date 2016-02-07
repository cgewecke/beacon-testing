angular.module('linkedin')
  .controller("LoginCtrl", LoginCtrl);

function LoginCtrl ($rootScope, $scope, $auth, $state, $reactive, LinkedIn, Beacons, ionicToast ){
    
    $scope.DEV = $rootScope.DEV;

    var appHash = "Txc9";
    
    $scope.loggingIn = false;

    $scope.login = function(){

      $scope.loggingIn = true;
      LinkedIn.authenticate().then(function(){
        console.log('Authenticated');
        LinkedIn.getMe().then(function(){
          console.log('Calling meteor login');
          meteorLogin();
        },
        function(error){
          $scope.loggingIn = false;
          console.log('Linkedin data api call bad: ' + error)
        });

      }, function(error){
        $scope.loggingIn = false;
        ionicToast.show("Couldn't get your LinkedIn profile. Try again.", 'top', true, 2500);
        console.log('Linkedin login call bad: ' + JSON.stringify(error));

      });
    };

    // DEVELOPMENT
    $scope.devLogin = function(){
      console.log('USING DEV LOGIN');
      LinkedIn.getMe().then(function(){
        meteorLogin();
      });
    };


    function meteorLogin(){
      console.log('defining user in meteorLogin')
      // User object
      var user = {
        username: LinkedIn.me.id,
        password: LinkedIn.me.id + '_' + appHash,
        email: null,
        profile: {
          authToken: LinkedIn.me.authToken,
          profileUrl: LinkedIn.me.publicProfileUrl,
          notifications: [],
          notifyCount: 0,
          pushToken: null,
          major: null,
          minor: null,
          appId: null,
          session: null
        }
      };

      console.log('going into hasRegistered');
      // Check registration
      Meteor.call('hasRegistered', user.username, function(err, registered ){
        
        if (!err){
        
          console.log("ABOUT TO LOGIN WITH ACCOUNT: " + JSON.stringify(LinkedIn.me));

          (registered) ? loginWithAccount(user) : createAccount(user); 
        
        } else {
          $scope.loggingIn = false;
          console.log('Registration error');
        }
      })            
      
    }

    // REGISTERED: Login with password. Update our user w/current linkedIn profile
    // Set beacon major - local storage sometimes gets wiped. Redirect to . . .
    function loginWithAccount(user){
      console.log('Logging in with account');
      Meteor.loginWithPassword(user.username, user.password, function(err){
        if (!err){
          
          $auth.waitForUser().then(function(){
  
            (!window.localStorage['pl_newInstall']) ? 
              window.localStorage['pl_newInstall'] = 'true' : 
              false;

            window.localStorage['pl_id'] = Meteor.user().emails[0].address;
            Meteor.users.update(Meteor.userId(), { $set: { 'profile.authToken': user.profile.authToken } });
            $scope.loggingIn = false;
            $state.go('tab.nearby');

          })
        
        } else {
          $scope.loggingIn = false;
          ionicToast.show("Couldn't log in to Psychic Link. (Password) Try again.", 'top', true, 2500);
        }
      });
    };

    // NEW ACCOUNTS: Get unique beacon major for this app instance, create user and save
    // major there and in local storage. Redirect to nearby
    function createAccount(user){

      Meteor.call( 'getUniqueAppId', function(err, val){ 
        if (!err && val ){

          var i = val.minor % Beacons.quantity; // Index to select uuid

          user.profile.appId = Beacons.getUUID(i);
          user.profile.beaconName = 'r_' + i;
          user.profile.major = val.major;
          user.profile.minor = val.minor;

          user.email = val.major + '_' + val.minor + '_' + user.profile.appId;
          
          // DEBUGGING
          console.log("CREATE ACCOUNT: CLIENT");
          console.log(JSON.stringify(user));

          Accounts.createUser(user, function(err){
            if (!err){
  
              window.localStorage['pl_id'] = user.email;
              window.localStorage['pl_newInstall'] = 'true';
              $scope.loggingIn = false;
              $state.go('tab.nearby');
              
            } else{
              console.log('createUser Error: ' + JSON.stringify(err));
              $scope.loggingIn = false;
              ionicToast.show("Server overloaded (CreateUser) - try again", 'top', true, 2500);
            }
          })

        } else{
          $scope.loggingIn = false;
          ionicToast.show("Couldn't create psychic link (AppID) - try again", 'top', true, 2500);
        }
      });
    };
};