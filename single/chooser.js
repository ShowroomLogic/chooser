angular.module('chooser.single', [
	'chooser.dropdown'
]).directive('chooser', function($filter) {
		'use strict';

		return {
			restrict: 'E',
			templateUrl: 'chooser/single/chooser.tpl.html',
			scope: {
				labelKey: '@',
				items: '=options',
				model: '=ngModel',
				placeholder: '@placeholder'
			},
			controller: function($scope) {
				this.chooseOption = function(option) {
					$scope.model = option;
				};
			},
			link: function(scope, element) {
				scope.$watch('model', function(model) {
					var modelLabel = $filter('chooserLabelFilter')(model, scope.labelKey),
							labelExists = modelLabel && modelLabel.length,
							text = labelExists ? modelLabel : scope.placeholder || 'Select';

					element.find('.chosen-text').toggleClass('placeholder', !labelExists).html(text);
				});
			}
		};
	});