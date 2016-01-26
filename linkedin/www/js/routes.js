var routes_debug, routes_debugII;

angular
  .module('linkedin')
  .config(config);

function config ($stateProvider, $urlRouterProvider) {

  $stateProvider

  // Each tab has its own nav history stack:
  .state('loading', {
      url: '/loading',
      templateUrl: 'templates/loading.html',
      controller: 'LoadingCtrl'
  })
  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
  })


  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
  })

  
  .state('tab.nearby', {
      url: '/nearby',
      views: {
        'tab-nearby': {
          templateUrl: 'templates/tab-nearby.html',
          controller: 'NearbyCtrl',
          controllerAs: 'nearby'
        }
      },
      resolve: {
        user: function($auth){
            return $auth.requireUser();
        }
      }
  })
  .state('tab.nearby-profile', {
    url: '/nearby/:userId',
    views: {
      'tab-nearby': {
        templateUrl: 'templates/tab-profile.html',
        controller: 'NearbyProfileCtrl',
        controllerAs: 'vm'
      }
    },
    resolve: {
      user: function($auth){
          return $auth.requireUser();
      }
    }
  })
  .state('tab.profile', {
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'templates/tab-profile.html',
          controller: 'ProfileCtrl',
          controllerAs: 'vm'
        }
      },
      resolve: {
        user: function(LinkedIn){
            return LinkedIn.initialize();
        }
      }
  })
  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
  })
  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })
  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl',
        controllerAs: 'settings',
      }
    }
  })

  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('loading');
  //$urlRouterProvider.otherwise('login');

};