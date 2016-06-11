angular.module('linkedin')
  .service("AnimistAccount", AnimistAccount);

function AnimistAccount($rootScope, $q ){

    var self = this;
    var user = {};
    
    // Testing
    self.init = function(){
        
        var d = $q.defer();

        var ks, addr, password = 'hello';
        var secretSeed = lightwallet.keystore.generateRandomSeed();
        lightwallet.keystore.deriveKeyFromPassword(password, function (err, pwDerivedKey) {

            if (err){
                d.reject(err);
            } else {
                ks = new lightwallet.keystore(secretSeed, pwDerivedKey);
                ks.generateNewAddress(pwDerivedKey, 1);
                addr = ks.getAddresses();

                user = {
                    animistUserIsInitialized: true,
                    pwDerivedKey: pwDerivedKey,
                    address: addr,
                    keystore: ks,
                    sign: sign,
                    recover: recover
                } 
                d.resolve(user);
            };
        });

        return d.promise;

    };

    function sign(msg){
        return lightwallet.signing.signMsg(user.keystore, user.pwDerivedKey, msg, user.address);
    }

    function recover(msg, signed){
        return lightwallet.signing.recoverAddress(msg, signed.v, signed.r, signed.s);
    }

    self.validate = function(_user){
        ( _user != null && 
          typeof _user === 'object' && 
          _user.hasOwnProperty('animistUserIsInitialized') && 
          _user.isInitialized ) ? 
            
            return true : 
            return false;
    };
  
    //var decoded = lightwallet.signing.recoverAddress(uuid, msg.v, msg.r, msg.s);
    //console.log('DECODED: ' + decoded.toString('hex'));
    //console.log('ADDR: ' + addr[0]);
 
};

