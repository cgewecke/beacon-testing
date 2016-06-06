// @service: Beacons
// Handlers for initializing, transmitting and receiving of beacon signals
angular.module('linkedin')
  .service("Beacons", Beacons);


function Beacons($rootScope, $q, $cordovaBeacon, AnimistBLE){

    var self = this;
    var BLE = AnimistBLE;

    // The set of uuids to monitor for
    var uuids = [
        "4F7C5946-87BB-4C50-8051-D503CEBA2F19" //, //1
        //"D4FB5D93-B1EF-42CE-8C08-CF11685714EB", //2
        //"98983597-F322-4DC3-A36C-72052BF6D612", //3
        //"8960D5AB-3CFA-46E8-ADE2-26A3FB462053", //4
        //"458735FA-E270-4746-B73E-E0C88EA6BEE0", //5
    ];

    // ------------------------  Logger Utility --------------------------
    var logger = function(msg, obj){
        Meteor.call('ping', msg + ' ' + JSON.stringify(obj));
    }

    // ------------------------  Public ---------------------------------
    self.regions = [];
    self.quantity = uuids.length;
    self.initialized = false;
    self.midTransaction = false;
    self.canCapture = true;

    // @function: getUUID 
    // Exposes the uuid array. In LoginCtrl, the modulus of the Beacon minor and the 
    // uuid array side is used to select a uuid. This allows them to be distributed evenly 
    // across acounts and minimizes the likelyhood that a duplicate uuid will be present
    // in any group of phones. See beacon-testing/issues/15 for details. 
    self.getUUID = function(index){
        return uuids[index];
    };

    // @function initialize() 
    // Sets up beaconing in app. This method resolves on the Nearby tab, so it may
    // have already run as user navigates around. Rejects if user does not authorize.
    self.initialize = function(){
        
        var deferred = $q.defer();

        // Return if initialized. Also beacons cannot run in browser + output is annoying in XCode.
        if ($rootScope.DEV || $rootScope.beaconsOFF || self.initialized  ) { deferred.resolve(); return deferred; }
           
        MSLog('@beacons:initialize');

        var profile, appBeacon;

        // Init region array. Set device to wake app up when killed/backgrounded
        setUpRegions();
        $cordovaBeacon.requestAlwaysAuthorization();

        // Monitor all uuids
        angular.forEach(self.regions, function(region){
            $cordovaBeacon.startMonitoringForRegion(region);
        });

        // Range for all regions
        angular.forEach(self.regions, function(region){
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

        // Initialize BLE
        AnimistBLE.initialize();

        // Check authorization before resolving. Remove newInstall key 
        // from local storage so that a pw/login will redirect to the settings
        // page.
        $cordovaBeacon.getAuthorizationStatus().then(
            function(status){
                self.initialized = true;
                deferred.resolve();
            }, function(error){
                self.initialized = false;
                window.localStorage.removeItem('pl_newInstall');
                deferred.reject('AUTH_REQUIRED');
            }
        );
        
        return deferred;
    };

    // ------------------------  Private ---------------------------------
    // setUpRegions(): initialize an array beaconRegion obj of all our possible uuid vals
    function setUpRegions(){
        for (var i = 0; i < uuids.length; i++){
            self.regions.push( $cordovaBeacon.createBeaconRegion('r_' + i, uuids[i], null, null, true));
        }
    };
    
    // @function: onExit
    // @param: result (this only contains uuid, not major/minor)
    // Called when monitoring exits a region. Pulls app identifier from local storage and
    // attempts to remove any connections where this app is the receiver and the transmitter
    // has the uuid specified by 'result'.   
    function onExit(result){

        MSLog('@beacons:onExit');

        var transmitter, pkg, beacon;
        var localId = window.localStorage['pl_id']
        var receiver = (localId != undefined) ? localId : Meteor.user().emails[0].address;
        
        beacon = result.region;
        
        if (beacon){

            pkg = {
               transmitter: beacon.uuid,
               receiver: receiver,
            };

            //AnimistBLE.terminate();
            BLE.close();
            Meteor.call('disconnect', pkg);

        } else {
            MSLog("@beacon:disconnect. Error: receiver - " + receiver);
        }
        
        
    };

    // @function: onCapture
    // @param: result (result.beacons is an array)
    // Called when ranging detects a beacon. Pulls app identifier from local storage and
    // attempts to create a connection record in the meteor DB.  
    function onCapture(result){

        var beacons = result.beacons
        var test_uuid = '56D2E78E-FACE-44C4-A786-1763EA8E4302';
        var scan_result, transmitter, proximity, beacon;

        if (beacons.length){
            
            /* DEVELOPMENT: CHANGE */
            beacon = beacon[0];
            logger('Captured: ', beacon.uuid );
            // ----------------------
                  
            AnimistBle.listen(beacon.uuid, beacon.proximity);
        };
    };
}