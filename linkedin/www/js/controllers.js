var log_test;

angular.module('linkedin')
  .controller('ChatsCtrl', ChatsCtrl)
  .controller('ChatDetailCtrl', ChatDetailCtrl)
  .controller('NearbyCtrl', NearbyCtrl)
  .controller('ProfileCtrl', ProfileCtrl)
  .controller('LoadingCtrl', LoadingCtrl);


function NearbyCtrl ($scope, $reactive, LinkedIn){
  $reactive(this).attach($scope);
  
  this.users = [];
  this.users.push(LinkedIn.me);
  log_test = this.users;
  /*$scope.helpers({
    nearbys: function () {
      return Nearby.find();
    }
  });
 
  $scope.remove = remove;
 
  function remove (chat) {
    Chats.remove(chat);
  }*/
};

function ProfileCtrl ($scope, $reactive, $state, LinkedIn){
  $reactive(this).attach($scope);
   
  console.log('params: ' + JSON.stringify($state.params) );
  this.link = LinkedIn;
  
};

function LoadingCtrl ($scope, $ionicPlatform, $ionicLoading, $state ){
   
  console.log('ionic loading start' );
  
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    hideOnStateChange: true,
    maxWidth: 200,
    showDelay: 0
  });
  
  $ionicPlatform.ready(function(){
    console.log('ionic loading end' );
    $ionicLoading.hide();
    $state.go('tab.profile');
  });
  
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

