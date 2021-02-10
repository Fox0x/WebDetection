app.register.controller('ListCtrl', function ($scope) {
    $scope.firstName1 = '';
    $scope.firstName2 = '';
    $scope.firstName3 = '';
    $scope.firstName4 = '';

    $scope.lastName1 = '';
    $scope.lastName2 = '';
    $scope.lastName3 = '';
    $scope.lastName4 = '';

    $scope.list = [{
        'image': 'img/user.png',
        'firstName': 'John',
        'lastName': 'Doe'
    }];
}).service('listService', function () {
    this.push = function ($scope, image, firstName, lastName) {
        $scope.list.push({
            'image': image,
            'firstName': firstName,
            'lastName': lastName
        });
        console.log("list length is: " + $scope.list.length)}
});