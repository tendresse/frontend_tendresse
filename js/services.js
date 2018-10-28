angular.module('app.services', [])

.factory('AuthInterceptor', ['$rootScope', '$q', function($rootScope, $q){

    return {
        responseError: (response) => {
            $rootScope.$broadcast({
                401: "notAuthenticated",
                403: "notAuthorized",
                503: "serverDown"
            }[response.status], response);
            return $q.reject(response);
        }
    };

}])

.service('AuthService', ['$http', '$q', 'BASE_URL', function($http, $q, BASE_URL){

    const TENDRESSE_TOKEN = 'tendresse_jwt';
    const TENDRESSE_USERNAME = 'tendresse_username';

    function loadUserCredentials() {
        let token = window.localStorage.getItem(TENDRESSE_TOKEN);
        if (token) {
            useCredentials(token);
        }
    }

    function storeUserCredentials(username, token) {
        window.localStorage.setItem(TENDRESSE_USERNAME, username);
        window.localStorage.setItem(TENDRESSE_TOKEN, token);
        useCredentials(token);
    }

    function useCredentials(token) {
        // Inject the token in the header of every requests
        $http.defaults.headers.common['Authorization'] = 'Bearer '+token;
    }

    let login = function(loginForm) {
        return $q( (resolve, reject) => {
            let req = {
              method: 'POST',
              url: BASE_URL+'/login',
              headers: {
                'Content-Type': 'application/json'
              },
              data: {
                "username": loginForm['username'],
                "password": loginForm['password']
              }
            };

            $http(req).then(
            (resp) => {
                storeUserCredentials(loginForm['username'], resp.data.token);
                resolve('Login success.');
            },
            (error) => {
                reject('Login Failed.');
            });
        });
    };

    let signup = (signupForm) => {
        return $q( (resolve, reject) => {
            let req = {
                method: 'POST',
                url: BASE_URL+'/signup',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "username": signupForm['username'],
                    "email": signupForm['email'],
                    "password": signupForm['password']
                }
            };

            $http(req).then(
            (resp) => {
                storeUserCredentials(signupForm['username'], resp.data.token);
                resolve('Signup success.');
            },
            (err) => {
                reject('Signup Failed.');
            });
        });
    };

    let loginToken = function() {
        return $q((resolve, reject) => {
            if (window.localStorage.getItem(TENDRESSE_TOKEN)) {
                let req = {
                    method: 'GET',
                    url: 'v1/users/me/reset_token',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                $http(req).then(
                (resp) => {
                    storeUserCredentials(resp.username,resp.token);
                    resolve('login/reset token success');
                },
                (error) => {
                    reject('login/reset token error');
                });
            }
        });
    };

    let logout = function() {
        $http.defaults.headers.common['Authorization'] = undefined;
        window.localStorage.clear();
    };

    let status = function() {
        return $q((resolve, reject) => {
            let req = {
                method: 'GET',
                url: BASE_URL+'/v1/status'
            };
            $http(req).then(
            () => {
                resolve('backend is online');
            },
            () => {
                reject('backend seems down');
            });
        });
    }

    loadUserCredentials();

    return {
        signup: signup,
        login: login,
        logout: logout,
        username: () => {return window.localStorage.getItem(TENDRESSE_USERNAME)},
        token: () => {return window.localStorage.getItem(TENDRESSE_TOKEN)},
        checkToken: loginToken,
        status: status
    };

}])

