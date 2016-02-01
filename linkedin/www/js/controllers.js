var log_test;

angular.module('linkedin')
  .controller('ChatsCtrl', ChatsCtrl)
  .controller('ChatDetailCtrl', ChatDetailCtrl)
  .controller('NearbyCtrl', NearbyCtrl)
  .controller('NearbyProfileCtrl', NearbyProfileCtrl)
  .controller('ProfileCtrl', ProfileCtrl)
  .controller('LoadingCtrl', LoadingCtrl)
  .controller('SettingsCtrl', SettingsCtrl);


function NearbyCtrl ($scope, $reactive, $auth, LinkedIn, Beacons){
  $reactive(this).attach($scope);
  
  this.subscribe('connections');
  this.helpers({
    connections: function () {
      return Connections.find();
    }
  });

  this.initBeacon = Beacons.initialize;
  
  this.clear = function(){
    
    var pkg = {
      transmitter: Meteor.user().email,
      receiver: Meteor.user().email
    }
    Meteor.call('disconnect', pkg, function(err, result){
      (err) ? console.log(JSON.stringify(err)) : console.log(JSON.stringify(result)); 
    })
  }
  this.notify = function(){
    console.log('notify clicked');
  }

  this.testPub = function(){

    var pkg = {
      transmitter: Meteor.user().email,
      receiver: Meteor.user().email
    }
    Meteor.call('newConnection', pkg, function(err, connections){
    })
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
   
    $cordovaContacts.save(contact).then(function(result) {
        
        $scope.flasher = true;
        
        $timeout(function(){
        
            $scope.exit = true;
            Meteor.call('addContact', self.connection._id); 
            self.connection.contactAdded = true;
            
        }, 1000)

        console.log(JSON.stringify(result));
    }, function(error) {
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
  

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    hideOnStateChange: true,
    maxWidth: 200,
    showDelay: 0
  });
  
  //$timeout(function(){
    $ionicPlatform.ready(function(){
      $ionicLoading.hide();
      $state.go('tab.profile');
    });
  //}, 2000)
  
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
  
  var ref = window.cordova.InAppBrowser.open("localhost/callback.html", '_blank');
  console.log('window: ' + JSON.stringify(ref));

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

