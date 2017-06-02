var app = angular.module('app', ['ngMaterial']);

app.controller('mainCtrl', ($scope, $http) => {
    // reloads all items from the server
    $scope.reloadAll = function() {
        $http.get('/all').then(res => {
            $scope.users = res.data;
        });
    };

    // prep new empty user
    $scope.newUser = {};

    $scope.register = function() {
        var cardHash = CryptoJS.SHA256($scope.newUser.cardId).toString();
        
        var loginData = { username : $scope.newUser.username, password : $scope.newUser.password };
        // use the card id & the card hash to encrypt the login data
        var token = CryptoJS.AES.encrypt(JSON.stringify(loginData), $scope.newUser.cardId + cardHash);
        
        var regData = {
            name  : $scope.newUser.name,
            hash  : cardHash,
            salt  : token.iv,
            token : token.toString()
        };
        $scope.newUser = {};

        $http.post('/register', regData).then(function() {
            $scope.reloadAll();
        });
    }

    $scope.delete = function(id) {
        $http.get('/remove/' + id).then(() => {
            $scope.reloadAll();
        });
    }
});