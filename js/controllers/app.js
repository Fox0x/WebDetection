'use strict';
let app = angular.module('WebDetections', ['ui.router', 'oc.lazyLoad']);
app.config(function ($stateProvider, $urlRouterProvider, $controllerProvider) {
    $urlRouterProvider.otherwise('/list');

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
            }
        })
        .state('list', {
        url: '/list',
        templateUrl: 'views/list.htm',
        controller: 'ListCtrl',
        resolve: {
            loadPlugin: function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    files: ['js/controllers/ListCtrl.js', 'css/list.css']
                });
            }
        }
    });

});