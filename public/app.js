var app = angular.module('POI-app', ['ngRoute', 'ngCookies']);

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
        .otherwise({
            controller: 'notFound',
            templateUrl: 'views/404.html'
        });
});

hideLoading();

$(".navbar-nav > .nav-item > a").click((event) => {
    $(".nav-item").removeClass("active");
    $(event.target).parent().addClass("active");
})

function showLoading(){
    $(".sk-circle").show();
}

function hideLoading(){
    $(".sk-circle").hide();
}

function showUserNav(){
    $("#profileNav").removeClass('d-none');
    $("#outNav").removeClass('d-none');
    $("#pointsNav").removeClass('d-none');
    $("#logRegNav").addClass('d-none');
    $("#homeNav").addClass('d-none');
}

function showLogRegNav(){
    $("#profileNav").addClass('d-none');
    $("#outNav").addClass('d-none');
    $("#pointsNav").addClass('d-none');
    $("#logRegNav").removeClass('d-none');
    $("#homeNav").removeClass('d-none');
}