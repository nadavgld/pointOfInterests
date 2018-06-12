
app.controller('passwordForget', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    $scope.user = {
        email: ''
    }
    $scope.err = {};
    $scope.hasQuestions = false;
    $scope.questions;
    $scope.answers = {
        answer: '',
        answer2: ''
    };

    //First Step - Gets questionn by email
    $scope.getQuestions = function () {
        if (isMailValid($scope.user.email)) {
            $http.get('/user/' + $scope.user.email + "/question").then((response) => {
                var data = response.data;
                if (data.error) {
                    $scope.err.email = data.error;
                } else {
                    $scope.err.email = "";
                    $scope.hasQuestions = true;
                    $scope.questions = data.questions[0];
                }
            })
        } else {
            $scope.err.email = "Please enter a valid E-Mail";
        }
    }

    // Second Step - Gets password by answers 
    $scope.getPassword = function () {

        $http.post('/user/password', {email: $scope.user.email, answer: $scope.answers.answer, answer2: $scope.answers.answer2 }).then((response) => {
            var data = response.data;
            if (data.error) {
                $scope.err.password = data.error;
            } else {
                $scope.err.password = "";
                $scope.answers = {};
                $scope.password = data.password;
            }
        }).catch((err) => {
            console.log(err)
        })
    }

}]);

// Checks if mail is valid
function isMailValid(value) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(value.toLowerCase())) {
        return false;
    }
    return true;
}