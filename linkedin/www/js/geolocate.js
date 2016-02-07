angular.module('linkedin')
  .service("GeoLocate", GeoLocate);


function GeoLocate($rootScope, $q, $cordovaGeolocation){

	var self = this;
	var posOptions = {timeout: 10000, enableHighAccuracy: false};
	
	self.lat = null;
	self.lng = null;

	self.getAddress = function(){

		console.log('entering get address');
		var deferred = $q.defer();

		if ($rootScope.DEV){
			deferred.resolve(); 
			return deferred.promise; 
		}

		// Get current pos
		$cordovaGeolocation.getCurrentPosition(posOptions)
		    .then(function (position) {
		    	console.log("entering getCurrentPosition " + JSON.stringify(position));
		    	// Check coords exist
		    	if (position.coords){
		    		self.lat  = position.coords.latitude;
      				self.lng = position.coords.longitude;
     
      				// Check Maps and vals ok
      				if (self.lng && self.lat && google.maps ){
      					
      					// Initialize maps
						var geocoder = new google.maps.Geocoder();
           				var latlng = new google.maps.LatLng(self.lat, self.lng );

           				// Reverse Geocode
           				geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                
			                if (status == google.maps.GeocoderStatus.OK) {
			                    
			                    // OK
			                    if (results[1]) {
			                    	console.log('Got address: ' + JSON.stringify(results));
			                        deferred.resolve(results[1].formatted_address);

			                    // No address
			                    } else {
			                        deferred.resolve('');
			                        console.log('GEOLOCATE: no maps results for position');
			                    }

			                // Geocoder call fail
			                } else {
			                    deferred.resolve('');
			                    console.log('GEOLOCATE: google.maps.geocode error: ' + status);
			                }
			            });
			        // Maps or vals bad    
           			} else {
           				deferred.resolve('');
           				console.log('GEOLOCATE: no position vals or no google.maps');
           			}	
           	    // No coordinates in position
      			} else {
      				deferred.resolve('');
      				console.log('GEOLOCATE no $cordova.geolocation position object');
      			}    	

      		// $cordova layer failure	
		    }, function(err) {
		      deferred.resolve('');
		      console.log('GEOLOCATE: $cordovaGeolocation error:' + JSON.stringify(err))
		    }
		);

		return deferred.promise;
	};

};
