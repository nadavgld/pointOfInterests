
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

    //Initialize Scope - gets all favorites from localstorage\db
    $scope.init = function () {
        showLoading();

        tokenService.checkIfUserLoggedIn($cookies).then((response) => {
            $scope.token = $cookies.get('token');

            $http.get('http://localhost:3000/user/token/' + $scope.token).then((response) => {
                if (!response.data.error) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;

                    $http.get('http://localhost:3000/category').then((response) => {
                        $scope.categories = response.data;

                        $scope.points_temp = localStorageService.get('favorites') ? localStorageService.get('favorites') : [];

                        if ($scope.points_temp.length == 0) {

                            $http.get('http://localhost:3000/user/' + $scope.user.id + '/favorite?token=' + $scope.token).then((response) => {
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

    //Swap favorite point places while re-ordering
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
                break;
            }
        }
    }

    //Sub-function; checks which index to swap to
    $scope.getEmptySpot = function () {
        for (var i = 1; i <= $scope.points_temp.length; i++) {
            if ($scope.points_temp.filter(f => f.fav_order == i).length == 0)
                return i;
        }

        return -1;
    }

    //Get all favorites
    $scope.getAllFavs = function () {
        var promises = [];

        for (var i = 0; i < $scope.points_temp.length; i++) {
            var id = $scope.points_temp[i].p_id;
            var _p = $http.get('http://localhost:3000/point/id/' + id).then((response) => $scope.points.push(response.data[0]))
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

    //Checks if a point is favorited
    $scope.isFavorited = function (id) {
        id = parseInt(id);

        for (var i = 0; i < $scope.points_temp.length; i++) {
            if (id == $scope.points_temp[i].p_id)
                return true;
        }

        return false;
    }

    //Sends array of points to DB
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

        $http.put('http://localhost:3000/user/favorite', body).then((response) => {
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

    //Favorite\Un-favorite a point
    $scope.toggleFavorite = function (id) {
        id = parseInt(id);

        $scope.points_temp.sort((a, b) => a.fav_order < b.fav_order ? -1 : 1);

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
        }

        localStorageService.set('favorites', $scope.points_temp)
        $("#favoritesCount").html("(" + $scope.points_temp.length + ")")
        $(".orders").attr('max', $scope.points_temp.length);

        for (var i = 0; i < $scope.points.length; i++) {
            if (parseInt($scope.points[i].id) == id) {
                $scope.points.splice(i, 1);
                break;
            }
        }

        $scope.filterByCategory(false);
    }

    //Show\Hide filtering section
    $scope.toggleFiltering = function () {
        $scope.showFiltering = !$scope.showFiltering;

        if ($scope.showFiltering) {
            $(".filter-section").slideDown();
        }
        else {
            $(".filter-section").slideUp();
        }
    }

    //Sort array of points by field
    $scope.sortBy = function (arr) {
        return new Promise((resolve, reject) => {
            var x = [].concat(arr).slice().sort((a, b) =>
                a[$scope.sortByValue] < b[$scope.sortByValue] ? -1 * $scope.ascending : 1 * $scope.ascending
            );
            resolve(x);
        });
    }

    //Sort Asc\Desc
    $scope.switchAscDesc = function () {
        $scope.ascending = $scope.ascending * -1;
        $scope.updateSortValue();
    }

    //Re-sorting after changing sort-field
    $scope.updateSortValue = function () {
        $scope.sortBy($scope.points).then(arr => {
            $scope.points = arr
            $(".orders").attr('max', $scope.points_temp.length);
            $scope.$apply();
        });
    }

    //Filter points by category
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

    //Show review modal & get all reviews of point
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

                $http.get('http://localhost:3000/user/' + id + '/name').then((response) => {
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

    //Resize search font by length
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

    // Filter points by textual search
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

    //Search point by text compare to name\category\description
    $scope.searchPoint = function (p) {
        return p.name.toLowerCase().indexOf($scope.searchForm.toLowerCase()) >= 0 ||
            p.category.toLowerCase().indexOf($scope.searchForm.toLowerCase()) >= 0 ||
            p.description.toLowerCase().indexOf($scope.searchForm.toLowerCase()) >= 0
    }

    //Clear all filtering 
    $scope.clearFiltering = function () {
        $scope.searchForm = '';
        $scope.categoryFilter = '';
        $scope.ascending = 1;
        $scope.sortByValue = 'fav_order';
        $scope.filterByCategory(false);
    }

}]);