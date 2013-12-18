angular.module('chooser.tags', [

]).directive('chooserTags', function() {
	'use strict';

	return {
		restrict: 'E',
		require: 'chooserTags',
		templateUrl: 'chooser/tags/chooser.tags.tpl.html',
		scope: {
			items: '=options',
			model: '=ngModel',
			placeholder: '@placeholder'
		},
		controller: function($scope) {
			this.chooseOption = function(option) {
				if (angular.isArray($scope.model)) {
					// Don't allow duplicates
					if ($scope.model.indexOf(option) === -1) {
						$scope.model = $scope.model.concat([option]);
					}
				} else {
					$scope.model = [option];
				}
			};
		},
		link: function(scope, element, attrs, tagsCtrl) {
			var input = element.find('input').eq(0);

			var keyboardListener = function(event) {
				switch (event.which) {
					case 13: // enter
						scope.$apply(function() {
							if (input.val().length) {
								tagsCtrl.chooseOption(input.val());
							}
							scope.newTag = '';
						});
						break;
					case 27: // escape
						input.blur();
						break;
				}
			};

			var focusInput = function() {
				input.bind('keydown', keyboardListener);
				input.bind('blur', inputBlurred);
				input[0].focus();
			};
			scope.focusInput = focusInput;

			var inputBlurred = function() {
				scope.newTag = '';
				input.unbind('keydown', keyboardListener);
				input.unbind('blur', inputBlurred);
			};

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