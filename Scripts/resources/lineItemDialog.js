angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.confirmDialogController', ['$scope', '$modalInstance', 'dialog', '$sce', function ($scope, $modalInstance, dialog, $sce) {
    angular.extend($scope, dialog);

    $scope.yes = function () {
        $modalInstance.close(true);
    };

    $scope.no = function () {
        $modalInstance.close(false);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.toTrustedHTML = function (html) {
        return $sce.trustAsHtml(html);
    }

}])
.controller('virtoCommerce.orderModule.invoiceDialogController', ['$scope', '$modalInstance', 'dialog', '$sce', function ($scope, $modalInstance, dialog, $sce) {
    angular.extend($scope, dialog);
    
    $scope.yes = function () {
        $modalInstance.close(true);
    };

    $scope.no = function () {
        $modalInstance.close(false);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.toTrustedHTML = function (html) {
        return $sce.trustAsHtml(html);
    }

    $scope.printInvoice = function (html) {
        printElement(document.getElementById("invoice-detail"));
    }

    $scope.sendEmail = function (html) {
        
    }

    function printElement(elem, append, delimiter) {
        var domClone = elem.cloneNode(true);

        var $printSection = document.getElementById("printSection");

        if (!$printSection) {
            var $printSection = document.createElement("div");
            $printSection.id = "printSection";
            document.body.appendChild($printSection);
        }

        if (append !== true) {
            $printSection.innerHTML = "";
        }

        else if (append === true) {
            if (typeof (delimiter) === "string") {
                $printSection.innerHTML += delimiter;
            }
            else if (typeof (delimiter) === "object") {
                $printSection.appendChlid(delimiter);
            }
        }

        $printSection.appendChild(domClone);
        window.print();
        $printSection.remove();
    }

}])
.factory('virtoCommerce.orderModule.dialogService', ['$rootScope', '$modal', function ($rootScope, $modal) {

    var dialogService = {
        dialogs: [],
        currentDialog: undefined
    };

    function findDialog(id) {
        var found;
        angular.forEach(dialogService.dialogs, function (dialog) {
            if (dialog.id == id) {
                found = dialog;
            }
        });

        return found;
    }

    dialogService.showDialog = function (dialog, templateUrl, controller, cssClass) {
        var dlg = findDialog(dialog.id);

        if (angular.isUndefined(dlg)) {
            dlg = dialog;

            dlg.instance = $modal.open({
                templateUrl: templateUrl,
                controller: controller,
                windowClass: cssClass ? cssClass : null,
                resolve: {
                    dialog: function () {
                        return dialog;
                    }
                }
            });

            dlg.instance.result.then(function (result) //success
            {
                var idx = dialogService.dialogs.indexOf(dlg);
                dialogService.dialogs.splice(idx, 1);
                if (dlg.callback)
                    dlg.callback(result);
            }, function (reason) //dismiss
            {
                var idx = dialogService.dialogs.indexOf(dlg);
                dialogService.dialogs.splice(idx, 1);
            });

            dialogService.dialogs.push(dlg);
        }
    };

    dialogService.showLineItemDialog = function (dialog) {
        dialogService.showDialog(dialog, 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/dialogs/lineItemDialog.tpl.html', 'virtoCommerce.orderModule.confirmDialogController', 'cpc-modal-window');
    };

    dialogService.showInvoiceDialog = function (dialog) {
        dialogService.showDialog(dialog, 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/dialogs/invoice-dialog.tpl.html', 'virtoCommerce.orderModule.invoiceDialogController', 'invoice-modal-window');
    };

    return dialogService;

}])
