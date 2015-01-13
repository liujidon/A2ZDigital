/**
 * Created by Bill on 15-01-12.
 */

ProfileController.controller('ProfileController', function ($scope, $rootScope) {

    $scope.accessLevel = function () {
        if ($rootScope.globals.currentUser.level == null) return "Unknown";
        switch (parseInt($rootScope.globals.currentUser.level)) {
            case "0":
                return "Public";
            case 1:
                return "Access";
            case 2:
                return "Full Access";
            case 3:
                return "Admin";
            default:
                return "Unknown";
        }
    };
});