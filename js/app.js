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
            files: ["js/f-live.js"],
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
            files: ["css/visitList.css", "js/f-vList.js"],
          });
        },
      },
    });
});
let labeledDescriptors = [];
async function updateLabeledDescriptors() {
  labeledDescriptors = [];
  for (let i = 0; i < localStorage.length; i++) {
    const descriptor = Float32Array.from(
      Object.values(
        JSON.parse(localStorage.getItem("person " + (i + 1))).descriptor
      )
    );
    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors("person " + (i + 1), [descriptor])
    );
  }
}