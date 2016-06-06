
angular.module('linkedin')
  .service("AnimistBLE", AnimistBLE);


function AnimistBLE($rootScope, $q, $cordovaBluetoothLE){
    
    var self = this;

    // ----------------------- Public -----------------------

    // Characteristic UUIDS
    self.UUID = {
        pin : 'C40C94B3-D9FF-45A0-9A37-032D72E423A9',
        hasTx:  'BFA15C55-ED8F-47B4-BD6A-31280E98C7BA',
        authTx: '297E3B0A-F353-4531-9D44-3686CC8C4036',
        tx : '3340BC2C-70AE-4E7A-BE24-8B2ED8E3ED06'
    };

    self.endpointMap = {

        "4F7C5946-87BB-4C50-8051-D503CEBA2F19" : "05DEE885-E723-438F-B733-409E4DBFA694",
        "D4FB5D93-B1EF-42CE-8C08-CF11685714EB" : "9BD991F7-0CB9-4FA7-A075-B3AB1B9CFAC8", 
        "98983597-F322-4DC3-A36C-72052BF6D612" : "774D64CA-91C9-4C3A-8DA3-221D9CF755E7",
        "8960D5AB-3CFA-46E8-ADE2-26A3FB462053" : "33A93F3C-9CAA-4D39-942A-6659AD039232",
        "458735FA-E270-4746-B73E-E0C88EA6BEE0" : "01EC8B5B-B7DB-4D65-949C-81F4FD808A1A"
    };

    self.peripheral = {};

    self.initialize = function(){
        // Initialize connection to BLE peripheral 
        if (!$cordovaBluetoothLE.isInitialized()){

            $cordovaBluetoothLE.initialize({request: true}).then(null,
              function(obj) { logger('Initialized BLE:', obj) },
              function(obj) { logger('Failed to initialize BLE:', obj) }
            );
        };
    };

    self.openLink = function( beaconId ){

        var where = 'AnimistBLE:openLink: ';
        var d = $q.defer();
        var uuid = self.endpointMap[beaconId];
            
        // Scan, discover and compose current peripheral object
        scan(uuid).then(
            function(scan){

                connectAndDiscover(scan.address).then(
                    function(device){
                        
                        self.peripheral.address = scan.address;
                        self.peripheral.device = device;

                        subscribePin().then(
                            function(){ d.resolve(device) },
                            function(){ d.reject( where + error)}
                        );
                    },
                    // Connect & Discover fail
                    function(error){ d.reject(where + error) }
                );
            // Scan fail
            }, function(error){ d.reject(where + error) }
        );
        return d.promise;
    }

    self.closeLink = function(){
        var where = "AnimistBLE:closeLink: ";

        $cordovaBluetoothLE.close(address: self.peripheral.address).then(
            function(){ self.peripheral = {} },
            function(error){ logger(where, error) }
        );
    };

    self.hasTx = function(user, uuid, proximity){

        var where = 'AnimistBLE:hasTx: ';
        var peripheralError = 'no peripheral connection';
        var pinError = 'no PIN reading';
        var deferred = $q.defer();
        var address = self.peripheral.address
        var pin = self.peripheral.pin

        // Verify scan was called and we have time PIN
        if (!address) 
            deferred.reject(where + peripheralError )
        else if (!pin)
            deferred.reject(where + pinError)

        // Check connection
        $cordovaBluetoothLE.isConnected(address).then(
            
            // Connected
            function(){

                // hasTx ?
                publish(user, pin, self.UUID.hasTx, true).then(
                    function(tx){ deferred.resolve(tx) }, 
                    function(error){ deferred.reject( where + error) }
                )
            // Disconnected
            }, function(error){ deferred.reject(where + error)  }
        );

        return deferred.promise;
    };


    // ------------------------ Private -----------------------------------------

    // Debugging Utility 
    var logger = function(msg, obj){
        Meteor.call('ping', msg + ' ' + JSON.stringify(obj));
    }

    // @function scan( uuid ) 
    // @param uuid (String): Animist service uuid (beacon id + 1) 
    // Resolves the BLE hardware address of the endpoint peripheral
    function scan( uuid ){

        var where = 'AnimistBLE:scan: '
        var deferred = $q.defer();

        // Figure out how to scan only once per session using was connected . . . . .  
        // Scan
        $cordovaBluetoothLE.startScan( services[uuid] ).then(null,
        
            // Scan failed
            function(error){ 
                logger(where, error); 
                deferred.reject(where + error) 
            },
            // Scan succeeded
            function(scan){         
             
                logger(where, scan);
             
                // Stop Scan on Success
                $cordovaBluetoothLE.stopScan().then( 
                    function(){ deferred.resolve(scan) },
                    function(){ deferred.reject(where + error) }
                );
            }
        );

        return deferred.promise;
    };

    // Initial connection
    function connectAndDiscover( address ){

        var where = 'AnimistBLE:connectAndDiscover: '
        var deferred = $q.defer();

        // Connect 
        $cordovaBluetoothLE.connect(address: address, timeout: 5000).then(

            null,
           
           // Connect failed: close
            function(error){
                $cordovaBluetoothLE.close(address: address);
                deferred.reject(where + error);
            },

            // Connected
            function(connected){
                logger(where, connected);

                // Discover
                $cordovaBluetoothLE.discover(address: address, timeout: 5000).then(
                 
                    // Discovered
                    function(device){
                        logger(where, device);
                        deferred.resolve(device);
                    },
                    // Discover failed
                    function(error){
                        $cordovaBluetoothLE.close(address: address);
                        deferred.reject(where + error);
                    };
                );
            }
        );
        return deferred.promise;
    };

    function connect( address ){

        var where = 'AnimistBLE:connect: '
        var deferred = $q.defer();

        // Connect 
        $cordovaBluetoothLE.connect(address: address, timeout: 5000).then(

            null,
           
            // Connect failed: close
            function(error){
                $cordovaBluetoothLE.close(address: address);
                logger(where, error);
                deferred.reject(where + error);
            },

            // Connected
            function(connected){
                logger(where, connected);
                deferred.resolve();
            }
        );

        return deferred.promise;
    };


    // ---------------------  Characteristic Helpers -----------------------------
    function publish(user, PIN, target, wait){

        var msg = self.peripheral.service + '_' + PIN;
        var signed = user.sign( msg );
        var signedBytes = $cordovaBluetoothLE.stringToBytes(signed);
        var signedEncoded = $cordovaBluetoothLE.bytesToEncodedString(signedBytes);

        // Compose 'write' req to hasTx characteristic
        var req {
            address: self.peripheral.address,
            service: self.peripheral.service,
            characteristic: target,
            value: signedEncoded,
            timeout: 5000 
        };

        // Attempt write, wait for notify
        $cordovaBluetoothLE.write(req).then( 
           function(PIN){ deferred.resolve()}, 
           function(error){ deferred.reject(where + error)}
        );
    };


    function subscribeHasTx(){
        var decoded;
        var where = 'AnimistBLE:subscribeHasTx: ';
        var d = $q.defer();

        // Compose subscribe req to hasTx characteristic
        var req = {
            address: self.peripheral.address,
            service: self.peripheral.service,
            characteristic: self.uuid.hasTx
            timeout: 5000
        };

        // Attempt
        $cordovaBluetoothLE.subscribe(req).then( 
            // Auto unsubscribe callback
            null, 
            // Subscribe failed     
            function(error){ deferred.reject(where + error)},
            // Subscribed/Updated
            function(sub){ 
                // Subscribed, resolve: 
                // This is write/notify so won't get update until we
                // write our auth to hasTx.
                if (sub.status === 'subscribed'){
                    logger(where, sub);
                    d.resolve();
                } else {
                    // Update tx
                    logger(where, sub );
                    decodedTx = $cordovaBluetoothLE.encodedStringToBytes(sub.value);
                    decodedTx = $cordovaBluetoothLE.bytesToString(decodedTx));
                    self.peripheral.tx = decodedTx;
                };
            }
        );
        return deferred.promise;
    }

    function subscribePin(){
        
        var decodedTx;
        var where = 'AnimistBLE:subscribePIN: ';
        var d = $q.defer();

        // Compose subscribe req to pin characteristic
        var req = {
            address: self.peripheral.address,
            service: self.peripheral.service,
            characteristic: self.UUID.pin
            timeout: 5000
        };

        // Attempt
        $cordovaBluetoothLE.subscribe(req).then( 
            function(sub){ 
                
                // Subscribed
                if (sub.status === 'subscribed'){
                    logger(where, sub);
                } else {
                    // Update pin
                    logger(where, sub );
                    decodedTx = $cordovaBluetoothLE.encodedStringToBytes(sub.value);
                    decodedTx = $cordovaBluetoothLE.bytesToString(decodedTx));
                    self.peripheral.tx = decodedTx;
                    
                    // Resolve on initial read
                    if (d.$$state.status === 0)
                        d.resolve();
                }
            
            // Subscribe failed     
            function(error){ d.reject(where + error)}
        );

        return d.promise;
    };
};





                
