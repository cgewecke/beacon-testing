Meteor.methods({


  //---------------- Logging/Debugging -------------------------
  ping(pkg){

    console.log('Got pinged: ' + JSON.stringify(pkg));
  }, 

  //---------------- Notifications -------------------------
  // @function: notify
  // @param: info {target: _id, notification: {} }
  // Adds a notification to the receiver's notifications array, increments their notify count 
  notify(info){
    console.log('in notify');
    Meteor.users.update({_id: info.target},{
      $inc: {'profile.notifyCount': 1 },
      $push: {'profile.notifications': info.notification} 
    });
  },


  // @function: resetNotifyCounter
  // @param: info {target: _id, notification: {} }
  // Resets notifyCount to zero (for updating client side badges etc. . .)
  resetNotifyCounter(){
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.notifyCount': 0}});
  },

  addContact(id){
    Connections.update(id, {$set: {contactAdded: true}});
  },

  //---------------- Connections -------------------------
  // @function: newConnection
  // @param: beaconIds [{transmitter: email, receiver: email}]
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
        return true;
      }
      
    } else if (transmitter && receiver){
      
      // This is bad. There is no guarantee this token will be any good
      // since it expires every 60 days and we don't know if the receiver
      // ever uses this app. Apply for search API? 
      var linkedin = Linkedin().init(receiver.profile.authToken);
      
      linkedin.people.me(linkedParams, 
        Meteor.bindEnvironment(
          function(err, $in){

            // LinkIn call success: Add connection
            if (!err || !$in.errorCode) {     

              var connection = { 
                transmitter: transmitter._id, 
                receiver: receiver._id,
                transUUID: transmitter.profile.appId,
                proximity: beaconIds.proximity,
                isNew: true,
                profile: $in
              }

              Connections.insert(connection);
              console.log("PROFILE IN NEW CONNECTION");
              console.log(JSON.stringify(connection.profile));
              return connection;

            // LinkIn call failure: Bad token ?  
            } else {
              error = 'NEW CONNECTION ERROR: LinkedIn call failed';
              console.log(error);
              console.log($in.message);
              return error
            }

          // Bind Environment error  
          }, function(err){
            error = 'NEW CONNECTION ERROR: Couldnt bubd';
            console.log(error);
            return error;
          })
      );
    } else {
      error = "NEW CONNECTION ERROR - new connection, couldn't db locate trans or reciever"
      console.log(error);
      return (error)
    }
    
  },

  // @function: disconnect
  // @param: beaconIds [{transmitter: uuid, receiver: email}]
  disconnect(beaconIds){

    console.log('Disconnecting: ' + JSON.stringify(beaconIds));
    var receiver = Accounts.findUserByEmail(beaconIds.receiver);
    var transmitter = beaconIds.transmitter;

    if (transmitter && receiver){
       Connections.remove({$and: 
        [
          {transUUID: transmitter}, 
          {receiver: receiver._id}
        
        ]}, function(err){
          console.log(JSON.stringify(err));
          return err;
        });
       console.log('Successful removal');
       return 'Success';
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