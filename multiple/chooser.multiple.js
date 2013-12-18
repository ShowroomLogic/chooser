angular.module('chooser.multiple', [
	'chooser.dropdown'
]).directive('chooserMultiple', function() {
	'use strict';

	return {
		restrict: 'E',
		templateUrl: 'chooser/multiple/chooser.multiple.tpl.html',
		scope: {
			labelKey: '@',
			items: '=options',
			model: '=ngModel',
			placeholder: '@placeholder'
		},
		controller: function($scope) {
			this.chooseOption = function(option) {
				$scope.model = angular.isArray($scope.model) ?
						$scope.model.concat([option]) : [option];
			};
		},
		link: function(scope) {
			scope.removeOption = function(event, option) {
				if (event) {
					event.preventDefault();
					event.stopPropagation();
				}

				var index = scope.model.indexOf(option);
				if (index !== -1) {
					scope.model.splice(index, 1);
				}
			};
		}
	};
});