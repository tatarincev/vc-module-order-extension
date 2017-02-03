using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Services;
using VirtoCommerce.Domain.Store.Services;
using VirtoCommerce.Domain.ProductConfiguration.Services;
using VirtoCommerce.OrderExtModule.Web.Model;
using VirtoCommerce.OrderModule.Data.Services;
using orderModel = VirtoCommerce.Domain.Order.Model;
using cartModel = VirtoCommerce.Domain.Cart.Model;
using VirtoCommerce.Platform.Core.Common;
using VirtoCommerce.Domain.Commerce.Model;
using VirtoCommerce.CartExtModule.Web.Model;
using VirtoCommerce.Domain.ProductConfiguration.Model;

namespace VirtoCommerce.OrderExtModule.Web.Services {

    /// <summary>
    /// Override the original CustomerOrderBuilderImpl to copy extended fields which added in this module
    /// </summary>
    public class CustomerOrderBuilderExtImpl : CustomerOrderBuilderImpl
    {
        private ICustomerOrderService _customerOrderService;
        private IStoreService _storeService;
        private IProductConfigurationRequestService _productConfigurationRequestService;

        public CustomerOrderBuilderExtImpl(ICustomerOrderService customerOrderService, IStoreService storeService) : base(customerOrderService, storeService)
        {
            _storeService = storeService;
            _customerOrderService = customerOrderService;
        }

        protected override orderModel.CustomerOrder ConvertCartToOrder(cartModel.ShoppingCart cart)
        {
            var retVal = base.ConvertCartToOrder(cart);
            //TODO: Invoices 
            return retVal;
        }

        protected override orderModel.Shipment ToOrderModel(cartModel.Shipment shipment)
        {
            var shipment2 = base.ToOrderModel(shipment) as Model.ShipmentExtension;
            if (shipment2 != null)
            {
                shipment2.HasLoadingDock = shipment2.HasLoadingDock;
                shipment2.IsCommercial = shipment2.IsCommercial;
                shipment2.Comment = shipment2.Comment;
            }
            return shipment2;
        }

        protected override orderModel.LineItem ToOrderModel(cartModel.LineItem lineItem)
        {
            var cartLineItem2 = lineItem as CartExtModule.Web.Model.CartLineItemExtension;
            var orderLineItem2 = base.ToOrderModel(lineItem) as Model.OrderLineItemExtension;

            if (orderLineItem2 != null)
            {
                orderLineItem2.ProductConfigurationRequestId = cartLineItem2.ProductConfigurationRequestId;
            }

            if (!string.IsNullOrEmpty(cartLineItem2.ProductConfigurationRequestId))
            {
                //ProductConfigurationRequest lineItemCPC = _productConfigurationRequestService.GetByIds(orderLineItem2.ProductConfigurationRequestId).FirstOrDefault();
                //if (lineItemCPC != null)
                //{
                //    lineItemCPC.Id = null;
                //    lineItemCPC.OrderLineItemId = customerOrder.Id; //need to assign the right order id
                //    lineItemCPC.CartLineItemId = null;
                //    lineItemCPC.QuoteLineItemId = null;
                //    lineItemCPC.ProductConfiguration.Id = null;
                //    lineItemCPC.Number = null;
                //    lineItemCPC.Status = "Ordered";
                //    lineItemCPC.CreatedDate = DateTime.UtcNow;
                //    lineItemCPC.ModifiedDate = null;
                //    lineItemCPC.ProductConfiguration.LineItems = lineItemCPC.ProductConfiguration.LineItems.Select(c => { c.Id = null; return c; }).ToList();

                //    var resultCPC = _productConfigurationRequestService.SaveChanges(updateCPCList.ToArray());
                //    extItem.ProductConfigurationRequestId = resultCPC.First().Id;
                //}

            }
            return orderLineItem2;
        }
    }
}
