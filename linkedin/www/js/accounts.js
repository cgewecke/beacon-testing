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

// TO DO
// Break linkedin login out to service
// Write profile controller

angular.module('linkedin')
  .controller("LoginCtrl", LoginCtrl);

function LoginCtrl ($scope, $auth, $state, LinkedIn, ionicToast ){
  
    // GET TOKEN from github
    
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
      //LinkedIn.setAuthToken(token);
      LinkedIn.getMe().then(function(){
        meteorLogin();
      });
    };


    function meteorLogin(){

      // User object
      var user = {
        username: LinkedIn.me.id,
        password: LinkedIn.me.lastName + '_' + appHash,
        profile: {
          info: LinkedIn.me,
          session: null,
          appId: null,
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
                  $state.go('tab.nearby');

                })
              
              } else {
                ionicToast.show("Couldn't log in to Psychic Link. (Password) Try again.", 'top', true, 2500);
              }
            })

          // NEW ACCOUNTS: Get unique beacon major for this app instance, create user and save
          // major there and in local storage. Redirect to nearby
          } else {

            Meteor.call( 'getUniqueAppId', function(err, val){ 
              if (!err && val ){
                
                user.profile.appId = val;
                
                Accounts.createUser(user, function(err){
                  if (!err){
                    window.localStorage['pl_major'] = user.profile.appId;
                    $state.go('tab.nearby');
                  } else{
                    ionicToast.show("Couldn't create psychic link (CreateUser) - try again", 'top', true, 2500);
                  }
                })

              } else{
                ionicToast.show("Couldn't create psychic link (AppID) - try again", 'top', true, 2500);
              }
            });
            
          }
        }
      })            
      console.log(JSON.stringify(LinkedIn.me));
    }
};