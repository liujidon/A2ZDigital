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
                if( invoice.amountPaid == 0 && invoiceDate < today)
                    filtered.push(invoice);
                break;
            case 'over30': //due date 30 days before today
                if( invoice.amountPaid == 0 && invoiceDate < d30before)
                    filtered.push(invoice);
                break;
            case 'over60': //due date 60 days before today
                if( invoice.amountPaid == 0 && invoiceDate < d60before )
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
                            $scope.createChildInvoice($scope.invoices[i]);
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

    $scope.getNextPaymentDate = function(billingCycle, dueDate) {
        var currentDate = new Date(dueDate);
        currentDate.setMonth(currentDate.getMonth() + zeroNull(convertCycle(billingCycle)));
        return currentDate;
    };

    $scope.createChildInvoice = function(invoice) {
        if(invoice != null) {
            //load services from server
            services.getServices(invoice.id).then(function(serviceData){
                var serviceList = serviceData.data;
                var childInvoice = { parentID: invoice.id, amountPaid: 0.00,  notes: "",
                                 dueDate: formatDate($scope.getNextPaymentDate(invoice.billingCycle, invoice.dueDate)),
                                 clientNumber: invoice.clientNumber,
                                 amountDue: calculateRecurringTotal(serviceList, invoice.billingCycle),
                                 method: invoice.method,
                                 billingCycle: invoice.billingCycle,
                                 createdBy: invoice.createdBy };

                //TODO recalculate child invoice to account for canceled invoice
                services.insertInvoice(childInvoice).then(function(data){
                    var lastInvoiceID = data.data.lastInsertID;
                    console.log(serviceList);
                    //copy services
                    for (var i = 0; i < serviceList.length; i++) {
                        var childService = serviceList[i];
                        for (var j in childService) {
                            if (childService[j] === null || childService[j] === undefined) {
                                delete childService[j];
                            }
                        }
                        childService.invoiceNumber = lastInvoiceID;
                        console.log(childService);
                        services.insertService(childService);
                    }
                });
            });
        }
    };

	$scope.tableInvoice = new ngTableParams({
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
            id: 'asc'     // initial sorting
        }
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
        var invoiceParentID = $scope.invoice.parentID == 0 ? $scope.invoice.id : $scope.invoice.parentID;

        //load services from server
        services.getServices(invoiceParentID).then(function(serviceData){
            $scope.orderList = serviceData.data;
            console.log($scope.orderList.length);
        });
    });
});


//return 0 for Nulls
function zeroNull(value) {
  return value == null ? 0 : value;
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    return year + "-" + month + "-" + day; 
}

//calculate the recurring total on child invoice
function calculateRecurringTotal(serviceList, billingCycle) {
    var total = 0.00;
    var cycleMultiplier = convertCycle(billingCycle);
    for (var i = 0; i < serviceList.length; i++) {
        var s = serviceList[i];
        total = total + zeroNull(s.monthlyCharge) * cycleMultiplier + zeroNull(s.totalCost);
    }
    total = total * 1.13;
    return total;
}

function convertCycle(billingCycle) {
    switch(billingCycle) {
        case "Monthly":
            return 1;
        case "Quarterly":
            return 3;
        case "Semi-Annually":
            return 6;
        case "Annually":
            return 12;
        default:
            return 0;
    }    

}
