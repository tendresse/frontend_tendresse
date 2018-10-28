angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl',
        data: {
            pageTitle: 'Tendresse | Login'
        },
    })

    .state('signup', {
        url: '/signup',
        templateUrl: 'templates/signup.html',
        controller: 'signupCtrl',
        data: {
            pageTitle: 'Tendresse | Signup'
        },
    })

    .state('tendresse', {
        url: '',
        templateUrl: 'templates/menu.html',
        controller: 'menuCtrl',
        abstract:true
    })

    .state('tendresse.home', {
        url: '/home',
        views: {
            'content': { // will be injected in templates/menu.html @ div ui-view="content"
                templateUrl: 'templates/home.html',
                controller: 'homeCtrl'
            }
        }
    })

    .state('tendresse.profile', {
        url: '/me',
        views: {
            'content': { // will be injected in templates/menu.html @ div ui-view="content"
                templateUrl: 'templates/profile.html',
                controller: 'profileCtrl'
            }
        }
    })

    .state('tendresse.friend', {
        url: '/friend/:username',
        views: {
            'content': { // will be injected in templates/menu.html @ div ui-view="content"
                templateUrl: 'templates/friend.html',
                controller: 'friendCtrl'
            }
        }
    })

    $urlRouterProvider.otherwise('/login')

})

.run(function($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
})
