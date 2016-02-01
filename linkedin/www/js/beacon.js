// Service for initializing, transmitting and receiving beacons signal

angular.module('linkedin')
  .service("Beacons", Beacons);


function Beacons($rootScope, $cordovaBeacon){

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

    self.getUUID = function(index){
        return uuids[index];
    };

	// Needs to happen in $ionicPlatform.ready() in a $auth.waitForUser
	self.initialize = function(){

        console.log('Initializing beacons');

		var profile, appBeacon;

        // Init region array. Set device to wake app up when killed/backgrounded
        setUpRegions();
		$cordovaBeacon.requestAlwaysAuthorization();

		// Monitor all uuids
		angular.forEach(regions, function(region){
            $cordovaBeacon.startMonitoringForRegion(region);
        });

        // Range for all regions
        angular.forEach(regions, function(region){
            $cordovaBeacon.startRangingBeaconsInRegion(region);
        });

        // Register handlers
        $rootScope.$on("$cordovaBeacon:didEnterRegion", function(event, result){
            onEntry(result);
        });
		$rootScope.$on("$cordovaBeacon:didExitRegion", function(event, result){
            onExit(result);
        });
        $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, result){
            onCapture(result);
        });

        /*$rootScope.$on("$cordovaBeacon:didDetermineStateForRegion", function (event, pluginResult) {
              $scope.didDetermineStateForRegionLog += '-----' + '\n';
              $scope.didDetermineStateForRegionLog += JSON.stringify(pluginResult) + '\n';
        });*/

        // Transmit
        profile = Meteor.user().profile;
        appBeacon = $cordovaBeacon.createBeaconRegion(
            profile.beaconName,
            profile.appId,
            parseInt(profile.major),
            parseInt(profile.minor),
            true
        );

        console.log('Beacon region created: ' + JSON.stringify(appBeacon));

        $cordovaBeacon.startAdvertising(appBeacon);

	};

    // setUpRegions(): initialize an array beaconRegion obj of all our possible uuid vals
    function setUpRegions(){
        for (var i = 0; i < uuids.length; i++){
            regions.push( $cordovaBeacon.createBeaconRegion('r_' + i, uuids[i], null, null, true));
        }
    };
    
    function onEntry(result){

        //* DEV
        console.log('ON ENTRY: BEACON PARAM');
        console.log(JSON.stringify(result));
        var beacon;
        
        
        //console.log('ON ENTRY: ' + JSON.stringify(pkg));
        Meteor.call('ping on entry', beacon, function(err, connections){});

        /*angular.forEach(regions, function(region){
            $cordovaBeacon.startRangingBeaconsInRegion(region);
        })
        var b = $cordovaBeacon.createBeaconRegion(beacon.identifier, beacon.uuid, null, null, true);
        console.log("BEACON REGION in entry: " + JSON.stringify(b));

        $cordovaBeacon.startRangingBeaconsInRegion(b).then(function(){
            console.log('started ranging')
        }, function(error){
            console.log("error starting ranging" + JSON.stringify(error));
        });*/
    };

    function onExit(result){

        // DEV
        console.log('ON EXIT: BEACON PARAM');
        console.log(JSON.stringify(result));
        Meteor.call('ping on exit', result, function(err, connections){});

        var localId = window.localStorage['pl_id']
        var receiver = (function(){ return (localId != undefined) ? localId : Meteor.user().emails[0].address})();
        var transmitter, pkg, beacon;

        beacon = result.region;
        
        console.log("OnExit - receiver: " + receiver);

        if (receiver && beacon){

            pkg = {
               transmitter: beacon.major + '_' + beacon.minor + '_' + beacon.uuid,
               receiver: receiver,
            };
            
            console.log('EXITING: ' + JSON.stringify(pkg));
            /*Meteor.call('disconnect', pkg, function(err, success){
                (err) ? 
                    console.log(JSON.stringify(err)) : 
                    console.log(JSON.stringify(success)); 
            })*/
        } else {
            console.log("Error: receiver - " + receiver + " beacons: " + beacons.length);
        }
        
        
    };

    function onCapture(result){

        // DEV
        //console.log('ON CAPTURE: BEACONS PARAM');
        //console.log(JSON.stringify(beacons));
        var beacons = result.beacons
        if (beacons.length){
            var localId = window.localStorage['pl_id'];
            var receiver = (function(){ return (localId != undefined) ? localId : Meteor.user().emails[0].address})();

            console.log(receiver);
            
            var transmitter, pkg;

            console.log('IN CAPTURE: ');

            angular.forEach(beacons, function(beacon){

                pkg = {
                   transmitter: beacon.major + '_' + beacon.minor + '_' + beacon.uuid,
                   receiver: receiver,
                   proximity: beacon.proximity 
                };
                
                console.log('CAPTURED: ' + JSON.stringify(pkg));
                $cordovaBeacon.isAdvertising().then(function(result){
                    pkg.isAdvertising = result;
                    Meteor.call('ping', pkg, function(err, connections){});
                })
                
                //Meteor.call('newConnection', pkg, function(err, connections){})
            })
        } else {
            //console.log("Error: capture - " + receiver + " beacons: " + beacons.length);
        }
    };

}