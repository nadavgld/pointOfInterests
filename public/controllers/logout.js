
app.controller('logout', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    if (tokenService.checkIfUserLoggedIn($cookies)) {
        $cookies.remove('token');
        $location.path('/');
        $location.replace();
    }
    $location.path('/');
    $location.replace();


}]);