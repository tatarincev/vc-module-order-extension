using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Services;
using VirtoCommerce.Domain.Store.Services;
using VirtoCommerce.OrderExtModule.Web.Model;
using VirtoCommerce.OrderModule.Data.Services;
using orderModel = VirtoCommerce.Domain.Order.Model;
using cartModel = VirtoCommerce.Domain.Cart.Model;
using VirtoCommerce.Platform.Core.Common;
using VirtoCommerce.Domain.Commerce.Model;
using VirtoCommerce.CartExtModule.Web.Model;

namespace VirtoCommerce.OrderExtModule.Web.Services {

    /// <summary>
    /// Override the original CustomerOrderBuilderImpl to copy extended fields which added in this module
    /// </summary>
    public class CustomerOrderBuilderExtImpl : CustomerOrderBuilderImpl {
        private ICustomerOrderService _customerOrderService;
        private IStoreService _storeService;

        public CustomerOrderBuilderExtImpl(ICustomerOrderService customerOrderService, IStoreService storeService) : base(customerOrderService, storeService) {
            _storeService = storeService;
            _customerOrderService = customerOrderService;
        }

        public override orderModel.CustomerOrder PlaceCustomerOrderFromCart(cartModel.ShoppingCart cart) {
            var customerOrder = ConvertCartToOrder(cart);
            try {
                _customerOrderService.SaveChanges(new[] { customerOrder });
            } catch (Exception ex) {
                Console.Write(ex.Message);
            }

            customerOrder = _customerOrderService.GetByIds(new[] { customerOrder.Id }).FirstOrDefault();

            //Redistribute order line items to shipment if cart shipment items empty 
            var shipment = customerOrder.Shipments.FirstOrDefault();
            if (shipment != null && shipment.Items.IsNullOrEmpty()) {
                int i = 0;
                foreach (var lineItem in customerOrder.Items) {
                    try {
                        shipment.Items = new List<orderModel.ShipmentItem>();
                        shipment.Items.Add(new orderModel.ShipmentItem { LineItemId = lineItem.Id, LineItem = lineItem, Quantity = lineItem.Quantity });
                    } catch (Exception e) {
                        Console.Write(e.Message);
                    }

                    i++;
                }
            }

            try {
                _customerOrderService.SaveChanges(new[] { customerOrder });
            } catch (Exception ex) {
                Console.Write(ex.Message);
            }

            customerOrder = _customerOrderService.GetByIds(new[] { customerOrder.Id }).FirstOrDefault();

            return customerOrder;
        }

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

        //protected override orderModel.LineItem ToOrderModel(VirtoCommerce.Domain.Cart.Model.LineItem lineItem) {
        //    var result = base.ToOrderModel(lineItem) as OrderLineItemExtension;

        //    if (result != null) {
        //        //Next lines just copy OuterId from cart LineItem2 to order LineItem2
        //        var cartLineItem2 = lineItem as CartLineItemExtension;
        //        if (cartLineItem2 != null) {
        //            result.ProductConfigurationRequestId = cartLineItem2.ProductConfigurationRequestId;
        //        }
        //    }
        //    return result;
        //}

    }
}
