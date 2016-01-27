if (Meteor.isServer) {
  Meteor.startup(function () {
    console.log('running startup');
    // Set up counter
    if (AppInstance.find().count() === 0){
      AppInstance.insert({major: 0, minor: 0});
    }
    
    Connections.remove({});

    if (Connections.find().count() === 0){
      console.log('loading');
      var cons = [

      {
        transmitter: "SA4tMdPaww",
        receiver: "0",
        profile: {
           "emailAddress":"fake1@cyclop.se",
           "firstName":"Cyrus",
           "headline":"Tester at Cyclop.se",
           "id":"11111",
           "industry":"Internet",
           "lastName":"Delacroix",
           "location":{"country":{"code":"us"},
           "name":"Portland, Oregon Area"},
           "numConnections":0,
           "pictureUrl":"https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png",
           "summary":"The best cylinder I've ever seen was the Cyrus cylinder!"
          }
      },
      {
        transmitter: "SA4tMdPaww",
        receiver: "1",
        profile:{"emailAddress":"fake2@cyclop.se",
           "firstName":"Alexander",
           "headline":"Tester at Cyclop.se",
           "id":"222222",
           "industry":"Internet",
           "lastName":"DuPlessy",
           "location":{"country":{"code":"us"},
           "name":"Portland, Oregon Area"},
           "numConnections":0,
           "pictureUrl":"https://avatars3.githubusercontent.com/u/11214?v=3&s=460",
           "summary":"Glassssssssss."
          }
      },
      {
        transmitter: "SA4tMdPaww",
        receiver: "2",
        profile:{"emailAddress":"fake3@cyclop.se",
           "firstName":"Ahmed",
           "headline":"Tester at Cyclop.se",
           "id":"33333",
           "industry":"Internet",
           "lastName":"Boatman",
           "location":{"country":{"code":"us"},
           "name":"Portland, Oregon Area"},
           "numConnections":0,
           "pictureUrl":"https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg",
           "summary":"All these boats are like sooooo fast."
          }
      },
      {
        transmitter: "SA4tMdPaww",
        receiver: "3",
        profile:{"emailAddress":"fake4@cyclop.se",
           "firstName":"Christian",
           "headline":"Tester at Cyclop.se",
           "id":"44444",
           "industry":"Internet",
           "lastName":"Ekewege",
           "location":{"country":{"code":"us"},
           "name":"Portland, Oregon Area"},
           "numConnections":0,
           "pictureUrl":"https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png",
           "summary":"My real name is Chris Gewecke"
          }
      },
      {
        transmitter: "SA4tMdPaww",
        receiver: "555555",
        profile: {"emailAddress":"fake4@cyclop.se",
           "firstName":"Emil",
           "headline":"Tester at Cyclop.se",
           "id":"SA4tMdPaww",
           "industry":"Internet",
           "lastName":"Torkensen",
           "location":{"country":{"code":"us"},
           "name":"Portland, Oregon Area"},
           "numConnections":0,
           "pictureUrl":"https://avatars2.githubusercontent.com/u/7332026?v=3&s=400",
           "summary":"Brrrrr."
         }
      }

      ];
      for (var i = 0; i < cons.length; i++) {
        console.log('inserting connections');
        Connections.insert(cons[i]);
      }
    }
    


    if (Chats.find().count() === 0) {
      Messages.remove({});
 
      var messages = [
        {
          text: 'You on your way?',
          timestamp: moment().subtract(1, 'hours').toDate()
        },
        {
          text: 'Hey, it\'s me',
          timestamp: moment().subtract(2, 'hours').toDate()
        },
        {
          text: 'I should buy a boat',
          timestamp: moment().subtract(1, 'days').toDate()
        },
        {
          text: 'Look at my mukluks!',
          timestamp: moment().subtract(4, 'days').toDate()
        },
        {
          text: 'This is wicked good ice cream.',
          timestamp: moment().subtract(2, 'weeks').toDate()
        }
      ];
 
      for (var i = 0; i < messages.length; i++) {
        Messages.insert(messages[i]);
      }
 
      var chats = [
        {
          name: 'Ben Sparrow',
          picture: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
        },
        {
          name: 'Max Lynx',
          picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
        },
        {
          name: 'Adam Bradleyson',
          picture: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
        },
        {
          name: 'Perry Governor',
          picture: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
        },
        {
          name: 'Mike Harrington',
          picture: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
        }
      ];
 
      for (var i = 0; i < chats.length; i++) {
        var message = Messages.findOne({ chatId: { $exists: false } });
        var chat = chats[i];
        chat.lastMessage = message;
        var chatId = Chats.insert(chat);
        Messages.update(message._id, { $set: { chatId: chatId } })
      }
    }
  });
}