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
            var retVal = base.ToModel(lineItem) as OrderLineItemExtension;

            return lineItem;
        }

        public override LineItemEntity FromModel(LineItem lineItem, PrimaryKeyResolvingMap pkMap) {
            var retVal = base.FromModel(lineItem, pkMap) as OrderLineItemExtensionEntity;

            return this;
        }

        public override void Patch(LineItemEntity target) {
            base.Patch(target);

            var customerOrderLineItemExtensionEntity = target as OrderLineItemExtensionEntity;
        }
    }
}