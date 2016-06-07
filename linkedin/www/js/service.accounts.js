angular.module('linkedin')
  .service("AnimistAccount", AnimistAccount);

function AnimistAccount($rootScope, $q ){

    var self = this;
    var user = {};
    // Testing
    self.init = function(){
        
        var ks, addr, password = 'hello';
        var secretSeed = lightwallet.keystore.generateRandomSeed();
        lightwallet.keystore.deriveKeyFromPassword(password, function (err, pwDerivedKey) {

            ks = new lightwallet.keystore(secretSeed, pwDerivedKey);
            ks.generateNewAddress(pwDerivedKey, 1);
            addr = ks.getAddresses();
        }

        user.pwDerivedKey = pwDerivedKey;
        user.address = addr;
        user.keystore = ks;

    };

    self.sign = function(msg){
        return lightwallet.signing.signMsg(user.ks, user.pwDerivedKey, msg, user.address);
    }
  
    //var decoded = lightwallet.signing.recoverAddress(uuid, msg.v, msg.r, msg.s);
    //console.log('DECODED: ' + decoded.toString('hex'));
    //console.log('ADDR: ' + addr[0]);
 
});



}
