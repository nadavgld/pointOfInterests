var app = angular.module('POI-app',['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider.when('/',{
        controller: 'homepage',
        templateUrl: 'views/homepage.html'
    })
    .otherwise({
        controller: 'notFound',
        templateUrl: 'views/404.html'        
    });
});


$(".navbar-nav > .nav-item > a").click((event)=>{
    $(".nav-item").removeClass("active");
    $(event.target).parent().addClass("active");
})