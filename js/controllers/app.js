'use strict';
let app = angular.module('WebDetections', ['ui.router', 'oc.lazyLoad']);

app.config(function ($stateProvider, $urlRouterProvider, $controllerProvider) {
    $urlRouterProvider.otherwise('/live');

    app.register = {
        controller: $controllerProvider.register
    }

    $stateProvider
        .state('live', {
            url: '/live',
            templateUrl: 'views/live.htm',
            // controller: 'LiveCtrl',
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        files: ['js/functions-live.js']
                    });
                }
            },
        });
});