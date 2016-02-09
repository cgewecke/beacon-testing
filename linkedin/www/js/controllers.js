var log_test;

angular.module('linkedin')
  .controller('ChatsCtrl', ChatsCtrl)
  .controller('ChatDetailCtrl', ChatDetailCtrl)

  .controller('NearbyCtrl', NearbyCtrl)
  .directive('beaconMap', BeaconMap)
  
  .controller('NearbyProfileCtrl', NearbyProfileCtrl)
  .controller('ProfileCtrl', ProfileCtrl)
  .controller('LoadingCtrl', LoadingCtrl)
  .controller('SettingsCtrl', SettingsCtrl)
  .controller('NotificationsCtrl', NotificationsCtrl)
  .controller('TabsCtrl', TabsCtrl);

function TabsCtrl ($scope, $reactive ){
  $reactive(this).attach($scope);

    this.helpers({
        notifyCount: function () {
          return Meteor.user().profile.notifyCount;
        }
    });  
};

function NotificationsCtrl ($scope, $reactive, Notify ){
  $reactive(this).attach($scope);
  
  this.helpers({
      notifications: function () {
        return Meteor.user().profile.notifications;
      }
  });
  
  this.testNotify = function(){
    Notify.sawProfile(Meteor.userId());
  }

  this.clearNotes = function(){
    Meteor.users.update({_id: Meteor.userId()}, 
      {$set: 
        {'profile.notifications' : [],
         'profile.notifyCount' : 0
        }
      }
    );
  };

  this.pushTest = function(){
    Meteor.call('pushTest');
  };
  
};

// Element
 function BeaconMap(GeoLocate){
    return {
       restrict: 'E',  
       template: '<div id="map"></div>',
       link: function searchboxEventHandlers(scope, elem, attrs){

          function loadMap(){};

          var map = L.map('map').setView([51.505, -0.09], 18);
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: '',
              zoomControl: false,
              id: 'epilepone.2f443807',
              accessToken: 'pk.eyJ1IjoiZXBpbGVwb25lIiwiYSI6ImNpanRyY3IwMjA2cmp0YWtzdnFoenhkbjkifQ._Sg2cIhMaGfU6gpKMmrGBA'
          }).addTo(map);

          var pulsingIcon = L.icon.pulse({iconSize:[17,17], color:'#387EF5'});
          var marker = L.marker([51.505, -0.09],{icon: pulsingIcon}).addTo(map);
       }
    };
 };

function NearbyCtrl ($scope, $rootScope, $reactive, $auth, LinkedIn, Beacons, Notify, subscription, $timeout){
  $reactive(this).attach($scope);
  
  var self = this;
  console.log('creating NearbyCtrl');
  // Slides
  self.listSlide = 0
  self.mapSlide = 1;
  self.slide = 0; 

  if (!subscription){
    console.log('Subscription failed in NearbyCtrl');
  }

  self.helpers({
      connections: function () {
        return Connections.find( {transmitter: Meteor.userId() } )
      }
  });

  self.initBeacon = Beacons.initialize;

  this.maps = function(slide){
    if (slide === self.mapSlide){
      console.log('maps!')

    }
  };
  
  this.clear = function(){
    
    var pkg = {
      transmitter: Meteor.user().profile.appId,
      receiver: Meteor.user().emails[0].address,
    }
    Meteor.call('disconnect', pkg, function(err, result){
      (err) ? console.log(JSON.stringify(err)) : console.log(JSON.stringify(result)); 
    })
  }

  this.notify = function(user){
    Notify.sawProfile(user.receiver);
  }

  this.testPub = function(){

    Meteor.call('ping', Meteor.user().emails[0].address, function(err, connections){});

    var pkg = {
      transmitter: Meteor.user().emails[0].address,
      receiver: Meteor.user().emails[0].address,
      proximity: Math.random().toString()
    }
    Meteor.call('newConnection', pkg, function(err, connections){})
  };
  
};

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

  // Add to native contacts button
  this.createContact = function(){
    
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
    
    console.log('createContact: ' + JSON.stringify(contact));
    $scope.flasher = true;
    $cordovaContacts.save(contact).then(function(result) {
        
        $timeout(function(){
        
            $scope.exit = true;
            Meteor.call('addContact', self.connection._id); 
            self.connection.contactAdded = true;
            
        }, 1000)

        console.log(JSON.stringify(result));
    }, function(error) {
        $scope.flasher = false;
        console.log(error);
    });    
  }
};

function ProfileCtrl ($scope, $reactive, $state, LinkedIn){
  $reactive(this).attach($scope);
    
  this.user = LinkedIn.me;
  this.user.contactAdded = true;
  this.user.name = this.user.firstName + ' ' + this.user.lastName;
  this.viewTitle = "You";
  
  
};

function LoadingCtrl ($scope, $ionicPlatform, $ionicLoading, $state, $timeout ){
   
  console.log('ionic loading start' );

  $ionicPlatform.ready(function(){
      $state.go('tab.nearby');
  });
  
  
};

function SettingsCtrl($scope, $reactive, $state) {
  $reactive(this).attach($scope);

  this.logout = logout;

  function logout() {
    Meteor.logout(function(err){
      $state.go('login');
    });
  }
};


function ChatsCtrl ($scope, $reactive){
  $reactive(this).attach($scope);
  
};


function ChatDetailCtrl($scope, $stateParams, Chats) {
  /*$scope.helpers({

    chat: function () {
      return Chats.findOne($stateParams.chatId);
    },
    messages: function () {
      return Messages.find({ chatId: $stateParams.chatId });
    }
  
  });*/
};

