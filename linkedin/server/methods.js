Meteor.methods({


  //---------------- Logging/Debugging -------------------------
  ping(pkg){

    console.log('Got pinged: ' + JSON.stringify(pkg));
  }, 

  pushTest(){
    Push.sendAPN("79b229d8a40309c5498c75fba2b2c16a5cf6065be976c89e3c0f25ec2870633a", 
      {from: 'push',title: 'Congratulations',text: 'You can now Push to this device!'});
  },
  //---------------- Notifications -------------------------
  // @function: notify
  // @param: info {target: _id, notification: {} }
  // Adds a notification to the receiver's notifications array, increments their notify count 
  notify(info){
    console.log('in notify');

    var target, note;

    // Device Notify
    Meteor.users.update({_id: info.target},{
      $inc: {'profile.notifyCount': 1 },
      $push: {'profile.notifications': info.notification} 
    });

    // Push Notify  
    target = Meteor.users.findOne({_id: info.target});
    
    if (target && target.profile.pushToken){
      console.log("Token:" + target.profile.pushToken);
      note = { from: 'push', text: info.notification.name + ' checked your profile.', sound: 'ping.aiff'};
      Push.sendAPN(target.profile.pushToken, note);
    }
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

    var existing = null;
    var linkedParams = 
      [ 'id', 'num-connections', 'picture-url', 'first-name', 'last-name', 'headline',
        'location', 'industry', 'specialties', 'summary', 'email-address', 'positions' ];

    var receiver = Accounts.findUserByEmail(beaconIds.receiver);
    var transmitter = Accounts.findUserByEmail(beaconIds.transmitter);

    if (transmitter && receiver){

      Connections.upsert(
        {$and: [{transmitter: transmitter._id}, {receiver: receiver._id}]}, 
        {$set: { 
          transmitter: transmitter._id, 
          receiver: receiver._id,
          transUUID: transmitter.profile.appId,
          proximity: beaconIds.proximity }
        }
      );
    
    } else {

      console.log("Beacons ids are bad: " + JSON.stringify(beaconIds));
      return;
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