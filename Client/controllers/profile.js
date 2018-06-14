
app.controller('profile', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', 'localStorageService', function ($scope, $http, $location, $routeParams, $cookies, tokenService, localStorageService) {

    $scope.token;
    $scope.user = {};
    $scope.point_for_user = [];
    $scope.latest_favorited = [];
    $scope.favorites = [];
    $scope.pointToReview;
    $scope.pointHasReviews;

    //Initialize Scope - get latest favorited points & most popular to this user
    $scope.init = function () {
        showLoading();

        tokenService.checkIfUserLoggedIn($cookies).then((response) => {
            $scope.token = $cookies.get('token');
            $scope.favorites = localStorageService.get('favorites') ? localStorageService.get('favorites') : [];
            $("#favoritesCount").html("(" + $scope.favorites.length + ")")

            $http.get('http://localhost:3000/user/token/' + $scope.token).then((response) => {
                if (!response.data.error) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;
                    $scope.user.isAdmin = response.data.isAdmin;

                    var req = {
                        method: 'get',
                        url: 'http://localhost:3000/user/' + $scope.user.id + '/point/2',
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

                    if ($scope.favorites.length == 0) {

                        $http.get('http://localhost:3000/user/' + $scope.user.id + '/favorite?token=' + $scope.token).then((response) => {
                            $scope.favorites = response.data;
                            localStorageService.set('favorites', $scope.favorites);
                            $("#favoritesCount").html("(" + $scope.favorites.length + ")")

                        })

                        var req2 = {
                            method: 'get',
                            url: 'http://localhost:3000/user/' + $scope.user.id + '/latest/2',
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
                    } else {
                        $scope.latest_favorited = [];
                        $scope.favorites.sort((a, b) => b.date > a.date ? 1 : -1)


                        var promises = [];
                        for (var i = 0; i < 2; i++) {
                            if($scope.favorites[i]){
                                var id = $scope.favorites[i].p_id;
                                var _p = $http.get('http://localhost:3000/point/id/' + id)
                                promises.push(_p)
                            }
                        }

                        Promise.all(promises).then((res) => {
                            for (var i = 0; i < res.length; i++) {
                                if ($scope.latest_favorited.length < 2)
                                    $scope.latest_favorited.push(res[i].data[0])
                            }
                        })
                    }
                }
            });
        }).catch((err) => {
            $cookies.remove('token');
            redirectTo('/', $scope, $location);
        })
    }

    // show reviews modal
    $scope.showReviewsModal = function (type, id) {
        showLoading();

        var arr = type == 'fav' ? $scope.latest_favorited : $scope.point_for_user

        var point = arr.filter((poi) => poi.id == id)[0];

        $scope.pointToReview = point;

        if (!point.reviews || point.reviews.length == 0) {
            $scope.pointHasReviews = false;

            $('#profileModal').modal('show');
        }
        else {
            $scope.pointHasReviews = true;

            for (let user = 0; user < point.reviews.length; user++) {
                const id = point.reviews[user].u_id;
                const idx = user;

                $http.get('http://localhost:3000/user/' + id + '/name').then((response) => {
                    point.reviews[idx].username = response.data.username;
                    point.reviews[idx].time = new Date(point.reviews[idx].timestamp).getTime();

                    if (idx == point.reviews.length - 1) {
                        $('#profileModal').modal('show');
                    }

                }).catch(err => console.log(err))

            }
        }
        hideLoading();

    }

}]);