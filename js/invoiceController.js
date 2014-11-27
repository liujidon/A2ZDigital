'use strict';

invoiceController.controller('ModalController', ['$scope', 'close', 'invoice', function($scope, close, invoice) {
	$scope.invoice = invoice;
    $scope.input = { method: invoice.method };
    $scope.filterSelected = {};

	$scope.close = function(result) {
        if(result != null)
        {
            result.id = $scope.invoice.id;
		    close($scope.input, 500); // close, but give 500ms for bootstrap to animate
        }
	};

    $scope.sameAmount = function() {
        return Math.round($scope.input.amount*100)/100 == Math.round($scope.invoice.amountDue*100)/100;
    };

}]);

invoiceController.filter('invoiceFilter', function() {
    var today = new Date();
    today.setHours(0,0,0,0);

    var d30before = new Date();
    d30before.setDate(today.getDate()-30);
    d30before.setHours(0,0,0,0);

    var d60before = new Date();
    d60before.setDate(today.getDate()-60);
    d60before.setHours(0,0,0,0);
    return function( invoices, filterType ) {
        var filtered = [];

      angular.forEach(invoices, function(invoice) {
        var invoiceDate = new Date(invoice.dueDate);
        switch(filterType) {
            case 'now': //due date before today
                if( invoiceDate < today && invoice.amountPaid == 0)
                    filtered.push(invoice);
                break;
            case 'over30': //due date 30 days before today
                if( invoiceDate < d30before && invoice.amountPaid == 0)
                    filtered.push(invoice);
                break;
            case 'over60': //due date 60 days before today
                if( invoiceDate < d60before && invoice.amountPaid == 0)
                    filtered.push(invoice);
                break;
            case 'paid': //paidAmount == amountDue
                if( invoice.amountDue == invoice.amountPaid)
                    filtered.push(invoice);
                break;
            default:
                filtered.push(invoice);
                break;
        }
      });
      return filtered;
    };
});

invoiceController.controller('invoiceController', function ($scope, services, ngTableParams, $filter, ModalService, $location) {
    $scope.invoices = [];
    $scope.filterSelected = '*';

	services.getAllInvoices().then(function(data){
	    $scope.invoices = data.data;
	    $scope.tableInvoice.reload();
	    $scope.tableInvoice.page(1);
	});

    $scope.setFilter = function(option) {
        $scope.filterSelected = option;
    };

    $scope.showInvoice = function(invoice) {
        $location.path('/invoice/' + invoice.id);
    };

	$scope.showConfirm = function(invoice) {
        ModalService.showModal({
            templateUrl: 'partials/invoice-confirm-content.html',
            controller: "ModalController",
            inputs: { invoice: invoice }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if(result != null) {
                    for(var i = 0; i < $scope.invoices.length; i++) {
                        if($scope.invoices[i].id == result.id) {
                            var today = new Date();
                            $scope.invoices[i].paidBy = "admin";
                            $scope.invoices[i].paidDate = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDay();
                            $scope.invoices[i].amountPaid= result.amount;
                            $scope.invoices[i].method = result.method;
                            $scope.invoices[i].notes = result.reason;
                            services.updateInvoice($scope.invoices[i].id, $scope.invoices[i]);
                        }
                    }
                }
                else {
                    $scope.invoices[i].paidBy = null;
                    $scope.invoices[i].paidDate = null;
                }
            });
        });
    };

	$scope.tableInvoice = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    }, {
        total: 0,
        counts: [],
        getData: function($defer, params) {
            var orderedData = params.sorting() ?
                                $filter('orderBy')($scope.invoices, params.orderBy()) :
                                $scope.invoices;
            params.total(orderedData.length);
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
});

invoiceViewController.controller('invoiceViewController', function($scope, $routeParams, services) {
    var id = ($routeParams.invoiceID) ? parseInt($routeParams.invoiceID) : 0;
    $scope.today = new Date();
    //load invoice from server
    services.getInvoice(id).then(function(data){
        $scope.invoice = data.data;
    });
});

