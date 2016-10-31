using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.OrderModule.Data.Model;

namespace VirtoCommerce.OrderExtModule.Web.Model
{
    public class InvoiceEntity : OperationEntity
    {
        public string CustomerId { get; set; }
        public string CustomerName { get; set; }


        public CustomerOrderExtensionEntity CustomerOrderExtension { get; set; }

        public string CustomerOrderExtensionId { get; set; }

        public override void Patch(OperationEntity operation)
        {
            base.Patch(operation);

            var target = operation as InvoiceEntity;
            if (target == null)
                throw new NullReferenceException("target");

            target.CustomerId = this.CustomerId;
            target.CustomerName = this.CustomerName;
        }
    }
}