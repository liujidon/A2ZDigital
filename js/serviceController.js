'use strict';

serviceController.controller('serviceController', function ($scope, services, $routeParams) {
	this.tab = 1;
	$scope.selected = 'Cable TV';
	$scope.orderList = [];

	var clientID = ($routeParams.clientID) ? parseInt($routeParams.clientID) : 0;

	this.selectTab = function (setTab){
	  console.print(setTab);
	  this.tab = setTab;
	};
	this.isSelected = function(checkTab) {
	  return this.tab === checkTab;
	};
	$scope.saveService = function(service) {
		if (clientID > 0) {
			service.clientNumber = clientID;
			if(service.name == null)
				service.name = $scope.selected;
			if(service.numUnits != null && service.unitCost != null)
				service.totalCost = service.numUnits * service.unitCost;
			services.insertService(service);
			$scope.orderList.push(service);
		}
		$scope.service = null;
	};

	$scope.removeService = function(index) {
		console.log(index);
        $scope.orderList.splice(index, 1);
    };
});

