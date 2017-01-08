using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Model;

namespace VirtoCommerce.OrderExtModule.Web.Model {

    public class ShipmentExtension : Shipment {

        public bool IsCommercial { get; set; }
        public bool HasLoadingDock { get; set; }

    }

}