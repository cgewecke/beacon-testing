// Service for initializing, transmitting and receiving beacons signal

angular.module('linkedin')
  .service("Beacons", Beacons);


function Beacons($cordovaBeacon){

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

    var regions = [];

	self.quantity = uuids.length;

	// Needs to happen in $ionicPlatform.ready() in a $auth.waitForUser
	self.initialize = function(){

		var profile, appBeacon;

        // Init region array
        setUpRegions();

        // Set device to wake app up when killed/backgrounded
		$cordovaBeacon.requestAlwaysAuthorization();

		// Monitor all uuids
		angular.forEach(regions, function(region){
            $cordovaBeacon.startMonitoringForRegion(region);
        })

        // Register handlers
        $rootScope.$on("$cordovaBeacon:didEnterRegion", function(result){
            onEntry(result);
        });
		$rootScope.$on("$cordovaBeacon:didExitRegion", function(result){
            onExit(result);
        });
        $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(result){
            onCapture(result);
        });

        // Transmit
        profile = Meteor.user().profile;
        appBeacon = $cordovaBeacon.createBeaconRegion(
            profile.beaconName,
            profile.appId,
            parseInt(profile.major),
            parseInt(profile.minor)
        });

        $cordovaBeacon.startAdvertising();
	};

    // setUpRegions(): initialize an array beaconRegion obj of all our possible uuid vals
    function setUpRegions(){
        for (int i = 0; i < uuids.length; i++){
            regions.push( $cordovaBeacon.createBeaconRegion('r_' + i, uuids[i]);
        }
    }
    
    function onEntry(result){
        angular.forEach(regions, function(region){
            $cordovaBeacon.startRangingBeaconsInRegion(region);
        })
    };

    function onExit(result){
        // Remove self from connections
    }

    function onCapture(result){
        // add self to connections
    }

}