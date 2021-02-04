let app = angular.module('app', ['ngRoute', 'oc.lazyLoad']);

app.controller('AppCtrl', ($scope) => {

});

app.controller('LiveCtrl', ($scope) => {

})


app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/live.htm",
            resolve: {
                lazy: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        files: [
                            'js/live',
                            'js/live/image.js',
                            'js/live/form.js',
                            'js/live/detections.js'
                        ]
                    });
                }]
            }
        }).otherwise({
        redirectTo: "/"
    });
});