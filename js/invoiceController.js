'use strict';

invoiceController.controller('ModalController', ['$scope', 'close', 'invoice', function($scope, close, invoice) {
	$scope.invoice = invoice;
    $scope.input = { method: invoice.method };

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

invoiceController.controller('invoiceController', function ($scope, services, ngTableParams, $filter, ModalService) {
    $scope.invoices = [];

	services.getAllInvoices().then(function(data){
	    $scope.invoices = data.data;
	    $scope.tableInvoice.reload();
	    $scope.tableInvoice.page(1);
	});

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
                            $scope.invoices[i].paidBy = "admin";
                            $scope.invoices[i].paidDate = new Date();
                            $scope.invoices[i].amountPaid= result.amount;
                            $scope.invoices[i].method = result.method;
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
                                $filter('orderBy')($scope.invoices , params.orderBy()) :
                                $scope.invoices;
            params.total(orderedData.length);
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });


});