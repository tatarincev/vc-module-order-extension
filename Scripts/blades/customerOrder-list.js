angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.customerOrderListController', ['$scope', '$localStorage', 'virtoCommerce.orderModule.order_res_customerOrders', 'virtoCommerce.productConfigurationModule.productConfigurations', 'platformWebApp.bladeUtils', 'platformWebApp.dialogService', 'platformWebApp.authService', 'uiGridConstants', 'platformWebApp.uiGridHelper', 'dateFilter', 'virtoCommerce.orderModule.knownOperations', '$q',
function ($scope, $localStorage, customerOrders, productConfigurations, bladeUtils, dialogService, authService, uiGridConstants, uiGridHelper, dateFilter, knownOperations, $q) {
    var blade = $scope.blade;
    var bladeNavigationService = bladeUtils.bladeNavigationService;
    var ctrl = this;
    $scope.uiGridConstants = uiGridConstants;

    blade.refresh = function () {
        blade.isLoading = true;
        var criteria = {
            keyword: filter.keyword,
            sort: uiGridHelper.getSortExpression($scope),
            skip: ($scope.pageSettings.currentPage - 1) * $scope.pageSettings.itemsPerPageCount,
            take: $scope.pageSettings.itemsPerPageCount,
            responseGroup: 'default'
        };
        if (filter.current) {
            angular.extend(criteria, filter.current);
        }

        customerOrders.search(criteria, function (data) {
            blade.isLoading = false;

            $scope.pageSettings.totalItems = data.totalCount;
            $scope.objects = data.customerOrders;
        },
	   function (error) {
	       bladeNavigationService.setError('Error ' + error.status, blade);
	   });
    };

    $scope.selectNode = function (node) {
        $scope.selectedNodeId = node.id;

        var foundTemplate = knownOperations.getOperation(node.operationType);
        if (foundTemplate) {
            var newBlade = angular.copy(foundTemplate.detailBlade);
            newBlade.customerOrder = node;
            bladeNavigationService.showBlade(newBlade, blade);
        }
    };

    $scope.deleteList = function (list) {
        var dialog = {
            id: "confirmDeleteItem",
            title: "orders.dialogs.orders-delete.title",
            message: "orders.dialogs.orders-delete.message",
            callback: function (remove) {
                if (remove) {
                    closeChildrenBlades();

                    var itemIds = _.pluck(list, 'id');

                    //TODO remove product configuration associated with order line items before removing order


                    customerOrders.remove({ ids: itemIds }, function (data, headers) {
                        blade.refresh();
                    },
                    function (error) {
                        bladeNavigationService.setError('Error ' + error.status, blade);
                    });
                }
            }
        }
        dialogService.showConfirmationDialog(dialog);
    }

    $scope.cloneList = function (list) {
        var dialog = {
            id: "confirmCloneItem",
            title: "orders.dialogs.orders-clone.title",
            message: "orders.dialogs.orders-clone.message",
            callback: function (clone) {
                if (clone) {
                    closeChildrenBlades();

                    var itemIds = _.pluck(list, 'id');

                    itemIds.reduce(function (p, val) {
                        return p.then(function () {

                            cloneOrder(val);
                        });

                    }, $q.when(true)).then(function (finalResult) {
                        // done here
                        
                    }, function (error) {
                        bladeNavigationService.setError('Error ' + error.status, blade);
                    });

                }
            }
        }

        dialogService.showConfirmationDialog(dialog);
    }

    function cloneOrder(id) {
        customerOrders.get({ id: id }, function (order, headers) {


            var dateNow = new Date();
            var orderCloned = angular.copy(order, orderCloned);

            orderCloned.id = null;
            orderCloned.childrenOperations = null;
            orderCloned.inPayments = null;
            orderCloned.shipments = null;
            orderCloned.invoices = null;
            orderCloned.number = null;
            orderCloned.createdDate = dateNow.toISOString();
            orderCloned.createdBy = 'admin';
            orderCloned.status = 'New';
            orderCloned.isApproved = 0;
            angular.forEach(orderCloned.items, function (orderLineItem) {
                orderLineItem.id = null;
            });

            customerOrders.save(orderCloned, function (orderResult) {
                //cloneProductConfigurations(orderResult);

                customerOrders.search({ keyword: orderResult.number }, function (orderResult) {

                    var dateNow = new Date();

                    angular.forEach(orderResult.items, function (orderLineItemResult, key) {
                        //copy product configuration request and reset id's to null
                        if (orderLineItemResult.productConfigurationRequestId != null) {
                            var criteria = {
                                productConfigurationRequestId: orderLineItemResult.productConfigurationRequestId,
                                isordered: true
                            };

                            productConfigurations.search(criteria, function (productConfigData) {

                                var orderLineItemCPC = productConfigData.productConfigurationRequests[0];
                                orderLineItemCPC.id = null;
                                orderLineItemCPC.number = null;
                                orderLineItemCPC.orderLineItemId = orderResult.items[key].id;
                                orderLineItemCPC.productConfiguration.id = null;
                                angular.forEach(orderLineItemCPC.productConfiguration.lineItems, function (line) {
                                    line.id = null;
                                })
                                orderLineItemCPC.createdDate = dateNow.toISOString();
                                orderLineItemCPC.modifiedDate = dateNow.toISOString();
                                orderLineItemCPC.createdBy = 'admin';

                                productConfigurations.save(orderLineItemCPC, function (orderLineItemCPCResult) {
                                    orderLineItemResult.productConfiguration = orderLineItemCPCResult;
                                    orderLineItemResult.productConfigurationRequestId = orderLineItemCPCResult.id;

                                    //angular.forEach($scope.clonedOrder.items, function (orderLineItemResult) {
                                    //    if (orderLineItemResult.productConfigurationRequestId != null) {
                                    //        orderLineItemResult.productConfiguration.orderLineItemId = orderLineItemResult.id;

                                    //        //orderLineItemResult.productConfiguration.lineItems = null;

                                    //        //productConfigurations.update(orderLineItemResult.productConfiguration, function (updateResult) {
                                    //        //    //orderLineItem.productConfiguration = orderLineItemCPCResult;
                                    //        //},
                                    //        //function (error) {
                                    //        //    bladeNavigationService.setError('Error ' + error.status, blade);
                                    //        //});
                                    //    }
                                    //});
                                },
                                function (error) {
                                    bladeNavigationService.setError('Error ' + error.status, blade);
                                });



                            },
                            function (error) {
                                bladeNavigationService.setError('Error ' + error.status, blade);
                            });
                        }
                    });

                });

                blade.refresh();
            },
            function (error) {
                bladeNavigationService.setError('Error ' + error.status, blade);
            });

            return order;

        });
        return id;
    }

    function cloneProductConfigurations(orderResult) {
            var dateNow = new Date();

            angular.forEach(orderResult.items, function (orderLineItemResult, key) {
                //copy product configuration request and reset id's to null
                if (orderLineItemResult.productConfigurationRequestId != null) {
                    var criteria = {
                        productConfigurationRequestId: orderLineItemResult.productConfigurationRequestId,
                        isordered: true
                    };

                    productConfigurations.search(criteria, function (productConfigData) {

                        var orderLineItemCPC = productConfigData.productConfigurationRequests[0];
                        orderLineItemCPC.id = null;
                        orderLineItemCPC.number = null;
                        orderLineItemCPC.orderLineItemId = orderResult.items[key].id;
                        orderLineItemCPC.productConfiguration.id = null;
                        angular.forEach(orderLineItemCPC.productConfiguration.lineItems, function (line) {
                            line.id = null;
                        })
                        orderLineItemCPC.createdDate = dateNow.toISOString();
                        orderLineItemCPC.modifiedDate = dateNow.toISOString();
                        orderLineItemCPC.createdBy = 'admin';

                        productConfigurations.save(orderLineItemCPC, function (orderLineItemCPCResult) {
                            orderLineItemResult.productConfiguration = orderLineItemCPCResult;
                            orderLineItemResult.productConfigurationRequestId = orderLineItemCPCResult.id;
                            
                            //angular.forEach($scope.clonedOrder.items, function (orderLineItemResult) {
                            //    if (orderLineItemResult.productConfigurationRequestId != null) {
                            //        orderLineItemResult.productConfiguration.orderLineItemId = orderLineItemResult.id;

                            //        //orderLineItemResult.productConfiguration.lineItems = null;

                            //        //productConfigurations.update(orderLineItemResult.productConfiguration, function (updateResult) {
                            //        //    //orderLineItem.productConfiguration = orderLineItemCPCResult;
                            //        //},
                            //        //function (error) {
                            //        //    bladeNavigationService.setError('Error ' + error.status, blade);
                            //        //});
                            //    }
                            //});
                        },
                        function (error) {
                            bladeNavigationService.setError('Error ' + error.status, blade);
                        });



                    },
                    function (error) {
                        bladeNavigationService.setError('Error ' + error.status, blade);
                    });
                }
            });
    }

    function closeChildrenBlades() {
        angular.forEach(blade.childrenBlades.slice(), function (child) {
            bladeNavigationService.closeBlade(child);
        });
    }

    blade.headIcon = 'fa-file-text';

    blade.toolbarCommands = [
            {
                name: "platform.commands.refresh", icon: 'fa fa-refresh',
                executeMethod: blade.refresh,
                canExecuteMethod: function () {
                    return true;
                }
            },
            {
                name: "platform.commands.delete", icon: 'fa fa-trash-o',
                executeMethod: function () {
                    $scope.deleteList($scope.gridApi.selection.getSelectedRows());
                },
                canExecuteMethod: function () {
                    return $scope.gridApi && _.any($scope.gridApi.selection.getSelectedRows());
                },
                permission: 'order:delete'
            },
            {
                name: "platform.commands.clone", icon: 'fa fa-clone',
                executeMethod: function () {
                    $scope.cloneList($scope.gridApi.selection.getSelectedRows());
                },
                canExecuteMethod: function () {
                    return $scope.gridApi && _.any($scope.gridApi.selection.getSelectedRows());
                },
                permission: 'order:create'
            }
    ];

    // simple and advanced filtering
    var filter = $scope.filter = {};
    var filter = blade.filter = $scope.filter = {};
    $scope.$localStorage = $localStorage;
    if (!$localStorage.orderSearchFilters) {
        $localStorage.orderSearchFilters = [{ name: 'orders.blades.customerOrder-list.labels.new-filter' }]
    }
    if ($localStorage.orderSearchFilterId) {
        filter.current = _.findWhere($localStorage.orderSearchFilters, { id: $localStorage.orderSearchFilterId });
    }

    filter.change = function () {
        $localStorage.orderSearchFilterId = filter.current ? filter.current.id : null;
        if (filter.current && !filter.current.id) {
            filter.current = null;
            showFilterDetailBlade({ isNew: true });
        } else {
            bladeNavigationService.closeBlade({ id: 'filterDetail' });
            filter.criteriaChanged();
        }
    };

    filter.edit = function () {
        if (filter.current) {
            showFilterDetailBlade({ data: filter.current });
        }
    };

    function showFilterDetailBlade(bladeData) {
        var newBlade = {
            id: 'filterDetail',
            controller: 'virtoCommerce.orderModule.filterDetailController',
            template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/blades/filter-detail.tpl.html',
        };
        angular.extend(newBlade, bladeData);
        bladeNavigationService.showBlade(newBlade, blade);
    }

    filter.criteriaChanged = function () {
        if ($scope.pageSettings.currentPage > 1) {
            $scope.pageSettings.currentPage = 1;
        } else {
            blade.refresh();
        }
    };

    // ui-grid
    $scope.setGridOptions = function (gridOptions) {
        var createdDateColumn = _.findWhere(gridOptions.columnDefs, { name: 'createdDate' });
        if (createdDateColumn) { // custom tooltip
            createdDateColumn.cellTooltip = function (row, col) { return dateFilter(row.entity.createdDate, 'medium'); }
        }
        uiGridHelper.initialize($scope, gridOptions, function (gridApi) {
            uiGridHelper.bindRefreshOnSortChanged($scope);
        });

        bladeUtils.initializePagination($scope);
    };


    // actions on load
    //No need to call this because page 'pageSettings.currentPage' is watched!!! It would trigger subsequent duplicated req...
    //blade.refresh();
}]);