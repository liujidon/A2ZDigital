'use strict';

invoiceController.controller('invoiceController', function ($scope, services, ngTableParams, $filter) {
    $scope.invoices = [];

	services.getAllInvoices().then(function(data){
	    $scope.invoices = data.data;
	    $scope.tableInvoice.reload();
	    $scope.tableInvoice.page(1);
	    console.log($scope.invoices);
	});	

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