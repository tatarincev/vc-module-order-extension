using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.OrderModule.Data.Model;
using VirtoCommerce.Domain.Order.Model;
using VirtoCommerce.Platform.Core.Common;
using System.Collections.ObjectModel;

namespace VirtoCommerce.OrderExtModule.Web.Model {
    public class ShipmentExtensionEntity : ShipmentEntity {

        public bool IsCommercial { get; set; }
        public bool HasLoadingDock { get; set; }

        public override OrderOperation ToModel(OrderOperation shipment) {
            var result = base.ToModel(shipment);

            var shipment2 = result as ShipmentExtension;
            shipment2.IsCommercial = this.IsCommercial;
            shipment2.HasLoadingDock = this.HasLoadingDock;

            //shipment2.Items = this.Items.Select(x => x.ToModel(AbstractTypeFactory<ShipmentItem>.TryCreateInstance())).ToList();

            return shipment2;
        }

        public override OperationEntity FromModel(OrderOperation shipment, PrimaryKeyResolvingMap pkMap) {
            base.FromModel(shipment, pkMap);

            var shipment2 = shipment as ShipmentExtension;
            this.IsCommercial = shipment2.IsCommercial;
            this.HasLoadingDock = shipment2.HasLoadingDock;

            //if (shipment2.Items != null) {
            //    this.Items = new ObservableCollection<ShipmentItemEntity>(shipment2.Items.Select(x => AbstractTypeFactory<ShipmentItemEntity>.TryCreateInstance().FromModel(x, pkMap)));
            //}

            return this;
        }

        public override void Patch(OperationEntity target) {
            base.Patch(target);
            var shipmentExtensionEntity = target as ShipmentExtensionEntity;
            shipmentExtensionEntity.IsCommercial = this.IsCommercial;
            shipmentExtensionEntity.HasLoadingDock = this.HasLoadingDock;
        }
    }
}