var map;
var features = [];

app.controller('map', ['$scope', '$http', '$location', '$routeParams', 'tokenService', '$cookies', 'localStorageService', function ($scope, $http, $location, $routeParams, tokenService, $cookies, localStorageService) {

    $scope.user = {};

    //Initialize Scope - checks if user logged-in ; loads points to the map
    $scope.init = function () {

        tokenService.checkIfUserLoggedIn($cookies).then((response) => {
            $scope.token = $cookies.get('token');

            $scope.favorites = localStorageService.get('favorites') ? localStorageService.get('favorites') : [];
            $("#favoritesCount").html("(" + $scope.favorites.length + ")")

            if ($scope.favorites.length == 0) {

                $http.get('http://localhost:3000/user/' + $scope.user.id + '/favorite?token=' + $scope.token).then((response) => {
                    $scope.favorites = response.data;
                    localStorageService.set('favorites', $scope.favorites);
                    $("#favoritesCount").html("(" + $scope.favorites.length + ")")

                })
            }

            $http.get('http://localhost:3000/user/token/' + $scope.token).then((response) => {
                if (!response.data.error) {
                    $scope.user.username = response.data.userName;
                    $scope.user.id = response.data.id;
                    $scope.user.isAdmin = response.data.isAdmin;

                    $scope.getMap();
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

    // Generates map via mapbox
    $scope.getMap = function () {

        mapboxgl.accessToken = 'pk.eyJ1IjoibmFkYXZncmkiLCJhIjoiY2ppYmZneG81MWhjODNwcGZ1OWJvcmdoMCJ9.fYcGYOUgVO1feInVU394HQ';

        map = new mapboxgl.Map({
            container: 'map',
            center: [-73.984801, 40.748389],
            zoom: 12,
            style: 'mapbox://styles/mapbox/streets-v10'
        });

        var loadMap = function () {
            map.on('load', function () {
                map.addLayer({
                    "id": "places",
                    "type": "symbol",
                    "source": {
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": features
                        }
                    },
                    "layout": {
                        "icon-image": "{icon}-15",
                        "icon-allow-overlap": true
                    }
                });

                map.on('click', 'places', function (e) {
                    var coordinates = e.features[0].geometry.coordinates.slice();
                    var description = e.features[0].properties.description;

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                });

                map.on('mouseenter', 'places', function () {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'places', function () {
                    map.getCanvas().style.cursor = '';
                });
            });

        }

        // Gets points details
        $http.get('http://localhost:3000/point').then((response) => {
            var data = response.data;
            features = [];

            for (var i = 0; i < data.length; i++) {
                if (data[i].x_pos) {
                    features.push({
                        "type": "Feature",
                        "properties": {
                            "description": "<strong> <a href='#!/point/" + data[i].id + "' class='text-success p-4'>" + data[i].name + " [" + data[i].category + "] </a></strong>",
                            "icon": "star"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data[i].x_pos, data[i].y_pos]
                        }
                    })
                }
            }

            loadMap();
        })
    }
}]);
