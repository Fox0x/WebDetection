let app = angular.module('app', ['ngRoute', 'oc.lazyLoad']);

app.controller('AppCtrl', ($scope) => {

});


app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/live.htm",
            resolve: {
                lazy: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        files: [
                            'js/player.js',
                            'js/image.js',
                            'js/showForm.js']
                    });
                }]
            }
        }).otherwise({
        redirectTo: "/"
    });
});