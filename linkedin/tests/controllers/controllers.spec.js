var test_debug;

describe('Small Controllers', function () {

    var vm, $controller, Meteor, $reactive, $scope;
    var user = { _id: '', username: '', email: '', profile: {} };

    beforeEach(module('linkedin'));

    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $provide.value('Meteor', function(){});
        $urlRouterProvider.deferIntercept();
    }));
    
    beforeEach(inject(function (_$controller_, _$rootScope_, _$state_) {
        $controller = _$controller_;
        $scope = _$rootScope_;
        $state = _$state_;
        
        Meteor = {
            user: function(){ return user},
            call: function(){ return; }
        }
        $reactive = function(self){
            
            self.attach = function(scope){
                self.scope = scope;
            };

            self.helpers = function(helpers){
                self.helperCollection = helpers;
            };

            self.autorun = function(){
                var keys = Object.keys(self.helperCollection);
                angular.forEach(keys, function(key){
                    self[key] = (self.helperCollection[key])();
                });
                test_debug = Meteor;
            };
            return self;   
        };

        

    }));

    it('TabsCtrl: should reactively bind the users notifyCount to the controller', function(){

        vm = $controller('TabsCtrl', {$scope: $scope, $reactive: $reactive, Meteor: Meteor });
            
        user.profile.notifyCount = 1;
        vm.autorun();

        expect(vm.notifyCount).toEqual(1);

        user.profile.notifyCount = 1;
        vm.autorun();

        expect(vm.notifyCount).toEqual(1);

    }); 

    it('SetupCtrl: accept() should navigate to tab.nearby', function(){

        vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

        spyOn($state, 'go');

        vm.accept();
        expect($state.go).toHaveBeenCalledWith('tab.nearby');
            
    }); 

    it('SetupCtrl: reject() should navigate back to login', function(){

        vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

        spyOn($state, 'go');

        vm.reject();
        expect($state.go).toHaveBeenCalledWith('login');
            
    });  

    it('NotificationsCtrl: should reactively bind the users notifications array to the controller', function(){
        vm = $controller('NotificationsCtrl', {$scope, $reactive, Meteor: Meteor });
        
        user.profile = { notifications: [] };
        vm.autorun();
        expect(vm.notifications.length).toBe(0);

        user.profile = { notifications: [{key: 'A'}] };
        vm.autorun();
        expect(vm.notifications.length).toBe(1);
    })

});