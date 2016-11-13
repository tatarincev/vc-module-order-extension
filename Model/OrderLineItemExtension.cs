using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Model;
using VirtoCommerce.Domain.ProductConfiguration.Model;

namespace VirtoCommerce.OrderExtModule.Web.Model {
    public class OrderLineItemExtension : LineItem {

        public string ProductConfigurationRequestId { get; set; }

    }
}