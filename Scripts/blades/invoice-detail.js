angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.invoiceDetailController', ['$scope', 'platformWebApp.bladeNavigationService', 'platformWebApp.dialogService', 'platformWebApp.settings', 'virtoCommerce.customerModule.members',
    function ($scope, bladeNavigationService, dialogService, settings, members) {
        var blade = $scope.blade;

        if (blade.isNew) {
            blade.title = 'New invoice';

            var foundField = _.findWhere(blade.metaFields, { name: 'createdDate' });
            if (foundField) {
                foundField.isReadonly = false;
            }

            blade.initialize({
                operationType: "Invoice",
                status: 'New',
                number: "INV60826-00000",
                createdDate: new Date(),
                isApproved: true,
                currency: 'USD'
            });
        } else {
            blade.title = 'invoice details';
            blade.subtitle = 'sample';
        }

        blade.currentStore = _.findWhere(blade.parentBlade.stores, { id: blade.customerOrder.storeId });
        blade.realOperationsCollection = blade.customerOrder.invoices;

        blade.statuses = settings.getValues({ id: 'Invoice.Status' });
        blade.openStatusSettingManagement = function () {
            var newBlade = new DictionarySettingDetailBlade('Invoice.Status');
            newBlade.parentRefresh = function (data) {
                blade.statuses = data;
            };
            bladeNavigationService.showBlade(newBlade, blade);
        };

        //// load customers
        //members.search(
        //   {
        //       memberType: 'Contact',
        //       sort: 'fullName:asc',
        //       take: 5000
        //   },
        //   function (data) {
        //       blade.contacts = data.results;
        //   });

        //blade.resetCustomerName = function (newVal) {
        //    blade.currentEntity.customerName = newVal ? newVal.fullName : undefined;
        //};

        //// load employees
        //members.search(
        //   {
        //       memberType: 'Employee',
        //       sort: 'fullName:asc',
        //       take: 5000
        //   },
        //   function (data) {
        //       blade.employees = data.results;
        //   });

        //blade.resetEmployeeName = function (newVal) {
        //    blade.currentEntity.employeeName = newVal ? newVal.fullName : undefined;
        //};

        //// load organizations
        //members.search(
        //   {
        //       memberType: 'Organization',
        //       sort: 'fullName:asc',
        //       take: 5000
        //   },
        //   function (data) {
        //       blade.organizations = data.results;
        //   });

        //blade.resetOrganizationName = function (newVal) {
        //    blade.currentEntity.organizationName = newVal ? newVal.fullName : undefined;
        //};
    }]);