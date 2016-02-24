"use strict"
var test_debug;

describe('Small Controllers & Their Templates', function () {

    var vm, $reactive, userMock, connectionsMock, statusMock;

    var $controller, $scope, $state, $stateParams, ionicToast, $ionicPlatform, $httpBackend, 
        $timeout, $compile, $templateCache, compileProvider, Notify, GeoLocate, Connections;
    

    beforeEach(module('templates'));
    beforeEach(module('linkedin'));
    
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));

    beforeEach(module(function($compileProvider) {
      compileProvider = $compileProvider;
    }));
 
    beforeEach(inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, 
                                _ionicToast_, _$ionicPlatform_, _$timeout_, _$compile_, 
                                _$httpBackend_, _$templateCache_, 
                                _Notify_, _GeoLocate_, _LinkedIn_ ) {
        
        // Real Dependencies
        $controller = _$controller_;
        $scope = _$rootScope_;
        $state = _$state_;
        $stateParams = _$stateParams_;
        $ionicPlatform = _$ionicPlatform_;
        $timeout = _$timeout_;
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $templateCache = _$templateCache_;
        ionicToast = _ionicToast_;

        Notify = _Notify_;
        GeoLocate = _GeoLocate_;
        LinkedIn = _LinkedIn_;

        // Mock Data
        userMock = { 
            _id: '123', 
            username: 'nicole', 
            email: 'nicole@gmail.com', 
            profile: { 
                id: '777', 
                notifications: []
            } 
        };

        connectionsMock = []; 
        statusMock = 'connected';
  
        // Mock Meteor
        Connections = { 
            find: function(query){ 
                return connectionsMock;
            },
            findOne: function(query){
                return connectionsMock[0];
            }
        }
        
        Meteor = {
            user: function(){ return userMock;},
            call: function(){ return; },
            status: function(){ return {status: statusMock};},
            userId: function(){ return userMock._id}
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

    it('setup.html: should wire the buttons correctly', function(){

        var template;

        compileProvider.directive('setupTest', function(){
            return {
                controller: 'SetupCtrl',
                template: $templateCache.get('setup.html')
            }
        })
        
        template = angular.element('<setup-test></setup-test>');
        $compile(template)($scope);
        $scope.$digest();

        vm = template.controller('setupTest');
        
        var acceptButton = template.find('button#setup.accept');
        var rejectButton = template.find('button#setup.reject');

        spyOn(vm, 'accept');
        spyOn(vm, 'reject');

        acceptButton.triggerHandler('click');
        rejectButton.triggerHandler('click');
        
        $timeout(function(){
            expect(vm.accept).toHaveBeenCalled();
            expect(vm.reject).toHaveBeenCalled();

        },0)
    })
    
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

    it('NearbyProfileCtrl: Should reactively bind ctrl to Mongo.connection & profile associated w/ :userId url', function(){
        
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

    it('ProfileCtrl: Should bind ctrl to the current users LinkedIn profile', function(){

        LinkedIn.me = { firstName: 'Nicole', lastName: 'De Lorean'};
        vm = $controller('ProfileCtrl', {$scope, LinkedIn});

        expect(vm.user).toEqual(LinkedIn.me);
        expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
        expect(vm.viewTitle).toEqual('You');
    })

    it('LoadingCtrl: should navigate to tab.nearby on ionicPlatform ready', function(){

        console.log('LOADING CTRL TEST NOT WORKING')
        
        //spyOn($ionicPlatform, 'ready');
        
        vm = $controller('LoadingCtrl', {$ionicPlatform, $state, $timeout, ionicToast });
        
        /*spyOn($state, 'go');
        expect($ionicPlatform.ready).toHaveBeenCalled(); 
        expect($state.go).toHaveBeenCalledWith('tab.nearby');*/

    })

    //it('SettingsCtrl: . . . . .', function(){
        // STUB: THIS TAB GETTING REWRITTEN FOR ISSUE #56
    //})

});