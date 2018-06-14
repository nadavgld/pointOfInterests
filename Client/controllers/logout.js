
app.controller('logout', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    //Remove token when logout - redirect to homepage
    $scope.init = function () {

        $cookies.remove('token');
        showLogRegNav()
        $location.path('/');
        $location.replace();
    }
}]);