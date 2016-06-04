// Characteristic UUIDS
var authTxCharacterstic = 'C40C94B3-D9FF-45A0-9A37-032D72E423A9';
var hasTxCharacteristic = 'BFA15C55-ED8F-47B4-BD6A-31280E98C7BA';
var authPresenceCharacteristic ='297E3B0A-F353-4531-9D44-3686CC8C4036';



function openLink( uuid ){

    var where = 'AnimistBLE:openLink: ';
    var d = $q.defer();
        
    // Scan, discover and compose current peripheral object
    scan(uuid).then(
        function(scan){
            
            self.peripheral.address = scan.address;
            
            connectAndDiscover(self.peripheral.address).then(
                function(device){
                    
                    self.peripheral.device = device;
                    d.resolve(device);
                },
                // Connect & Discover fail
                function(error){ d.reject(where + error) }
            );
        // Scan fail
        }, function(error){ d.reject(where + error) }
    );
    return d.promise;
}

function closeLink(){
    self.peripheral = null;
};


// Initial Scan - uuid is the Animist service uuid - 
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
    $cordovaBluetoothLE.connect(address: address, timeout: 5000).then(null,
       
       // Connect failed, explicitly close
        function(error){
            $cordovaBluetoothLE.close(address: address);
            deferred.reject(where + error);
        },

        // Connect succeeded
        function(connected){
            logger(where, connected);

            // Discover
            $cordovaBluetoothLE.discover(address: address, timeout: 5000).then(
             
                // Discover succeeded
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
    $cordovaBluetoothLE.connect(address: address, timeout: 5000).then(null,
       
       // Connect failed, explicitly close
        function(error){
            $cordovaBluetoothLE.close(address: address);
            logger(where, error);
            deferred.reject(where + error);
        },

        // Connect succeeded
        function(connected){
            logger(where, connected);
            deferred.resolve();
        }
    );

    return deferred.promise;
};

function hasTx(user, uuid, proximity){

    var where = 'AnimistBLE:hasTx: ';
    var initError = 'no peripheral connection';
    var deferred = $q.defer();
    var address = self.peripheral.address

    // Verify scan was called
    if (!address) 
        deferred.reject(where + initError )

    // Check connection
    $cordovaBluetoothLE.isConnected(address).then(function(){
        // Get current reading of peripherals timePIN for Auth
        getTimePIN().then( function(PIN){
            // Ask for tx
            getTx(user, PIN).then(function(tx){
                deferred.resolve(tx);

            }, function(error){ deferred.reject( where + error) })
        }, function(error){ deferred.reject(where + error)  })
    }, function(error) deferred.reject(where + error) })

    return deferred.promise;
}

function getTimePIN(){
    
    var where = 'AnimistBLE:getTimePIN: ';
    var deferred = $q.defer();

    // Compose read req to timePIN characteristic
    var req = {
        address: self.peripheral.address,
        service: self.peripheral.service,
        characteristic: animist.timePIN
        timeout: 5000
    };

    // Attempt read
    $cordovaBluetoothLE.read(req).then( 
       function(PIN){ deferred.resolve(PIN)}, 
       function(error){ deferred.reject(where + error)}
    );

    return deferred.promise;
}

function getTx(user, PIN){

    var msg = self.peripheral.service + '_' + PIN;
    var signed = user.sign( msg );
    var signedBytes = $cordovaBluetoothLE.stringToBytes(signed);

    // Compose 'write' req to hasTx characteristic
    var req {
        address: self.peripheral.address,
        service: self.peripheral.service,
        characteristic: animist.hasTx,
        value: $cordovaBluetoothLE.bytesToEncodedString(signedBytes),
        timeout: 5000 
    };

    // Attempt write, wait for notify
    $cordovaBluetoothLE.write(req).then( 
       function(PIN){ deferred.resolve(PIN)}, 
       function(error){ deferred.reject(where + error)}
    );
};



                
