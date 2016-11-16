//Call this to register our module to main application
var moduleName = "virtoCommerce.orderExtension";

if (AppDependencies != undefined) {
    AppDependencies.push(moduleName);
}

angular.module(moduleName, [])
.run(
  ['virtoCommerce.orderModule.knownOperations', '$http', '$compile',
	function (knownOperations, $http, $compile) {

	    var foundTemplate = knownOperations.getOperation('CustomerOrder');
	    if (foundTemplate) {
	        //foundTemplate.detailBlade.metaFields.push(
            //    {
            //        name: 'newField',
            //        title: "New field",
            //        valueType: "ShortText"
            //    });

	        foundTemplate.detailBlade.knownChildrenOperations.push('Invoice');
	    }

	    var invoiceOperation = {
	        type: 'Invoice',
	        description: 'Sample Invoice document',
	        treeTemplateUrl: 'invoiceOperation.tpl.html',
	        detailBlade: {
	            template: 'Modules/$(VirtoCommerce.OrderExtension)/Scripts/blades/invoice-detail.tpl.html',
	            metaFields: [
                    {
                        name: 'number',
                        isRequired: true,
                        title: "Invoice number",
                        valueType: "ShortText"
                    },
                    {
                        name: 'createdDate',
                        isReadonly: true,
                        title: "created",
                        valueType: "DateTime"
                    }
	            ]
	        }
	    };
	    knownOperations.registerOperation(invoiceOperation);

	    $http.get('Modules/$(VirtoCommerce.OrderExtension)/Scripts/tree-template.html').then(function (response) {
	        // compile the response, which will put stuff into the cache
	        $compile(response.data);
	    });
	}]);