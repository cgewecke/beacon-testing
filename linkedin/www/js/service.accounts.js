angular.module('linkedin')
  .service("AnimistAccount", AnimistAccount);

function AnimistAccount($rootScope, $q ){

    var self = this;
    self.user = {};
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

                self.user.pwDerivedKey = pwDerivedKey;
                self.user.address = addr;
                self.user.keystore = ks;
                d.resolve(self.user);
            };
        });

        return d.promise;

    };

    self.sign = function(msg){
        return lightwallet.signing.signMsg(user.ks, user.pwDerivedKey, msg, user.address);
    }

    self.validate = function(user){

        if (user.hasOwnProperty('pwDerivedKey'))
            return true;
        else
            return false;
    };
  
    //var decoded = lightwallet.signing.recoverAddress(uuid, msg.v, msg.r, msg.s);
    //console.log('DECODED: ' + decoded.toString('hex'));
    //console.log('ADDR: ' + addr[0]);
 
};

