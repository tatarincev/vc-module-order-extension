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
    public class CustomerOrderBuilderExtImpl : CustomerOrderBuilderImpl {
        private ICustomerOrderService _customerOrderService;
        private IStoreService _storeService;
        private IProductConfigurationRequestService _productConfigurationRequestService;

        public CustomerOrderBuilderExtImpl(ICustomerOrderService customerOrderService, IStoreService storeService, IProductConfigurationRequestService productConfigurationRequestService) : base(customerOrderService, storeService) {
            _storeService = storeService;
            _customerOrderService = customerOrderService;
            _productConfigurationRequestService = productConfigurationRequestService;
        }

        public override orderModel.CustomerOrder PlaceCustomerOrderFromCart(cartModel.ShoppingCart cart) {
            var customerOrder = ConvertCartToOrder(cart);
            try {
                _customerOrderService.SaveChanges(new[] { customerOrder });
            } catch (Exception ex) {
                Console.Write(ex.Message);
            }

            customerOrder = _customerOrderService.GetByIds(new[] { customerOrder.Id }).FirstOrDefault();

            ////Redistribute order line items to shipment if cart shipment items empty 
            //var shipment = customerOrder.Shipments.FirstOrDefault();
            //if (customerOrder.Shipments.Any() && shipment.Items.IsNullOrEmpty()) {

            //    int i = 0;
            //    foreach (var lineItem in customerOrder.Items) {
            //        try {
            //            shipment.Items = new List<orderModel.ShipmentItem>();
            //            shipment.Items.Add(new orderModel.ShipmentItem { LineItemId = lineItem.Id, LineItem = lineItem, Quantity = lineItem.Quantity });
            //        } catch (Exception e) {
            //            Console.Write(e.Message);
            //        }

            //        i++;
            //    }
            //}

            //try {
            //    _customerOrderService.SaveChanges(new[] { customerOrder });
            //} catch (Exception ex) {
            //    Console.Write(ex.Message);
            //}

            //customerOrder = _customerOrderService.GetByIds(new[] { customerOrder.Id }).FirstOrDefault();

            //TODO clone product configurations from line items that are and reassign them their new CPC number.
            foreach (var item in customerOrder.Items) {
                List<ProductConfigurationRequest> updateCPCList = new List<ProductConfigurationRequest>();
                var extItem = item as OrderLineItemExtension;

                if (!string.IsNullOrEmpty(extItem.ProductConfigurationRequestId)) {
                    ProductConfigurationRequest lineItemCPC = _productConfigurationRequestService.GetByIds(extItem.ProductConfigurationRequestId).FirstOrDefault();
                    if (lineItemCPC != null) {
                        lineItemCPC.Id = null;
                        lineItemCPC.OrderLineItemId = customerOrder.Id; //need to assign the right order id
                        lineItemCPC.CartLineItemId = null;
                        lineItemCPC.QuoteLineItemId = null;
                        lineItemCPC.ProductConfiguration.Id = null;
                        lineItemCPC.Number = null;
                        lineItemCPC.Status = "Ordered";
                        lineItemCPC.CreatedDate = DateTime.UtcNow;
                        lineItemCPC.ModifiedDate = null;
                        lineItemCPC.ProductConfiguration.LineItems = lineItemCPC.ProductConfiguration.LineItems.Select(c => { c.Id = null; return c; }).ToList();

                        updateCPCList.Add(lineItemCPC);
                        var resultCPC = _productConfigurationRequestService.SaveChanges(updateCPCList.ToArray());
                        extItem.ProductConfigurationRequestId = resultCPC.First().Id;
                    }
                }
            }

            return customerOrder;
        }

        //protected override orderModel.ShipmentItem ToOrderModel(cartModel.ShipmentItem shipmentItem) {
        //    var result = base.ToOrderModel(shipmentItem) as orderModel.ShipmentItem;

        //    return result;
        //}

        //protected override orderModel.PaymentIn ToOrderModel(cartModel.Payment payment) {
        //    var result = base.ToOrderModel(payment) as orderModel.PaymentIn;

        //    return result;
        //}

        protected override orderModel.CustomerOrder ConvertCartToOrder(cartModel.ShoppingCart cart) {
            var retVal = AbstractTypeFactory<orderModel.CustomerOrder>.TryCreateInstance();

            retVal.Comment = cart.Comment;
            retVal.Currency = cart.Currency;
            retVal.ChannelId = cart.ChannelId;
            retVal.CustomerId = cart.CustomerId;
            retVal.CustomerName = cart.CustomerName;
            retVal.DiscountAmount = cart.DiscountAmount;
            retVal.OrganizationId = cart.OrganizationId;
            retVal.StoreId = cart.StoreId;
            retVal.TaxPercentRate = cart.TaxPercentRate;
            retVal.TaxType = cart.TaxType;

            retVal.Status = "New";

            if (cart.Items != null) {
                retVal.Items = cart.Items.Select(x => ToOrderModel(x)).ToList();
            }
            if (cart.Discounts != null) {
                retVal.Discounts = cart.Discounts.Select(x => ToOrderModel(x)).ToList();
            }

            if (cart.Addresses != null) {
                retVal.Addresses = cart.Addresses.ToList();
            }

            if (cart.Shipments != null) {
                retVal.Shipments = cart.Shipments.Select(x => ToOrderModel(x)).ToList();
                //Add shipping address to order
                retVal.Addresses.AddRange(retVal.Shipments.Where(x => x.DeliveryAddress != null).Select(x => x.DeliveryAddress));
                //Redistribute order line items to shipment if cart shipment items empty 
                //var shipment = retVal.Shipments.FirstOrDefault();
                //if (shipment != null && shipment.Items.IsNullOrEmpty()) {
                //    int i = 0;
                //    foreach (var lineItem in cart.Items) {
                //        try {
                //            shipment.Items = new List<orderModel.ShipmentItem>();
                //            shipment.Items.Add(new orderModel.ShipmentItem { LineItemId = lineItem.Id, Quantity = lineItem.Quantity });
                //        } catch (Exception e) {
                //            Console.Write(e.Message);
                //        }

                //        i++;
                //    }
                //}
            }
            if (cart.Payments != null) {
                retVal.InPayments = new List<orderModel.PaymentIn>();
                foreach (var payment in cart.Payments) {
                    var paymentIn = ToOrderModel(payment);
                    paymentIn.CustomerId = cart.CustomerId;
                    retVal.InPayments.Add(paymentIn);
                    if (payment.BillingAddress != null) {
                        retVal.Addresses.Add(payment.BillingAddress);
                    }
                }
            }

            //Save only disctinct addresses for order
            bool isBillingAndShippingAddress = false;
            if (retVal.Addresses.Distinct().ToList().Count < retVal.Addresses.Count) {
                isBillingAndShippingAddress = true;
            }

            List<Address> newAddresses = new List<Address>();
            foreach (var item in retVal.Addresses) {
                newAddresses.Add(new Address {
                    AddressType = item.AddressType,
                    City = item.City,
                    CountryCode = item.CountryCode,
                    CountryName = item.CountryName,
                    Email = item.Email,
                    FirstName = item.FirstName,
                    LastName = item.LastName,
                    Line2 = item.Line2,
                    MiddleName = item.MiddleName,
                    Name = item.Name,
                    Organization = item.Organization,
                    Phone = item.Phone,
                    PostalCode = item.PostalCode,
                    RegionId = item.RegionId,
                    RegionName = item.RegionName,
                    Zip = item.Zip
                });
            }
            retVal.Addresses = newAddresses.Distinct().ToList();

            if (isBillingAndShippingAddress) {
                retVal.Addresses.FirstOrDefault().AddressType = Domain.Commerce.Model.AddressType.BillingAndShipping;
            }

            retVal.Shipments.FirstOrDefault().DeliveryAddress.AddressType = Domain.Commerce.Model.AddressType.Shipping;
            retVal.InPayments.FirstOrDefault().BillingAddress.AddressType = Domain.Commerce.Model.AddressType.Billing;

            retVal.TaxDetails = cart.TaxDetails;
            return retVal;
        }

        protected override orderModel.Shipment ToOrderModel(cartModel.Shipment shipment) {
            var retVal = AbstractTypeFactory<orderModel.Shipment>.TryCreateInstance();
            retVal.Currency = shipment.Currency;
            retVal.DiscountAmount = shipment.DiscountAmount;
            retVal.Height = shipment.Height;
            retVal.Length = shipment.Length;
            retVal.MeasureUnit = shipment.MeasureUnit;
            retVal.ShipmentMethodCode = shipment.ShipmentMethodCode;
            retVal.ShipmentMethodOption = shipment.ShipmentMethodOption;
            retVal.Sum = shipment.Total;
            retVal.Weight = shipment.Weight;
            retVal.WeightUnit = shipment.WeightUnit;
            retVal.Width = shipment.Width;
            retVal.TaxPercentRate = shipment.TaxPercentRate;
            retVal.DiscountAmount = shipment.DiscountAmount;
            retVal.Price = shipment.Price;
            retVal.Status = "New";
            if (shipment.DeliveryAddress != null) {
                retVal.DeliveryAddress = shipment.DeliveryAddress;
            }
            //if (shipment.Items != null)
            //{
            //    retVal.Items = shipment.Items.Select(x => ToOrderModel(x)).ToList();
            //}
            if (shipment.Discounts != null) {
                retVal.Discounts = shipment.Discounts.Select(x => ToOrderModel(x)).ToList();
            }
            retVal.TaxDetails = shipment.TaxDetails;

            var result = retVal as Model.ShipmentExtension;

            if (result != null) {
                //Next lines just copy OuterId from cart LineItem2 to order LineItem2
                var shipment2 = shipment as CartExtModule.Web.Model.ShipmentExtension;
                if (shipment2 != null) {
                    result.HasLoadingDock = shipment2.HasLoadingDock;
                    result.IsCommercial = shipment2.IsCommercial;
                    result.Comment = shipment2.Comment;
                }
            }
            return result;
        }

        protected override orderModel.LineItem ToOrderModel(cartModel.LineItem lineItem) {

            if (lineItem == null)
                throw new ArgumentNullException("lineItem");

            var retVal = AbstractTypeFactory<orderModel.LineItem>.TryCreateInstance();

            retVal.CatalogId = lineItem.CatalogId;
            retVal.CategoryId = lineItem.CategoryId;
            retVal.Comment = lineItem.Note;
            retVal.Currency = lineItem.Currency;
            retVal.Height = lineItem.Height;
            retVal.ImageUrl = lineItem.ImageUrl;
            retVal.IsGift = lineItem.IsGift;
            retVal.Length = lineItem.Length;
            retVal.MeasureUnit = lineItem.MeasureUnit;
            retVal.Name = lineItem.Name;
            retVal.PriceId = lineItem.PriceId;
            retVal.ProductId = lineItem.ProductId;
            retVal.ProductType = lineItem.ProductType;
            retVal.Quantity = lineItem.Quantity;
            retVal.Sku = lineItem.Sku;
            retVal.TaxPercentRate = lineItem.TaxPercentRate;
            retVal.TaxType = lineItem.TaxType;
            retVal.Weight = lineItem.Weight;
            retVal.WeightUnit = lineItem.WeightUnit;
            retVal.Width = lineItem.Width;

            retVal.DiscountAmount = lineItem.DiscountAmount;
            retVal.Price = lineItem.ListPrice;

            retVal.FulfillmentLocationCode = lineItem.FulfillmentLocationCode;
            retVal.DynamicProperties = null; //to prevent copy dynamic properties from ShoppingCart LineItem to Order LineItem
            if (lineItem.Discounts != null) {
                retVal.Discounts = lineItem.Discounts.Select(x => ToOrderModel(x)).ToList();
            }
            retVal.TaxDetails = lineItem.TaxDetails;

            var result = retVal as Model.OrderLineItemExtension;

            if (result != null) {
                //Next lines just copy OuterId from cart LineItem2 to order LineItem2
                var cartLineItem2 = lineItem as CartExtModule.Web.Model.CartLineItemExtension;
                if (cartLineItem2 != null) {
                    result.ProductConfigurationRequestId = cartLineItem2.ProductConfigurationRequestId;
                }
            }
            return result;
        }

    }
}
