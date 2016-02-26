angular
  	.module('meteormock', [])
  	.service('MeteorMock', function(){

  		var self = this;

	  	this.user = { 
	        _id: '123', 
	        username: 'nicole', 
	        email: 'nicole@gmail.com', 
	        profile: { 
	            id: '777', 
	            notifications: [],
	            contacts: []
	        } 
	    };

	    this.connections = []; 
	    this.status = 'connected';

	    // Mock Meteor
	    this.Connections = { 
	        find: function(query){ 
	        	console.log('running connections');
	            return self.connections;
	        },
	        findOne: function(query){
	            return self.connections[0];
	        }
	    }
	    
	    this.Meteor = {
	        user: function(){ return self.user;},
	        call: function(){ return; },
	        status: function(){ return {status: self.status};},
	        userId: function(){ return self.user._id}
	    }

	    this.$reactive = function(context){
	        
	        context.attach = function(scope){
	            context.scope = scope;
	        };

	        context.helpers = function(helpers){
	            context.helperCollection = helpers;
	            context.autorun();
	        };

	        context.autorun = function(){
	            var keys = Object.keys(context.helperCollection);
	            angular.forEach(keys, function(key){
	                context[key] = (context.helperCollection[key])();
	            });
	        };

	        context.subscribe = function(collection){

	        };
	        return context;   
	    };
	});