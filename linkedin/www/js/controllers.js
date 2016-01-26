var log_test;

angular.module('linkedin')
  .controller('ChatsCtrl', ChatsCtrl)
  .controller('ChatDetailCtrl', ChatDetailCtrl)
  .controller('NearbyCtrl', NearbyCtrl)
  .controller('NearbyProfileCtrl', NearbyProfileCtrl)
  .controller('ProfileCtrl', ProfileCtrl)
  .controller('LoadingCtrl', LoadingCtrl)
  .controller('SettingsCtrl', SettingsCtrl);


function NearbyCtrl ($scope, $reactive, LinkedIn){
  $reactive(this).attach($scope);
  
  this.helpers({
    connections: function () {
      return Connections.find();
    }
  });
  //this.users = [];
  //this.users.push(LinkedIn.me);
  
  this.notify = function(){
    console.log('notify clicked');
  }
  
};

function NearbyProfileCtrl ($scope, $reactive, LinkedIn){
  $reactive(this).attach($scope);
  
  this.user = LinkedIn.me;
  this.viewTitle = this.user.name;


  
};

function ProfileCtrl ($scope, $reactive, $state, LinkedIn){
  $reactive(this).attach($scope);
   
  
  this.user = LinkedIn.me;
  this.viewTitle = "You";
  console.log('user at profctrl init: ' + JSON.stringify(this.user) );
  
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
  
  $timeout(function(){
    $ionicPlatform.ready(function(){
      $ionicLoading.hide();
      $state.go('tab.profile');
    });
  }, 2000)
  
};

function SettingsCtrl($scope, $reactive, $state) {
  $reactive(this).attach($scope);

  this.logout = logout;

  ////////////

  function logout() {
    Meteor.logout((err) => {
      $state.go('login');
    });
  }
};


function ChatsCtrl ($scope, $reactive){
  $reactive(this).attach($scope);
  
  this.helpers({
    chats: function () {
      return Chats.find();
    }
  });
 
  this.remove = remove;
 
  function remove (chat) {
    Chats.remove(chat);
  }
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

