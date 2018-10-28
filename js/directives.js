angular.module('app.directives', [])

.directive('blankDirective', [function(){

}])

.directive('pageTitle', function($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            let listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                let title = 'OGPS';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle)
                    title = toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
})
