'use strict';


ClientListController.controller('ClientListController', function ($scope, services) {
    services.getClients().then(function (data) {
        $scope.clients = data.data;
    });
});

ClientEditController.controller('ClientEditController', function ($scope, $rootScope, $location, $routeParams, services, client) {
    var clientID = ($routeParams.clientID) ? parseInt($routeParams.clientID) : 0;
    $rootScope.title = (clientID > 0) ? 'Edit Client' : 'Add Client';
    $scope.buttonText = (clientID > 0) ? 'Update Client' : 'Add New Client';
    if (client.data != "") {
        var original = client.data;
        original._id = clientID;
        $scope.client = angular.copy(original);
        $scope.client._id = clientID;
    }
    $scope.isClean = function () {
        return angular.equals(original, $scope.client);
    }

    $scope.deleteClient = function (client) {
        $location.path('/client-accounts');
        if (confirm("Are you sure to delete client number: " + $scope.client._id) == true)
            services.deleteClient(client.clientNumber);
    };

    $scope.saveClient = function (client) {
        $location.path('/client-accounts');
        if (clientID <= 0) {
            services.insertClient(client);
        }
        else {
            services.updateClient(clientID, client);
        }
    };
});

ClientViewController.controller('ClientViewController', function ($scope, $location, $routeParams, services, client, ModalService) {
    var clientID = ($routeParams.clientID) ? parseInt($routeParams.clientID) : 0;
    if (client.data == "") {
    } else {
        var original = client.data;
        original._id = clientID;
        $scope.client = angular.copy(original);
        $scope.client._id = clientID;
        $scope.panelContext = "panel panel-success";

        $scope.convertStatus = function (status) {
            switch (status) {
                case "Active":
                    return "panel panel-info";
                case "Suspended":
                    return "panel panel-warning";
                case "Deactivated":
                    return "panel panel-danger";
                default:
                    return "panel panel-danger";
            }
        };

        $scope.accordionStatus = {
            serviceTabOpen: true,
            invoiceTabOpen: true
        };

        $scope.addService = function (clientNumber) {
            $location.path("/add-services/" + clientNumber);
        };

        services.getClientServices(clientID).then(function (data) {
            $scope.services = data.data;
            var i = 0;
            for (i; i < $scope.services.length; i++) {
                $scope.services[i].panelStatus = $scope.convertStatus($scope.services[i].status);
            }
        });

        services.getClientInvoices(clientID).then(function (data) {
            $scope.invoices = data.data;
        });
        services.getClientCards(clientID).then(function (data) {
            $scope.cards = data.data;
        });

        $scope.showConfirmCancel = function (service) {
            ModalService.showModal({
                templateUrl: 'partials/service-confirm-cancel.html',
                controller: "ServiceModalController",
                inputs: {service: service}
            }).then(function (modal) {
                modal.element.modal();
                modal.close.then(function (result) {
                    if (result != null) {
                        services.updateService(zeroNullObj(service));
                    }
                });
            });
        };
    }
});

ClientViewController.controller('ServiceModalController', ['$scope', 'close', 'service', function ($scope, close, service) {
    $scope.service = service;

    $scope.calculateTotal = function () {
        return zeroNull($scope.service.totalCost) + zeroNull($scope.service.monthlyCharge);
    };
    $scope.close = function (result) {
        if (result != null) {
            result.status = "Canceled";
            close(result, 500); // close, but give 500ms for bootstrap to animate
        }
    };
}]);
