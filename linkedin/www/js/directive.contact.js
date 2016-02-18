angular.module('linkedin')
  .directive("addContact", AddContact);

//@directive: add-contact
//@params: 
//  model: the item in collection or array that will be marked as having been added
//  contact: the profile object of the user to be added
function AddContact($cordovaContacts, $timeout, $auth){
    return {
       restrict: 'E',   
       replace: true,
       scope: {user: '='},
       template: 
        
        '<ion-footer-bar align-title="left" class="bar-energized directive-footer"' +
                        'ng-show="!contactAdded && !(user.id === currentUserId)">' +
          '<h1 class="title" >' +
            '<span ng-show="!flasher"> Add {{user.firstName}} to contacts</span>' +
            '<span class="profile-add-contact" ng-show="flasher">Added {{user.firstName}} </span>' +
          '</h1>' +
          '<div class="buttons">' +
            '<button class="button button-clear button-light icon ion-ios-plus-outline" ng-click="createContact()"></button>' +
          '</div>' +
        '</ion-footer-bar>',

       link: function(scope, elem, attrs){

          scope.currentUserId = Meteor.user().username;
          scope.contactAdded = hasContact();
          scope.flasher = false;

          function hasContact(){
            if (!Meteor.user()) return false;

            var contacts = Meteor.user().profile.contacts;
            for(var i = 0; i < contacts.length; i++){
                if (contacts[i] === scope.user.id){
                  return true;
                }
            }
            return false;
          }; 
    
       		// Add to native contacts button
          scope.createContact = function(){
            
            MSLog('@NearbyProfileCtrl:createContact');

            var contactInfo ={
              "displayName": scope.user.name,
              "emails": (scope.user.emailAddress) ? 
                [{ "value": scope.user.emailAddress, 
                   "type": "business" }] : null,
              "organizations": (scope.user.positions) ?
                [{"type": "Company", 
                  "name": scope.user.positions.values[0].company.name,
                  "title": scope.user.positions.values[0].title 
                }] : null,
              "photos": [{"value": scope.user.pictureUrl}],
              "birthday": Date('5/5/1973')
            };
            
            scope.flasher = true;
            $cordovaContacts.save(contactInfo).then(function(result) {
                
                $timeout(function(){
                
                    scope.exit = true;
                    scope.contactAdded = true;
                    Meteor.call('addContact', scope.user.id); 
                    
                }, 1000)

            }, function(error) {
                scope.flasher = false;
                MSLog('@NearbyProfileCtrl:createContact: failed: ' + error);
            });    
          }
        }
    };
 };