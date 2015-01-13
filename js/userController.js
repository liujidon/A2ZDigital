/**
 * Created by Bill on 15-01-10.
 */
UserController.controller('UserController', function ($scope, services) {

    $scope.refresh = function(){
        services.getUsers().then(function (data) {
            $scope.users = data.data;
        });
        $scope.user = { username: '', password: '', firstname: '', lastname: '', level: 1 };
    };

    $scope.refresh();

    $scope.addUser = function(user) {
        services.insertUser(user).then(function (data) {
            $scope.refresh();
        });
    };

    $scope.isValid = function() {
        return  $scope.user != null &&
                $scope.user.username != null &&
                $scope.user.password != null &&
                $scope.user.level != null;
    };
});