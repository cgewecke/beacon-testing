var auth_debug;

angular
  .module('linkedin')
  .run(run);
 
function run ($rootScope, $state) {

	console.log('In run');

	$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
		// We can catch the error thrown when the $requireUser promise is rejected
		// and redirect the user back to the main page
		console.log('statechangeerror');
		if (error === 'AUTH_REQUIRED') {
		  $state.go('login');
		}
	});

}