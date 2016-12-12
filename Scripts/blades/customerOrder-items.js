angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.customerOrderItemsController', ['$scope', '$sce', 'platformWebApp.bladeNavigationService', 'platformWebApp.dialogService', 'virtoCommerce.orderModule.dialogService', 'virtoCommerce.catalogModule.items', 'virtoCommerce.productConfigurationModule.productConfigurations', 'virtoCommerce.pricingModule.prices',
    function ($scope, $sce, bladeNavigationService, dialogService, moduleDialogService, items, productConfigurations, prices) {
    var blade = $scope.blade;
    blade.updatePermission = 'order:update';
    blade.hasUpdatePermission = $scope.$parent.blade.hasUpdatePermission();

    //pagination settings
    $scope.pageSettings = {};
    $scope.totals = {};
    $scope.pageSettings.totalItems = blade.currentEntity.items.length;
    $scope.pageSettings.currentPage = 1;
    $scope.pageSettings.numPages = 5;
    $scope.pageSettings.itemsPerPageCount = 4;
    

    $scope.toTrustedHTML = function (html) {
        return $sce.trustAsHtml(html);
    }

    var selectedProducts = [];

    blade.refresh = function () {
        blade.isLocked = blade.currentEntity.status == 'Completed' || blade.currentEntity.isCancelled || !blade.hasUpdatePermission;
        angular.forEach(blade.currentEntity.items, function (item) {

            if (item.productConfigurationRequestId != null) {
                var criteria = {
                    productConfigurationRequestId: item.productConfigurationRequestId,
                    isordered: true
                };

                productConfigurations.search(criteria, function (data) {
                    blade.isLoading = false;
                    if (data.productConfigurationRequests.length > 0) {
                        item.productConfiguration = data.productConfigurationRequests[0];
                    }
                },
               function (error) {
                   bladeNavigationService.setError('Error ' + error.status, blade);
               });
            }
        });

        blade.selectedAll = false;
        blade.isLoading = false;
    };

    function addProductsToOrder(products) {
        angular.forEach(products, function (product) {
            items.get({ id: product.id }, function (data) {
                prices.getProductPrices({ id: product.id }, function (prices) {
                    var price = _.find(prices, function (x) { return x.currency == blade.currentEntity.currency });

                    var newLineItem =
					{
					    productId: data.id,
					    catalogId: data.catalogId,
					    categoryId: data.categoryId,
					    name: data.name,
					    imageUrl: data.imgSrc,
					    sku: data.code,
					    quantity: 1,
					    price: price && price.list ? price.list : 0,
					    discountAmount: price && price.list && price.sale ? price.list - price.sale : 0,
					    currency: blade.currentEntity.currency
					};
                    blade.currentEntity.items.push(newLineItem);
                    blade.recalculateFn();
                    $scope.pageSettings.totalItems = blade.currentEntity.items.length;
                });
            });
        });
    };

    $scope.openItemDynamicProperties = function (item) {
        var blade = {
            id: "dynamicPropertiesList",
            currentEntity: item,
            controller: 'platformWebApp.propertyValueListController',
            template: '$(Platform)/Scripts/app/dynamicProperties/blades/propertyValue-list.tpl.html'
        };
        bladeNavigationService.showBlade(blade, $scope.blade);
    };

    $scope.openLineItemDetailModal = function (item) {
        moduleDialogService.showLineItemDialog({
            id: "ProductConfiguration",
            title: "Product Configuration",
            productConfigurationRequest: item,
            messageValues: { memberType: item },
        });
    };

    $scope.openItemDetail = function (item) {
        //TODO add if for product configurations

        if (item.name == 'Custom Configuration') {
            var newBlade = {
                currentEntityId: item.productConfigurationRequestId,
                controller: 'virtoCommerce.productConfigurationModule.productConfigurationDetailController',
                template: 'Modules/$(VirtoCommerce.ProductConfiguration)/Scripts/blades/product-configuration-detail.tpl.html'
            };
            bladeNavigationService.showBlade(newBlade, $scope.blade);
        }
        else{
            var newBlade = {
                id: "listItemDetail",
                itemId: item.productId,
                title: item.name,
                controller: 'virtoCommerce.catalogModule.itemDetailController',
                template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/item-detail.tpl.html'
            };
            bladeNavigationService.showBlade(newBlade, $scope.blade);
        }
    };

    function openAddEntityWizard() {
        var options = {
            checkItemFn: function (listItem, isSelected) {
                if (isSelected) {
                    if (_.all(selectedProducts, function (x) { return x.id != listItem.id; })) {
                        selectedProducts.push(listItem);
                    }
                }
                else {
                    selectedProducts = _.reject(selectedProducts, function (x) { return x.id == listItem.id; });
                }
            }
        };
        var newBlade = {
            id: "CatalogItemsSelect",
            currentEntities: blade.currentEntity,
            title: "orders.blades.catalog-items-select.title",
            controller: 'virtoCommerce.catalogModule.catalogItemSelectController',
            template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/common/catalog-items-select.tpl.html',
            options: options,
            breadcrumbs: [],
            toolbarCommands: [
			  {
			      name: "orders.commands.add-selected", icon: 'fa fa-plus',
			      executeMethod: function (blade) {
			          addProductsToOrder(selectedProducts);
			          selectedProducts.length = 0;
			          bladeNavigationService.closeBlade(blade);

			      },
			      canExecuteMethod: function () {
			          return selectedProducts.length > 0;
			      }
			  }]
        };
        bladeNavigationService.showBlade(newBlade, $scope.blade);
    }

    blade.toolbarCommands = [
        {
            name: "orders.commands.add-catalog-item", icon: 'fa fa-plus',
            executeMethod: function () {
                if (!blade.isLocked) { 
                    openAddEntityWizard();
                }
            },
            canExecuteMethod: function () {
                return blade.currentEntity.operationType === 'CustomerOrder' && !blade.isLocked;
            },
            permission: blade.updatePermission
        },
        {
            name: "orders.commands.add-product-configuration", icon: 'fa fa-plus',
            executeMethod: function () {
                if (!blade.isLocked) {
                    var dialog = {
                        id: "confirmAddProductConfiguration",
                        title: "orders.dialogs.orders-cpc.title",
                        message: "orders.dialogs.orders-cpc.message",
                        callback: function (cpc) {
                            openAddProductConfigurationWizard();
                        }
                    }
                    dialogService.showConfirmationDialog(dialog);
                }
            },
            canExecuteMethod: function () {
                return blade.currentEntity.operationType === 'CustomerOrder' && !blade.isLocked;
            },
            permission: blade.updatePermission
        },
        {
            name: "platform.commands.remove", icon: 'fa fa-trash-o',
            executeMethod: function () {
                var lineItems = blade.currentEntity.items;
                blade.currentEntity.items = _.difference(lineItems, _.filter(lineItems, function (x) { return x.selected }));
                blade.recalculateFn();
                $scope.pageSettings.totalItems = blade.currentEntity.items.length;
            },
            canExecuteMethod: function () {
                return _.any(blade.currentEntity.items, function (x) { return x.selected; });;
            },
            permission: blade.updatePermission
        }
    ];

    //$scope.$watch('pageSettings.currentPage', function (newPage) {
    //    blade.refresh();
    //});

    $scope.checkAll = function (selected) {
        angular.forEach(blade.currentEntity.items, function (item) {
            item.selected = selected;
        });
    };

    blade.refresh();

}]);