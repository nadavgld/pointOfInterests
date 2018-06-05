
app.controller('homepage', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    $scope.popularPoints = [];

    $scope.pointToReview;
    $scope.pointHasReviews;

    $scope.init = function () {
        showLoading();
        if (tokenService.checkIfUserLoggedIn($cookies)) {
            $location.path('/profile');
            $location.replace();
        }

        $http.get('/point/random/3').then((response) => {

            if (response.data) {
                $scope.popularPoints = response.data;
                hideLoading();
            }

        })
    }

    $scope.showReviewsModal = function (id) {
        showLoading();

        var point = $scope.popularPoints.filter((poi) => poi.id == id)[0];

        $scope.pointToReview = point;

        if (!point.reviews || point.reviews.length == 0) {
            $scope.pointHasReviews = false;

            $('#exampleModal').modal('show');
        }
        else {
            $scope.pointHasReviews = true;

            for (let user = 0; user < point.reviews.length; user++) {
                const id = point.reviews[user].u_id;
                const idx = user;

                $http.get('/user/' + id + '/name').then((response) => {
                    point.reviews[idx].username = response.data.username;
                    point.reviews[idx].time = new Date(point.reviews[idx].timestamp).getTime();

                    if (idx == point.reviews.length - 1){
                        $('#exampleModal').modal('show');
                    }
                    
                })
                
            }
        }
        hideLoading();

    }

}]);