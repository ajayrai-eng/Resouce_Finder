var app = angular.module('resourceApp', []);

app.controller('MainCtrl', function($scope, $http) {
    $scope.results = [];
    $scope.newItem = {};

    // AJAX Search
    $scope.search = function() {
        if ($scope.searchQuery && $scope.searchQuery.length > 2) {
            $http.get('http://localhost:3000/api/search?q=' + $scope.searchQuery)
                .then(function(res) { $scope.results = res.data; });
        } else { $scope.results = []; }
    };

    // AJAX Add
    $scope.addResource = function() {
        if(!$scope.newItem.item || !$scope.newItem.shop || !$scope.newItem.location) {
            return alert("Please fill all details!");
        }
        $http.post('http://localhost:3000/api/add', $scope.newItem).then(function() {
            alert("Success! Entry added.");
            $scope.newItem = {};
            if($scope.searchQuery) $scope.search();
        });
    };

    // AJAX Verify
    $scope.verify = function(id, type) {
        $http.post('http://localhost:3000/api/verify', { id: id, type: type })
            .then(function() {
                alert("Trust updated!");
                $scope.search(); // Refresh card data
            });
    };
});