.factory('TendresseFactory', ['$http', '$q', 'BASE_URL', function($http, $q, BASE_URL){

    const TENDRESSE_TENDRESSES = "tendresse_tendresses";
    let tendresses = JSON.parse(window.localStorage.getItem(TENDRESSE_TENDRESSES)) || [];

    let getTendresses = function() {
        return $q(function(resolve, reject) {
            let req = {
                method: 'GET',
                url: BASE_URL+'/v1/me/tendresses',
            };

            $http(req).then(
            (resp) => {
                window.localStorage.setItem(TENDRESSE_TENDRESSES, JSON.stringify(resp.data));
                tendresses = resp.data;
                resolve('get tendresses');
            },
            (error) => {
                reject('error getting tendresses');
            });
        });
    };

    let stateTendresseAsViewed = function(tendresse_id){
        return $q( (resolve, reject) => {

            let req = {
                method: 'PUT',
                url: BASE_URL+'/me/tendresses/'+tendresse_id,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http(req).then(
            (resp) => {
                resolve('tendresse state as viewed.');
            },
            (err) => {
                reject('error stating tendresse as viewed');
            });

        });
    }

    let sendTendresse = function(username){
        return $q(function(resolve, reject) {

            let req = {
                method: 'POST',
                url: BASE_URL+'/me/friends/'+username+'/tendresses',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http(req).then(
            (resp) => {
                resolve('tendresse state as viewed.');
            },
            (error) => {
                reject('error stating tendresse as viewed');
            });

        });
    }


    return {
        getTendresses: getTendresses,
        sendTendresse: sendTendresse,
        stateTendresseAsViewed: stateTendresseAsViewed,
        tendresses: function(){return tendresses;}
    };

}])

.factory('MeFactory', ['$http', '$q', 'AuthService', 'BASE_URL', function($http, $q, AuthService, BASE_URL){

    const TENDRESSE_PROFILE = 'tendresse_profile';
    const TENDRESSE_FRIENDS = 'tendresse_friends';
    let profile = JSON.parse(window.localStorage.getItem(TENDRESSE_PROFILE)) || {};
    let friends = JSON.parse(window.localStorage.getItem(TENDRESSE_FRIENDS)) || [];

    let addFriend = function(username) {
        return $q(function(resolve, reject) {
            let req = {
                method: 'POST',
                url: BASE_URL+'/v1/me/friends/'+username
            };
            $http(req).then(
            (resp) => {
                resolve('friend added');
            },
            (err) => {
                console.log(err);
                reject('error adding friend');
            });
        });
    };

    let removeFriend = function(username) {
        return $q(function(resolve, reject) {
            let req = {
                method: 'DELETE',
                url: BASE_URL+'/v1/me/friends/'+username
            };
            $http(req).then(
            (resp) => {
                resolve('friend removed');
            },
            (err) => {
                console.log(err);
                reject('error removing friend');
            });
        });
    };

    let getFriends = function() {
        return $q(function(resolve, reject) {
            let req = {
                method: 'GET',
                url: BASE_URL+'/v1/me/friends',
            };
            $http(req).then(
            (resp) => {
                window.localStorage.setItem(TENDRESSE_FRIENDS, JSON.stringify(resp.data));
                friends = resp.data;
                resolve('get current user friends');
            },
            (error) => {
                reject('error getting current user friends');
            });
        });
    };

    let getAchievements = function() {
        return $q(function(resolve, reject) {
            let req = {
                method: 'GET',
                url: BASE_URL+'/v1/achievements',
            };
            $http(req).then(
            (resp) => {
                resolve(resp.data);
            },
            (error) => {
                reject('error getting achievements');
            });
        });
    };

    let getMyProfile = function() {
        // get achievements + XP
        return $q(function(resolve, reject) {
            let req = {
                method: 'GET',
                url: BASE_URL+'/v1/me/profile'
            };
            $http(req).then(
            (resp) => {
                window.localStorage.setItem(TENDRESSE_PROFILE, JSON.stringify(resp.data));
                profile = resp.data;
                resolve('get current user profile');
            },
            (error) => {
                reject('error getting current user profile');
            });
        });
    }

    let getProfile = function(username) {
        return $q(function(resolve, reject) {
            let req = {
                method: 'GET',
                url: BASE_URL+'/v1/users/'+username+"/profile"
            };
            $http(req).then(
            (resp) => {
                resolve(resp.data);
            },
            (error) => {
                reject('error getting current user profile');
            });
        });
    }

    return {
        addFriend: addFriend,
        getFriends: getFriends,
        getProfile: getProfile,
        getMyProfile: getMyProfile,
        getAchievements: getAchievements,
        removeFriend: removeFriend,
        friends: () => {return friends},
        profile: () => {return profile}
    };

}])

.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
})
