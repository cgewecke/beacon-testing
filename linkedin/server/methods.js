Meteor.methods({


  //---------------- Connections Collections -------------------------
  
  ping(pkg){

    console.log('Got pinged: ' + JSON.stringify(pkg));
  }, 

  // @function: newConnection
  // @param: beaconIds [{transmitter: {uuid, major, minor}, receiver: username}]
  newConnection(beaconIds){

    var linkedParams = 
      [ 'id', 'num-connections', 'picture-url', 'first-name', 'last-name', 'headline',
        'location', 'industry', 'specialties', 'summary', 'email-address', 'positions' ];

    var receiver = Accounts.findUserByEmail(beaconIds.receiver);
    var transmitter = Accounts.findUserByEmail(beaconIds.transmitter);
    var existing = Connections.findOne({$and: [{transmitter: transmitter._id}, {receiver: receiver._id}]});

    if (existing){

      if(beaconIds.proximity != existing.proximity){
        Connections.update(existing._id, {$set: { proximity: beaconIds.proximity, isNew: false }});
        console.log('updated proximity: ' + JSON.stringify(existing));
      }
      
    } else if (transmitter && receiver){

      console.log('transmitter:');
      console.log(JSON.stringify(transmitter));
      
      var linkedin = Linkedin().init(transmitter.profile.authToken);
      
      linkedin.people.url(receiver.profile.profileUrl, linkedParams, 
        Meteor.bindEnvironment(
          function(err, $in){
            if (!err) {     
              var connection = { 
                transmitter: transmitter._id, 
                receiver: receiver._id,
                proximity: beaconIds.proximity,
                isNew: true,
                profile: $in
              }

              Connections.insert(connection);
              console.log("PROFILE IN NEW CONNECTION");
              console.log(JSON.stringify(connection.profile));
            } else {
              console.log('Error: LinkedIn call failed');
            }
          }, function(err){
            console.log('Error: Couldnt bind!!!');
          })
      );
    } else {
      console.log("ERROR - new connection, couldn't db locate trans or reciever");
    }
    
  },

  addContact(id){
    Connections.update(id, {$set: {contactAdded: true}});
  },

  disconnect(beaconIds){

    console.log('Disconnecting');
    var receiver = Accounts.findUserByEmail(beaconIds.receiver);
    var transmitter = Accounts.findUserByEmail(beaconIds.transmitter);

    if (transmitter && receiver){
       Connections.remove({$and: 
        [
          {transmitter: transmitter._id}, 
          {receiver: receiver._id}
        
        ]}, function(err){
          console.log(JSON.stringify(err));
          return err;
        });
       return 'Success'
    } else {
      return 'Discovery Failure';
    }   
  },


  // ---------------- Authentication Utilities -------------------------
  hasRegistered(name){
    console.log('ENTERING HAS hasRegistered');
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
        minor = 1;
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