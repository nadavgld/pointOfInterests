app.service('tokenService', ['$http', function ($http) {

    this.checkIfUserLoggedIn = function (cookies) {
        return new Promise((resolve, reject) => {

            if (cookies.get('token')) {
                $http.get('/user/token/' + cookies.get('token')).then((response) => {
                    if (!response.data.error) {

                        var isAdmin = response.data.isAdmin == 1 ? true : false;
                        showUserNav(isAdmin)
                        resolve(true);
                    } else {
                        cookies.remove('token')

                        showLogRegNav()
                        reject(false);

                    }
                }).catch((response) => reject(false))
            } else {
                showLogRegNav()
                reject(false);
            }
        })
    }

}]);