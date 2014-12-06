'use strict';

checkoutController.controller('checkoutController', function ($scope, $location, orderService, services) {
    $scope.orderList = orderService.getOrders();
    $scope.payment = {billingCycle: "Monthly", method: "Credit Card", credit: {month: '01', year: '2014'}};
    $scope.HST = 13;

    $scope.removeService = function (index) {
        orderService.removeOrder(index);
        $scope.orderList = orderService.getOrders();
    };

    $scope.convertCycle = function (cycleStr) {
        switch (cycleStr) {
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
    };

    $scope.convertDiscount = function (discountStr) {
        if (discountStr == null) return 1;
        switch (discountStr) {
            case "0%":
                return 1;
            case "5%":
                return 0.95;
            case "10%":
                return 0.9;
            case "15%":
                return 0.85;
            case "20%":
                return 0.80;
            case "25%":
                return 0.75;
            default:
                return 1;
        }
    };

    $scope.calcPreTaxTotal = function () {
        var total = 0.0;
        if ($scope.orderList == null) return total;
        for (var i = 0; i < $scope.orderList.length; i++) {
            var service = $scope.orderList[i];
            total = total + $scope.calcSubtotal(service);
        }
        return total;
    };

    $scope.calcSubtotal = function (service) {
        var subtotal = 0;
        if (service == null) return 0;
        subtotal = zeroNull(service.activationCost) + zeroNull(service.monthlyCharge) * zeroNull($scope.convertCycle($scope.payment.billingCycle)) + zeroNull(service.totalCost);
        subtotal = subtotal * $scope.convertDiscount(service.discount);
        return subtotal
    };

    $scope.calcHst = function () {
        if ($scope.payment.method == "Cash")
            return 0.00;
        else
            return $scope.calcPreTaxTotal() * $scope.HST * 0.01;
    };

    $scope.calcTotal = function () {
        return $scope.calcPreTaxTotal() + $scope.calcHst();
    };

    $scope.getNextPaymentDate = function () {
        var currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + zeroNull($scope.convertCycle($scope.payment.billingCycle)));
        return currentDate;
    };

    //Store services, invoice, credit card info in database
    $scope.checkout = function () {
        $location.path('/');
        if ($scope.orderList != null) {
            //store invoice
            var invoice = {
                clientNumber: orderService.getClientNumber(),
                parentID: 0,
                amountDue: $scope.calcTotal(),
                amountPaid: 0.00,
                method: $scope.payment.method,
                dueDate: formatDate($scope.getNextPaymentDate()),
                billingCycle: $scope.payment.billingCycle,
                createdBy: "admin"
            };

            services.insertInvoice(invoice).then(function (data) {
                var lastInvoiceID = data.data.lastInsertID;
                //store services
                for (var i = 0; i < $scope.orderList.length; i++) {
                    var service = $scope.orderList[i];
                    service.invoiceNumber = lastInvoiceID;
                    services.insertService(service);
                }
            });

            //store credit card info
            if ($scope.payment.method == "Credit Card") {
                var card = {
                    clientNumber: orderService.getClientNumber(),
                    name: $scope.payment.credit.name,
                    number: $scope.payment.credit.number,
                    month: $scope.payment.credit.month,
                    year: $scope.payment.credit.year,
                    security: $scope.payment.credit.security
                };
                services.insertCard(card);
            }
        }
        console.log("checkout completed.");
        orderService.clear();
    };

    $scope.cancelCheckout = function () {
        orderService.clear();
        $location.path('/');
    };

    //confirm with user validation
    $scope.isValid = function () {
        if ($scope.payment.method == "Credit Card") {
            var credit = $scope.payment.credit;
            return credit.name != null && credit.number != null &&
                credit.month != null && credit.year != null && credit.security != null &&
                credit.name.length > 0 && credit.number.length > 0 && credit.security.length > 0;
        }
        else
            return Math.round($scope.payment.validate * 100) / 100 == Math.round($scope.calcTotal() * 100) / 100;
    };

});
