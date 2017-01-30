angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.dashboard.statisticsWidgetController', ['$scope', '$localStorage', '$state', 'moment',
    function ($scope, $localStorage, $state, moment) {
        $scope.currentYear = moment().year();
        $scope.lastYear = moment().subtract(1, 'year').year();

        $scope.$storage = $localStorage;

        $scope.openBlade = function () {
            $state.go('workspace.orderModule');
        };

        $scope.openOrderWithStatus = function (status) {
            $state.go('workspace.orderModule', { status: [status] });
        }

        $scope.openOrderWithId = function (id) {
            $state.go('workspace.orderModule', { id: id });
        }
    }]);
