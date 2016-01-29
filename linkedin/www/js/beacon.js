// Service for initializing, transmitting and receiving beacons signal

angular.module('linkedin')
  .service("Beacons", Beacons);


function Beacons($q, $auth, $cordovaOauth, $ionicPlatform){

	var self = this;

	var uuids = [
		"4F7C5946-87BB-4C50-8051-D503CEBA2F19", //1
		"D4FB5D93-B1EF-42CE-8C08-CF11685714EB", //2
		"98983597-F322-4DC3-A36C-72052BF6D612", //3
		"8960D5AB-3CFA-46E8-ADE2-26A3FB462053", //4
		"458735FA-E270-4746-B73E-E0C88EA6BEE0", //5
		"01EC8B5B-B7DB-4D65-949C-81F4FD808A1A", //6
		"33A93F3C-9CAA-4D39-942A-6659AD039232", //7
		"774D64CA-91C9-4C3A-8DA3-221D9CF755E7", //8
		"9BD991F7-0CB9-4FA7-A075-B3AB1B9CFAC8", //9
		"05DEE885-E723-438F-B733-409E4DBFA694", //10
	];

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

}