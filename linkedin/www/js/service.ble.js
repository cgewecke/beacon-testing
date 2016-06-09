// TO DO:
// User verification
// Peripheral Logic
// Transaction caching around proximity

angular.module('linkedin')
  .service("AnimistBLE", AnimistBLE);

function AnimistBLE($rootScope, $q, $cordovaBluetoothLE, AnimistAccount ){

    var user = null;
    var midTransaction = false;  
    var canTransact = true;
    var initialized = false;

    var events = {
        receivedTx: 'Animist:receivedTx',
        signedTxSuccess: 'Animist:signedTxSuccess',
        signedTxFailure: 'Animist:signedTxFailure',
        authTxSuccess: 'Animist:authTxSuccess',
        authTxSuccess: 'Animist:authTxFailure',
        unauthorizedTx: 'Animist:unauthorizedTx'
    };

    // ----------------------- Public -----------------------

    var self = this;

    // Characteristic UUIDS
    self.UUID = {
        pin : 'C40C94B3-D9FF-45A0-9A37-032D72E423A9',
        hasTx:  'BFA15C55-ED8F-47B4-BD6A-31280E98C7BA',
        authTx: '297E3B0A-F353-4531-9D44-3686CC8C4036',
        tx : '3340BC2C-70AE-4E7A-BE24-8B2ED8E3ED06'
    };

    // Animist Beacon UUIDS (Keys) and their corresponding Peripheral UUIDS
    self.endpointMap = {

        "4F7C5946-87BB-4C50-8051-D503CEBA2F19" : "05DEE885-E723-438F-B733-409E4DBFA694",
        "D4FB5D93-B1EF-42CE-8C08-CF11685714EB" : "9BD991F7-0CB9-4FA7-A075-B3AB1B9CFAC8", 
        "98983597-F322-4DC3-A36C-72052BF6D612" : "774D64CA-91C9-4C3A-8DA3-221D9CF755E7",
        "8960D5AB-3CFA-46E8-ADE2-26A3FB462053" : "33A93F3C-9CAA-4D39-942A-6659AD039232",
        "458735FA-E270-4746-B73E-E0C88EA6BEE0" : "01EC8B5B-B7DB-4D65-949C-81F4FD808A1A"
    };

    self.peripheral = {};
    self.txCache = {};

    self.initialize = function(_user){

        var where = 'AnimistBLE:initialize: ';
        var userError = 'invalid user: ' + JSON.stringify(AnimistAccount);
        var d = $q.defer();

        initialized = false;
        
        if ( AnimistAccount.validate(_user)) {
            user = _user;  
            
            $cordovaBluetoothLE.initialize({request: true}).then(
                null,
                function(error) { 
                    initialized = false; 
                    logger(where, error); 
                    d.reject();
                },
                function(success) { 
                    initialized = true; 
                    logger(where, success);
                    d.resolve(); 
                }
            );
        } else {
            logger(where, userError);
            d.reject();
        }

        return d.promise;
    };

    self.listen = function(uuid, proximity){

        var where = 'AnimistBLE:listen: ';
        var d = $q.defer();
        
        // Verify that we initialized
        if (!initialized){
            d.reject({ state: 0, msg: 'NOT_INITIALIZED' });

        } else if ( !isAnimistSignal(uuid)){
            d.reject({ state: 0, msg: 'BAD_UUID: ' + uuid });

        // Return if we are connected/connecting etc 
        } else if ( midTransaction ){
            d.resolve({state: 1, msg: 'TRANSACTING'});

        // Connect 
        } else if ( canTransact ){
            midTransaction = true;
            d.resolve({state: 1, msg: 'CONNECTING'});

            self.openLink(uuid).then(function(device){
                /*self.hasTx(uuid, proximity).then(function(tx){

                    // Case: User can sign their own tx
                    if (tx.authority === user.address) {

                        tx = user.sign(tx);
                        self.signTx(tx, uuid).then( 

                            function(txHash){
                                $rootScope.$broadcast( events.signedTxSuccess); 
                                canTransact = false;
                            }, 
                            function(error){
                                $rootScope.$broadcast( events.signedTxFailure );
                            }

                        ).finally(function(){ self.closeLink() });

                    // Case: Signing will be remote - ask endpoint to validate presence
                    } else if ( tx.authority === user.remoteAuthority){

                        self.authTx(user, transmitter).then(
                            
                            function(txHash){
                                $rootScope.$broadcast( events.authTxSuccess );
                                canTransact = false;
                            }, 
                            function(error){
                                $rootScope.$broadcast( events.authTxFailure );
                            }
                        ).finally(function(){ self.closeLink() });

                    // No one is authorized (Bad api key etc . . .)
                    } else {
                        $rootScope.$broadcast( events.unauthorizedTx );
                        self.closeLink();
                        canTransact = false; 
                    }

                // Fail stack: hasTx, openLink   
                }, function( error ){ logger(where, error) }) */
            }, function( error ){ logger(where, error) });

        /*} else if ( either error state or post-successful tx ) . . {
                //*************
                //**************/
        };

        return d.promise;
    }

    self.openLink = function( beaconId ){

        var where = 'AnimistBLE:openLink: ';
        var d = $q.defer();
        logger(where, beaconId);
        // Production
        //var uuid = self.endpointMap[beaconId];
        
        // Testing
        var uuid = '56D2E78E-FACE-44C4-A786-1763EA8E4302';

        // Peripheral has not been connected to yet
        if (Object.keys(self.peripheral).length === 0){
            
            // Scan, discover and compose current peripheral object
            scan(uuid).then(
                function(scan){
                    logger(where, scan);
                    connectAndDiscover(scan.address).then(
                        function(device){
                            
                            // Bind service to device
                            self.peripheral.address = scan.address;
                            // ***** TESTING ******
                            self.peripheral.service = uuid;

                            // Setup Subscriptions
                            readPin().then( function(){ 
                                subscribeHasTx().then( function(){
                                    
                                    d.resolve(device);

                                // Fail stack: hasTx -> pin -> con&dis -> scan
                                }, function(error){ d.reject( where + JSON.stringify(error))})
                            }, function(error){ d.reject( where + JSON.stringify(error))})
                        },function(error){ d.reject(where + JSON.stringify(error))})
                }, function(error){ d.reject(where + JSON.stringify(error))}
            );

        // Or we're reconnecting
        } else {
            d.resolve(self.peripheral);
        }    
        
        return d.promise;
    }

    self.closeLink = function(){
        var where = "AnimistBLE:closeLink: ";

        $cordovaBluetoothLE.close(self.peripheral.address).
            then().finally(function(result){
                self.cache = {};
                self.peripheral = {}; 
                midTransaction = false;
                logger(where, result); 
            }
        );
    };

    self.hasTx = function( pin, proximity){

        var required, signedPin;
        var where = 'AnimistBLE:hasTx: ';
        var d = $q.defer();
        var peripheral = canCall();

        if (peripheral) {

            // Check connection
            $cordovaBluetoothLE.isConnected(address).then(
                // Connected
                function(){
    
                    signedPin = user.sign(self.pin);
                    write(signedPin, proximity, self.UUID.hasTx ).then(
                        function(tx){

                            // Resolve when the hasTx subscription event fires
                            $rootScope.$on('Animist:gotTx', function(){

                                // Required proximity
                                required = self.peripheral.tx.proximity;

                                // Case: no tx found
                                if (self.peripheral.tx == null){
                                    d.reject({status: 'none' });

                                // Case: proximity requirement mismatch
                                } else if (required != 'any' && required != proximity){
                                    d.reject({status: 'proximity', proximity: required });
                                
                                // Case: ok
                                } else {
                                    d.resolve(self.peripheral.tx);
                                }
                            }); 
                        }, 
                        // Write failed
                        function(error){ d.reject( {status: undefined, msg: where + error})})
                // Disconnected
                }, function(error){ d.reject({ status: undefined, msg: where + error })}
            );

        } else {
            d.reject( where + peripheral );
        }
        return d.promise;
    };

    self.authTx = function(user, uuid, proximity){

        var where = 'AnimistBLE:authTx: ';
        var d = $q.defer();
        var peripheral = canCall();

        if (!peripheral){ 
            d.reject( where + peripheral );
            return d.promise;
        };

        // Check connection
        $cordovaBluetoothLE.isConnected(address).then(
            
            // Connected
            function(){

                // Authenticate
                write( self.UUID.authTx, true).then(
                    function(ok){ 

                        // UNDERCONSTRUCTION . . . .
                        // ****************
                        //publish()
                        //d.resolve(tx) 
                        // ****************
                    }, 
                    function(error){ d.reject( where + error) })
            // Disconnected
            }, function(error){ d.reject(where + error)  }
        );
    }


    // ------------------------ Private -----------------------------------------

    // Debugging Utility 
    var logger = function(msg, obj){
        if (!Meteor) return;

        Meteor.call('ping', msg + ' ' + JSON.stringify(obj));
    }

    // isAnimistSignal: 
    function isAnimistSignal(uuid){
        return (self.endpointMap.hasOwnProperty(uuid)) ? true : false;
    }

    // State check run before tx attempts
    function canCall(){
        
        var peripheralError = 'no peripheral connection';
        var pinError = 'no PIN reading';

        if      (!self.peripheral.address)  return peripheralError;
        else if (!self.peripheral.pin)      return pinError;
        else                                return true;
    };

    // @function scan( uuid ) 
    // @param uuid (String): Animist service uuid (beacon id + 1) 
    // Resolves the BLE hardware address of the endpoint peripheral
    function scan( uuid ){

        var where = 'AnimistBLE:scan: '
        var d = $q.defer();

        logger(where, uuid);
        // Figure out how to scan only once per session using was connected . . . . .  
        // Scan

        $cordovaBluetoothLE.startScan( { services: [uuid] }).then(null,
        
            // Scan failed
            function(error){ 
                logger(where, error); 
                d.reject(where + error) 
            },
            // Scan succeeded
            function(scan){         
                logger(where, scan);

                // Stop Scan on Success
                if (scan.status === 'scanResult'){
                    $cordovaBluetoothLE.stopScan().then( 
                        function(){ d.resolve(scan) },
                        function(){ d.reject(where + error) }
                    );  
                }
                
            }
        );

        return d.promise;
    };

    // Initial connection
    function connectAndDiscover( address ){

        var where = 'AnimistBLE:connectAndDiscover: '
        var d = $q.defer();

        // Connect 
        $cordovaBluetoothLE.connect({address: address, timeout: 5000}).then(

            null,
           
           // Connect failed: close per randDusing best practice
            function(error){
                $cordovaBluetoothLE.close(address);
                d.reject(where + JSON.stringify(error));
            },

            // Connected -> Discover
            function(connected){
                $cordovaBluetoothLE.discover({address: address, timeout: 5000}).then(
                 
                    // Discovered
                    function(device){
                        logger(where, device);
                        d.resolve(device);
                    },
                    // Discover failed
                    function(error){
                        $cordovaBluetoothLE.close(address);
                        d.reject(where + JSON.stringify(error));
                    }
                );
            }
        );
        return d.promise;
    };

    function connect( address ){

        var where = 'AnimistBLE:connect: '
        var d = $q.defer();

        // Connect 
        $cordovaBluetoothLE.connect({address: address, timeout: 5000}).then(

            null,
           
            // Connect failed: close
            function(error){
                $cordovaBluetoothLE.close(address);
                logger(where, error);
                d.reject(where + error);
            },

            // Connected
            function(connected){
                logger(where, connected);
                d.resolve();
            }
        );

        return d.promise;
    };


    // ---------------------  Characteristic Helpers -----------------------------
    function write(signed, target, wait){

        var where = 'AnimistBLE:write: ';
        var signedBytes = $cordovaBluetoothLE.stringToBytes(signed);
        var signedEncoded = $cordovaBluetoothLE.bytesToEncodedString(signedBytes);
        var d = $q.defer();
        var peripheral = canCall();

        if (peripheral){ 
            
            // Compose 'write' req to hasTx characteristic
            var req = {
                address: self.peripheral.address,
                service: self.peripheral.service,
                characteristic: target,
                value: signedEncoded,
                timeout: 5000 
            };

            // Attempt write, wait for notify
            $cordovaBluetoothLE.write(req).then( 
               function(ok){ d.resolve()}, 
               function(error){ d.reject(where + error)}
            );

        // No peripheral    
        } else { 
            d.reject( where + peripheral ) 
        }

        return d.promise;
    };


    function subscribeHasTx(){
        
        var decoded;
        var where = 'AnimistBLE:subscribeHasTx: ';
        var d = $q.defer();
        var peripheral = canCall();

        if (peripheral){ 
            
            // hasTx characteristic params
            var req = {
                address: self.peripheral.address,
                service: self.peripheral.service,
                characteristic: self.uuid.hasTx,
                timeout: 5000
            };

            // Attempt
            $cordovaBluetoothLE.subscribe(req).then( 
                
                // Auto unsubscribe callback
                null, 

                // Subscribe failed     
                function(error){ d.reject(where + error)},
                
                // Subscribed/Updated
                function(sub){ 
                    
                    // Subscribed, resolve: 
                    if (sub.status === 'subscribed'){
                        logger(where, sub);
                        d.resolve();

                    // Notification handler: broadcasts gotTx event
                    } else {

                        logger(where, sub );
                        decoded = $cordovaBluetoothLE.encodedStringToBytes(sub.value);
                        decoded = $cordovaBluetoothLE.bytesToString(decoded);
                        
                        (decoded == 'null') ? 
                            self.peripheral.tx = null : 
                            self.peripheral.tx = decoded;
                        
                        $rootScope.$broadcast( events.receivedTx );
                    };
                }
            );

        // No peripheral 
        } else {
            d.reject( where + peripheral );
        }

        return d.promise;
    }

    function readPin(){
        
        var decoded;
        var where = 'AnimistBLE:readPIN: ';
        var d = $q.defer();
        var peripheral = canCall();

        if (peripheral) {
            
            // Compose subscribe req to pin characteristic
            var req = {
                address: self.peripheral.address,
                service: self.peripheral.service,
                characteristic: self.UUID.pin,
                timeout: 5000
            };

            logger(where, 'before');
            // Subscribe, register notification handler
            $cordovaBluetoothLE.read(req).then( 
                function(result){ 
                    // Update pin
                    decoded = $cordovaBluetoothLE.encodedStringToBytes(result.value);
                    decoded = $cordovaBluetoothLE.bytesToString(decoded);
                    self.pin = decoded;
                    logger(where, result);
                    logger(where, self.pin);
                    d.resolve();

                },
                // Subscribe failed     
                function(error){ d.reject(where + JSON.stringify(error))}
            );
        // No peripheral
        } else {
            d.reject( where + JSON.stringify(peripheral) );
        }
        return d.promise;
    };
};





                
