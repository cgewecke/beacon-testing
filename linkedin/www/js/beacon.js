// Service for initializing, transmitting and receiving beacons signal

angular.module('linkedin')
  .service("Beacons", Beacons);


function Beacons($rootScope, $q, $cordovaBeacon){

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
    var lastDate = new Date();
    var lastBeacon = null;

	self.quantity = uuids.length;
    self.initialized = false;
    self.lock = false;


    self.getUUID = function(index){
        return uuids[index];
    };

	// Needs to happen in $ionicPlatform.ready() in a $auth.waitForUser
	self.initialize = function(){

        var deferred = $q.defer();

        if ($rootScope.DEV || $rootScope.beaconsOFF || self.initialized  ) { deferred.resolve(); return deferred; }
           
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

        self.initialized = true;
        deferred.resolve();
        return deferred;
	};

    // setUpRegions(): initialize an array beaconRegion obj of all our possible uuid vals
    function setUpRegions(){
        for (var i = 0; i < uuids.length; i++){
            regions.push( $cordovaBeacon.createBeaconRegion('r_' + i, uuids[i], null, null, true));
        }
    };
    
    function onEntry(result){
   
        // DEV
        result.message = "ENTERING";
        Meteor.call('ping', result, function(err, connections){});
    };

    function onExit(result){

        // DEV
        result.message = "EXITING";
        Meteor.call('ping', result, function(err, connections){});


        var transmitter, pkg, beacon;
        var localId = window.localStorage['pl_id']
        var receiver = (function(){ return (localId != undefined) ? localId : Meteor.user().emails[0].address})();
        
        beacon = result.region;
        
        if (receiver && beacon){

            pkg = {
               transmitter: beacon.uuid,
               receiver: receiver,
            };
            
            Meteor.call('disconnect', pkg, function(err, success){
                (err) ? 
                    console.log(JSON.stringify(err)) : 
                    console.log(JSON.stringify(success)); 
            });

        } else {
            console.log("Error: receiver - " + receiver + " beacons: " + beacons.length);
        }
        
        
    };

    function onCapture(result){

        var beacons = result.beacons

        if (beacons.length){

            var localId = window.localStorage['pl_id'];
            var receiver = (function(){ return (localId != undefined) ? localId : Meteor.user().emails[0].address})();            
            var transmitter, pkg;

            angular.forEach(beacons, function(beacon){

                pkg = {
                   transmitter: beacon.major + '_' + beacon.minor + '_' + beacon.uuid,
                   receiver: receiver,
                   proximity: beacon.proximity 
                };
                
                Meteor.call('newConnection', pkg, function(err, result){});
                
            })
        } else {
            //console.log("Error: capture - " + receiver + " beacons: " + beacons.length);
        }
    };

    function throttle(beacon){
        
        var curDate = new Date();
        var diff = Math.abs(curDate - lastDate);
        lastDate = curDate;
        lastBeacon = beacon;

        if ( diff < 500 && lastBeacon.uuid === beacon.uuid ){
            Meteor.call('ping', {message: 'THROTTLE: ' + Math.abs(curDate - lastDate) });
            return false;
        } else {
            return true;
        } 

    }

}