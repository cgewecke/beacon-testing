var test_debug;

describe('Small Controllers & Their Templates', function () {

    var vm, userMock, connectionsMock;
    var $controller, $state, $stateParams, Meteor, $reactive, $scope, Notify, GeoLocate, Connections;
    

    beforeEach(module('linkedin'));

    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $provide.value('Meteor', function(){});
        $urlRouterProvider.deferIntercept();
    }));
    
    beforeEach(inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _Notify_, _GeoLocate_ ) {
        
        // Real Dependencies
        $controller = _$controller_;
        $scope = _$rootScope_;
        $state = _$state_;
        $stateParams = _$stateParams_;

        Notify = _Notify_;
        GeoLocate = _GeoLocate_;

        // Mock Vars
        userMock = { _id: '123', username: 'nicole', email: 'nicole@gmail.com', profile: { id: '777', notifications: []} };
        connectionsMock = []; 
  
        // Meteor Mocks
        Connections = { 
            find: function(query){ 
                return connectionsMock;
            },
            findOne: function(query){
                return connectionsMock[0];
            }
        }
        
        Meteor = {
            user: function(){ return userMock},
            call: function(){ return; }
        }

        $reactive = function(self){
            
            self.attach = function(scope){
                self.scope = scope;
            };

            self.helpers = function(helpers){
                self.helperCollection = helpers;
                self.autorun();
            };

            self.autorun = function(){
                var keys = Object.keys(self.helperCollection);
                angular.forEach(keys, function(key){
                    self[key] = (self.helperCollection[key])();
                });
            };

            self.subscribe = function(collection){

            };
            return self;   
        };
    }));

    it('TabsCtrl: should reactively bind the users notifyCount to the controller', function(){

        vm = $controller('TabsCtrl', {$scope: $scope, $reactive: $reactive, Meteor: Meteor });
            
        userMock.profile.notifyCount = 1;
        vm.autorun();

        expect(vm.notifyCount).toEqual(1);

        userMock.profile.notifyCount = 1;
        vm.autorun();

        expect(vm.notifyCount).toEqual(1);

    }); 

    it('SetupCtrl.accept() should navigate to tab.nearby', function(){

        vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

        spyOn($state, 'go');

        vm.accept();
        expect($state.go).toHaveBeenCalledWith('tab.nearby');
            
    }); 

    it('SetupCtrl.reject() should navigate back to login', function(){

        vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

        spyOn($state, 'go');

        vm.reject();
        expect($state.go).toHaveBeenCalledWith('login');
            
    });  

    it('NotificationsCtrl: should reactively bind the users notifications array to the controller', function(){
        vm = $controller('NotificationsCtrl', {$scope, $reactive, Meteor: Meteor });
        
        userMock.profile = { notifications: [] };
        vm.autorun();
        expect(vm.notifications.length).toBe(0);

        userMock.profile = { notifications: [{key: 'A'}] };
        vm.autorun();
        expect(vm.notifications.length).toBe(1);
    });

    it('NearbyCtrl: should initialize slides & bind to injected services correctly', function(){
        vm = $controller('NearbyCtrl', {$scope, $reactive, Notify: Notify, GeoLocate: GeoLocate, 
                                        subscription: null, Connections: Connections });
        
        expect(vm.listSlide).toBe(0);
        expect(vm.mapSlide).toBe(1);
        expect(vm.slide).toBe(0);
        expect(vm.geolocate).toEqual(GeoLocate);
        expect(vm.notify).toEqual(Notify);

    });

    it('NearbyCtrl: should reactively bind Mongo.Connections to the controller', function(){
        vm = $controller('NearbyCtrl', {$scope, $reactive, Notify: Notify, GeoLocate: GeoLocate, 
                                        subscription: null, Connections: Connections });

        connectionsMock.push({receiver: 'xxx', transmitter: userMock._id});
        vm.autorun();
        expect(vm.connections.length).toBe(1);
        expect(vm.connections[0].transmitter).toEqual(userMock._id);

    });

    it('NotificationsProfileCtrl: Should bind to profile associated with relevant note sender to controller', function(){
           
        userMock.profile.notifications.push({sender: 'yyy', profile: {firstName: 'xxx', lastName: 'zzz'}});
        $stateParams.sender = 'yyy';

        vm = $controller('NotificationsProfileCtrl', {$scope, $stateParams, Meteor});


        expect(vm.user).toEqual(userMock.profile.notifications[0].profile);
        expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
        expect(vm.viewTitle).toEqual(vm.user.name);

    });

    it('NearbyProfileCtrl: Should bind to profile associated with relevant connection to controller', function(){
        
        connectionsMock.push({
            receiver: '111', 
            transmitter: userMock._id, 
            profile: { 
                id: '555', 
                firstName: 'xxx', 
                lastName: 'zzz'
            }
        });

        $stateParams.userId = '555';
      
        vm = $controller('NearbyProfileCtrl', {$scope, $reactive, $stateParams, Connections});
        
        expect(vm.connection).toEqual(connectionsMock[0]);

        expect(vm.user).toEqual(connectionsMock[0].profile);
        expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
        expect(vm.viewTitle).toEqual(vm.user.name);

    });







});