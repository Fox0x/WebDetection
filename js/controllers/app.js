let labeledDescriptors = [];
let users = [];

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
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        files: ['js/f-live.js']
                    });
                }
            }
        })
        .state('list', {
        url: '/list',
        templateUrl: 'views/visitList.htm',
        controller: 'VListCtrl',
        resolve: {
            loadPlugin: function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    files: ['css/visitList.css', 'js/controllers/VListCtrl.js']
                });
            }
        }
    });
});
