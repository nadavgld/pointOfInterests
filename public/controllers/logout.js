
app.controller('logout', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    $scope.init = function () {

        $cookies.remove('token');
        showLogRegNav()
        $location.path('/');
        $location.replace();
    }
}]);