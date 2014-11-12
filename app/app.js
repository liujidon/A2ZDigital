var app = angular.module('myApp', 
                        ['ngRoute',
                         'mgcrea.ngStrap',
                         'myApp.serviceController',
                         'myApp.clientListController',
                         'myApp.clientEditController',
                         'myApp.checkoutController']);

var clientListController = angular.module('myApp.clientListController', []);
var clientEditController = angular.module('myApp.clientEditController', []);
var serviceController = angular.module('myApp.serviceController', []);
var checkoutController = angular.module('myApp.checkoutController', []);

app.service("orderService", function() {
    var orderList = [];

    var addOrder = function(newOrder) {
          orderList.push(newOrder);
    }
    var getOrders = function(){
      return orderList;
    }
    var getClientID = function(){
      return clientID;
    }
    var removeOrder = function(index) {
      orderList.splice(index, 1);
    }
    var clear = function() {
      orderList = [];
    }
    return {
      addOrder: addOrder,
      getOrders: getOrders,
      removeOrder: removeOrder,
      clear: clear
  };
});

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
      .when('/checkout', {
        title: 'Checkout',
        templateUrl: 'partials/checkout.html',
        controller: 'checkoutController',
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