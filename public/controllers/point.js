
app.controller('point', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', 'localStorageService', function ($scope, $http, $location, $routeParams, $cookies, tokenService, localStorageService) {

    $scope.pointId = $routeParams.id;
    $scope.isFavorite;
    $scope.point = {};
    $scope.user = {};
    $scope.favorites = [];

    $scope.pointToReview;
    $scope.pointHasReviews;

    $scope.newReview = '';
    $scope.rate = 0;

    $scope.init = function (setView) {
        showLoading();

        tokenService.checkIfUserLoggedIn($cookies).then((response) => {
            $scope.token = $cookies.get('token');

            $http.get('/user/token/' + $scope.token).then((response) => {
                if (!response.data.error) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;

                    var readPoint = function () {
                        $http.get('/point/id/' + $scope.pointId).then((response) => {
                            $scope.point = response.data[0];

                            $scope.favorites = localStorageService.get('favorites') ? localStorageService.get('favorites') : [];

                            if ($scope.favorites.length == 0) {

                                $http.get('/user/' + $scope.user.id + '/favorite?token=' + $scope.token).then((response) => {
                                    $scope.favorites = response.data;
                                    $scope.favorites.map(f => f.date = f.date.slice(0, 19).replace('T', ' '))

                                    localStorageService.set('favorites', $scope.favorites);

                                    $("#favoritesCount").html("(" + $scope.favorites.length + ")")
                                    try {
                                        $scope.isFavorite = $scope.isFavorited() >= 0 ? true : false;

                                    } catch (e) { $scope.isFavorite = false; $scope.favorites = [] }

                                })
                            } else {

                                $("#favoritesCount").html("(" + $scope.favorites.length + ")")
                                try {
                                    $scope.isFavorite = $scope.isFavorited() >= 0 ? true : false;

                                } catch (e) { $scope.isFavorite = false; $scope.favorites = [] }
                            }

                            hideLoading();
                        })
                    }

                    if (setView)
                        $http.put('/point/views', { point_id: $scope.pointId }).then(() => readPoint());
                    else
                        readPoint()
                }
            });
        }).catch((err) => {
            redirectTo('/', $scope, $location);
        })
    }

    $scope.isFavorited = function () {
        for (var i = 0; i < $scope.favorites.length; i++) {
            if ($scope.favorites[i].p_id == $scope.pointId) {
                return i;
            }
        }
        return -1;
    }

    $scope.toggleFavorite = function () {
        $scope.isFavorite = !$scope.isFavorite;

        if ($scope.isFavorite) {
            $scope.favorites.push({
                p_id: $scope.pointId,
                fav_order: ($scope.favorites.length),
                date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
        } else {
            var idx = $scope.isFavorited();

            if (idx > -1)
                $scope.favorites.splice(idx, 1);
        }

        localStorageService.set('favorites', $scope.favorites)
        $("#favoritesCount").html("(" + $scope.favorites.length + ")")
    }

    $scope.showReviewsModal = function (id) {
        showLoading();

        var point = $scope.point;
        $scope.pointToReview = $scope.point;

        if (!point.reviews || point.reviews.length == 0) {
            $scope.pointHasReviews = false;

            $('#pointModal').modal('show');
        }
        else {
            $scope.pointHasReviews = true;

            for (let user = 0; user < point.reviews.length; user++) {
                const id = point.reviews[user].u_id;
                const idx = user;

                $http.get('/user/' + id + '/name').then((response) => {
                    point.reviews[idx].username = response.data.username;
                    point.reviews[idx].time = new Date(point.reviews[idx].timestamp).getTime();

                    if (idx == point.reviews.length - 1) {
                        $('#pointModal').modal('show');
                    }

                }).catch(err => console.log(err))

            }
        }
        hideLoading();

    }

    $scope.setRate = function (rate) {
        $scope.rate = rate;

        for (var i = 1; i <= rate; i++) {
            $("#star_" + i).removeClass("far");
            $("#star_" + i).addClass("fas");
        }

        for (var i = (rate + 1); i <= 5; i++) {
            $("#star_" + i).addClass("far");
            $("#star_" + i).removeClass("fas");
        }
    }

    $scope.applyReview = function () {
        if ($scope.newReview.length < 10) {
            $scope.descriptionErr = "Description must be at least 10 characters";
            return
        }

        if ($scope.rate == 0) {
            $scope.rateErr = "Must rate the point before submit review";
            return;
        }

        $scope.descriptionErr = "";
        $scope.rateErr = "";

        var rate = $scope.rate
        var desc = $scope.newReview

        var review = {
            point_id: $scope.pointId,
            review: {
                u_id: $scope.user.id,
                p_id: $scope.pointId,
                description: desc,
                rating: rate,
            },
            token: $scope.token
        };

        $http.post('/point/review', review).then((avg) => {
            $scope.rate = 0
            $scope.newReview = ''
            $("#addReviewModal").modal('hide');
            $scope.init(false);

        }).catch((err) => console.log(err));


    }

}]);