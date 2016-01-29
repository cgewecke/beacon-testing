// Service for initializing, transmitting and receiving beacons signal

/*angular.module('linkedin')
  .service("Beacons", Beacons);


function Beacons($q, $auth, $cordovaOauth, $ionicPlatform){

	var self = this;

	self.initialize = function(){};
	self.transmit = function(){};
	self.parseMonitorSignal = function(){};

	document.addEventListener("deviceready", onDeviceReady, false);

    function didDetermineStateForRegion(pluginResult) {
    }

    function didStartMonitoringForRegion (pluginResult) {
    }
    function didExitRegion(pluginResult) {
        $cordovaLocalNotification.add({
        id: 30244234234,
        title: "Good By!",
        text: "Hope to see you again."
            }).then(function () {
            });
    }

    function didEnterRegion (pluginResult) {
        $cordovaLocalNotification.add({
        title: "Welcome",
        text: "Tap to launch app"
            }).then(function () {

            });

    };
    function didRangeBeaconsInRegion (pluginResult) {

    }

    function onDeviceReady() {
        // Now safe to use device APIs
        function createBeacon(uuid,nofiyState) {

            var uuid = uuid; // mandatory
            var identifier = 'estimote'; // mandatory

            // throws an error if the parameters are not valid
            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);
            beaconRegion.notifyEntryStateOnDisplay = true;
            return beaconRegion;
        }
        var delegate = new cordova.plugins.locationManager.Delegate();
        delegate.didDetermineStateForRegion = didDetermineStateForRegion;

        delegate.didStartMonitoringForRegion = didStartMonitoringForRegion;

        delegate.didRangeBeaconsInRegion = didRangeBeaconsInRegion;
        delegate.didEnterRegion = didEnterRegion;
        delegate.didExitRegion = didExitRegion;

        var beaconRegion = createBeacon('02681445-8D1B-4F58-99D4-B25F4B129A58',true);
        // var beaconRegionBlue = createBeacon('02681445-8D1B-4F58-99D4-B25F4B129A58',1,,true);
        cordova.plugins.locationManager.setDelegate(delegate);

        // required in iOS 8+
        //cordova.plugins.locationManager.requestWhenInUseAuthorization();
        cordova.plugins.locationManager.requestAlwaysAuthorization();
        cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
        .fail(console.error)
        .done();

    }

}*/