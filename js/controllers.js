angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $state, AuthService) {

    $scope.username = AuthService.username();

    $scope.$on("notAuthorized", function(event) {
        console.error(event);
        AuthService.logout();
        $state.go('login');
    });

    $scope.$on("notAuthenticated", function(event) {
        console.error(event);
        AuthService.logout();
        $state.go('login');
    });

})

.controller('menuCtrl', function($scope, $state, AuthService, MeFactory, TendresseFactory) {

    $scope.logout = function() {
        AuthService.logout();
        $state.go('login');
    };;

})

.controller('loginCtrl', function($scope, $state, AuthService, MeFactory, TendresseFactory) {

    $scope.loginForm = {};

    $scope.login = function() {
        AuthService.login($scope.loginForm).then(
        () => {
            $scope.loginForm.password = "";
            $state.go('tendresse.home', {});
        },
        (err) => {
            // handle errorx
            $scope.loginForm.password = "";
        });
    };

    let enter = function() {
        if ( ! AuthService.token() ) {
            AuthService.logout();
        }
    };
    enter();

})

.controller('signupCtrl', function($scope, $state, AuthService) {

    $scope.signupForm = {};

    AuthService.logout();

    $scope.signup = function(signupForm) {
        AuthService.signup($scope.signupForm).then(
            (authenticated) => {
                // $state.go('tendresse.home', {}, {reload: true});
                $state.go('tendresse.home', {});
            },
            (err) => {
                // handle error
                $scope.signupForm.password = "";
            }
        );
    };
})

.controller('homeCtrl', function($state, $scope, $timeout, AuthService, MeFactory, TendresseFactory) {

    $scope.sendTendresse = function(username, $event) {
        if($scope.sendingTendresse)
            return false;
        $scope.sendingTendresse = true;
        friend = angular.element($event.currentTarget);
        TendresseFactory.sendTendresse(username).then(
            (response) => {
                friend.addClass("animated bounceOutRight");
            },
            (err) => {
                friend.addClass("animated shake");
            }
        );
        $timeout(function(){
            friend.removeClass("animated bounceOutRight shake");
            $scope.sendingTendresse = false;
        }, 1500);
    };

    $scope.profile = function(username) {
        $state.go('friend',{"username":username});
    };

    $scope.displayTendresses = function(tendresses) {
        $scope.currentTendresses = tendresses;
        $scope.nextTendresse();
    };

    $scope.addFriend = function(person) {
        MeFactory.addFriend(person["username"]).then(
        (response) => {
            person.isFriend = true;
        },
        (err) => {
            console.error("adding friend error",err);
        });
    };

    $scope.nextTendresse = function() {
        console.log($scope.currentTendresses[0]);
        if (typeof $scope.currentTendresses[0] !== 'undefined'){
            $scope.gifUrl = "/img/loading.gif";
            $scope.gifUrl = $scope.currentTendresses[0]["gif"]["url"];
            //TendresseFactory.stateTendresseAsViewed(tendresses[0]["id"]);
            $scope.currentTendresses.splice(0,1);
        } else {
            $scope.gifUrl = undefined;
        }
    };

    $scope.isEmpty = function(obj) {
        return angular.equals({}, obj);
    };

    $scope.doRefresh = function() {
        MeFactory.getFriends().then( () => {
            TendresseFactory.getTendresses().then( () => {
                let tendresses = TendresseFactory.tendresses();
                let friends = MeFactory.friends();
                $scope.home = {};
                for (let i = friends.length - 1; i >= 0; i--) {
                    let friend_id = friends[i]['id']
                    if ($scope.home.hasOwnProperty(friend_id)){
                        $scope.home[friend_id].isFriend = true;
                    } else {
                        $scope.home[friend_id] = friends[i];
                        $scope.home[friend_id].isFriend = true;
                    }
                    if ( ! $scope.home[friend_id].hasOwnProperty("tendresses")) {
                        $scope.home[friend_id]['tendresses'] = [];
                    }
                }
                for (let i = tendresses.length - 1; i >= 0; i--) {
                    let sender_id = tendresses[i]['sender_id'];
                    if ($scope.home.hasOwnProperty(sender_id)) {
                        $scope.home[sender_id]['tendresses'].push(tendresses[i]);
                    } else {
                        $scope.home[sender_id] = tendresses[i]['sender'];
                        $scope.home[sender_id]['tendresses'] = [tendresses[i]];
                    }
                }
            });
        });
    };

    let enter = function() {
        if ( AuthService.token() ) {
            $scope.doRefresh();
        } else {
            AuthService.logout()
            $state.go('login');
        }
    };
    enter();

})

.controller('profileCtrl', function($state, $scope, AuthService, MeFactory) {

    $scope.addFriend = function(data) {
        MeFactory.addFriend($scope.data.username_friend).then(
        (response) => {
            $scope.data.username_friend = "";
        },
        (err) => {
            console.error(err);
        });
    };

    $scope.doRefresh = function() {
        MeFactory.getMyProfile().then( () => {
            $scope.profile = MeFactory.profile();
        });
        MeFactory.getAchievements().then( (achievements) => {
            $scope.achievements = achievements;
        });
    };

    let enter = function() {
        if ( AuthService.token() ) {
            $scope.data = {};
            $scope.doRefresh();
        } else {
            AuthService.logout()
            $state.go('login');
        }
    };
    enter();

})

.controller('friendCtrl', function($scope, $state, $stateParams, AuthService, MeFactory) {

    $scope.username = $stateParams.username;

    $scope.removeFriend = function() {
        MeFactory.removeFriend($stateParams.username).then(function(response) {
            console.log("adding friend success");
            MeFactory.getFriends();
            $state.go('tendresse.home');
        }, function(err) {
            console.log("adding friend error",err);
        });
    };

    $scope.doRefresh = function() {
        MeFactory.getProfile($stateParams.username).then( (profile) => {
            $scope.profile = profile;
        });
    };

    let enter = function() {
        if ( AuthService.token() ) {
            $scope.doRefresh();
        } else {
            AuthService.logout()
            $state.go('login');
        }
    };
    enter();

})
