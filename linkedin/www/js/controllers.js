var log_test;

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

function TabsCtrl ($scope, $reactive ){
  $reactive(this).attach($scope);

    this.helpers({
        notifyCount: function () {
          if(Meteor.user()) return Meteor.user().profile.notifyCount;
        }
    });  
};

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

function NotificationsCtrl ($scope, $reactive, Notify ){
  $reactive(this).attach($scope);
  
  this.helpers({
      notifications: function () {
        return Meteor.user().profile.notifications;
      }
  });
 
};


function NearbyCtrl ($scope, $reactive, LinkedIn, Notify, GeoLocate, subscription ){
  $reactive(this).attach($scope);
  
  var self = this;

  // Slides
  self.listSlide = 0
  self.mapSlide = 1;
  self.slide = 0; 
  self.geolocate = GeoLocate;

  if (!subscription){
    MSLog('Subscription failed in NearbyCtrl');
  }

  self.helpers({
      connections: function () {
        return Connections.find( {transmitter: Meteor.userId() } )
      }
  });

  this.maps = function(slide){
    if (slide === self.mapSlide){
    }
  };

  this.notify = function(user){
    Notify.sawProfile(user.receiver);
  }

};

// STUB . . .
function NotificationsProfileCtrl ($scope, $reactive, $stateParams){
  $reactive(this).attach($scope);

}
  
  
function NearbyProfileCtrl ($scope, $reactive, $stateParams, $ionicPlatform, $cordovaContacts, $timeout, LinkedIn){
  
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
  this.currentUser = Meteor.user().username;

  // Add to native contacts button
  this.createContact = function(){
    
    MSLog('@NearbyProfileCtrl:createContact');

    var contact ={
      "displayName": this.user.name,
      "emails": (this.user.emailAddress) ? 
        [{ "value": this.user.emailAddress, 
           "type": "business" }] : null,
      "organizations": (this.user.positions) ?
        [{"type": "Company", 
          "name": this.user.positions.values[0].company.name,
          "title": this.user.positions.values[0].title 
        }] : null,
      "photos": [{"value": this.user.pictureUrl}],
      "birthday": Date('5/5/1973')
    };
    
    $scope.flasher = true;
    $cordovaContacts.save(contact).then(function(result) {
        
        $timeout(function(){
        
            $scope.exit = true;
            Meteor.call('addContact', self.connection._id); 
            self.connection.contactAdded = true;
            
        }, 1000)

    }, function(error) {
        $scope.flasher = false;
        MSLog('@NearbyProfileCtrl:createContact: failed: ' + error);
    });    
  }
};

function ProfileCtrl ($scope, $reactive, $state, LinkedIn){
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


