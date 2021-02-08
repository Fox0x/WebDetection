'use strict';
let app = angular.module('app', ['ui.router', 'oc.lazyLoad']);

app.controller('AppCtrl', () => {

});

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/live');

    $stateProvider
        .state('live', {
            url: '/live',
            templateUrl: 'views/live.htm',
            // controller: 'LiveCtrl',
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        files: [
                            'js/functions-live.js',
                            'js/controllers/live-Ctrl.js']
                    });
                }
            },

        });
});