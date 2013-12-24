var chooserDemo = angular.module('chooserDemo', ['chooser']);
 
chooserDemo.controller('ChooserDemoSingleCtrl', function ($scope, $timeout) {
  $scope.items = null;
  $scope.placeholder = "Loading Options...";
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
    $scope.placeholder = "Select an item";
  }, 5000);
  
});