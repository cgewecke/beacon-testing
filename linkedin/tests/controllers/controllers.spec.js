"use strict"
var test_debug;
var Meteor;
//var Connections;

describe('Small Controllers/Templates', function () {
    
    var compileProvider;

    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('linkedin'));    // Application
    beforeEach(module('meteormock'));  // Mocked Meteor services, collections
    
    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));

    
    // Inject $compileProvider so we can spin up directives from the templates
    // and test the DOM with our mocks.
    beforeEach(module(function($compileProvider) {
      compileProvider = $compileProvider;
    }));
 
    
    describe('TabsCtrl', function(){

        var $controller, $scope, $reactive, user;

        beforeEach(inject(function(_$controller_, _$rootScope_, _MeteorMock_){
            $controller = _$controller_;
            $scope = _$rootScope_;

            $reactive = _MeteorMock_.$reactive;
            Meteor = _MeteorMock_.Meteor;
            user = _MeteorMock_.user;
        }));

        it('should reactively bind "Meteor.user().notifyCount" to the controller', function(){

            var vm = $controller('TabsCtrl', {$scope: $scope, $reactive: $reactive });
                
            user.profile.notifyCount = 1;
            vm.autorun();

            expect(vm.notifyCount).toEqual(1);

            user.profile.notifyCount = 1;
            vm.autorun();

            expect(vm.notifyCount).toEqual(1);

        }); 

    });


    describe('SetupCtrl', function(){

        var $controller, $scope, $state, $timeout, $compile, $templateCache, $httpBackend;

        beforeEach(inject(function(_$controller_, _$rootScope_,  _$state_, _$timeout_, 
                                   _$compile_, _$templateCache_ ){
            
            $controller = _$controller_;
            $scope = _$rootScope_;
            $state = _$state_;
            $timeout = _$timeout_;
            $compile = _$compile_;
            $templateCache = _$templateCache_;

        }));

        it('should navigate to tab.nearby on accept()', function(){

            var vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

            spyOn($state, 'go');

            vm.accept();
            expect($state.go).toHaveBeenCalledWith('tab.nearby');
                
        }); 

        it('should navigate back to login on reject()', function(){

            var vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

            spyOn($state, 'go');

            vm.reject();
            expect($state.go).toHaveBeenCalledWith('login');
                
        }); 

        it('should wire accept/reject to the template', function(){

            var template, vm, acceptButton, rejectButton;

            compileProvider.directive('setupTest', function(){
                return {
                    controller: 'SetupCtrl',
                    template: $templateCache.get('templates/setup.html')
                }
            })
            
            template = angular.element('<setup-test></setup-test>');
            $compile(template)($scope);
            $scope.$digest();
            
            vm = template.controller('setupTest');
            
            acceptButton = template.find('button#setup-accept');
            rejectButton = template.find('button#setup-reject');

            expect(acceptButton.attr('ng-click')).toEqual('vm.accept()');
            expect(rejectButton.attr('ng-click')).toEqual('vm.reject()');
            
        })
    });
    
    describe('NotificationsCtrl', function(){

        var $controller, $scope, $compile, $templateCache, $reactive, $inject, user, template, ctrl;

        beforeEach(inject(function(_$controller_, _$rootScope_, _MeteorMock_, _$compile_, _$templateCache_){
            
            $controller = _$controller_;
            $scope = _$rootScope_;
            $compile = _$compile_;
            $templateCache = _$templateCache_;

            $reactive = _MeteorMock_.$reactive;
            Meteor = _MeteorMock_.Meteor;
            user = _MeteorMock_.user;
            
            // Compile /tab-notifications
            compileProvider.directive('notificationsTest', notificationsTest);

            function notificationsTest(){
                return {
                    controller: 'NotificationsCtrl',
                    controllerAs: 'vm',
                    template: $templateCache.get('templates/tab-notifications.html')
                }
            };
            
            template = angular.element('<ion-nav-bar><notifications-test></notifications-test></ion-nav-bar>');            
            $compile(template)($scope, null, {transcludeControllers: 'ionNavBar'});
            $scope.$digest();

            ctrl = template.find('notifications-test').controller('notificationsTest');
              
        }));

        it('should reactively bind the users notifications array to ctrl', function(){
            
            var vm = $controller('NotificationsCtrl', {$scope: $scope, $reactive: $reactive });

            user.profile = { notifications: [] };
            vm.autorun();
            expect(vm.notifications.length).toBe(0);

            user.profile = { notifications: [{key: 'A'}] };
            vm.autorun();
            expect(vm.notifications.length).toBe(1);
        });

        it('should show/hide the "no notifications" item appropriately', function(){

            var item;

            item = template.find('ion-item#notifications-none');
            ctrl.notifications.push({key: 'X'});
            $scope.$digest();
            
            expect(item.hasClass('ng-hide')).toBe(true);

            ctrl.notifications.pop();
            $scope.$digest();

            expect(item.hasClass('ng-hide')).toBe(false);
            
        });

        it('should link a notification item to the correct profile view', function(){
            
            var item, html;

            ctrl.notifications.push({sender: 'nicole'});
            $scope.$digest();
            
            html = template.find('ion-item')[0];
            item = angular.element(html);

            expect(item.attr('href')).toEqual('#/tab/notifications/nicole');

        })

    })
        
    describe('NearbyCtrl', function(){

        var $controller, $scope, $compile, $templateCache, template, GeoLocate, Notify, ctrl;

        beforeEach(inject(function(_$controller_, _$rootScope_, _GeoLocate_, _Notify_, _$compile_, _$templateCache_){
            $controller = _$controller_;
            $scope = _$rootScope_;
            $compile = _$compile_;
            $templateCache = _$templateCache_;

            Notify = _Notify_;
            GeoLocate = _GeoLocate_;

            // Compile /tab-notifications
            compileProvider.directive('nearbyTest', nearbyTest);

            function nearbyTest(){
                return {
                    controller: 'NearbyCtrl',
                    controllerAs: 'vm',
                    template: $templateCache.get('templates/tab-nearby.html')
                }
            };
            
            template = angular.element('<ion-nav-bar><nearby-test></nearby-test></ion-nav-bar>');            
            $compile(template)($scope);
            $scope.$digest();

            ctrl = template.find('nearby-test').controller('nearbyTest');
        }));


        it('should initialize slides & bind injected/reactive services to ctrl', function(){
            
            // Meteor
            expect(ctrl.connections).not.toBe(undefined);
            
            // Other
            expect(ctrl.listSlide).toBe(0);
            expect(ctrl.mapSlide).toBe(1);
            expect(ctrl.slide).toBe(0);
            expect(ctrl.geolocate).toEqual(GeoLocate);
            expect(ctrl.notify).toEqual(Notify);

        });  
    })
        
    /*
    describe('NotificationsProfileCtrl', function(){

        var $controller, $scope, $reactive, Meteor, user, $stateParams;

        beforeEach(inject(function(_$controller_, _$rootScope_, _MeteorMock_, _$stateParams_){
            $controller = _$controller_;
            $scope = _$rootScope_;
            $stateParams = _$stateParams_;

            $reactive = _MeteorMock_.$reactive;
            Meteor = _MeteorMock_.Meteor;
            user = _MeteorMock_.user;
            
        }));

        it('should bind to profile associated with relevant note sender to controller', function(){
               
            user.profile.notifications.push({sender: 'yyy', profile: {firstName: 'xxx', lastName: 'zzz'}});
            $stateParams.sender = 'yyy';

            var vm = $controller('NotificationsProfileCtrl', {$scope, $stateParams, Meteor});

            expect(vm.user).toEqual(user.profile.notifications[0].profile);
            expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
            expect(vm.viewTitle).toEqual(vm.user.name);

        });
    })


    describe('NearbyProfileCtrl', function(){

        var $controller, $scope, $reactive, Meteor, user, connections, Connections, $stateParams;

        beforeEach(inject(function(_$controller_, _$rootScope_, _MeteorMock_, _$stateParams_){
            $controller = _$controller_;
            $scope = _$rootScope_;
            $stateParams = _$stateParams_;

            $reactive = _MeteorMock_.$reactive;
            Meteor = _MeteorMock_.Meteor;
            user = _MeteorMock_.user;
            connections = _MeteorMock_.connections;
            Connections = _MeteorMock_.Connections;
        }));

        it('should reactively bind ctrl to Mongo.connection & profile of routes /:userId', function(){
            
            connections.push({
                receiver: '111', 
                transmitter: user._id, 
                profile: { 
                    id: '555', 
                    firstName: 'xxx', 
                    lastName: 'zzz'
                }
            });

            $stateParams.userId = '555';
          
            var vm = $controller('NearbyProfileCtrl', {$scope, $reactive, $stateParams, Connections});
            
            expect(vm.connection).toEqual(connections[0]);

            expect(vm.user).toEqual(connections[0].profile);
            expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
            expect(vm.viewTitle).toEqual(vm.user.name);

        });

    });

    describe('ProfileCtrl', function(){

        var $controller, $scope, LinkedIn;

        beforeEach(inject(function(_$controller_, _$rootScope_, _LinkedIn_){
            $controller = _$controller_;
            $scope = _$rootScope_;
            LinkedIn = _LinkedIn_;
        }));

        it('ProfileCtrl: Should bind ctrl to the current users LinkedIn profile', function(){

            LinkedIn.me = { firstName: 'Nicole', lastName: 'De Lorean'};
            var vm = $controller('ProfileCtrl', {$scope, LinkedIn});

            expect(vm.user).toEqual(LinkedIn.me);
            expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
            expect(vm.viewTitle).toEqual('You');
        })

    });

    describe('LoadingCtrl', function(){

        var $controller, $ionicPlatform, $state, $timeout, ionicToast;

        beforeEach(inject(function(_$controller_, _$ionicPlatform_, _$state_, _$timeout_, _ionicToast_){
            $controller = _$controller_;
            $ionicPlatform = _$ionicPlatform_;
            $state = _$state_;
            $timeout = _$timeout_;
            ionicToast = _ionicToast_;
        }));

        it('LoadingCtrl: should navigate to tab.nearby on ionicPlatform ready', function(){

            spyOn($ionicPlatform, 'ready');
            spyOn($state, 'go');
            
            var vm = $controller('LoadingCtrl', {$ionicPlatform, $state, $timeout, ionicToast });
            
            $timeout(function(){
                expect($ionicPlatform.ready).toHaveBeenCalled(); 
                expect($state.go).toHaveBeenCalledWith('tab.nearby');
            })
        });

    }) */
        
    /*
        

        

        */

    //it('SettingsCtrl: . . . . .', function(){
        // STUB: THIS TAB GETTING REWRITTEN FOR ISSUE #56
    //})

});