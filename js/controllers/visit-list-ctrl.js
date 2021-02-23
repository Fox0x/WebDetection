app.register.controller('VLCtrl', function ($scope) {

    document.getElementById('spinner').style.visibility = 'hidden';
    document.getElementById('content').style.visibility = 'visible';

    $scope.visitList = [
        {
            image: 'img/user.png',
            created: ''
        }
    ];
});