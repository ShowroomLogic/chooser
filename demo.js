var chooserDemo = angular.module('chooserDemo', ['chooser']);
 
chooserDemo.controller('ChooserDemoSingleCtrl', function ($scope, $timeout) {
	$scope.items = null;
	
	// Let's mess around with the items and the model over time
	$timeout(function() {
		
		$scope.model = 4;
		
		$timeout(function() {
			console.log("loading items...");
			$scope.items = [
				{label: "Item 1", value: 1},
				{label: "Item 2", value: 2},
				{label: "Item 3", value: 3},
				{label: "Item 4", value: 4},
				{label: "Item 5", value: 5},
				{label: "Item 6", value: 6}
			];
			
			$timeout(function() {
				$scope.model = 7;
			}, 3000);

		}, 3000);

	}, 1000);

	$scope.$watchCollection('[items, model]', function(values) {
		
		var items = values[0],
			model = values[1];

		// Is the selection valid?
		$scope.isValid = _.find(items, {value:model});

		// Set appropriate placeholder
		if (items == null) {
			$scope.placeholder = "Loading Options...";
		} else if (!$scope.isValid) {
			$scope.placeholder = "Invalid Option";
		} else {
			$scope.placeholder = "Select an item";
		}

	});
	
});