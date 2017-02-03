angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.operationDetailController', ['$scope', 'platformWebApp.dialogService', 'virtoCommerce.orderModule.dialogService', 'platformWebApp.bladeNavigationService', 'virtoCommerce.orderModule.order_res_customerOrders', 'virtoCommerce.orderModule.stripe_res', 'platformWebApp.objCompareService', '$timeout', 'focus', 'virtoCommerce.productConfigurationModule.productConfigurations',
    function ($scope, dialogService, moduleDialogService, bladeNavigationService, customerOrders, stripe_res, objCompareService, $timeout, focus, productConfigurations) {
        var blade = $scope.blade;
        blade.updatePermission = 'order:update';

        blade.refresh = function () {
            if (blade.id === 'operationDetail') {
                if (!blade.isNew)
                    blade.initialize(blade.currentEntity);
            }
            else {
                blade.isLoading = true;
                customerOrders.get({ id: blade.customerOrder.id }, function (result) {
                    blade.initialize(result);
                    blade.customerOrder = blade.currentEntity;
                    populateProductConfigurations();
                    //necessary for scope bounded ACL checks 
                    blade.securityScopes = result.scopes;
                });
            }
        }

        blade.initialize = function (operation) {
            blade.origEntity = operation;
            blade.currentEntity = angular.copy(operation);
            $timeout(function () {
                blade.customInitialize();
            });

            blade.isLoading = false;
        };

        // base function to override as needed
        blade.customInitialize = function () { };

        blade.recalculate = function () {
            blade.isLoading = true;
            customerOrders.recalculate(blade.customerOrder, function (result) {
                angular.copy(result, blade.customerOrder);

                var idToFocus = document.activeElement.id;
                if (idToFocus)
                    $timeout(function () {
                        focus(idToFocus);
                        document.getElementById(idToFocus).select();
                    });

                blade.isLoading = false;
            });
        };

        function populateProductConfigurations() {
            angular.forEach(blade.customerOrder.items, function (item) {

                if (item.productConfigurationRequestId != null) {
                    var criteria = {
                        productConfigurationRequestId: item.productConfigurationRequestId,
                        isordered: true
                    };

                    productConfigurations.search(criteria, function (data) {
                        if (data.productConfigurationRequests.length > 0) {
                            item.productConfiguration = data.productConfigurationRequests[0];
                        }
                    },
                   function (error) {
                       bladeNavigationService.setError('Error ' + error.status, blade);
                   });
                }
            });

            return blade.customerOrder;
        }

        function isDirty() {
            return blade.origEntity && !objCompareService.equal(blade.origEntity, blade.currentEntity) && !blade.isNew && blade.hasUpdatePermission();
        }

        function canSave() {
            return isDirty() && (!$scope.formScope || $scope.formScope.$valid);
        }

        $scope.setForm = function (form) { $scope.formScope = form; };

        $scope.cancelChanges = function () {
            blade.currentEntity = blade.origEntity;
            $scope.bladeClose();
        }
        $scope.saveChanges = function () {
            if (blade.id === 'operationDetail') {
                angular.copy(blade.currentEntity, blade.origEntity);
                if (blade.isNew) {
                    blade.realOperationsCollection.push(blade.currentEntity);
                    blade.customerOrder.childrenOperations.push(blade.currentEntity);
                } else {
                    var foundOp = _.findWhere(blade.realOperationsCollection, { id: blade.origEntity.id });
                    angular.copy(blade.origEntity, foundOp);
                }
                $scope.bladeClose();

                if (blade.isTotalsRecalculationNeeded) {
                    blade.recalculate();
                }
            } else {
                blade.isLoading = true;
                customerOrders.update(blade.customerOrder, function () {
                    blade.isNew = false;
                    blade.refresh();
                    blade.parentBlade.refresh();
                });
            }
        };

        blade.toolbarCommands = [
        {
            name: "orders.commands.new-document", icon: 'fa fa-plus',
            executeMethod: function () {
                var newBlade = {
                    id: "newOperationWizard",
                    customerOrder: blade.customerOrder,
                    currentEntity: blade.currentEntity,
                    stores: blade.stores,
                    availableTypes: blade.knownChildrenOperations,
                    title: "orders.blades.newOperation-wizard.title",
                    subtitle: 'orders.blades.newOperation-wizard.subtitle',
                    controller: 'virtoCommerce.orderModule.newOperationWizardController',
                    template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/wizards/newOperation/newOperation-wizard.tpl.html'
                };
                bladeNavigationService.showBlade(newBlade, blade);
            },
            canExecuteMethod: function () {
                return _.any(blade.knownChildrenOperations);
            },
            permission: blade.updatePermission
        },
        {
            name: "platform.commands.save", icon: 'fa fa-save',
            executeMethod: $scope.saveChanges,
            canExecuteMethod: canSave,
            permission: blade.updatePermission
        },
        {
            name: "platform.commands.reset", icon: 'fa fa-undo',
            executeMethod: function () {
                angular.copy(blade.origEntity, blade.currentEntity);
            },
            canExecuteMethod: isDirty,
            permission: blade.updatePermission
        },
        {
            name: "platform.commands.delete", icon: 'fa fa-trash-o',
            executeMethod: function () {
                var dialog = {
                    id: "confirmDeleteItem",
                    title: "orders.dialogs.operation-delete.title",
                    message: "orders.dialogs.operation-delete.message",
                    callback: function (remove) {
                        if (remove) {
                            if (blade.id === 'operationDetail') {
                                var idx = _.findIndex(blade.customerOrder.childrenOperations, function (x) { return x.id === blade.origEntity.id; });
                                blade.customerOrder.childrenOperations.splice(idx, 1);
                                var idx = _.findIndex(blade.realOperationsCollection, function (x) { return x.id === blade.origEntity.id; });
                                blade.realOperationsCollection.splice(idx, 1);

                                bladeNavigationService.closeBlade(blade);
                            }
                            else {
                                customerOrders.delete({ ids: blade.customerOrder.id }, function () {
                                    blade.parentBlade.refresh();
                                    bladeNavigationService.closeBlade(blade);
                                });
                            }
                        }
                    }
                };
                dialogService.showConfirmationDialog(dialog);
            },
            canExecuteMethod: function () {
                return true;
            },
            permission: 'order:delete'
        },
        {
            name: "orders.commands.invoice", icon: 'fa fa-file-text-o',
            executeMethod: function () {
                var dialog = {
                    id: "invoice",
                    title: "orders.commands.invoice",
                    customerOrder: blade.customerOrder,
                    callback: function () {
                        //no action required on callback
                    }
                };
                moduleDialogService.showInvoiceDialog(dialog, 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/dialogs/invoice-dialog.tpl.html', 'virtoCommerce.orderModule.confirmCancelDialogController');
            },
            canExecuteMethod: function () {
                return blade.currentEntity && !blade.currentEntity.isCancelled;
            },
            permission: blade.updatePermission
        },
        //{
        //    name: "orders.commands.cancel-document", icon: 'fa fa-remove',
        //    executeMethod: function () {
        //        var dialog = {
        //            id: "confirmCancelOperation",
        //            callback: function (reason) {
        //                if (reason) {
        //                    blade.currentEntity.cancelReason = reason;
        //                    blade.currentEntity.isCancelled = true;
        //                    blade.currentEntity.status = 'Cancelled';
        //                    $scope.saveChanges();
        //                }
        //            }
        //        };
        //        dialogService.showDialog(dialog, 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/dialogs/cancelOperation-dialog.tpl.html', 'virtoCommerce.orderModule.confirmCancelDialogController');
        //    },
        //    canExecuteMethod: function () {
        //        return blade.currentEntity && !blade.currentEntity.isCancelled;
        //    },
        //    permission: blade.updatePermission
        //},
        {
            name: "orders.commands.capture-payment", icon: 'fa fa-money',
            executeMethod: function () {
                var dialog = {
                    id: "confirmCapturePayment",
                    callback: function (reason) {

                        stripe_res.capturePayment({ orderId: blade.origEntity.id }, function (data, headers) {
                            blade.customerOrder.status = 'Processing';
                            blade.customerOrder.inPayments[0].paymentStatus = 'Paid';

                            $scope.saveChanges();
                        },
                        function (error) {
                            bladeNavigationService.setError('Error ' + error.status, blade);
                        });
                        
                    }
                };
                dialogService.showDialog(dialog, 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/dialogs/capturePayment-dialog.tpl.html', 'virtoCommerce.orderModule.confirmCancelDialogController');
            },
            canExecuteMethod: function () {
                if (blade.customerOrder.inPayments.length > 0) {
                    return blade.customerOrder.inPayments[0].status == "Authorized";
                }
                else {
                    return false;
                }
            },
            permission: blade.updatePermission
        },
        {
            name: "orders.commands.refund-payment", icon: 'fa fa-money',
            executeMethod: function () {
                var dialog = {
                    id: "confirmRefundPayment",
                    callback: function (reason) {
                        if (reason) {
                            
                            stripe_res.refundPayment({ orderId: blade.origEntity.id }, function (data, headers) {
                                blade.customerOrder.cancelReason = 'REFUNDED : ' + reason;
                                blade.customerOrder.isCancelled = true;
                                blade.customerOrder.status = 'Cancelled';
                                blade.customerOrder.inPayments[0].paymentStatus = 'Refunded';

                                $scope.saveChanges();
                            },
                            function (error) {
                                bladeNavigationService.setError('Error ' + error.status, blade);
                            });
                        }
                    }
                };
                dialogService.showDialog(dialog, 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/dialogs/cancelOperation-dialog.tpl.html', 'virtoCommerce.orderModule.confirmCancelDialogController');
            },
            canExecuteMethod: function () {
                if (blade.customerOrder.inPayments.length > 0) {
                    return blade.customerOrder.inPayments[0].status == "Paid" && blade.customerOrder.inPayments[0].gatewayCode == 'Stripe.Payment';
                }
                else {
                    return false;
                }
            },
            permission: blade.updatePermission
        }
        ];

        // no save for children operations
        if (blade.id === 'operationDetail') {
            blade.toolbarCommands.splice(1, 1);
        }

        //blade.onClose = function (closeCallback) {
        //    bladeNavigationService.showConfirmationIfNeeded(isDirty(), canSave(), blade, $scope.saveChanges, closeCallback, "orders.dialogs.operation-save.title", "orders.dialogs.operation-save.message");
        //};

        $scope.cancelOperationResolution = function (resolution) {
            $modalInstance.close(resolution);
        };

        // actions on load
        blade.refresh();
    }
])
.controller('virtoCommerce.orderModule.confirmCancelDialogController', ['$scope', '$modalInstance', function ($scope, $modalInstance, dialog) {

    $scope.cancelReason = undefined;
    $scope.yes = function () {
        $modalInstance.close($scope.cancelReason);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
