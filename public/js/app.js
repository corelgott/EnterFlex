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
        $http.get('https://www.random.org/cgi-bin/randbyte?nbytes=16&format=h').then(function(body) {
            // ensure we got random data
            if (!body.data) { alert('error retrieving random data!'); return; }
            // extract the bytes for the iv
            var iv = CryptoJS.enc.Base64.parse(body.data.replace(/ /g, ''));
            // create a hash for the card id
            var cardHash = CryptoJS.SHA256($scope.newUser.cardId).toString();
            // toss in the username and the password
            var loginData = { username : $scope.newUser.username, password : $scope.newUser.password };
            // use the card id & the card hash to encrypt the login data
            var token = CryptoJS.AES.encrypt(JSON.stringify(loginData), $scope.newUser.cardId + cardHash, { iv : iv });
            
            // pack everything
            var regData = {
                name  : $scope.newUser.name,
                hash  : cardHash,
                iv    : iv.toString(),
                token : token.toString()
            };
            $scope.newUser = {};

            $http.post('/register', regData).then(function() {
                $scope.reloadAll();
            });
        });
    }

    $scope.delete = function(id) {
        $http.get('/remove/' + id).then(() => {
            $scope.reloadAll();
        });
    }
});