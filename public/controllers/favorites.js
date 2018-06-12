
app.controller('favorites', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', 'localStorageService', '$timeout', function ($scope, $http, $location, $routeParams, $cookies, tokenService, localStorageService, $timeout) {

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
    // $scope.favorites = [];

    $scope.saveMsg = '';
    $scope.saveErr = '';

    _sLimit = 14;
    _fBase = '100px'
    searchLimit = 14;

    $scope.ascending = 1;
    $scope.sortByValue = 'fav_order';
    $scope.sorts = [
        {
            'value': 'fav_order',
            'name': 'Order'
        },
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

                    $http.get('/category').then((response) => {
                        $scope.categories = response.data;

                        $scope.points_temp = localStorageService.get('favorites') ? localStorageService.get('favorites') : [];

                        if ($scope.points_temp.length == 0) {

                            $http.get('/user/' + $scope.user.id + '/favorite?token=' + $scope.token).then((response) => {
                                $scope.points_temp = response.data;
                                $scope.points_temp.map(f => f.date = f.date.slice(0, 19).replace('T', ' '))

                                localStorageService.set('favorites', $scope.points_temp);
                                $("#favoritesCount").html("(" + $scope.points_temp.length + ")")

                                $scope.getAllFavs();
                            })
                        } else {
                            $("#favoritesCount").html("(" + $scope.points_temp.length + ")")

                            $scope.getAllFavs();
                        }

                    });
                }
            });
        }).catch((err) => {
            redirectTo('/', $scope, $location);
        })
    }

    $scope.swapPlaces = function (id) {
        var neworder = $scope.points.filter(p => p.id == id)[0].fav_order;
        $scope.points_temp.filter(p => p.id == id)[0].fav_order = neworder;
        var prev = $scope.getEmptySpot();

        if (neworder <= 0 || neworder > $scope.points_temp.length) {
            alert('Error with swapping favorites order');
            $scope.points.filter(p => p.id == id)[0].fav_order = prev;
            $scope.points_temp.filter(p => p.id == id)[0].fav_order = prev;
            return;
        }

        for (var i = 0; i < $scope.points_temp.length; i++) {
            if ($scope.points_temp[i].id != id && $scope.points_temp[i].fav_order == neworder) {
                var swapTo = $scope.getEmptySpot();
                $scope.points_temp[i].fav_order = swapTo;

                $scope.filterByCategory();
                // $scope.syncFavorites();
                break;
            }
        }
    }

    $scope.getEmptySpot = function () {
        for (var i = 1; i <= $scope.points_temp.length; i++) {
            if ($scope.points_temp.filter(f => f.fav_order == i).length == 0)
                return i;
        }

        return -1;
    }

    // $scope.syncFavorites = function () {
    //     for (var i = 0; i < $scope.favorites.length; i++) {
    //         $scope.favorites[i].fav_order = $scope.points_temp.filter(p=>p.id == $scope.favorites[i].p_id)[0].fav_order
    //     }

    //     localStorageService.set('favorites',$scope.favorites);
    //     $(".orders").attr('max', $scope.favorites.length);
    // }

    $scope.getAllFavs = function () {
        var promises = [];

        for (var i = 0; i < $scope.points_temp.length; i++) {
            var id = $scope.points_temp[i].p_id;
            var _p = $http.get('/point/id/' + id).then((response) => $scope.points.push(response.data[0]))
            promises.push(_p)
        }

        Promise.all(promises).then(() => {

            for (var i = 0; i < $scope.points.length; i++) {
                var point = $scope.points[i];
                var fav = $scope.points_temp.filter(p => p.p_id == point.id)[0];
                point.p_id = fav.p_id;
                point.date = fav.date.slice(0, 19).replace('T', ' ');
                point.fav_order = fav.fav_order;
            }

            $scope.points_temp = JSON.parse(JSON.stringify($scope.points))

            $(".orders").attr('max', $scope.points_temp.length);

            $scope.filterByCategory(false);
        })

        hideLoading();
    }

    $scope.isFavorited = function (id) {
        id = parseInt(id);

        for (var i = 0; i < $scope.points_temp.length; i++) {
            if (id == $scope.points_temp[i].p_id)
                return true;
        }

        return false;
    }

    $scope.saveFavorites = function () {

        var pointsToSave = [];
        for (let i = 0; i < $scope.points_temp.length; i++) {
            var fav = $scope.points_temp[i];
            var _p = {
                date: fav.date.slice(0, 19).replace('T', ' '),
                point_id: fav.id,
                fav_order: fav.fav_order
            }
            pointsToSave.push(_p)
        }

        var body = {
            user_id: $scope.user.id,
            fps: pointsToSave,
            token: $scope.token
        }

        $http.put('/user/favorite', body).then((response) => {
            $scope.saveMsg = "Saved Successfully";

            $timeout(() => {
                $scope.saveMsg = ''
            }, 3000);
        }).catch((err) => {
            $scope.saveErr = "Error has occoured while saving";

            $timeout(() => {
                $scope.saveErr = ''
            }, 3000);
        })
    }

    $scope.toggleFavorite = function (id) {
        id = parseInt(id);

        $scope.points_temp.sort((a, b) => a.fav_order < b.fav_order ? -1 : 1);

        // if ($scope.isFavorited(id)) {
        var idx = -1;

        for (var i = 0; i < $scope.points_temp.length; i++) {
            if ($scope.points_temp[i].p_id == id) {
                idx = i;
                break;
            }
        }

        if (idx > -1) {
            $scope.points_temp.splice(idx, 1);
            for (var i = 0; i < $scope.points_temp.length; i++) {
                var empty = $scope.getEmptySpot();
                if (empty < $scope.points_temp[i].fav_order && empty != -1) {
                    $scope.points_temp[i].fav_order = empty
                }
            }
            // $scope.syncFavorites()
        }
        // }

        localStorageService.set('favorites', $scope.points_temp)
        $("#favoritesCount").html("(" + $scope.points_temp.length + ")")
        $(".orders").attr('max', $scope.points_temp.length);

        // for (var i = 0; i < $scope.points_temp.length; i++) {
        //     if (parseInt($scope.points_temp[i].id) == id) {
        //         $scope.points_temp.splice(i, 1);
        //         break;
        //     }
        // }

        for (var i = 0; i < $scope.points.length; i++) {
            if (parseInt($scope.points[i].id) == id) {
                $scope.points.splice(i, 1);
                break;
            }
        }

        $scope.filterByCategory(false);
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

    $scope.sortFavsOrder = function () {
        for (let i = 0; i < $scope.points.length; i++) {
            $scope.points[i].fav_order = (i + 1);
        }
    }

    $scope.switchAscDesc = function () {
        $scope.ascending = $scope.ascending * -1;
        $scope.updateSortValue();
    }

    $scope.updateSortValue = function () {
        $scope.sortBy($scope.points).then(arr => {
            $scope.points = arr
            $(".orders").attr('max', $scope.points_temp.length);
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
        $scope.sortByValue = 'fav_order';
        $scope.filterByCategory(false);
    }

}]);