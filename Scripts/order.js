//Call this to register our module to main application
var moduleName = "virtoCommerce.orderModule";

if (AppDependencies != undefined) {
    AppDependencies.push(moduleName);
}

angular.module(moduleName, ['virtoCommerce.catalogModule', 'virtoCommerce.pricingModule', 'angularMoment'])
.config(
  ['$stateProvider', function ($stateProvider) {
      $stateProvider
          .state('workspace.orderModule', {
              url: '/orders',
              templateUrl: '$(Platform)/Scripts/common/templates/home.tpl.html',
              controller: [
                  '$scope', 'platformWebApp.bladeNavigationService', function ($scope, bladeNavigationService) {
                      var blade = {
                          id: 'orders',
                          title: 'orders.blades.customerOrder-list.title',
                          //subtitle: 'Manage Orders',
                          controller: 'virtoCommerce.orderModule.customerOrderListController',
                          template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/blades/customerOrder-list.tpl.html',
                          isClosingDisabled: true
                      };
                      bladeNavigationService.showBlade(blade);
                      //Need for isolate and prevent conflict module css to another modules 
                      //it value included in bladeContainer as ng-class='moduleName'
                      $scope.moduleName = "vc-order";
                  }
              ],
              params: { status: null, id: null }
          });
  }]
)
// define known Operations to be accessible platform-wide
.factory('virtoCommerce.orderModule.knownOperations', ['platformWebApp.bladeNavigationService', function (bladeNavigationService) {
    var map = {};

    function registerOperation(op) {
        var copy = angular.copy(op);
        copy.detailBlade = angular.extend({
            id: 'operationDetail',
            knownChildrenOperations: [],
            metaFields: [],
            controller: 'virtoCommerce.orderModule.operationDetailController'
        }, copy.detailBlade);

        map[op.type] = copy;
    }

    function getOperation(type) {
        return map[type];
    }

    return {
        registerOperation: registerOperation,
        getOperation: getOperation
    };
}])
.run(
  ['$rootScope', '$http', '$compile', 'platformWebApp.mainMenuService', 'platformWebApp.widgetService', 'platformWebApp.bladeNavigationService', '$state', '$localStorage', 'virtoCommerce.orderModule.order_res_customerOrders', 'platformWebApp.permissionScopeResolver', 'virtoCommerce.storeModule.stores', 'virtoCommerce.orderModule.knownOperations', 'moment',
	function ($rootScope, $http, $compile, mainMenuService, widgetService, bladeNavigationService, $state, $localStorage, customerOrders, scopeResolver, stores, knownOperations, moment) {
	    //Register module in main menu
	    var menuItem = {
	        path: 'orders',
	        icon: 'fa fa-cart-arrow-down',
	        title: 'orders.main-menu-title',
	        priority: 3,
	        action: function () { $state.go('workspace.orderModule'); },
	        permission: 'order:access'
	    };
	    mainMenuService.addMenuItem(menuItem);

	    // register CustomerOrder, PaymentIn and Shipment types as known operations
	    knownOperations.registerOperation({
	        type: 'CustomerOrder',
	        treeTemplateUrl: 'orderOperationDefault.tpl.html',
	        detailBlade: {
	            id: 'orderDetail',
	            template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/blades/customerOrder-detail.tpl.html',
	            knownChildrenOperations: ['Shipment', 'PaymentIn'],
	            metaFields: [
                    {
                        name: 'isApproved',
                        title: "orders.blades.customerOrder-detail.labels.approved",
                        valueType: "Boolean",
                        isVisibleFn: function (blade) {
                            return !blade.isNew;
                        }
                    },
                    {
                        name: 'employeeId',
                        title: "orders.blades.customerOrder-detail.labels.employee",
                        templateUrl: 'employeeSelector.html'
                    },
                    {
                        name: 'number',
                        isRequired: true,
                        title: "orders.blades.customerOrder-detail.labels.order-number",
                        valueType: "ShortText"
                    },
                    {
                        name: 'createdDate',
                        isReadonly: true,
                        title: "orders.blades.customerOrder-detail.labels.from",
                        valueType: "DateTime"
                    },
                    {
                        name: 'status',
                        templateUrl: 'statusSelector.html'
                    },
                    {
                        name: 'customerName',
                        title: "orders.blades.customerOrder-detail.labels.customer",
                        templateUrl: 'customerSelector.html'
                    },
                    {
                        name: 'discountAmount',
                        title: "orders.blades.customerOrder-items.labels.discount",
                        templateUrl: 'discountAmount.html'
                    },
                    {
                        name: 'storeId',
                        title: "orders.blades.customerOrder-detail.labels.store",
                        templateUrl: 'storeSelector.html'
                    }
	            ]
	        }
	    });

	    var paymentInOperation = {
	        type: 'PaymentIn',
	        description: 'orders.blades.newOperation-wizard.menu.payment-operation.description',
	        // treeTemplateUrl: 'orderOperationDefault.tpl.html',
	        detailBlade: {
	            template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/blades/payment-detail.tpl.html',
	            metaFields: [
                    {
                        name: 'number',
                        isRequired: true,
                        title: "orders.blades.payment-detail.labels.payment-number",
                        valueType: "ShortText"
                    },
                    {
                        name: 'createdDate',
                        isReadonly: true,
                        title: "orders.blades.payment-detail.labels.from",
                        valueType: "DateTime"
                    }
	            ]
	        }
	    };
	    knownOperations.registerOperation(paymentInOperation);

	    var shipmentOperation = {
	        type: 'Shipment',
	        description: 'orders.blades.newOperation-wizard.menu.shipment-operation.description',
	        detailBlade: {
	            template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/blades/shipment-detail.tpl.html',
	            metaFields: [
                    {
                        name: 'number',
                        isRequired: true,
                        title: "orders.blades.shipment-detail.labels.shipment-number",
                        valueType: "ShortText"
                    },
                    {
                        name: 'createdDate',
                        isReadonly: true,
                        title: "orders.blades.shipment-detail.labels.from",
                        valueType: "DateTime"
                    },
                    {
                        name: 'status',
                        templateUrl: 'statusSelector.html'
                    },
                    {
                        name: 'employeeId',
                        title: "orders.blades.shipment-detail.labels.employee",
                        templateUrl: 'employeeSelector.html'
                    },
                    {
                        name: 'price',
                        title: "orders.blades.shipment-detail.labels.price",
                        templateUrl: 'price.html'
                    },
                    {
                        name: 'priceWithTax',
                        title: "orders.blades.shipment-detail.labels.price-with-tax",
                        templateUrl: 'priceWithTax.html'
                    }
	            ]
	        }
	    };
	    knownOperations.registerOperation(shipmentOperation);

	    //Register widgets
	    var operationItemsWidget = {
	        controller: 'virtoCommerce.orderModule.customerOrderItemsWidgetController',
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/customerOrder-items-widget.tpl.html'
	    };
	    widgetService.registerWidget(operationItemsWidget, 'customerOrderDetailWidgets');

	    var shipmentItemsWidget = {
	        controller: 'virtoCommerce.orderModule.shipmentItemsWidgetController',
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/shipment-items-widget.tpl.html'
	    };
	    widgetService.registerWidget(shipmentItemsWidget, 'shipmentDetailWidgets');


	    var customerOrderAddressWidget = {
	        controller: 'virtoCommerce.orderModule.customerOrderAddressWidgetController',
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/customerOrder-address-widget.tpl.html'
	    };
	    widgetService.registerWidget(customerOrderAddressWidget, 'customerOrderDetailWidgets');

	    var customerOrderTotalsWidget = {
	        controller: 'virtoCommerce.orderModule.customerOrderTotalsWidgetController',
	        size: [2, 2],
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/customerOrder-totals-widget.tpl.html'
	    };
	    widgetService.registerWidget(customerOrderTotalsWidget, 'customerOrderDetailWidgets');


	    var operationCommentWidget = {
	        controller: 'virtoCommerce.orderModule.operationCommentWidgetController',
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/operation-comment-widget.tpl.html'
	    };
	    widgetService.registerWidget(operationCommentWidget, 'customerOrderDetailWidgets');

	    var shipmentAddressWidget = {
	        controller: 'virtoCommerce.orderModule.shipmentAddressWidgetController',
	        size: [2, 1],
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/shipment-address-widget.tpl.html'
	    };
	    widgetService.registerWidget(shipmentAddressWidget, 'shipmentDetailWidgets');


	    var shipmentTotalWidget = {
	        controller: 'virtoCommerce.orderModule.shipmentTotalsWidgetController',
	        size: [2, 1],
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/shipment-totals-widget.tpl.html'
	    };
	    widgetService.registerWidget(shipmentTotalWidget, 'shipmentDetailWidgets');

	    widgetService.registerWidget({
	        controller: 'virtoCommerce.orderModule.paymentAddressWidgetController',
	        size: [2, 1],
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/payment-address-widget.tpl.html'
	    }, 'paymentDetailWidgets');

	    var dynamicPropertyWidget = {
	        controller: 'platformWebApp.dynamicPropertyWidgetController',
	        template: '$(Platform)/Scripts/app/dynamicProperties/widgets/dynamicPropertyWidget.tpl.html'
	    };
	    widgetService.registerWidget(dynamicPropertyWidget, 'shipmentDetailWidgets');
	    widgetService.registerWidget(dynamicPropertyWidget, 'customerOrderDetailWidgets');
	    widgetService.registerWidget(dynamicPropertyWidget, 'paymentDetailWidgets');


	    var operationsTreeWidget = {
	        controller: 'virtoCommerce.orderModule.operationTreeWidgetController',
	        size: [4, 3],
	        template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/operation-tree-widget.tpl.html'
	    };
	    widgetService.registerWidget(operationsTreeWidget, 'customerOrderDetailWidgets');

	    // register dashboard widgets
	    var statisticsController = 'virtoCommerce.orderModule.dashboard.statisticsWidgetController';
	    //widgetService.registerWidget({
	    //    controller: statisticsController,
	    //    size: [2, 1],
	    //    template: 'order-statistics-revenue.html'
	    //}, 'mainDashboard');
	    //widgetService.registerWidget({
	    //    controller: statisticsController,
	    //    size: [1, 1],
	    //    template: 'order-statistics-customersCount.html'
	    //}, 'mainDashboard');
	    //widgetService.registerWidget({
	    //    controller: statisticsController,
	    //    size: [1, 1],
	    //    template: 'order-statistics-revenuePerCustomer.html'
	    //}, 'mainDashboard');
	    //widgetService.registerWidget({
	    //    controller: statisticsController,
	    //    size: [1, 1],
	    //    template: 'order-statistics-orderValue.html'
	    //}, 'mainDashboard');
	    //widgetService.registerWidget({
	    //    controller: statisticsController,
	    //    size: [1, 1],
	    //    template: 'order-statistics-itemsPurchased.html'
	    //}, 'mainDashboard');
	    //widgetService.registerWidget({
	    //    controller: statisticsController,
	    //    size: [1, 1],
	    //    template: 'order-statistics-lineitemsPerOrder.html'
	    //}, 'mainDashboard');
	    widgetService.registerWidget({
	        controller: statisticsController,
	        size: [3, 2],
	        template: 'order-statistics-revenueByQuarter.html'
	    }, 'mainDashboard');
	    //widgetService.registerWidget({
	    //    controller: statisticsController,
	    //    size: [3, 2],
	    //    template: 'order-statistics-orderValueByQuarter.html'
	    //}, 'mainDashboard');
	    widgetService.registerWidget({
	        controller: statisticsController,
	        size: [3, 2],
	        template: 'order-statistics-general.html'
	    }, 'mainDashboard');
	    widgetService.registerWidget({
	        controller: statisticsController,
	        size: [3, 2],
	        template: 'order-statistics-recent.html'
	    }, 'mainDashboard');
	    widgetService.registerWidget({
	        controller: statisticsController,
	        size: [3, 4],
	        template: 'order-statistics-summary.html'
	    }, 'mainDashboard');

	    $http.get('Modules/$(VirtoCommerce.OrderExtension)/Scripts/widgets/dashboard/statistics-templates.html').then(function (response) {
	        // compile the response, which will put stuff into the cache
	        $compile(response.data);
	    });


	    //Register permission scopes templates used for scope bounded definition in role management ui
	    var orderStoreScope = {
	        type: 'OrderStoreScope',
	        title: 'Only for orders in selected stores',
	        selectFn: function (blade, callback) {
	            var newBlade = {
	                id: 'store-pick',
	                title: this.title,
	                subtitle: 'Select stores',
	                currentEntity: this,
	                onChangesConfirmedFn: callback,
	                dataPromise: stores.query().$promise,
	                controller: 'platformWebApp.security.scopeValuePickFromSimpleListController',
	                template: '$(Platform)/Scripts/app/security/blades/common/scope-value-pick-from-simple-list.tpl.html'
	            };
	            bladeNavigationService.showBlade(newBlade, blade);
	        }
	    };
	    scopeResolver.register(orderStoreScope);
	    var responsibleOrderScope = {
	        type: 'OrderResponsibleScope',
	        title: 'Only for order responsible',
	    };
	    scopeResolver.register(responsibleOrderScope);

	    function getMonthDateRange(year, month) {
	        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
	        // array is 'year', 'month', 'day', etc
	        var startDate = moment([year, month]);

	        // Clone the value before .endOf()
	        var endDate = moment(startDate).endOf('month');

	        // just for demonstration:
	        console.log(startDate.toDate());
	        console.log(endDate.toDate());

	        // make sure to call toDate() for plain JavaScript date type
	        return { start: startDate, end: endDate };
	    }

	    $rootScope.$on('loginStatusChanged', function (event, authContext) {
	        if (authContext.isAuthenticated) {
	            var now = new Date();
	            var startDate = new Date();
	            startDate.setFullYear(now.getFullYear() - 1);

	            customerOrders.getDashboardStatistics({ start: startDate, end: now }, function (data) {
	                // prepare statistics
	                var statisticsToChartRows = function (statsList, allCurrencies) {
	                    var groupedQuarters = _.groupBy(statsList, function (stats) {
	                        return stats.year + ' Q' + stats.quarter;
	                    });
	                    return _.map(groupedQuarters, function (stats, key) {
	                        var values = [{
	                            v: key
	                        }];
	                        _.each(allCurrencies, function (x) {
	                            var stat = _.findWhere(stats, {
	                                currency: x
	                            });
	                            values.push({
	                                v: stat ? stat.amount : 0
	                            });
	                        });
	                        return {
	                            c: values
	                        };
	                    });
	                }

	                var allCurrencies = _.unique(_.pluck(data.avgOrderValuePeriodDetails, 'currency').sort());

	                var cols = [{
	                    id: "quarter", label: "Quarter", type: "string"
	                }];
	                _.each(allCurrencies, function (x) {
	                    cols.push({
	                        id: "revenue" + x, label: x, type: "number"
	                    });
	                });

	                data.chartRevenueByQuarter = {
	                    "type": "LineChart",
	                    "data": {
	                        cols: cols,
	                        rows: statisticsToChartRows(data.revenuePeriodDetails, allCurrencies)
	                    },
	                    "options": {
	                        "title": "Revenue by quarter",
	                        "legend": {
	                            position: 'top'
	                        },
	                        "vAxis": {
	                            // "title": "Sales unit",
	                            gridlines: {
	                                count: 8
	                            }
	                        },
	                        "hAxis": {
	                            // "title": "Date"
	                            slantedText: true,
	                            slantedTextAngle: 20
	                        }
	                    },
	                    "formatters": {}
	                };

	                cols = [{
	                    id: "quarter", label: "Quarter", type: "string"
	                }];
	                _.each(allCurrencies, function (x) {
	                    cols.push({
	                        id: "avg-orderValue" + x, label: x, type: "number"
	                    });
	                });

	                data.chartOrderValueByQuarter = {
	                    "type": "ColumnChart",
	                    "data": {
	                        cols: cols,
	                        rows: statisticsToChartRows(data.avgOrderValuePeriodDetails, allCurrencies)
	                    },
	                    "options": {
	                        "title": "Average Order value by quarter",
	                        "legend": {
	                            position: 'top'
	                        },
	                        "vAxis": {
	                            gridlines: {
	                                count: 8
	                            }
	                        },
	                        "hAxis": {
	                            slantedText: true,
	                            slantedTextAngle: 20
	                        }
	                    },
	                    "formatters": {}
	                };

	                //get Pending Items
	                data.PendingItems = {
	                    "OrdersPendingApproval": 0,
	                    "OrdersInProcess": 0,
	                    "OrdersReadyBilled": 0,
	                    "CustomerServiceMessages": 0
	                }

	                var criteria = {
	                    statuses: ['New'],
	                    take: 5000,
                        responseGroup: 'default'
	                };

	                customerOrders.search(criteria, function (apiData) {
	                    data.PendingItems.OrdersPendingApproval = apiData.totalCount;
	                    data.RecentOrders = apiData.customerOrders;
	                    menuItem.newCount = data.RecentOrders.length;
	                },
                    function (error) {
                       bladeNavigationService.setError('Error ' + error.status, blade);
                    });

	                var criteria = {
	                    statuses: ['Processing'],
	                    take: 5000,
	                    responseGroup: 'default'
	                };

	                customerOrders.search(criteria, function (apiData) {
	                    data.PendingItems.OrdersInProcess = apiData.totalCount;
	                },
                    function (error) {
                       bladeNavigationService.setError('Error ' + error.status, blade);
                    });

	                $localStorage.ordersDashboardStatistics = data;
	            },
                function (error) {
                    console.log(error);
                });

	            var start = moment().startOf('day'); // set to 12:00 am today
	            var end = moment().endOf('day'); // set to 23:59 pm today
                //statistics for today
	            customerOrders.getDashboardStatistics({ start: start.toISOString(), end: end.toISOString() }, function (data) {
	                data.amount = data.revenue[0].amount;

	                $localStorage.ordersDashboardStatistics.Today = {};
	                if (data.revenue.length > 0) {
	                    $localStorage.ordersDashboardStatistics.Today.TotalSales = data;
	                }

	            },
                function (error) {
                    console.log(error);
                });

	            //statistics for yesterday
	            start = moment().startOf('day').subtract(1, 'day'); // set to 12:00 am today
	            end = moment().endOf('day').subtract(1, 'day'); // set to 23:59 pm today
	            customerOrders.getDashboardStatistics({ start: start.toISOString(), end: end.toISOString() }, function (data) {
	                data.amount = data.revenue[0].amount;

	                $localStorage.ordersDashboardStatistics.Yesterday = {};
	                if (data.revenue.length > 0) {
	                    $localStorage.ordersDashboardStatistics.Yesterday.TotalSales = data;
	                }

	            },
                function (error) {
                    console.log(error);
                });


	            //statistics for Current Week            
	            start = moment().startOf('isoweek');
	            end = moment().endOf('isoweek');
	            customerOrders.getDashboardStatistics({ start: start.toISOString(), end: end.toISOString() }, function (data) {
	                data.amount = data.revenue[0].amount;

	                $localStorage.ordersDashboardStatistics.CurrentWeek = {};
	                if (data.revenue.length > 0) {
	                    $localStorage.ordersDashboardStatistics.CurrentWeek.TotalSales = data;
	                }

	            },
                function (error) {
                    console.log(error);
                });


	            //statistics for last Week            
	            start = moment().subtract(1, 'weeks').startOf('isoWeek')
	            end = moment().subtract(1, 'weeks').endOf('isoWeek')
	            customerOrders.getDashboardStatistics({ start: start.toISOString(), end: end.toISOString() }, function (data) {
	                data.amount = data.revenue[0].amount;

	                $localStorage.ordersDashboardStatistics.LastWeek = {};
	                if (data.revenue.length > 0) {
	                    $localStorage.ordersDashboardStatistics.LastWeek.TotalSales = data;
	                }

	            },
                function (error) {
                    console.log(error);
                });

	            //statistics for this month          
	            var dates = getMonthDateRange(moment().year(), moment().month())
	            customerOrders.getDashboardStatistics({ start: dates.start.toISOString(), end: dates.end.toISOString() }, function (data) {
	                data.amount = data.revenue[0].amount;

	                $localStorage.ordersDashboardStatistics.CurrentMonth = {};
	                if (data.revenue.length > 0) {
	                    $localStorage.ordersDashboardStatistics.CurrentMonth.TotalSales = data;
	                }

	            },
                function (error) {
                    console.log(error);
                });


	            //statistics for last month          
	            var dates = getMonthDateRange(moment().year(), moment().subtract(1, 'month').month())
	            customerOrders.getDashboardStatistics({ start: dates.start.toISOString(), end: dates.end.toISOString() }, function (data) {
	                data.amount = data.revenue[0].amount;

	                $localStorage.ordersDashboardStatistics.LastMonth = {};
	                if (data.revenue.length > 0) {
	                    $localStorage.ordersDashboardStatistics.LastMonth.TotalSales = data;
	                }

	            },
                function (error) {
                    console.log(error);
                });

	            //statistics for last 6 month
	            var dateStart = moment().subtract(5, 'month').startOf('month')
	            var dateEnd = moment().startOf('month')
	            customerOrders.getDashboardStatistics({ start: dateStart.toISOString(), end: dateEnd.toISOString() }, function (data) {
	                data.amount = data.revenue[0].amount;

	                $localStorage.ordersDashboardStatistics.LastSixMonth = {};
	                if (data.revenue.length > 0) {
	                    $localStorage.ordersDashboardStatistics.LastSixMonth.TotalSales = data;
	                }

	            },
                function (error) {
                    console.log(error);
                });

	        }
	    });
	}]);