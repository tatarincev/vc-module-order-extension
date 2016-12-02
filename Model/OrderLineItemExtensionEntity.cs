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
            // Here you can write code for custom mapping
            // supplier properties will be mapped in base method implementation by using value injection
            var retVal = base.ToModel(lineItem) as OrderLineItemExtension;

            return retVal;
        }

        public override LineItemEntity FromModel(LineItem lineItem, PrimaryKeyResolvingMap pkMap) {
            var retVal = base.FromModel(lineItem, pkMap) as OrderLineItemExtensionEntity;

            return retVal;
        }

        public override void Patch(LineItemEntity target) {
            base.Patch(target);

            var orderLineItemExtensionEntity = target as OrderLineItemExtensionEntity;
            orderLineItemExtensionEntity.ProductConfigurationRequestId = this.ProductConfigurationRequestId;
        }
    }
}