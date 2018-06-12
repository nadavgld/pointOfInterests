Chart.defaults.pie.tooltips.callbacks.label = function (tooltipItem, data) {
    var idx = tooltipItem.index;
    var label = data.labels[idx];
    var count = data.datasets[0].data[idx];
    return label + ": " + count + " times";
};

app.controller('panel', ['$scope', '$http', '$location', '$routeParams', 'tokenService', '$cookies', 'localStorageService', function ($scope, $http, $location, $routeParams, tokenService, $cookies, localStorageService) {

    $scope.user = {};

    //Initialize Scope - checks if user is an admin
    $scope.init = function () {
        showLoading();

        tokenService.checkIfUserLoggedIn($cookies).then((response) => {
            $scope.token = $cookies.get('token');

            $scope.favorites = localStorageService.get('favorites') ? localStorageService.get('favorites') : [];
            $("#favoritesCount").html("(" + $scope.favorites.length + ")")

            if ($scope.favorites.length == 0) {

                $http.get('/user/' + $scope.user.id + '/favorite?token=' + $scope.token).then((response) => {
                    $scope.favorites = response.data;
                    localStorageService.set('favorites', $scope.favorites);
                    $("#favoritesCount").html("(" + $scope.favorites.length + ")")

                })
            }

            $http.get('/user/token/' + $scope.token).then((response) => {
                if (!response.data.error) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;
                    $scope.user.isAdmin = response.data.isAdmin;

                    if ($scope.user.isAdmin == 1) {
                        $scope.getStatistics();
                    } else {
                        $scope.redirectTo('/');
                    }
                } else {
                    $scope.redirectTo('/');
                }
            })
        }).catch(() => {
            $scope.redirectTo('/');
        })
    }

    $scope.redirectTo = function (path) {
        $location.path(path);
        $location.replace();
        $scope.$apply();
    }

    // Gets all statistics data and loads it to Chart.js library 
    $scope.getStatistics = function () {

        $http.get('/statistics/views_agg/avg').then((response) => {
            var data = response.data;
            $scope.drawGraph(data, 'bar', 'avg_views', 'Average Views')
            hideLoading();
        })

        $http.get('/statistics/views_agg/max').then((response) => {
            var data = response.data;
            $scope.drawGraph(data, 'bar', 'max_views', 'Max Views')
            hideLoading();
        })

        $http.get('/statistics/views_percentile/0.9').then((response) => {
            var data = response.data;
            $scope.drawGraph(data, 'bar', 'perc9', 'Percentile 0.9 Views')
            hideLoading();
        })

        $http.get('/statistics/views_percentile/0.5').then((response) => {
            var data = response.data;
            $scope.drawGraph(data, 'bar', 'perc5', 'Percentile 0.5 Views')
            hideLoading();
        })

        $http.get('/statistics/review_length/users').then((response) => {
            var data = response.data;
            $scope.drawGraph_review(data.map(t => t.description_length), data.map(t => t.username), data, 'bar', 'users_review', 'Average review length by users', true)
            hideLoading();
        })

        $http.get('/statistics/review_length/points').then((response) => {
            var data = response.data;
            $scope.drawGraph_review(data.map(t => t.description_length), data.map(t => t.name), data, 'horizontalBar', 'points_review', 'Average review length of points', true)
            hideLoading();
        })

        $http.get('/statistics/time/userfavoritepoint/date').then((response) => {
            var data = response.data;
            $scope.drawGraph_review(data.map(t => t.count), data.map(t => t.hour + ":00"), data, 'pie', 'favorite_time', 'Favorite per hours along daytime', false)
            hideLoading();
        })

        $http.get('/statistics/time/reviews/timestamp').then((response) => {
            var data = response.data;
            $scope.drawGraph_review(data.map(t => t.count), data.map(t => t.hour + ":00"), data, 'pie', 'review_time', 'Reviews per hours along daytime', false)
            hideLoading();
        })
    }

    // Draw graph
    $scope.drawGraph = function (data, type, id, title) {
        views = data.map(t => t.views)
        names = data.map(t => t.name)
        colors = [];

        for (var i = 0; i < names.length; i++)
            colors.push(rndColor())

        var ctx = document.getElementById(id).getContext('2d');
        var myChart = new Chart(ctx, {
            type: type,
            data: {
                labels: names,
                datasets: [{
                    label: title,
                    data: views,
                    backgroundColor: colors,
                    borderColor: '#555',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                title: {
                    display: true,
                    text: title,
                    fontSize: 16
                },
                legend: {
                    display: false
                }
            }
        });

    }

    // Draw graph V2
    $scope.drawGraph_review = function (x, y, data, type, id, title, gridLine) {
        colors = [];

        for (var i = 0; i < x.length; i++)
            colors.push(rndColor())

        var ctx = document.getElementById(id).getContext('2d');
        var myChart = new Chart(ctx, {
            type: type,
            data: {
                labels: y,
                datasets: [{
                    label: title,
                    data: x,
                    backgroundColor: colors,
                    borderColor: '#555',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        gridLines: {
                            display: gridLine
                        }
                    }]
                },
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: !gridLine
                }
            }
        });

    }


}]);

// Generate random colors
function rndColor() {
    var hex = '0123456789ABCDEF'.split(''),
        color = '#', i;
    for (i = 0; i < 6; i++) {
        color = color + hex[Math.floor(Math.random() * 16)];
    }
    return color;
}