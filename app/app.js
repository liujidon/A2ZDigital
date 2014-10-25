var app = angular.module('myApp', 
                        ['ngRoute',
                         'mgcrea.ngStrap',
                         'myApp.serviceController',
                         'myApp.clientListController',
                         'myApp.clientEditController']);

var clientListController = angular.module('myApp.clientListController', []);
var clientEditController = angular.module('myApp.clientEditController', []);
var serviceController = angular.module('myApp.serviceController', []);

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

  obj.insertService = function (service) {
      return $http.post(serviceBase + 'insertService', service).then(function (results) {
      return results;
    });
  };

    return obj;   
}]);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        title: 'Clients',
        templateUrl: 'partials/clients.html',
        controller: 'clientListController'
      })
      .when('/edit-client/:clientID', {
        title: 'Edit Clients',
        templateUrl: 'partials/edit-client.html',
        controller: 'clientEditController',
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
        controller: 'serviceController',
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