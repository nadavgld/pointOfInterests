
app.controller('profile', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    $scope.token;
    $scope.user = {};
    $scope.point_for_user = [];
    $scope.latest_favorited = [];

    $scope.init = function () {
        showLoading();

        if (!tokenService.checkIfUserLoggedIn($cookies)) {
            $location.path('/');
            $location.replace();
        } else {
            $scope.token = $cookies.get('token');

            $http.get('/user/token/' + $scope.token).then((response) => {
                if (response.data) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;

                    var req = {
                        method: 'get',
                        url: '/user/' + $scope.user.id + '/point/2',
                        headers: {
                            'x-access-token': $scope.token
                        }
                    }

                    $http(req).then((response) => {
                        $scope.point_for_user = response.data;
                        hideLoading();
                    }).catch((err) => {
                        console.log(err.data)
                    })

                    var req2 = {
                        method: 'get',
                        url: '/user/' + $scope.user.id + '/latest/2',
                        headers: {
                            'x-access-token': $scope.token
                        }
                    }

                    $http(req2).then((response) => {
                        $scope.latest_favorited = response.data;
                        hideLoading();
                    }).catch((err) => {
                        console.log(err.data)
                    })
                }
            });

        }
    }

}]);