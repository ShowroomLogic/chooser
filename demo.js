var chooserDemo = angular.module('chooserDemo', ['chooser']);
 
chooserDemo.controller('singleSimpleCtrl', function ($scope) {
	
	$scope.states = [
		{name:'Texas', abbr:'TX'}, 
		{name:'Florida', abbr:'FL'}, 
		{name:'California', abbr:'CA'}
	];

});

chooserDemo.controller('singleAdvancedCtrl', function($scope, $timeout) {

	$scope.options = null;

	$scope.items = [
		{label: "Item 1", value: 1},
		{label: "Item 2", value: 2},
		{label: "Item 3", value: 3},
		{label: "Item 4", value: 4},
		{label: "Item 5", value: 5},
		{label: "Item 6", value: 6}
	];

	$scope.$watchCollection('[options, model]', function(values) {
		
		var options = values[0],
			model = values[1];

		// Is the selection valid?
		if (model) {
			$scope.isValid = _.find(options, {value:model});
		} else {
			$scope.isValid = true;
		}

		// Set appropriate placeholder
		if (options == null) {
			$scope.placeholder = "Loading Options...";
		} else if (!$scope.isValid) {
			$scope.placeholder = "Invalid Option";
		} else {
			$scope.placeholder = "Select an item";
		}

	});
	
});