angular.module('chooser', [
  'chooser.dropdown',
  'chooser.single',
  'chooser.multiple',
  'chooser.tags',
  'chooser.templates'
]).filter('chooserLabelFilter', function () {
  'use strict';
  return function (item, labelKey) {
    if (angular.isUndefined(labelKey)) {
      return item;
    }
    return angular.isObject(item) && item.hasOwnProperty(labelKey) ? item[labelKey] : item;
  };
});
angular.module('chooser.dropdown', []).directive('chooserDropdown', [
  '$document',
  '$location',
  '$filter',
  '$rootScope',
  function ($document, $location, $filter, $rootScope) {
    'use strict';
    var closeMenu = angular.noop, keyboardListener = angular.noop, openChooser;
    return {
      restrict: 'E',
      require: [
        '?^chooser',
        '?^chooserMultiple'
      ],
      templateUrl: 'templates/chooser.dropdown.html',
      link: function (scope, element, attrs, ctrls) {
        var chooserCtrl = ctrls[0] || ctrls[1];
        if (!chooserCtrl) {
          throw new Error('No controller was found to use for the chooser dropdown.');
        }
        var filterItems = function () {
          var filteredItems = $filter('filter')(scope.items, scope.$search);
          if (angular.isArray(scope.selectedItems)) {
            filteredItems = _.difference(filteredItems, scope.selectedItems);
          }
          scope.filteredItems = filteredItems.slice(0, 100);
        };
        scope.$watch('$search', filterItems);
        scope.$watch('model', filterItems, true);
        scope.$watch('items', filterItems, true);
        scope.selectOption = function (event, option) {
          chooserCtrl.chooseOption(option);
          closeMenu(event);
        };
        scope.highlightedIndex = 0;
        var upArrow = function () {
          if (scope.highlightedIndex > 0) {
            scope.$apply(function () {
              scope.highlightedIndex--;
            });
          }
        };
        var downArrow = function () {
          if (scope.highlightedIndex < scope.filteredItems.length - 1) {
            scope.$apply(function () {
              scope.highlightedIndex++;
            });
          }
        };
        var highlightDefault = function () {
          var highlightedIndex = 0;
          if (scope.model && !angular.isArray(scope.model)) {
            for (var i = 0; i < scope.filteredItems.length; i++) {
              if (angular.equals(scope.selectedItem, scope.filteredItems[i])) {
                highlightedIndex = i;
                break;
              }
            }
          }
          scope.highlightedIndex = highlightedIndex;
        };
        scope.$on('$locationChangeStart', closeMenu);
        scope.openMenu = function (event) {
          var chooserElement = element.closest('.chooser'), wasOpen = chooserElement.hasClass('open'), input = element.find('input').eq(0);
          if (event && event.preventDefault) {
            event.preventDefault();
          }
          if (event && event.stopPropagation) {
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
              closeMenu = angular.noop;
              keyboardListener = angular.noop;
            };
            $document.on('click', closeMenu);
            keyboardListener = function (event) {
              switch (event.which) {
              case 38:
                upArrow();
                break;
              case 40:
                downArrow();
                break;
              case 13:
                var selected = scope.filteredItems[scope.highlightedIndex];
                if (selected) {
                  scope.$apply(function () {
                    scope.selectOption(event, selected);
                  });
                } else {
                  closeMenu(event);
                }
                break;
              case 9:
              case 27:
                closeMenu(event);
                break;
              }
            };
            $document.on('keydown', keyboardListener);
          }
          scope.$on('closeChooser_' + scope.$id, function () {
            closeMenu();
          });
        };
      }
    };
  }
]);
angular.module('chooser.single', ['chooser.dropdown']).directive('chooser', [
  '$filter',
  function ($filter) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/chooser.single.tpl.html',
      scope: {
        labelKey: '@',
        valueKey: '@',
        items: '=options',
        model: '=ngModel',
        placeholder: '=placeholder'
      },
      controller: [
        '$scope',
        function ($scope) {
          this.chooseOption = function (option) {
            $scope.selectedItem = option;
            if (!$scope.valueKey) {
              $scope.model = $scope.selectedItem;
            } else {
              $scope.model = $scope.selectedItem[$scope.valueKey];
            }
          };
        }
      ],
      link: function (scope, element) {
        scope.map = {};
        var updateText = function () {
          var modelLabel = $filter('chooserLabelFilter')(scope.selectedItem, scope.labelKey), labelExists = modelLabel && modelLabel.length, text = labelExists ? modelLabel : scope.placeholder || 'Select';
          element.find('.chosen-text').toggleClass('placeholder', !labelExists).html(text);
        };
        scope.$watch('model', function (model) {
          scope.selectedItem = !scope.valueKey ? model : scope.map[model];
          updateText();
        });
        scope.$watch('placeholder', function (model) {
          updateText();
        });
        scope.$watch('items', function (items) {
          scope.map = {};
          scope.selectedItem = null;
          if (scope.valueKey && items) {
            for (var i = 0; i < items.length; i++) {
              scope.map[items[i][scope.valueKey]] = items[i];
            }
            scope.selectedItem = scope.map[scope.model];
          }
          updateText();
        });
      }
    };
  }
]);
angular.module('chooser.multiple', ['chooser.dropdown']).directive('chooserMultiple', function () {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/chooser.multiple.html',
    scope: {
      labelKey: '@',
      valueKey: '@',
      items: '=options',
      model: '=ngModel',
      placeholder: '=placeholder'
    },
    controller: [
      '$scope',
      function ($scope) {
        this.chooseOption = function (option) {
          $scope.selectedItems.push(option);
          if (!$scope.valueKey) {
            $scope.model = angular.isArray($scope.model) ? $scope.model.concat([option]) : [option];
          } else {
            $scope.model = angular.isArray($scope.model) ? $scope.model.concat([option[$scope.valueKey]]) : [option[$scope.valueKey]];
          }
        };
      }
    ],
    link: function (scope) {
      scope.map = {};
      scope.selectedItems = [];
      scope.$watch('model', function (model) {
        var _selectedItems = [];
        if (angular.isArray(model)) {
          for (var i = 0; i < model.length; i++) {
            var item = !scope.valueKey ? model : scope.map[model[i]];
            if (item) {
              _selectedItems.push(item);
            } else {
              if (!scope.labelKey) {
                _selectedItems.push(model[i]);
              } else if (!scope.valueKey) {
                _selectedItems.push(model[i]);
              } else {
                var dummyItem = {};
                dummyItem[scope.labelKey] = 'Invalid Option';
                dummyItem[scope.valueKey] = model[i];
                dummyItem['_invalid'] = true;
                _selectedItems.push(dummyItem);
              }
            }
          }
        }
        scope.selectedItems = _selectedItems;
      });
      scope.$watch('items', function (items) {
        scope.map = {};
        if (scope.valueKey && items) {
          for (var i = 0; i < items.length; i++) {
            scope.map[items[i][scope.valueKey]] = items[i];
          }
        }
        var _selectedItems = [];
        if (angular.isArray(scope.model)) {
          for (var i = 0; i < scope.model.length; i++) {
            _selectedItems.push(!scope.valueKey ? scope.model : scope.map[scope.model[i]]);
          }
        }
        scope.selectedItems = _selectedItems;
      });
      scope.removeOption = function (event, option) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        console.log(option);
        var itemIndex = scope.selectedItems.indexOf(option);
        if (itemIndex !== -1) {
          scope.selectedItems.splice(itemIndex, 1);
        }
        if (!scope.valueKey) {
          var modelIndex = scope.model.indexOf(option);
        } else {
          var modelIndex = scope.model.indexOf(option[scope.valueKey]);
        }
        if (modelIndex !== -1) {
          scope.model.splice(modelIndex, 1);
        }
      };
    }
  };
});
angular.module('chooser.tags', []).directive('chooserTags', [
  '$timeout',
  '$filter',
  function ($timeout, $filter) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/chooser.tags.tpl.html',
      scope: {
        suggestCallback: '=',
        model: '=ngModel',
        change: '&ngChange',
        placeholder: '@placeholder'
      },
      link: function (scope, element, attrs) {
        scope.filteredItems = [];
        var input = element.find('input').eq(0);
        var keyboardListener = function (event) {
          switch (event.which) {
          case 13:
            scope.$apply(function () {
              if (input.val().length) {
                scope.addOption(input.val());
              }
              scope.newTag = '';
            });
            break;
          case 27:
            input.blur();
            break;
          }
        };
        scope.focusInput = function () {
          element.addClass('open');
          input.bind('keydown', keyboardListener);
          input.bind('blur', inputBlurred);
          input[0].focus();
        };
        var inputBlurred = function () {
          scope.newTag = '';
          input.unbind('keydown', keyboardListener);
          input.unbind('blur', inputBlurred);
        };
        scope.addOption = function (option) {
          console.log('choosing...');
          if (angular.isArray(scope.model)) {
            if (scope.model.indexOf(option) === -1) {
              scope.model = scope.model.concat([option]);
              $timeout(function () {
                scope.change();
              });
            }
          } else {
            scope.model = [option];
            $timeout(function () {
              scope.change();
            });
          }
        };
        scope.removeOption = function (event, option) {
          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }
          var index = scope.model.indexOf(option);
          if (index !== -1) {
            scope.model.splice(index, 1);
            $timeout(function () {
              scope.change();
            });
          }
        };
        var setOptions = function (options) {
          scope.options = options;
        };
        scope.matchingOptions = function () {
          var matches = $filter('filter')(scope.options, scope.newTag);
          if (angular.isArray(scope.model)) {
            matches = _.difference(matches, scope.model);
          }
          return matches;
        };
        scope.$watch('newTag', function (newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          scope.suggestCallback(newValue, setOptions);
        });
      }
    };
  }
]);
angular.module('chooser.templates', ['templates/chooser.dropdown.html', 'templates/chooser.multiple.html', 'templates/chooser.single.tpl.html', 'templates/chooser.tags.tpl.html']);

