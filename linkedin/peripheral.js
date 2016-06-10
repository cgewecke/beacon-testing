var bleno = require('bleno');
var randomstring = require('randomstring');
var lightwallet = require('eth-lightwallet');

/// TO DO:
//  For hasTx:  Write auth parser
//              Send signed tx response and decode on wowshuxkluh 
//              
//  For authTx: See if it's possible to get a JSON object . . .
//  PouchDB on client to speed up loads
//  Terminate on BLE so we can start stop server for testing w/out
//  reloading everything . . .
// 


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

codes = {
   NO_PROXIMITY_IN_REQUEST: 0x01,
   INVALID_JSON_IN_REQUEST: 0x02,
   NO_SIGNED_MSG_IN_REQUEST: 0x03,
   NO_TX_FOUND: 0x04,
   RESULT_SUCCESS: 0x00
};

var pin = randomstring.generate();
var oldPin = null;

function resetPin(){
   oldPin = pin;
   pin = randomstring.generate();
}

var name = 'Animist';
var uuid = '56D2E78E-FACE-44C4-A786-1763EA8E4302'


var onAuth = function(data, offset, response, callback){


}
var onPinRead = function(offset, callback ){

   console.log('onPinRead: ' + pin );
   callback(codes.RESULT_SUCCESS, new Buffer(pin));
};


var onHasTx = function(data, offset, response, callback ){

   var address, address_old, signed, res;
   var req = checkHasTxRequest(data);

   if (req.status){

      signed = req.val.signed;

      // Recover address from signed pin
      address = lightwallet.signing.recoverAddress(pin, signed.v, signed.r, signed.s);
      address = address.toString('hex');
      console.log('recovered Address: ' + address);
      
      // Try to find tx with address derived from current pin
      tx = getTx(address);

      // It's possible the pin updated during the transfer, so try 
      // with address derived from old pin
      if (!tx){

         address_old = lightwallet.signing.recoverAddress(oldPin, signed.v, signed.r, signed.s);
         address_old = address.toString('hex');
         tx = getTx(address_old);
      }

      // Success: confirm write, then send tx across after 50ms
      if (tx){
         console.log('sending write confirm')
         callback(codes.RESULT_SUCCESS);

         setTimeout(function(){
            console.log('sending updateValueCallback');
            if (hasTxCharacteristic.updateValueCallback){
               res = new Buffer(tx);
               console.log('Buffer length: ' + res.length);
               hasTxCharacteristic.maxValueSize = 3000;
               hasTxCharacteristic.updateValueCallback(res);
               console.log('hasTxCharacteristic: ' + JSON.stringify(hasTxCharacteristic));
            };
         }, 50);
         
      } else {
         console.log('sending no tx')
         callback(codes.NO_TX_FOUND)
      }

   } else {
      console.log('sending parse failure: ' + req.val.toString())
      callback(req.val);
   }
};

var checkHasTxRequest = function(data){

   var parsed, address;

   try {
      // Check JSON formatting
      parsed = JSON.parse(data);
      console.log('parsed @ hasTxRequest: ' + JSON.stringify(parsed));

      // Check proximity field
      if (!parsed.hasOwnProperty('proximity'))
         return { status: 0, val: codes.NO_PROXIMITY_IN_REQUEST }
      
      // Check signed message
      else if (!parsed.hasOwnProperty('signed') || 
               !parsed.signed.hasOwnProperty('r') ||
               !parsed.signed.hasOwnProperty('s') ||
               !parsed.signed.hasOwnProperty('v'))
         
         return { status: 0, val: codes.NO_SIGNED_MSG_IN_REQUEST }

      // Return parsed value
      else {
         parsed.signed.r = new Buffer(parsed.signed.r.data);
         parsed.signed.s = new Buffer(parsed.signed.s.data);
         return {status: 1, val: parsed }
      }
   
   } catch (err){
      console.log(err);
      // JSON formatting failure catch
      return {status: 0, val: codes.INVALID_JSON_IN_REQUEST }
   }
}

var onAuthTx = function(data, offset, response, callback){

};

var onSignTx = function(data, offset, response, callback){

}

// FAKE:
var getTx = function(address){

   var response = {
      code: '6060604052610381806100136000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480630ff4c9161461006557806329507f731461008c5780637b8d56e3146100a5578063c41a360a146100be578063f207564e146100fb57610063565b005b610076600480359060200150610308565b6040518082815260200191505060405180910390f35b6100a36004803590602001803590602001506101b3565b005b6100bc60048035906020018035906020015061026e565b005b6100cf600480359060200150610336565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61010c60048035906020015061010e565b005b60006000600050600083815260200190815260200160002060005060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614156101af57336000600050600083815260200190815260200160002060005060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b5b50565b3373ffffffffffffffffffffffffffffffffffffffff166000600050600084815260200190815260200160002060005060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141561026957806000600050600084815260200190815260200160002060005060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b5b5050565b3373ffffffffffffffffffffffffffffffffffffffff166000600050600084815260200190815260200160002060005060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415610303578060006000506000848152602001908152602001600020600050600101600050819055505b5b5050565b600060006000506000838152602001908152602001600020600050600101600050549050610331565b919050565b60006000600050600083815260200190815260200160002060005060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905061037c565b91905056',
      proximity: 'any',
      authority: address,
   };

   return JSON.stringify(response);
}

var authCharacteristic = new bleno.Characteristic({
   uuid: 'E219B7F9-7BF3-4B03-8DB6-88D228922F40',
   properties: ['write'], 
   onWriteRequest: onHasTx
});

var pinCharacteristic = new bleno.Characteristic({
   
   uuid: 'C40C94B3-D9FF-45A0-9A37-032D72E423A9',
   properties: ['read'], 
   onReadRequest: onPinRead

});

var hasTxCharacteristic = new bleno.Characteristic({
   
   uuid: 'BFA15C55-ED8F-47B4-BD6A-31280E98C7BA',
   properties: ['write', 'notify'], 
   onWriteRequest: onHasTx

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
      setInterval(resetPin, 60000);
   }
});

