using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using VirtoCommerce.OrderExtModule.Web.Model;
using VirtoCommerce.Domain.Order.Model;
using VirtoCommerce.OrderModule.Data.Model;
using VirtoCommerce.OrderModule.Data.Repositories;
using VirtoCommerce.Platform.Data.Infrastructure.Interceptors;


namespace VirtoCommerce.OrderExtModule.Web
{
    public class OrderExtensionRepository : OrderRepositoryImpl
    {
        public OrderExtensionRepository()
        {
        }

        public OrderExtensionRepository(string nameOrConnectionString, params IInterceptor[] interceptors)
            : base(nameOrConnectionString, interceptors)
        {
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            #region CustomerOrderExtension
            modelBuilder.Entity<CustomerOrderExtensionEntity>().HasKey(x => x.Id)
                .Property(x => x.Id);
            modelBuilder.Entity<CustomerOrderExtensionEntity>().ToTable("CustomerOrderExtension");
            #endregion

            #region Invoice
            modelBuilder.Entity<InvoiceEntity>().HasKey(x => x.Id)
            .Property(x => x.Id);
            modelBuilder.Entity<InvoiceEntity>().ToTable("OrderInvoice");

            modelBuilder.Entity<InvoiceEntity>().HasRequired(m => m.CustomerOrderExtension)
                                                 .WithMany(m => m.Invoices).HasForeignKey(m => m.CustomerOrderExtensionId)
                                                 .WillCascadeOnDelete(true);
            #endregion

            #region OrderLineItemExtension
            modelBuilder.Entity<OrderLineItemExtensionEntity>().HasKey(x => x.Id)
                .Property(x => x.Id);
            modelBuilder.Entity<OrderLineItemExtensionEntity>().ToTable("OrderLineItemExtension");
            #endregion

            base.OnModelCreating(modelBuilder);
        }


        public IQueryable<CustomerOrderExtensionEntity> CustomerOrdersExtended
        {
            get { return GetAsQueryable<CustomerOrderExtensionEntity>(); }
        }

        public IQueryable<InvoiceEntity> Invoices
        {
            get { return GetAsQueryable<InvoiceEntity>(); }
        }

        public IQueryable<OrderLineItemExtensionEntity> OrderLineItemExtended {
            get { return GetAsQueryable<OrderLineItemExtensionEntity>(); }
        }

        public override CustomerOrderEntity[] GetCustomerOrdersByIds(string[] ids, CustomerOrderResponseGroup responseGroup)
        {
            var retVal = base.GetCustomerOrdersByIds(ids, responseGroup);
            var invoices = Invoices.Where(x => ids.Contains(x.CustomerOrderExtensionId)).ToArray();
            return retVal;
        }

    }
}