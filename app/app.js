var app = angular.module('myApp', 
                        ['ngRoute',
                         'ngTable',
                         'ngAnimate',
                         'ngSanitize',
                         'angularModalService',
                         'mgcrea.ngStrap',
                         'myApp.serviceController',
                         'myApp.clientListController',
                         'myApp.clientEditController',
                         'myApp.checkoutController',
                         'myApp.invoiceController',
                         'myApp.invoiceViewController']);

var clientListController = angular.module('myApp.clientListController', []);
var clientEditController = angular.module('myApp.clientEditController', []);
var serviceController = angular.module('myApp.serviceController', []);
var checkoutController = angular.module('myApp.checkoutController', []);
var invoiceController = angular.module('myApp.invoiceController', []);
var invoiceViewController = angular.module('myApp.invoiceViewController', []);

//pass orders between serviceController and checkoutController
app.service("orderService", function() {
    var orderList = [];

    var addOrder = function(newOrder) {
        orderList.push(newOrder);
    }
    var getOrders = function(){
      return orderList;
    }
    var getClientNumber = function(){
      var i = 0;
      var clientNumber = 0;
      for(i; i < orderList.length; i++) {
          if(orderList[i].clientNumber != null && orderList[i].clientNumber != 0) {
            clientNumber = orderList[i].clientNumber;
          }
      }
      return clientNumber;
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
      clear: clear,
      getClientNumber: getClientNumber
  };
});


//factory to interface with php server
app.factory("services", ['$http', function($http) {
  var serviceBase = 'services/'
  var obj = {};

  //****************clients*****************
  obj.getClients = function(){
        return $http.get(serviceBase + 'clients');
  }
  obj.getClient = function(clientID){
        return $http.get(serviceBase + 'client?id=' + clientID);
  }

  obj.insertClient = function (client) {
    return $http.post(serviceBase + 'insertClient', client).then(function (results) {
        console.log(results);
        return results;
    });
	};

	obj.updateClient = function (id,client) {
	    return $http.post(serviceBase + 'updateClient', {id:id, client:client}).then(function (status) {
          console.log(status);
	        return status.data;
	    });
	};

	obj.deleteClient = function (id) {
	    return $http.delete(serviceBase + 'deleteClient?id=' + id).then(function (status) {
          console.log(results);
          return status.data;
	    });
	};

//****************services**********************
  obj.insertService = function (service) {
      return $http.post(serviceBase + 'insertService', service).then(function (results) {
      console.log(results);
      return results;
    });
  };

  obj.insertInvoice = function (invoice) {
      return $http.post(serviceBase + 'insertInvoice', invoice).then(function (results) {
      console.log(results);
      return results;
    });
  };

//*******************credit card*****************
  obj.insertCard = function (card) {
      return $http.post(serviceBase + 'insertCard', card).then(function (results) {
      console.log(results);
      return results.statusText;
    });
  };

//********************invoice***********************
  obj.updateInvoice = function (id, invoice) {
      return $http.post(serviceBase + 'updateInvoice', {id:id, invoice:invoice}).then(function (status) {
           console.log(status);
           return status.data;
       });
  };

  obj.getAllInvoices = function(){
      return $http.get(serviceBase + 'getAllInvoices');      
  }

  obj.getInvoice = function(id){
      return $http.get(serviceBase + 'getInvoice?id=' + id);      
  }

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
      .when('/invoice-credit', {
        title: 'Credit Invoice',
        templateUrl: 'partials/invoice-credit.html',
        controller: 'invoiceController',
      })
      .when('/invoice/:invoiceID', {
        templateUrl: 'partials/invoice.html',
        controller: 'invoiceViewController',
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