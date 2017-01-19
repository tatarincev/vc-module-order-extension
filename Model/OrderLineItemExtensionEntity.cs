using Omu.ValueInjecter;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Model;
using VirtoCommerce.OrderModule.Data.Model;
using VirtoCommerce.Platform.Core.Common;

namespace VirtoCommerce.OrderExtModule.Web.Model {
    public class OrderLineItemExtensionEntity : LineItemEntity {

        [StringLength(128)]
        public string ProductConfigurationRequestId { get; set; }

        public override LineItem ToModel(LineItem lineItem) {

            return base.ToModel(lineItem);
        }

        public override LineItemEntity FromModel(LineItem lineItem, PrimaryKeyResolvingMap pkMap) {
            return base.FromModel(lineItem, pkMap);
        }

        public override void Patch(LineItemEntity target) {
            base.Patch(target);

            var orderLineItemExtensionEntity = target as OrderLineItemExtensionEntity;
            orderLineItemExtensionEntity.ProductConfigurationRequestId = this.ProductConfigurationRequestId;
        }
    }
}