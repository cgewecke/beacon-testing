Meteor.methods({


  //---------------- Connections Collections -------------------------
  
  // @function: newConnection
  // @param: beaconIds [{transmitter: {uuid, major, minor}, receiver: username}]
  newConnection(beaconIds){

    var transIds = beaconIds.transmitter;
    var receiverId = beaconIds.receiver;
    var linkedParams = 
      [ 'id', 'num-connections', 'picture-url', 'first-name', 'last-name', 'headline',
        'location', 'industry', 'specialties', 'summary', 'email-address' ];

    var receiver = Meteor.users.findOne({username: receiverId});
    
    var transmitter = Meteor.users.findOne({ $and: 
        [{'profile.appId': transIds.uuid },
         {'profile.minor': transIds.minor},
         {'profile.major': transIds.major} 
        ]});

    if (transmitter && receiver){

      var linkedin = Linkedin().init(transmitter.profile.authToken);
      
      linkedin.people.id(receiver.username, linkedParams, 
        Meteor.bindEnvironment(
          function(err, $in){
            if (!err) {     
              var connection = { 
                transmitter: transmitter.username, 
                receiver: receiver.username,
                profile: $in
              }

              Connections.insert(connection);
              console.log(JSON.stringify(connection.profile));
            } else {
              console.log('Error: LinkedIn call failed');
            }
          }, function(err){
            console.log('Error: Couldnt bind!!!');
          })
      );
    }
    
  },

  disconnect(beaconIds){

    var transIds = beaconIds.transmitter;
    var receiverId = beaconIds.receiver;

    var receiver = Meteor.users.findOne({username: receiverId});
    
    var transmitter = Meteor.users.findOne({ $and: 
        [
          {'profile.appId': transIds.uuid },
          {'profile.minor': transIds.minor},
          {'profile.major': transIds.major} 
        ]});

    if (transmitter && receiver){
       Connections.remove({$and: 
        [
          {transmitter: transmitter.username}, 
          {receiver: receiver.username}
        
        ]}, function(err){
          console.log(JSON.stringify(err));
          return err;
        });
       return 'Success'
    } else {
      console.log('Couldnt find users to disconnect')
      return 'Discovery Failure';
    }   
  },


  // ---------------- Authentication Utilities -------------------------
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
      
      var major = instance.major;
      var minor = instance.minor;

      if (minor < 65000){
        minor = minor + 1;
      } else {
        major = major + 1;
        minor = 0;
      }

      AppInstance.update(instance._id, {major: major, minor: minor}); 
      return {major: major, minor: minor};
    
    } else {
      return undefined;
    }
    
  },

  //---------------- Chats Collections -------------------------
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