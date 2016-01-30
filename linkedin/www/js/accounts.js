angular.module('linkedin')
  .controller("LoginCtrl", LoginCtrl);

function LoginCtrl ($scope, $auth, $state, $reactive, LinkedIn, Beacons, ionicToast ){
    $reactive(this).attach($scope);
    
    // GET TOKEN from github
    
    this.subscribe('users');
    var appHash = "Txc9";
    
    $scope.login = function(){

      LinkedIn.authenticate().then(function(){
        LinkedIn.getMe().then(function(){
          meteorLogin();
        },
        function(error){
          console.log('Linkedin data api call bad: ' + error)
        });

      }, function(error){
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

      // User object
      var user = {
        username: LinkedIn.me.id,
        password: LinkedIn.me.id + '_' + appHash,
        email: null,
        profile: {
          authToken: LinkedIn.me.authToken,
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
          console.log('Registration error');
        }
      })            
      console.log(JSON.stringify(LinkedIn.me));
    }

    // REGISTERED: Login with password. Update our user w/current linkedIn profile
    // Set beacon major - local storage sometimes gets wiped. Redirect to . . .
    function loginWithAccount(user){
      Meteor.loginWithPassword(user.username, user.password, function(err){
        if (!err){
          
          $auth.waitForUser().then(function(){
  
            window.localStorage['pl_id'] = Meteor.user().email;
            Meteor.users.update(Meteor.userId(), { $set: { 'profile.authToken': user.profile.authToken } });
            $state.go('tab.nearby');

          })
        
        } else {
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
              $state.go('tab.nearby');
              
            } else{
              console.log('createUser Error: ' + JSON.stringify(err));
              ionicToast.show("Server overloaded (CreateUser) - try again", 'top', true, 2500);
            }
          })

        } else{
          ionicToast.show("Couldn't create psychic link (AppID) - try again", 'top', true, 2500);
        }
      });
    };
};