angular.module('linkedin')
  .service("GeoLocate", GeoLocate)
  .directive("beaconMap", BeaconMap);


function BeaconMap(GeoLocate, $rootScope){
    return {
       restrict: 'E',   
       scope: {slide: '=slide'},
       template: '<div id="map"></div>',
       link: function searchboxEventHandlers(scope, elem, attrs){

			ionic.Platform.isIPad() ? elem.addClass('ipad') : false;
				
			scope.$watch('slide', function(newVal, oldVal){

				if (newVal === 1){
					(GeoLocate.map === null) ? GeoLocate.loadMap(): GeoLocate.updateMap();
				};
			})
       }
    };
 };

function GeoLocate($rootScope, $q, $cordovaGeolocation){

	var icon, map, marker;
	var self = this;
	var posOptions = {timeout: 60000, enableHighAccuracy: false};
	var token = 'pk.eyJ1IjoiZXBpbGVwb25lIiwiYSI6ImNpanRyY3IwMjA2cmp0YWtzdnFoenhkbjkifQ._Sg2cIhMaGfU6gpKMmrGBA';
    var id = 'epilepone.2f443807';
	
	self.lat = null;
	self.lng = null;
	self.address = null;
	self.enabled = false;
	self.map = null;

	self.setup = function(){
		var deferred = $q.defer();

		if ($rootScope.DEV){
			deferred.resolve(self.address); 
			return deferred.promise; 
		}
		
		$cordovaGeolocation.getCurrentPosition(posOptions).then(

			function (success){
		    	self.enabled = true;
		    	MSLog('@GeoLocate:setup. Geolocation enabled')
		    	deferred.resolve();
		    }, function (error){
		    	self.enabled = false;
		    	MSLog('@GeoLocate:setup. Geolocation disabled');
		    	deferred.resolve();
		    }
		);
		return deferred.promise;
	};

	self.loadMap = function(){
		self.getAddress().then(function(){
          self.map = L.map('map').setView([self.lat, self.lng], 16);
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: '',
              zoomControl: false,
              id: id,
              accessToken: token 
          }).addTo(self.map);

          icon = L.icon.pulse({iconSize:[17,17], color:'#387EF5'});
          marker = L.marker([self.lat, self.lng],{icon: icon}).addTo(self.map);
        });
	};

	self.updateMap = function(){

		self.getAddress().then(function(){
          self.map.setView([self.lat, self.lng], 16);
          marker.setLatLng([self.lat, self.lng]);
        });
	}

	self.getAddress = function(){

		MSLog('@GeoLocate:getAddress');
		var deferred = $q.defer();

		if ($rootScope.DEV){
			self.address = '777 Debugger Ave, New York City';
			self.lat = 51.505;
			self.lng = -0.09;
			deferred.resolve(self.address); 
			return deferred.promise; 
		}

		// Get current pos
		$cordovaGeolocation.getCurrentPosition(posOptions)
		    .then(function (position) {
		    	MSLog("GeoLocate:getCurrentPosition " + JSON.stringify(position));

		    	self.enabled = true;
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
			                    	MSLog('@GeoLocate: ' + JSON.stringify(results[1].formatted_address));
			                    	self.address = results[1].formatted_address.split(',').slice(0, -2).join(', '),
			                        deferred.resolve(self.address);

			                    // No address
			                    } else {
			                    	self.address = '';
			                        deferred.resolve('');
			                        MSLog('@GeoLocate: failed: no maps results for position');
			                    }

			                // Geocoder call fail
			                } else {
			                	self.address = '';
			                    deferred.resolve('');
			                    MSLog('@GeoLocate: failed: google.maps.geocode error: ' + status);
			                }
			            });
			        // Maps or vals bad    
           			} else {
           				self.address = '';
           				deferred.resolve('');
           				MSLog('@GeoLocate: failed: no position vals or no google.maps');
           			}	
           	    // No coordinates in position
      			} else {
      				self.address = '';
      				deferred.resolve('');
      				MSLog('@GeoLocate: failed: no $cordova.geolocation position object');
      			}    	

      		// $cordova layer failure	
		    }, function(err) {
		      self.address = '';
		      self.lat = 0;
		      self.lng = 0;
		      self.enabled = false;
		      deferred.resolve('');
		      MSLog('@GeoLocate: failed: $cordovaGeolocation error:' + JSON.stringify(err))
		    }
		);

		return deferred.promise;
	};

};