angular.module("templates/chooser.dropdown.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/chooser.dropdown.html",
    "<div class=\"chooser-dropdown\">\n" +
    "	<div class=\"chooser-dropdown-search\">\n" +
    "		<input type=\"text\" ng-model=\"$search\" ng-click=\"$event.stopPropagation();\" placeholder=\"Search\" />\n" +
    "	</div>\n" +
    "	<ul class=\"chooser-dropdown-list\">\n" +
    "		<li ng-show=\"filteredItems.length\" ng-repeat=\"item in filteredItems\" ng-mouseover=\"$parent.highlightedIndex = $index\">\n" +
    "			<a ng-class=\"{ highlight: highlightedIndex === $index }\" href ng-click=\"selectOption($event, item)\" tabindex=\"-1\">{{ item | chooserLabelFilter:labelKey }}</a>\n" +
    "		</li>\n" +
    "		<li ng-hide=\"filteredItems.length\" class=\"no-matches-found\">\n" +
    "			<span>No Matches Found</span>\n" +
    "		</li>\n" +
    "	</ul>\n" +
    "</div>");
}]);

angular.module("templates/chooser.multiple.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/chooser.multiple.html",
    "<div class=\"chooser chooser-multiple\">\n" +
    "	<div class=\"chooser-chosens\" ng-click=\"openMenu($event)\">\n" +
    "		<div class=\"chooser-chosen\" ng-repeat=\"item in selectedItems\" ng-class=\"{invalid: item._invalid}\">\n" +
    "			{{ item | chooserLabelFilter:labelKey }}\n" +
    "			<a class=\"chooser-remove-link\" href ng-click=\"removeOption($event, item)\">\n" +
    "				<i class=\"chooser-remove-icon\"></i>\n" +
    "			</a>\n" +
    "		</div>\n" +
    "		<div class=\"chooser-chosen-add-container\">\n" +
    "			<div class=\"chooser-chosen-add\">\n" +
    "				<span class=\"chooser-placeholder\" ng-bind=\"placeholder\" ng-show=\"placeholder\"></span>\n" +
    "				<i class=\"chooser-add-icon\"></i>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<chooser-dropdown></chooser-dropdown>\n" +
    "</div>");
}]);

