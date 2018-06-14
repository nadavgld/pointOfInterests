var app = angular.module('POI-app', ['ngRoute', 'ngCookies', 'LocalStorageModule']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        controller: 'homepage',
        templateUrl: 'views/homepage.html'
    })
        .when('/login', {
            controller: 'logReg',
            templateUrl: 'views/logReg.html'
        })
        .when('/profile', {
            controller: 'profile',
            templateUrl: 'views/profile.html'
        })
        .when('/logout', {
            controller: 'logout',
            templateUrl: 'views/logout.html'
        })
        .when('/forget', {
            controller: 'passwordForget',
            templateUrl: 'views/passwordForget.html'
        })
        .when('/points', {
            controller: 'points',
            templateUrl: 'views/points.html'
        })
        .when('/favorites', {
            controller: 'favorites',
            templateUrl: 'views/favorites.html'
        })
        .when('/point/:id', {
            controller: 'point',
            templateUrl: 'views/point.html'
        })
        .when('/panel', {
            controller: 'panel',
            templateUrl: 'views/panel.html'
        })
        .when('/map', {
            controller: 'map',
            templateUrl: 'views/map.html'
        })
        .otherwise({
            controller: 'notFound',
            templateUrl: 'views/404.html'
        });
});

hideLoading();

// $(".navbar-nav > .nav-item > a").click((event) => {
//     $(".nav-item").removeClass("active");
//     $(event.target).parent().addClass("active");
// })

function showLoading() {
    $(".sk-circle").show();
}

function hideLoading() {
    $(".sk-circle").hide();
}

function showUserNav(isAdmin) {
    $("#profileNav").removeClass('d-none');
    $("#outNav").removeClass('d-none');
    $("#pointsNav").removeClass('d-none');
    $("#favoritesNav").removeClass('d-none');
    $("#mapNav").removeClass('d-none');
    $("#logRegNav").addClass('d-none');
    $("#homeNav").addClass('d-none');

    if (isAdmin) {
        $("#adminNav").removeClass('d-none');
    }
}

function showLogRegNav() {
    $("#profileNav").addClass('d-none');
    $("#outNav").addClass('d-none');
    $("#pointsNav").addClass('d-none');
    $("#adminNav").addClass('d-none');
    $("#favoritesNav").addClass('d-none');
    $("#mapNav").addClass('d-none');
    $("#logRegNav").removeClass('d-none');
    $("#homeNav").removeClass('d-none');
}

function redirectTo(path, scope, location) {
    location.path(path);
    location.replace();
    scope.$apply();
}