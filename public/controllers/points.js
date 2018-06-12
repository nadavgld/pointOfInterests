
app.controller('points', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', 'localStorageService', function ($scope, $http, $location, $routeParams, $cookies, tokenService, localStorageService) {

    $scope.points = [];
    $scope.points_temp = [];
    $scope.pointToReview;
    $scope.pointHasReviews;
    $scope.categories = [];
    $scope.categoryFilter = '';
    $scope.token;
    $scope.user = {};
    $scope.searchForm;
    $scope.showFiltering = true;
    $scope.favorites = [];

    _sLimit = 14;
    _fBase = '100px'
    searchLimit = 14;

    $scope.ascending = 1;
    $scope.sortByValue = 'category';
    $scope.sorts = [
        {
            'value': 'name',
            'name': 'Name'
        },
        {
            'value': 'category',
            'name': 'Category'
        },
        {
            'value': 'total_reviews',
            'name': 'Reviews'
        },
        {
            'value': 'rating',
            'name': 'Rating'
        },
        {
            'value': 'views',
            'name': 'Views'
        }
    ]

    $scope.init = function () {
        showLoading();

        tokenService.checkIfUserLoggedIn($cookies).then((response) => {
            $scope.token = $cookies.get('token');

            $http.get('/user/token/' + $scope.token).then((response) => {
                if (!response.data.error) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;

                    $http.get('/point').then((response) => {
                        $scope.points = response.data;
                        $scope.points_temp = response.data;

                        $http.get('/category').then((response) => {
                            $scope.categories = response.data;
                            $scope.filterByCategory(false);
                            $scope.favorites = localStorageService.get('favorites') ? localStorageService.get('favorites') : [];
                            
                            if ($scope.favorites.length == 0) {

                                $http.get('/user/' + $scope.user.id + '/favorite?token=' + $scope.token).then((response) => {
                                    $scope.favorites = response.data;
                                    $scope.favorites.map(f => f.date = f.date.slice(0, 19).replace('T', ' '))
    
                                    localStorageService.set('favorites', $scope.favorites);
                                    $("#favoritesCount").html("(" + $scope.favorites.length + ")")
    
                                })
                            } else {
                                $("#favoritesCount").html("(" + $scope.favorites.length + ")")
                            }

                            hideLoading();
                        });
                    })
                }
            });
        }).catch((err) => {
            redirectTo('/', $scope, $location);
        })
    }

    $scope.isFavorited = function (id) {
        id = parseInt(id);

        for (var i = 0; i < $scope.favorites.length; i++) {
            if (id == $scope.favorites[i].p_id)
                return true;
        }

        return false;
    }

    $scope.toggleFavorite = function (id) {
        id = parseInt(id);

        if ($scope.isFavorited(id)) {
            var idx = -1;

            for (var i = 0; i < $scope.favorites.length; i++) {
                if ($scope.favorites[i].p_id == id) {
                    idx = i;
                    break;
                }
            }

            if (idx > -1)
                $scope.favorites.splice(idx, 1);
        } else {
            $scope.favorites.push({
                p_id: id,
                active: 1,
                u_id: $scope.user.id,
                fav_order: ($scope.favorites.length + 1),
                date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
        }

        localStorageService.set('favorites', $scope.favorites)
        $("#favoritesCount").html("(" + $scope.favorites.length + ")")

    }

    $scope.toggleFiltering = function () {
        $scope.showFiltering = !$scope.showFiltering;

        if ($scope.showFiltering) {
            $(".filter-section").slideDown();
        }
        else {
            $(".filter-section").slideUp();
        }
    }

    $scope.sortBy = function (arr) {
        return new Promise((resolve, reject) => {
            var x = [].concat(arr).slice().sort((a, b) =>
                a[$scope.sortByValue] < b[$scope.sortByValue] ? -1 * $scope.ascending : 1 * $scope.ascending
            );
            resolve(x);
        });
    }

    $scope.switchAscDesc = function () {
        $scope.ascending = $scope.ascending * -1;
        $scope.updateSortValue();
    }

    $scope.updateSortValue = function () {
        $scope.sortBy($scope.points).then(arr => {
            $scope.points = arr
            $scope.$apply();
        });
    }

    $scope.filterByCategory = function (byFilter) {
        var x;

        if (byFilter)
            x = $scope.searchForm.length == 0 ? JSON.parse(JSON.stringify($scope.points_temp)) : JSON.parse(JSON.stringify($scope.points))
        else if ($scope.searchForm)
            $scope.filterByName()
        else
            x = JSON.parse(JSON.stringify($scope.points_temp))

        new Promise((resolve, reject) => {
            if ($scope.categoryFilter != '') {
                try {
                    const y = x.filter((p) => p.category == $scope.categoryFilter);
                    resolve(y);
                } catch (e) {
                    resolve(x)
                }
            } else {
                resolve(x);
            }
        }).then(arr => {
            $scope.points = arr
            $scope.updateSortValue();
        });

    }

    $scope.showReviewsModal = function (id) {
        showLoading();

        var point = $scope.points.filter((poi) => poi.id == id)[0];

        $scope.pointToReview = point;

        if (!point.reviews || point.reviews.length == 0) {
            $scope.pointHasReviews = false;

            $('#reviewModal').modal('show');
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
                        $('#reviewModal').modal('show');
                    }

                })

            }
        }
        hideLoading();

    }

    $scope.checkLength = function () {
        if ($scope.searchForm.length > searchLimit) {
            var font = parseInt($("#searchForm").css('font-size'))
            $("#searchForm").css('font-size', (font / 1.5) + 'px')
            searchLimit *= 2
        }

        if ($scope.searchForm.length == 0) {
            $("#searchForm").css('font-size', _fBase)
            searchLimit = _sLimit

        }
        $scope.filterByName();
    }

    $scope.filterByName = function () {
        var x = JSON.parse(JSON.stringify($scope.points_temp))

        new Promise((resolve, reject) => {
            if ($scope.searchForm != '') {
                const y = x.filter((p) => $scope.searchPoint(p));
                resolve(y);
            } else {
                resolve(x);
            }
        }).then(arr => {
            $scope.points = arr
            $scope.filterByCategory(true);
        });
    }

    $scope.searchPoint = function (p) {
        return p.name.toLowerCase().indexOf($scope.searchForm.toLowerCase()) >= 0 ||
            p.category.toLowerCase().indexOf($scope.searchForm.toLowerCase()) >= 0 ||
            p.description.toLowerCase().indexOf($scope.searchForm.toLowerCase()) >= 0
    }

    $scope.clearFiltering = function () {
        $scope.searchForm = '';
        $scope.categoryFilter = '';
        $scope.ascending = 1;
        $scope.sortByValue = 'category';
        $scope.filterByCategory(false);
    }

}]);