angular.module('linkedin')
  .service("GeoLocate", GeoLocate);


function GeoLocate($rootScope, $q, $cordovaGeolocation){

	var self = this;
	
	var posOptions = {timeout: 10000, enableHighAccuracy: false};
	var watch;
	var watchOptions = { timeout : 3000, enableHighAccuracy: false};

	self.lat = null;
	self.lng = null;
	self.address = null;

	self.initialize = function(){

		var deferred = $q.defer();

		if ($rootScope.DEV || self.initialized){
			deferred.resolve(); 
			return deferred.promise; 
		}

		// Get current pos
		$cordovaGeolocation.getCurrentPosition(posOptions)
		    .then(function (position) {
		    	self.lat  = position.coords.latitude
      			self.lng = position.coords.longitude    	
		    }, function(err) {
		      console.log('GEOLOCATE CURRENT POS ERROR:' + err)
		    }
		);

		// Watch pos 
		watch = $cordovaGeolocation.watchPosition(watchOptions);

		watch.then( null,
		    function(err) {
		      	console.log('GEOLOCATE WATCH ERROR:' + err);
		    },
		    function(position) {
		      	self.lat  = position.coords.latitude
      			self.lng = position.coords.longitude   
			}
		);

		self.initialized = true;
		return deferred.promise;
	};

	self.address = function(){
		var deferred = $q.defer();

		if (self.lng && self.lat && google.maps ){
			var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(self.lat, self.lng );
            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        deferred.resolve(results[1].formatted_address);
                    } else {
                        deferred.reject(undefined)
                    }
                } else {
                    deferred.reject(status);
                }
            });


		} else {
			deferred.reject(undefined);
		}

		return deferred.promise;
	};  	
};
