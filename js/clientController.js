'use strict';


clientListController.controller('clientListController', function ($scope, services) {
    services.getClients().then(function(data){
        $scope.clients = data.data;
    });
});

clientEditController.controller('clientEditController', function ($scope, $rootScope, $location, $routeParams, services, client) {
    var clientID = ($routeParams.clientID) ? parseInt($routeParams.clientID) : 0;
    $rootScope.title = (clientID > 0) ? 'Edit Client' : 'Add Client';
    $scope.buttonText = (clientID > 0) ? 'Update Client' : 'Add New Client';
    if(client.data != "") {
      var original = client.data;
      original._id = clientID;
      $scope.client = angular.copy(original);
      $scope.client._id = clientID;
    }
      $scope.isClean = function() {
        return angular.equals(original, $scope.client);
      }

      $scope.deleteClient = function(client) {
        $location.path('/');
        if(confirm("Are you sure to delete client number: "+$scope.client._id)==true)
        services.deleteClient(client.clientNumber);
      };

      $scope.saveClient = function(client) {
        $location.path('/');
        if (clientID <= 0) {
            services.insertClient(client);
        }
        else {
            services.updateClient(clientID, client);
        }
    };
});
