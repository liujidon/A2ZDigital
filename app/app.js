var app = angular.module('myApp', ['ngRoute', 'mgcrea.ngStrap']);
app.factory("services", ['$http', function($http) {
  var serviceBase = 'services/'
    var obj = {};
    obj.getClients = function(){
        return $http.get(serviceBase + 'clients');
    }
    obj.getClient = function(clientID){
        return $http.get(serviceBase + 'client?id=' + clientID);
    }

    obj.insertClient = function (client) {
    return $http.post(serviceBase + 'insertClient', client).then(function (results) {
        return results;
    });
	};

	obj.updateClient = function (id,client) {
	    return $http.post(serviceBase + 'updateClient', {id:id, client:client}).then(function (status) {
	        return status.data;
	    });
	};

	obj.deleteClient = function (id) {
	    return $http.delete(serviceBase + 'deleteClient?id=' + id).then(function (status) {
	        return status.data;
	    });
	};

    return obj;   
}]);

app.controller('listCtrl', function ($scope, services) {
    services.getClients().then(function(data){
        $scope.clients = data.data;
    });
});

app.controller('editCtrl', function ($scope, $rootScope, $location, $routeParams, services, client) {
    var clientID = ($routeParams.clientID) ? parseInt($routeParams.clientID) : 0;
    $rootScope.title = (clientID > 0) ? 'Edit Client' : 'Add Client';
    $scope.buttonText = (clientID > 0) ? 'Update Client' : 'Add New Client';
      var original = client.data;
      original._id = clientID;
      $scope.client = angular.copy(original);
      $scope.client._id = clientID;

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

app.controller('addServiceCtrl', function ($scope, services) {
  this.tab = 1;
    
  this.selectTab = function (setTab){
      console.print(setTab);
      this.tab = setTab;
  };
  this.isSelected = function(checkTab) {
      return this.tab === checkTab;
  };
});


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        title: 'Clients',
        templateUrl: 'partials/clients.html',
        controller: 'listCtrl'
      })
      .when('/edit-client/:clientID', {
        title: 'Edit Clients',
        templateUrl: 'partials/edit-client.html',
        controller: 'editCtrl',
        resolve: {
          client: function(services, $route){
            var clientID = $route.current.params.clientID;
            return services.getClient(clientID);
          }
        }
      })
      .when('/add-services/:clientID', {
        title: 'Add Services',
        templateUrl: 'partials/add-services.html',
        controller: 'addServiceCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);