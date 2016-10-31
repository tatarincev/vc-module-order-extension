using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Model;
using VirtoCommerce.Domain.ProductConfiguration.Model;
using VirtoCommerce.OrderModule.Data.Model;
using VirtoCommerce.Platform.Core.Common;

namespace VirtoCommerce.OrderExtModule.Web.Model
{
    public class CustomerOrderExtensionEntity : CustomerOrderEntity
    {
        public CustomerOrderExtensionEntity()
        {
            Invoices = new NullCollection<InvoiceEntity>();
        }

        public virtual ObservableCollection<InvoiceEntity> Invoices { get; set; }

        
        public override OrderOperation ToModel(OrderOperation operation)
        {
            var customerOrderExtension = operation as CustomerOrderExtension;

            if (customerOrderExtension != null)
            {
                customerOrderExtension.Invoices = this.Invoices.Select(x => x.ToModel(new Invoice())).OfType<Invoice>().ToList();
            }

            base.ToModel(operation);

            return operation;
        }

        public override OperationEntity FromModel(OrderOperation operation, PrimaryKeyResolvingMap pkMap)
        {
            var customerOrderExtension = operation as CustomerOrderExtension;
            if (customerOrderExtension != null)
            {
                if (customerOrderExtension.Invoices != null)
                {
                    this.Invoices = new ObservableCollection<InvoiceEntity>(customerOrderExtension.Invoices.Select(x => new InvoiceEntity().FromModel(x, pkMap)).OfType<InvoiceEntity>());
                }
            }

            base.FromModel(operation, pkMap);

            return this;
        }

        public override void Patch(OperationEntity operation)
        {
            var target = operation as CustomerOrderExtensionEntity;
            if (target != null)
            {
                if (!this.Invoices.IsNullCollection())
                {
                    this.Invoices.Patch(target.Invoices, (sourceInvoice, targetInvoice) => sourceInvoice.Patch(targetInvoice));
                }
            }

            base.Patch(operation);
        }

    }
}