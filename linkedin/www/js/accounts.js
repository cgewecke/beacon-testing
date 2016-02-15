// @controller: LoginCtrl
//
// Functions/Methods for a two-step login system where signs into LinkedIn and then
// Meteor using details from their LinkedIn profile
angular.module('linkedin')
  .controller("LoginCtrl", LoginCtrl);


function LoginCtrl ($rootScope, $scope, $auth, $state, $reactive, LinkedIn, Beacons, ionicToast, $timeout ){
    
    $scope.DEV = $rootScope.DEV;

    var appHash = "Txc9"; // Constant to help generate password  
    $scope.loggingIn = false; // Dom flag for spinner that appears when returning from inAppBrowser login

    // @function: Login
    // Authenticates with LinkedIn, loads linkedin profile and passes to meteor login handlers. 
    // Shows toast on authentication failure.
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

    // @function: devLogin
    // DEVELOPMENT ONLY: Bypasses authentication call which cannot run in browser because cordova
    // inAppBrowser is device/simulator only
    $scope.devLogin = function(){
      console.log('USING DEV LOGIN');
      LinkedIn.getMe().then(function(){
        meteorLogin();
      });
    };

    // @function: meteorLogin 
    // Generates user object stub, then checks Meteor to see if account exists. 
    // Logs in w/password or creates based on result
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

      // Check registration
      Meteor.call('hasRegistered', user.username, function(err, registered ){
        
        if (!err){
        
          (registered) ? loginWithAccount(user) : createAccount(user); 
        
        } else {
          $scope.loggingIn = false;
          console.log('Registration error');
        }
      })            
      
    }

    // @function: loginWithAccount
    // Update our user w/current linkedIn profile
    // Set pl_id in local storage to user email. This variable will be accessed by
    // the beacon delegate and used to self-identify with server when woken up in the
    // background.  Redirect to setup if app is a new install, nearby otherwise.
    function loginWithAccount(user){
      console.log('Logging in with account');
      Meteor.loginWithPassword(user.username, user.password, function(err){
        if (!err){
          
          $auth.waitForUser().then(function(){
  
            window.localStorage['pl_id'] = Meteor.user().emails[0].address;
            Meteor.users.update(Meteor.userId(), { $set: { 'profile.authToken': user.profile.authToken } });
            
            if (!window.localStorage['pl_newInstall']){
              window.localStorage['pl_newInstall'] = 'true';
              $state.go('setup'); 
            } else {
              $state.go('tab.nearby');
            }

            // Delay turning spinner off - statechange sometimes takes a while because
            // nearby route has tons to resolve
            $timeout(function(){
              $scope.loggingIn = false;
            }, 3000);
          })
        
        } else {
          $scope.loggingIn = false;
          ionicToast.show("Couldn't log in to Psychic Link. (Password) Try again.", 'top', true, 2500);
        }
      });
    };

    // @function: createAccount
    // Get next beacon major/minor for this app instance, create user and save
    // email string composed of uuid, beacon major and minor there and in local storage.  
    // Redirect to setup or kick back to login if there is an error. This could happen
    // if for some reason two app simultaneously create accounts and generate the same email
    // address. Email is guaranteed to be unique.
    function createAccount(user){

      Meteor.call( 'getUniqueAppId', function(err, val){ 
        if (!err && val ){

          var i = val.minor % Beacons.quantity; // Index to select uuid

          user.profile.appId = Beacons.getUUID(i);
          user.profile.beaconName = 'r_' + i;
          user.profile.major = val.major;
          user.profile.minor = val.minor;

          user.email = val.major + '_' + val.minor + '_' + user.profile.appId;
          
          console.log("creating account: " + user.email + ': ' + user.profile.profileUrl);

          Accounts.createUser(user, function(err){
            if (!err){
  
              window.localStorage['pl_id'] = user.email;
              window.localStorage['pl_newInstall'] = 'true';
              $state.go('setup');

              $timeout(function(){
                $scope.loggingIn = false;
              }, 3000);
              
            } else{
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