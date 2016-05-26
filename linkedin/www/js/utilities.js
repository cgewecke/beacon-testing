//utilities.js
var GLOBAL_TESTING = false;
function MSLog(message){
	
	if (GLOBAL_TESTING) return;

	if (Meteor){
		Meteor.call('ping', 'client: ' + message);
	};
	console.log(message);
};