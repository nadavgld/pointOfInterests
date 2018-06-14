app.controller('logReg', ['$scope', '$http', '$location', '$routeParams', '$cookies', 'tokenService', function ($scope, $http, $location, $routeParams, $cookies, tokenService) {

    $scope.toLogin;
    $scope.loginForm = {};
    $scope.registerForm = {};
    $scope.countries = [];
    $scope.categories = [];
    $scope.afterRegUser;
    $scope.regErr = {

    }

    formTemplate = ['username', 'password', 'city', 'country', 'firstName', 'lastName', 'question', 'answer', 'question2', 'answer2', 'email', 'categories']

    //Initialize Scope - checks if user logged-in => redirect to profile, else load countries XML
    $scope.init = function () {
        showLoading();
        $scope.toLogin = true;

        tokenService.checkIfUserLoggedIn($cookies).then(() => {
            redirectTo('/profile', $scope, $location);
        }).catch(() => {

            $scope.registerForm.categories = [];

            $http.get('countries.xml').then((response) => {
                $scope.countries = (xml2json($.parseXML(response.data))).Countries.Country;
            });

            $http.get('http://localhost:3000/category').then((response) => {
                $scope.categories = response.data;

                hideLoading();
            });
        })

    }

    //Redirects to forget-password section
    $scope.passwordForget = function () {
        $location.path('/forget')
        $location.replace()
    }

    //Toggle between register-login
    $scope.toggleLogReg = function () {
        $scope.toLogin = !($scope.toLogin);
        $scope.loginForm = {};
        $scope.registerForm = {};
        $scope.registerForm.categories = [];

        setTimeout(() => {
            $('[data-toggle="tooltip"]').tooltip();
        }, 10);
    }

    $scope.toggleCategory = function (id) {
        if ($scope.registerForm.categories.indexOf(id) == -1)
            $scope.registerForm.categories.push(id)
        else {
            var idx = $scope.registerForm.categories.indexOf(id);
            $scope.registerForm.categories.splice(idx, 1);
        }

    }

    // Login 
    $scope.login = function () {
        showLoading();

        var username = $scope.loginForm.username;
        var password = $scope.loginForm.password;

        $http.post('http://localhost:3000/user/login', { username: username, password: password }).then((resp) => {
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

    //Register & form validation
    $scope.register = function () {
        showLoading();

        $scope.isEmailAndUserAvailable()
            .then((response) => {
                if (response) {
                    $scope.regErr.username = "Username or Email already in use";
                    $scope.regErr.email = "Username or Email already in use";

                    hideLoading();
                    return;
                }
                if ($scope.validateRegisterForm()) {
                    $scope.regErr = {};
                    $scope.postRegister();
                }else{
                    hideLoading();
                    $scope.$apply();
                    return;
                }
            })
            .catch((err) => { console.log(err) })

    }

    //Sends new user's data to DB
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

        $http.post('http://localhost:3000/user/', newUser).then((resp) => {
            $scope.afterRegUser = $scope.registerForm.username;

            $scope.toggleLogReg();
            hideLoading();

            $scope.loginForm.username = $scope.afterRegUser;
            setTimeout(() => {
                $('[data-toggle="tooltip"]').tooltip("disable");
                alert("Register successfully");
            }, 10);
        })
    }

    //Checks if username or email already taken
    $scope.isEmailAndUserAvailable = function () {
        return new Promise((resolve, reject) => {
            var email = $scope.registerForm.email;
            var username = $scope.registerForm.username;
            $http.get('http://localhost:3000/user/checkExistence/' + email + '/' + username).then((response) => {
                resolve(response.data.isExists);
            }).catch((err) => {
                reject(err)
            })
        })
    }

    //Validate register form by rules
    $scope.validateRegisterForm = function () {
        var hasMissing = false;
        var hasErr = false;

        for (var idx in formTemplate) {
            var field = formTemplate[idx];
            if (!$scope.registerForm[field] || $scope.registerForm[field] == null) {
                hasMissing = true;
            } else {
                if($scope.checkFormValue(field, $scope.registerForm[field]))
                    hasErr = true;
            }
        }

        if (hasMissing) {
            alert("All fields must be filled");

            hideLoading();
            return false;
        }

        return !hasErr;
    }

    // Validates register form
    $scope.checkFormValue = function (field, value) {
        var hasErr = false;

        switch (field) {
            case "username":
                var re = /^[a-zA-Z]+$/;
                if (value.length < 3 || value.length > 8 || !re.test(value)) {
                    $scope.regErr.username = "Username must be 3-8 characters, only letters";
                    hasErr = true;
                } else {
                    $scope.regErr.username = "";
                }
                break;

            case "password":
                var re = /^(?:[0-9]+[a-z]|[a-z]+[0-9])[a-z0-9]*$/i;
                if (value.length < 5 || value.length > 10 || !re.test(value)) {
                    $scope.regErr.password = "Password must be 5-10 characters, letters and numbers";
                    hasErr = true;
                } else {
                    $scope.regErr.password = "";
                }
                break;

            case "city":
                if (value.trim().length < 2) {
                    $scope.regErr.city = "Must enter valid city name";
                    hasErr = true;
                } else {
                    $scope.regErr.city = ""
                }
                break;

            case "firstName":
                if (value.trim().length < 2) {
                    $scope.regErr.firstname = "Must enter valid first name";
                    hasErr = true;
                } else {
                    $scope.regErr.firstname = ""
                }
                break;

            case "lastName":
                if (value.trim().length < 2) {
                    $scope.regErr.lastname = "Must enter valid last name";
                    hasErr = true;
                } else {
                    $scope.regErr.lastname = ""
                }
                break;

            case "email":
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(value.toLowerCase())) {
                    $scope.regErr.email = "Must enter valid email";
                    hasErr = true;
                } else {
                    $scope.regErr.email = ""
                }
                break;

            case "categories":
                if (value.length < 2) {
                    $scope.regErr.categories = "Must choose at least 2 categories";
                    hasErr = true;
                } else {
                    $scope.regErr.categories = ""
                }
                break;
        }

        return hasErr;

    }

}]);

// Converts XML to json
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