angular.module("templates/chooser.single.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/chooser.single.tpl.html",
    "<div class=\"chooser chooser-single\">\n" +
    "	<button type=\"button\" class=\"chooser-toggle\" ng-click=\"openMenu($event)\">\n" +
    "		<span class=\"chosen-text\"></span>\n" +
    "		<span class=\"caret-container\">\n" +
    "			<span class=\"caret\"></span>\n" +
    "		</span>\n" +
    "	</button>\n" +
    "	<chooser-dropdown></chooser-dropdown>\n" +
    "</div>");
}]);

angular.module("templates/chooser.tags.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/chooser.tags.tpl.html",
    "<div class=\"chooser chooser-multiple chooser-tags\">\n" +
    "	<div class=\"chooser-chosens\" ng-click=\"focusInput($event)\">\n" +
    "		<div class=\"chooser-chosen\" ng-repeat=\"item in model\">\n" +
    "			{{ item }} <a class=\"chooser-remove chooser-remove-link\" href ng-click=\"removeOption($event, item)\">&times;</a>\n" +
    "		</div>\n" +
    "		<div class=\"chooser-chosen-add-container\">\n" +
    "			<input type=\"text\" ng-model=\"newTag\" size=\"{{ newTag.length || '1' }}\" ng-change=\"openMenu($event)\" />\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class=\"chooser-dropdown\" ng-show=\"matchingOptions().length && newTag.length\">\n" +
    "		<ul class=\"chooser-dropdown-list\">\n" +
    "			<li ng-repeat=\"option in matchingOptions()\" ng-mouseover=\"$parent.highlightedIndex = $index\">\n" +
    "				<a ng-class=\"{ highlight: highlightedIndex === $index }\" href ng-click=\"addOption(option)\" tabindex=\"-1\">{{ option }}</a>\n" +
    "			</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</div>");
}]);
