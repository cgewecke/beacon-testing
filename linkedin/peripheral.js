var bleno = require('bleno');
var Characteristic = bleno.Characteristic;

// Service properties
// Characteristic UUIDS
var UUID = {

      auth: 'E219B7F9-7BF3-4B03-8DB6-88D228922F40',
      pin : 'C40C94B3-D9FF-45A0-9A37-032D72E423A9',
      hasTx:  'BFA15C55-ED8F-47B4-BD6A-31280E98C7BA',
      authTx: '297E3B0A-F353-4531-9D44-3686CC8C4036',
      signTx : '3340BC2C-70AE-4E7A-BE24-8B2ED8E3ED06'
};

var pin = null;

function resetPin(){
   var temp = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
   pin = temp.toString();
}
var name = 'Animist';
var uuid = '56D2E78E-FACE-44C4-A786-1763EA8E4302'


var onAuth = function(data, offset, response, callback){


}
var onPinRead = function(offset, callback ){

   console.log('onPinRead: ' + pin );
   callback(Characteristic.RESULT_SUCCESS, new Buffer(pin));
};


var onHasTx = function(data, offset, response, callback ){

   console.log('onWrite2 Callback running');
   console.log('Offset: ' + offset);
   console.log('Data: ' + data.toString('hex'));
   console.log('Response: ' + response);
};

var onAuthTx = function(data, offset, response, callback){

};

var onSignTx = function(data, offset, response, callback){

}

var authCharacteristic = new bleno.Characteristic({
   uuid: 'E219B7F9-7BF3-4B03-8DB6-88D228922F40',
   properties: ['write'], 
   //onWriteRequest: onWrite
});

var pinCharacteristic = new bleno.Characteristic({
   
   uuid: 'C40C94B3-D9FF-45A0-9A37-032D72E423A9',
   properties: ['read'], 
   onReadRequest: onPinRead

});

var hasTxCharacteristic = new bleno.Characteristic({
   
   uuid: 'BFA15C55-ED8F-47B4-BD6A-31280E98C7BA',
   properties: ['write', 'notify'], 
   //onWriteRequest: onWrite2

});

var signTxCharacteristic = new bleno.Characteristic({
   
   uuid: '3340BC2C-70AE-4E7A-BE24-8B2ED8E3ED06',
   properties: ['write'], 
   //onWriteRequest: onWrite2

});

var service = new bleno.PrimaryService({
        
   uuid: uuid,
   characteristics: [ 
      pinCharacteristic, 
      hasTxCharacteristic 
   ]

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
      
      // Reset pin every x seconds 
      setInterval(resetPin, 5000);
   }
});

