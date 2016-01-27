angular
  .module('linkedin')
  .run(run);

function run ($ionicPlatform, $auth, $state, $rootScope, LinkedIn ) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // DB testing
    $auth.waitForUser().then(function(){
      var pkg = {
        transmitter: {
          uuid: "332238CE-745A-4238-B90A-C79163A3C660",
          major: 0,
          minor: 10 
        },
        receiver: Meteor.user().username
      }
      Meteor.call('newConnection', pkg, function(err, connections){
        console.log('printing receiver:');
        //console.log(JSON.stringify(connections.receiver));
        console.log('');
        //console.log('printing transmitter:');
        //console.log(JSON.stringify(connections.transmitter));
      })
    })
  });
}