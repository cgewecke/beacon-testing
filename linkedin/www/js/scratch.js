// Characteristic UUIDS
var authTxCharacterstic = 'C40C94B3-D9FF-45A0-9A37-032D72E423A9';
var hasTxCharacteristic = 'BFA15C55-ED8F-47B4-BD6A-31280E98C7BA';
var authPresenceCharacteristic ='297E3B0A-F353-4531-9D44-3686CC8C4036';


// Nightmare: Manages initial Scan, connect, discover . . . .
function linkUp( uuid ){

    var deferred = $q.defer();
    var scan;

    // Scan
    $cordovaBluetoothLE.startScan( services[uuid] ).then(null,
    
        // Scan failed
        function(error){ 
            logger('scan error:', error); 
            deferred.reject(error) 
        },
        // Scan succeeded
        function(scanned){         
         
            scan = scanned;
            logger('scan: ', scan);
         
            // Stop Scan on Success
            $cordovaBluetoothLE.stopScan().then( function(){

                // Connect 
                $cordovaBluetoothLE.connect(address: scan.address, timeout: 5000).then(null,
                   
                   // Connect failed, explicitly close
                    function(error){
                        $cordovaBluetoothLE.close(address: scan.address, timeout: 1000);
                        logger('connect error:', error);
                        deferred.reject(error);
                    },

                    // Connect succeeded
                    function(connected){
                        logger('connect: ', connected);

                        // Discover
                        $cordovaBluetoothLE.discover(address: scan.address, timeout: 5000).then(
                         
                            // Discover succeeded
                            function(device){
                                logger('discover:', device);
                                deferred.resolve(device);
                            },
                            // Discover failed
                            function(error){
                                $cordovaBluetoothLE.close(address: scan.address, timeout: 1000);
                                logger('discover error:', error);
                                deferred.reject(error);
                            };
                        );
                    }
                );

            // StopScan failed         
            }, function(error){
                logger('stopScan error:', error);
                deferred.reject(error);
            });
        }
    );
    return deferred.promise;
};