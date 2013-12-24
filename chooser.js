angular.module('chooser', [
	'chooser.dropdown',
	'chooser.single',
	'chooser.multiple',
	'chooser.tags'
]).filter('chooserLabelFilter', function() {
	'use strict';

	return function(item, labelKey) {
		if (angular.isUndefined(labelKey)) {
			return item;
		}

		return angular.isObject(item) && item.hasOwnProperty(labelKey) ? item[labelKey] : item;
	};
});

angular.module('chooser.dropdown', [
	]).directive('chooserDropdown', function($document, $location, $filter, $rootScope) {
	'use strict';
	/* jshint maxstatements:20, maxcomplexity:10 */

	var closeMenu = angular.noop,
		keyboardListener = angular.noop,
		openChooser;

	return {
		restrict: 'E',
		require: ['?^chooser', '?^chooserMultiple', '?^chooserTags'],
		templateUrl: 'partials/chooser.dropdown.tpl.html',
		link: function(scope, element, attrs, ctrls) {
			var chooserCtrl = ctrls[0] || ctrls[1] || ctrls[2];
			if (!chooserCtrl) {
				throw new Error('No controller was found to use for the chooser dropdown.');
			}

			var filterItems = function() {
				var filteredItems = $filter('filter')(scope.items, scope.$search);

				if (angular.isArray(scope.model)) {
					filteredItems = _.difference(scope.items, scope.model);
				}
				scope.filteredItems = filteredItems;
			};

			scope.$watch('$search', filterItems);
			scope.$watch('model', filterItems, true);
			scope.$watch('items', filterItems, true);

			// Set model value when a new option is chosen
			scope.selectOption = function (event, option) {
				chooserCtrl.chooseOption(option);
				closeMenu(event);
			};

			scope.highlightedIndex = 0;

			var upArrow = function() {
				if (scope.highlightedIndex > 0) {
					scope.$apply(function() {
						scope.highlightedIndex--;
					});
				}
			};

			var downArrow = function() {
				if (scope.highlightedIndex < (scope.filteredItems.length - 1)) {
					scope.$apply(function() {
						scope.highlightedIndex++;
					});
				}
			};

			var highlightDefault = function() {
				var highlightedIndex = 0;
				if (scope.model && !angular.isArray(scope.model)) {
					for (var i = 0; i < scope.filteredItems.length; i++) {
						if (angular.equals(scope.model, scope.filteredItems[i])) {
							highlightedIndex = i;
							break;
						}
					}
				}
				scope.highlightedIndex = highlightedIndex;
			};

			scope.$on('$locationChangeStart', closeMenu);

			scope.openMenu = function(event) {
				var chooserElement = element.closest('.chooser'),
					wasOpen = chooserElement.hasClass('open'),
					input = element.find('input').eq(0);

				if (event.preventDefault) {
					event.preventDefault();
				}

				if (event.stopPropagation) {
					event.stopPropagation();
				}

				if (wasOpen) {
					closeMenu();
				} else if (!chooserElement.hasClass('disabled') && !chooserElement.attr('disabled')) {
					if (openChooser) {
						$rootScope.$broadcast('closeChooser_' + openChooser);
					}
					openChooser = scope.$id;
					chooserElement.addClass('open');
					input[0].focus();

					highlightDefault();
					scope.$search = '';

					closeMenu = function (event) {
						if (event && event.preventDefault) {
							event.preventDefault();
						}

						if (event && event.stopPropagation) {
							event.stopPropagation();
						}
						$document.off('click', closeMenu);
						$document.off('keydown', keyboardListener);
						chooserElement.removeClass('open');

						// Clean Up
						closeMenu = angular.noop;
						keyboardListener = angular.noop;
					};
					$document.on('click', closeMenu);

					keyboardListener = function(event) {
						switch(event.which) {
							case 38: // up
								upArrow();
								break;
							case 40: // down
								downArrow();
								break;
							case 13: //enter
								var selected = scope.filteredItems[scope.highlightedIndex];
								if (selected) {
									scope.$apply(function() {
										scope.selectOption(event, selected);
									});
								} else {
									closeMenu(event);
								}
								break;
							case 9: // tab
							case 27: // escape
								closeMenu(event);
								break;
						}
					};
					$document.on('keydown', keyboardListener);
				}

				scope.$on('closeChooser_' + scope.$id, function() {
					// Wrapping in anonymous function to suppress event argument
					closeMenu();
				});
			};
		}
	};
});

angular.module('chooser.single', [
	'chooser.dropdown'
]).directive('chooser', function($filter) {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/chooser.single.tpl.html',
		scope: {
			labelKey: '@',
			valueKey: '@',
			items: '=options',
			model: '=ngModel',
			placeholder: '=placeholder'
		},
		controller: function($scope) {
			$scope.hasItems = false;
			this.chooseOption = function(option) {
				$scope.selectedItem = option;
				if (!$scope.valueKey) {
					$scope.model = $scope.selectedItem;
				} else {
					$scope.model = $scope.selectedItem[$scope.valueKey];
				}
			};
		},
		link: function(scope, element) {
			
			var updateText = function(model, placeholder) {
				
			};

			scope.$watchCollection('[model, items, placeholder]', function(newValues, oldValues) {
				var model = newValues[0],
					items = newValues[1],
					placeholder = newValues[2];

				if (!scope.valueKey) {
					scope.selectedItem = model;
				} else {
					var predicate = {};
					predicate[scope.valueKey] = model;
					scope.selectedItem = _.find(scope.items, predicate);
				}

				var modelLabel = $filter('chooserLabelFilter')(scope.selectedItem, scope.labelKey),
					labelExists = modelLabel && modelLabel.length,
					text = labelExists ? modelLabel : placeholder || 'Select';
				
				element.find('.chosen-text').removeClass('invalid').toggleClass('placeholder', !labelExists).html(text);
				
			});
		}
	};
});

angular.module('chooser.multiple', [
	'chooser.dropdown'
]).directive('chooserMultiple', function() {
	'use strict';

	return {
		restrict: 'E',
		templateUrl: 'partials/chooser.multiple.tpl.html',
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

angular.module('chooser.tags', [

]).directive('chooserTags', function() {
	'use strict';

	return {
		restrict: 'E',
		require: 'chooserTags',
		templateUrl: 'partials/chooser.tags.tpl.html',
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