//publications.js
Meteor.publish('connections', function () {
  if (!this.userId){
  	return;
  }

  return Connections.find( {transmitter: this.userId } );
});