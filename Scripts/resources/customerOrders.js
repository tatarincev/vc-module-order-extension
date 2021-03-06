﻿angular.module('virtoCommerce.orderModule')
.factory('virtoCommerce.orderModule.order_res_customerOrders', ['$resource', function ($resource) {
    return $resource('api/order/customerOrders/:id', { id: '@Id' }, {
        search: { method: 'POST', url: 'api/order/customerOrders/search' },
        getNewShipment: { url: 'api/order/customerOrders/:id/shipments/new' },
        getNewPayment: { url: 'api/order/customerOrders/:id/payments/new' },
        recalculate: { method: 'PUT', url: 'api/order/customerOrders/recalculate' },
        update: { method: 'PUT', url: 'api/order/customerOrders' },
        getDashboardStatistics: { url: 'api/order/dashboardStatistics' }
    });
}])
.factory('virtoCommerce.orderModule.stripe_res', ['$resource', function ($resource) {
    return $resource('api/stripe', { orderId: '@Id'}, {
        capturePayment: { url: 'api/stripe/capture-payment/:orderId' },
        refundPayment: { url: 'api/stripe/refund-payment/:orderId' }
    });

}]);