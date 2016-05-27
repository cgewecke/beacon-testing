var bleno = require('bleno');

// Service properties

var name = 'Animist';
var uuid = '56D2E78E-FACE-44C4-A786-1763EA8E4302'

var onWrite = function(data, offset, response, callback ){

   console.log('onWrite1 Callback running');
   console.log('Offset: ' + offset);
   console.log('Data: ' + data.toString('utf8'));
   console.log('Response: ' + response);
   console.log('callback: ' + JSON.stringify(callback));

   callback(0x00);
};

var onWrite2 = function(data, offset, response ){

   console.log('onWrite2 Callback running');
   console.log('Offset: ' + offset);
   console.log('Data: ' + data.toString('hex'));
   console.log('Response: ' + response);
};

var characteristic1 = new bleno.Characteristic({
   
   uuid: 'fff1', // or 'fff1' for 16-bit
   properties: [ 'write' ], 
   onWriteRequest: onWrite

});

var characteristic2 = new bleno.Characteristic({
   
   uuid: 'fff2', // or 'fff1' for 16-bit
   properties: [ 'write' ], 
   onWriteRequest: onWrite2

});

var service = new bleno.PrimaryService({
        
   uuid: uuid,
   characteristics: [ characteristic1, characteristic2 ]

});

//
// Wait until the BLE radio powers on before attempting to advertise.
// If you don't have a BLE radio, then it will never power on!
//
bleno.on('stateChange', function(state) {
   if (state === 'poweredOn') {
      console.log('starting advertising');
      bleno.startAdvertising(name, [service.uuid], function(err) {
         if (err) {
            console.log(err);
         }
      });
  }
  else {
      bleno.stopAdvertising();
  }

});

bleno.on('advertisingStart', function(err) {
   if (!err) {
      console.log('advertising...' + JSON.stringify(service));
      bleno.setServices([ service ]);
   }
});

