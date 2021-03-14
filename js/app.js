let labeledDescriptors = [];
let app = angular.module("WebDetections", ["ui.router", "oc.lazyLoad"]);
app.config(function ($stateProvider, $urlRouterProvider, $controllerProvider) {
	$urlRouterProvider.otherwise("/live");

	app.register = {
		controller: $controllerProvider.register,
	};

	$stateProvider
		.state("live", {
			url: "/live",
			templateUrl: "views/live.htm",
			controller: "LiveCtrl",
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load({
						files: ["css/live.css", "js/f-live.js"],
					});
				},
			},
		})

		.state("subjects", {
			url: "/subjects",
			templateUrl: "views/subjectList.htm",
			controller: "SListCtrl",
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load({
						files: ["css/subjectList.css", "js/f-subjectList.js"],
					});
				},
			},
		})

		.state("visits", {
			url: "/visits",
			templateUrl: "views/visitList.htm",
			controller: "VListCtrl",
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load({
						files: ["css/visitList.css", "js/f-visitList.js"],
					});
				},
			},
		});
});
