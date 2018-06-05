
app.controller('points', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    $scope.points = [];
    $scope.points_temp = [];
    $scope.pointToReview;
    $scope.pointHasReviews;
    $scope.categories = [];
    $scope.categoryFilter = '';
    $scope.token;
    $scope.user = {};

    $scope.ascending = -1;
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

        if (!tokenService.checkIfUserLoggedIn($cookies)) {
            $location.path('/');
            $location.replace();
        } else {
            $scope.token = $cookies.get('token');

            $http.get('/user/token/' + $scope.token).then((response) => {
                if (response.data) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;

                    $http.get('/point').then((response) => {
                        $scope.points = response.data;
                        $scope.points_temp = response.data;

                        $http.get('/category').then((response) => {
                            $scope.categories = response.data;
                            // $scope.categories.unshift({ name: "All", id: -1 });
                            // $scope.switchAscDesc();
                            $scope.filterByCategory();

                            hideLoading();
                        });
                    })
                }
            });
        }
    }

    $scope.sortBy = function (arr) {
        console.log($scope.sortByValue)

        return new Promise((resolve, reject) => {
            var x = [].concat(arr).slice().sort((a, b) =>
                a[$scope.sortByValue] < b[$scope.sortByValue] ? 1 * $scope.ascending : -1 * $scope.ascending
            );
            resolve(x);
        });
    }

    $scope.switchAscDesc = function () {
        console.log($scope.ascending)
        $scope.ascending = $scope.ascending * -1;
        setTimeout(() => {
            $scope.updateSortValue();
        }, 50);

    }

    $scope.updateSortValue = function () {
        console.log( $scope.sortByValue)
        // const x = JSON.parse(JSON.stringify($scope.points))

        setTimeout(() => {
            $scope.sortBy($scope.points).then(arr => $scope.points = arr);
        }, 50);

    }

    $scope.filterByCategory = function () {
        var x = JSON.parse(JSON.stringify($scope.points_temp))

        new Promise((resolve, reject) => {
            if ($scope.categoryFilter != '') {
                const y = x.filter((p) => p.category == $scope.categoryFilter);
                resolve(y);
            }else{
                resolve(x);
            }
        }).then(arr => $scope.points = arr);
        
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

}]);