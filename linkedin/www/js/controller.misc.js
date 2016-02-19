var log_test;
// controller.misc.js
// These are little controllers for various routes/views. See config.routes.js
angular.module('linkedin')
  
  .controller('NearbyCtrl', NearbyCtrl)
  .controller('NearbyProfileCtrl', NearbyProfileCtrl)
  .controller('ProfileCtrl', ProfileCtrl)
  .controller('LoadingCtrl', LoadingCtrl)
  .controller('SettingsCtrl', SettingsCtrl)
  .controller('NotificationsCtrl', NotificationsCtrl)
  .controller('NotificationsProfileCtrl', NotificationsProfileCtrl)
  .controller('TabsCtrl', TabsCtrl)
  .controller('SetupCtrl', SetupCtrl);


// @controller TabsCtrl
// @params: $scope, $reactive
//
// Exposes user profile var 'notifyCount' (the number of unchecked notifications)
// to the DOM to determine badge display over tab icon
function TabsCtrl ($scope, $reactive ){
  $reactive(this).attach($scope);

    this.helpers({
        notifyCount: function () {
          if(Meteor.user()) return Meteor.user().profile.notifyCount;
        }
    });  
};

// @controller SetupCtrl
// @params: $scope, $state
//
// Functions to toggle state change when user approves requests for permission to use
// iBeacon and APNS on new account creation and new installs
function SetupCtrl ($scope, $state ){
  this.ready = false;

  this.accept = function(){
    this.ready = false;
    $state.go('tab.nearby');
  };

  this.reject = function(){
    $state.go('login');
  };

};

// @controller NotificationsCtrl
// @params: $scope, $reactive
//
// Exposes array of notifications in user.profile to DOM for
// tab-notifications view
function NotificationsCtrl ($scope, $reactive ){
  $reactive(this).attach($scope);
  
  this.helpers({
      notifications: function () {
        return Meteor.user().profile.notifications;
      }
  });
 
};

// @controller NearbyCtrl
// @params: $scope, $reactive
//
// Exposes Meteor mongo 'connections' to DOM, filtered against current user as 'transmitter'
// Subscription to 'connections' is handled in the route resolve and checked here. Also
// exposes GeoLocate service (for the maps view) and Notify service (to trigger notification when user
// clicks on list item to see profile)
function NearbyCtrl ($scope, $reactive, Notify, GeoLocate, subscription ){
  $reactive(this).attach($scope);
  
  var self = this;

  // Slide constants
  self.listSlide = 0
  self.mapSlide = 1;
  self.slide = 0; 

  // Services
  self.geolocate = GeoLocate;
  self.notify = Notify;

  if (!subscription){
    MSLog('Subscription failed in NearbyCtrl');
  }

  self.helpers({
      connections: function () {
        return Connections.find( {transmitter: Meteor.userId() } )
      }
  });

};

// @controller: NotificationsProfileCtrl
// @params: $scope, $stateParams
// 
// This view is a child of notifications: tab/notifications/:sender
// Controller iterates through current user's array of notifications to 
// locate one with correct :sender and populates the default profile
// template with relevant info. This view is cached per unique $stateParams 
// Meteor.userId
function NotificationsProfileCtrl ($scope, $stateParams){
  
  var self = this;
  var notes = Meteor.user().profile.notifications;

  self.user = null; // The note sender's profile;

  if (notes){
    for(var i = 0; i < notes.length; i++){
      if (notes[i].sender === $stateParams.sender){
        self.user = notes[i].profile; 
        self.user.name = this.user.firstName + ' ' + this.user.lastName;
        self.viewTitle = this.user.name;
        break;
      }
    }
  };

}
  
function NearbyProfileCtrl ($scope, $reactive, $stateParams, $cordovaContacts, $timeout, LinkedIn){
  
  $reactive(this).attach($scope);

  var self = this;
  
  // DB: Connections, get profile
  this.subscribe('connections');

  this.helpers({
    connection: function () {
      return Connections.findOne({'profile.id': $stateParams.userId});
    }
  });

  // Template vars
  this.user = this.connection.profile;
  this.user.name = this.user.firstName + ' ' + this.user.lastName;
  this.viewTitle = this.user.name;
  
};

function ProfileCtrl ($scope, $reactive, LinkedIn){
  $reactive(this).attach($scope);
    
  this.user = LinkedIn.me;
  this.user.name = this.user.firstName + ' ' + this.user.lastName;
  this.viewTitle = "You";
  this.currentUser = Meteor.user().username;
  
};

function LoadingCtrl ($ionicPlatform, $state, $timeout, ionicToast ){
   
  $ionicPlatform.ready(function(){
      $state.go('tab.nearby');

      $timeout(function(){
        var message;

        if (Meteor.status().status != 'connected'){
          message = "There's a problem connecting to the server. Try again later."
          ionicToast.show(message, 'top', true, 2500);
          $state.go('login');
        }
      }, 5000)
  });

  
  
};

function SettingsCtrl($scope, $state, GeoLocate, Notify, ionicToast) {

  var message = "Go to Settings > LinkedIn in your device's settings menu to change this."
  this.geolocate = {enabled: true};
  this.notify = {enabled: true};

  this.logout = function() {
    Meteor.logout(function(err){
      $state.go('login');
    });
  }

  this.toast = function(){
    ionicToast.show(message, 'middle', true, 2500);
  }

  // ------------------ -----  TESTING ----------------------------------
  // Test meteor method: disconnect by disconnecting any self-connections
  this.clearPub = function(){
    
    var pkg = {
      transmitter: Meteor.user().profile.appId,
      receiver: Meteor.user().emails[0].address,
    }
    Meteor.call('disconnect', pkg, function(err, result){
      (err) ? console.log(JSON.stringify(err)) : console.log(JSON.stringify(result)); 
    })
  }

  // Clears all notifications from current user
  this.clearNotes = function(){
    Meteor.users.update({_id: Meteor.userId()}, 
      {$set: 
        {'profile.notifications' : [],
         'profile.notifyCount' : 0
        }
      }
    );
  };

  // Test meteor method: newConnection() by adding self to connections
  this.testPub = function(){

    var pkg = {
      transmitter: Meteor.user().emails[0].address,
      receiver: Meteor.user().emails[0].address,
      proximity: Math.random().toString()
    }
    Meteor.call('newConnection', pkg, function(err, connections){})
  };

  // Test Notify.sawProfile method by notifying self
  this.testNotify = function(){
    Notify.sawProfile(Meteor.userId());
  }

};


