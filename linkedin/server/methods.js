Meteor.methods({

  hasRegistered(name){
  
    var user = Meteor.users.find({username: name});
    if (user.count()) 
      return true;
    else
      return false;
  },

  getUniqueAppId(){
    var instance = AppInstance.findOne();
    if (instance){
      var val = instance.counter;
      AppInstance.update(instance._id, {$inc: {counter: 1}});
      return counter;
    } else {
      return undefined;
    }
    
  },


  newMessage(message) {
    check(message, {
      text: String,
      chatId: String
    });
 
    message.timestamp = new Date();
 
    var messageId = Messages.insert(message);
    Chats.update(message.chatId, { $set: { lastMessage: message } });
    return messageId;
  }
});