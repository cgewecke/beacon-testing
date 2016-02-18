//utilities.js

function MSLog(message){
	if (Meteor){
		Meteor.call('ping', 'client: ' + message);
	};
	console.log(message);
};