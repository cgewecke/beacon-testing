var log_test;

angular.module('linkedin')
  .controller('ChatsCtrl', ChatsCtrl)
  .controller('ChatDetailCtrl', ChatDetailCtrl)
  .controller('NearbyCtrl', NearbyCtrl);


function NearbyCtrl ($scope){
  
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

function ChatsCtrl ($scope){
  
  $scope.helpers({
    chats: function () {
      return Chats.find();
    }
  });
 
  $scope.remove = remove;
 
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

