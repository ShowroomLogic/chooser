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
			templateUrl: 'chooser/dropdown/chooser.dropdown.tpl.html',
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
					} else if (!chooserElement.hasClass('disabled') && !chooserElement.prop('disabled')) {
						if (openChooser) {
							$rootScope.$broadcast('closeChooser_' + openChooser);
						}
						openChooser = scope.$id;
						chooserElement.addClass('open');
						input[0].focus();

						highlightDefault();
						scope.$search = '';

						closeMenu = function (event) {
							if (event.preventDefault) {
								event.preventDefault();
							}

							if (event.stopPropagation) {
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