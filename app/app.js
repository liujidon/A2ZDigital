angular.module('authenticationModule', []);

var app = angular.module('myApp',
    ['ngRoute',
        'ngTable',
        'ngAnimate',
        'ngSanitize',
        'angularModalService',
        'mgcrea.ngStrap',
        'ngCookies',
        'authenticationModule',
        'myApp.LoginController',
        'myApp.ServiceAddController',
        'myApp.ServiceEditController',
        'myApp.ClientListController',
        'myApp.ClientEditController',
        'myApp.ClientViewController',
        'myApp.CheckoutController',
        'myApp.InvoiceController',
        'myApp.InvoiceViewController']);

var LoginController = angular.module('myApp.LoginController', []);
var ClientListController = angular.module('myApp.ClientListController', []);
var ClientEditController = angular.module('myApp.ClientEditController', []);
var ClientViewController = angular.module('myApp.ClientViewController', []);
var ServiceAddController = angular.module('myApp.ServiceAddController', []);
var ServiceEditController = angular.module('myApp.ServiceEditController', []);
var CheckoutController = angular.module('myApp.CheckoutController', []);
var InvoiceController = angular.module('myApp.InvoiceController', []);
var InvoiceViewController = angular.module('myApp.InvoiceViewController', []);

//pass orders between serviceAddController and checkoutController
app.service("orderService", function () {
    var orderList = [];

    var addOrder = function (newOrder) {
        orderList.push(newOrder);
    }
    var getOrders = function () {
        return orderList;
    }
    var getClientNumber = function () {
        var i = 0;
        var clientNumber = 0;
        for (i; i < orderList.length; i++) {
            if (orderList[i].clientNumber != null && orderList[i].clientNumber != 0) {
                clientNumber = orderList[i].clientNumber;
            }
        }
        return clientNumber;
    }
    var removeOrder = function (index) {
        orderList.splice(index, 1);
    }
    var clear = function () {
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
app.factory("services", ['$http', function ($http) {
    var serviceBase = 'services/';
    var obj = {};

    //****************clients*****************
    obj.getClients = function () {
        return $http.get(serviceBase + 'clients');
    }
    obj.getClient = function (clientID) {
        return $http.get(serviceBase + 'client?clientNumber=' + clientID);
    }
    obj.getClientServices = function (clientID) {
        return $http.get(serviceBase + 'client?clientNumber=' + clientID + '&table=services');
    }
    obj.getClientInvoices = function (clientID) {
        return $http.get(serviceBase + 'client?clientNumber=' + clientID + '&table=invoices');
    }
    obj.getClientCards = function (clientID) {
        return $http.get(serviceBase + 'client?clientNumber=' + clientID + '&table=cards');
    }

    obj.insertClient = function (client) {
        return $http.post(serviceBase + 'insertClient', client).then(function (results) {
            console.log(results);
            return results;
        });
    };

    obj.updateClient = function (id, client) {
        return $http.post(serviceBase + 'updateClient', {id: id, client: client}).then(function (status) {
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
    obj.updateService = function (service) {
        return $http.post(serviceBase + 'updateService', {
            serviceNumber: service.serviceNumber,
            service: service
        }).then(function (status) {
            console.log(status);
            return status.data;
        });
    };

    obj.getServices = function (invoiceParentID) {
        return $http.get(serviceBase + 'getServices?invoiceID=' + invoiceParentID);
    }

//*******************credit card*****************
    obj.insertCard = function (card) {
        return $http.post(serviceBase + 'insertCard', card).then(function (results) {
            console.log(results);
            return results.statusText;
        });
    };

//********************invoice***********************
    obj.updateInvoice = function (id, invoice) {
        return $http.post(serviceBase + 'updateInvoice', {id: id, invoice: invoice}).then(function (status) {
            console.log(status);
            return status.data;
        });
    };

    obj.insertInvoice = function (invoice) {
        return $http.post(serviceBase + 'insertInvoice', invoice).then(function (results) {
            console.log(results);
            return results;
        });
    };

    obj.getAllInvoices = function (type) {
        return $http.get(serviceBase + 'getAllInvoices?type=' + type);
    }

    obj.getInvoice = function (id) {
        return $http.get(serviceBase + 'getInvoice?id=' + id);
    }

    return obj;
}]);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/client-accounts', {
                title: 'Clients',
                templateUrl: 'partials/clients.html',
                controller: 'ClientListController'
            })
            .when('/edit-client/:clientID', {
                title: 'Edit Clients',
                templateUrl: 'partials/edit-client.html',
                controller: 'ClientEditController',
                resolve: {
                    client: function (services, $route) {
                        var clientID = $route.current.params.clientID;
                        return services.getClient(clientID);
                    }
                }
            })
            .when('/view-client/:clientID', {
                title: 'View Client',
                templateUrl: 'partials/view-client.html',
                controller: 'ClientViewController',
                resolve: {
                    client: function (services, $route) {
                        var clientID = $route.current.params.clientID;
                        return services.getClient(clientID);
                    }
                }
            })
            .when('/add-services/:clientID', {
                title: 'Add Services',
                templateUrl: 'partials/add-services.html',
                controller: 'ServiceAddController'
            })
            .when('/checkout', {
                title: 'Checkout',
                templateUrl: 'partials/checkout.html',
                controller: 'CheckoutController'
            })
            .when('/invoices/credit', {
                templateUrl: 'partials/invoice-list.html',
                controller: 'InvoiceController',
                resolve: {
                    invoices: function (services) {
                        return services.getAllInvoices("credit");
                    },
                    title: function () {
                        return 'Credit Invoices';
                    }
                }
            })
            .when('/invoices/cash', {
                title: 'Cash Invoice',
                templateUrl: 'partials/invoice-list.html',
                controller: 'InvoiceController',
                resolve: {
                    invoices: function (services) {
                        return services.getAllInvoices("cash");
                    },
                    title: function () {
                        return 'Cash Invoices';
                    }
                }
            })
            .when('/invoice/:invoiceID', {
                templateUrl: 'partials/invoice.html',
                controller: 'InvoiceViewController'
            })
            .when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginController',
                hideMenus: true
            })
            .otherwise({
                redirectTo: '/login'
            });
    }]);

app.run(['$location', '$rootScope', '$cookieStore', '$http', 'AuthenticationService', function ($location, $rootScope, $cookieStore, $http, AuthenticationService) {

    $rootScope.authService = AuthenticationService;

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        //$rootScope.title = current.$$route.title;
    });

    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // redirect to login page if not logged in
        if ($location.path() !== '/login' && ($rootScope.globals == null || !$rootScope.globals.currentUser)) {
            $location.path('/login');
        }
    });

    $rootScope.$watch(function() { return $location.path(); }, function(newValue, oldValue){
        if (!AuthenticationService.Authorized() && newValue != '/' && newValue != '/login'){
            $location.path('/login');
        }
    });

}]);
