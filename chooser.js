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