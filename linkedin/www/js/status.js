angular.module('linkedin')
  //.service("GeoLocate", GeoLocate)
  .directive("serverStatus", ServerStatus);


function ServerStatus($reactive, ionicToast){
    return {
       restrict: 'A',   
       link: function(scope, elem, attrs){
       		$reactive(this).attach(scope);

       		scope.status = false;
       		this.autorun(function(){
       		  	var status = Meteor.status().status;
			  	if (status === "connected") {
			    	scope.status = true;
			  	} else {
			   		scope.status = false;
			  	}
       		});

       		scope.toast = function(){
       			console.log('entering toast')
       			var message;
       			if (scope.status){
       				message = 'You are connected to the server.'
       			} else {
       				message = 'You are not connected to the server.'
       			}

       			ionicToast.show(message, 'middle', false, 1000);
       		};

       }
    };
 };
