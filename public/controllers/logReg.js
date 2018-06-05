app.controller('logReg', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    $scope.toLogin;
    $scope.loginForm = {};
    $scope.registerForm = {};
    $scope.countries = [];
    $scope.categories = [];
    $scope.afterRegUser;

    formTemplate = ['username', 'password', 'city', 'country', 'firstName', 'lastName', 'question', 'answer', 'question2', 'answer2', 'email', 'categories']
    $scope.init = function () {
        showLoading();
        $scope.toLogin = true;

        if (tokenService.checkIfUserLoggedIn($cookies)) {
            $location.path('/profile');
            $location.replace();
        }

        $scope.registerForm.categories = [];

        $http.get('countries.xml').then((response) => {
            $scope.countries = (xml2json($.parseXML(response.data))).Countries.Country;
        });

        $http.get('/category').then((response) => {
            $scope.categories = response.data;
            hideLoading();
        });
    }

    $scope.passwordForget = function(){
        $location.path('/forget');
        $location.replace();
    }

    $scope.toggleLogReg = function () {
        $scope.toLogin = !($scope.toLogin);
        $scope.loginForm = {};
        $scope.registerForm = {};
        $scope.registerForm.categories = [];
    }

    $scope.toggleCategory = function (id) {
        if ($scope.registerForm.categories.indexOf(id) == -1)
            $scope.registerForm.categories.push(id)
        else {
            var idx = $scope.registerForm.categories.indexOf(id);
            $scope.registerForm.categories.splice(idx, 1);
        }

    }

    $scope.login = function () {
        showLoading();

        var username = $scope.loginForm.username;
        var password = $scope.loginForm.password;

        $http.post('/user/login', { username: username, password: password }).then((resp) => {
            $cookies.put('token', resp.data.token);
            showUserNav();
            hideLoading();

            $scope.loginForm.err = "";

            $location.path('/profile');
            $location.replace();

        })
            .catch((err) => {
                console.log(err.data.error);
                $scope.loginForm.err = err.data.error;
                $scope.loginForm.password = "";
                hideLoading();
            })
    }

    $scope.register = function () {
        showLoading();

        $scope.isEmailAndUserAvailable()
            .then((response) => {
                if (response) {
                    alert("Username or Email already in use");
                    hideLoading();

                    return;
                }
                if ($scope.validateRegisterForm()) {
                    $scope.postRegister();
                }
            })
            .catch((err) => { console.log(err) })

    }

    $scope.postRegister = function () {

        var newUser = {
            "username": $scope.registerForm.username,
            "password": $scope.registerForm.password,
            "firstName": $scope.registerForm.firstName,
            "lastName": $scope.registerForm.lastName,
            "city": $scope.registerForm.city,
            "country": $scope.registerForm.country,
            "email": $scope.registerForm.email,
            "question": $scope.registerForm.question,
            "answer": $scope.registerForm.answer,
            "categories": $scope.registerForm.categories,
            "question2": $scope.registerForm.question2,
            "answer2": $scope.registerForm.answer2
        }

        $http.post('/user/', newUser).then((resp) => {
            $scope.afterRegUser = $scope.registerForm.username;

            $scope.toggleLogReg();
            hideLoading();

            $scope.loginForm.username = $scope.afterRegUser;
            setTimeout(() => {
                alert("Register successfully");
            }, 2000);
        })
    }

    $scope.isEmailAndUserAvailable = function () {
        return new Promise((resolve, reject) => {
            var email = $scope.registerForm.email;
            var username = $scope.registerForm.username;
            $http.get('/user/checkExistence/' + email + '/' + username).then((response) => {
                resolve(response.data.isExists);
            }).catch((err) => {
                reject(err)
            })
        })
    }

    $scope.validateRegisterForm = function () {
        for (var idx in formTemplate) {
            var field = formTemplate[idx];
            if (!$scope.registerForm[field] || $scope.registerForm[field] == null) {
                alert("All fields must be filled");
                return false;
            } else {
                if (!checkFormValue(field, $scope.registerForm[field], $http)) {
                    return false;
                }
            }
        }

        return true;
    }

}]);

function checkFormValue(field, value) {
    switch (field) {
        case "username":
            var re = /^[a-zA-Z]+$/;
            if (value.length < 3 || value.length > 8 || !re.test(value)) {
                alert("Username must be 3-8 characters, only letters");
                return false;
            }
            break;

        case "password":
            var re = /^(?:[0-9]+[a-z]|[a-z]+[0-9])[a-z0-9]*$/i;
            if (value.length < 5 || value.length > 10 || !re.test(value)) {
                alert("Password must be 5-10 characters, letters and numbers");
                return false;
            }
            break;

        case "city":
            if (value.trim().length < 2) {
                alert("Must enter valid city name");
                return false;
            }
            break;

        case "firstName":
            if (value.trim().length < 2) {
                alert("Must enter valid first name");
                return false;
            }
            break;

        case "lastName":
            if (value.trim().length < 2) {
                alert("Must enter valid last name");
                return false;
            }
            break;

        case "email":
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(value.toLowerCase())) {
                alert("Must enter valid email");
                return false;
            }
            break;

        case "categories":
            if (value.length < 2) {
                alert("Must choose at least 2 categories");
                return false;
            }
            break;
    }

    return true;

}

function xml2json(xml) {
    try {
        var obj = {};
        if (xml.children.length > 0) {
            for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = xml2json(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xml2json(item));
                }
            }
        } else {
            obj = xml.textContent;
        }
        return obj;
    } catch (e) {
        console.log(e.message);
    }
}

setTimeout(() => {
    $('[data-toggle="tooltip"]').tooltip();
}, 1000);