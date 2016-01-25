var log_test;

angular.module('linkedin')
  .controller('ChatsCtrl', ChatsCtrl)
  .controller('ChatDetailCtrl', ChatDetailCtrl)
  .controller('NearbyCtrl', NearbyCtrl)
  .controller('ProfileCtrl', ProfileCtrl);


function NearbyCtrl ($scope, $reactive){
  $reactive(this).attach($scope);
  
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
  
  // PICTURE QUALITY ISSUE
  //http://api.linkedin.com/v1/people/~/picture-urls::(original)
  this.info = LinkedIn.me;
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

