/**
 * Created by Bill on 15-01-10.
 */
UserController.controller('UserController', function ($scope, services) {

    $scope.isEdit = false;

    $scope.refresh = function(){
        services.getUsers().then(function (data) {
            $scope.users = data.data;
        });
        $scope.user = { username: '', password: '', firstname: '', lastname: '', level: 1 };
    };

    $scope.refresh();

    $scope.addUser = function(user) {
        if($scope.isEdit) {
            services.deleteUser(user.id).then(function (data) {
                services.insertUser(user).then(function (data) {
                    $scope.refresh();
                });
            });
        }
        else
        {
            services.insertUser(user).then(function (data) {
                $scope.refresh();
            });
        }
    };

    $scope.isValid = function() {
        return  $scope.user != null &&
                $scope.user.username != null &&
                $scope.user.password != null &&
                $scope.user.level != null;
    };

    $scope.editUser = function(user) {
        $scope.user = user;
        $scope.isEdit = true;
    };

    $scope.deleteUser = function(user) {
        services.deleteUser(user.id).then(function (data) {
            $scope.refresh();
        });
    }
});