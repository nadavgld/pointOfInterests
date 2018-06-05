app.factory('tokenService', function() {

    return{

        checkIfUserLoggedIn: function(cookies){
            if(cookies.get('token')){
                showUserNav()
                return true;
            }else{
                showLogRegNav()
                return false;
            }
        }
        
    }
});