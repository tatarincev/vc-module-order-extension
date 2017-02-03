using System;
using Microsoft.Practices.Unity;
using VirtoCommerce.OrderExtModule.Web.Model;
using VirtoCommerce.Domain.Commerce.Model;
using VirtoCommerce.Domain.Order.Model;
using VirtoCommerce.OrderModule.Data.Model;
using VirtoCommerce.OrderModule.Data.Repositories;
using VirtoCommerce.Platform.Core.Common;
using VirtoCommerce.Platform.Core.Modularity;
using VirtoCommerce.Platform.Data.Infrastructure;
using VirtoCommerce.Platform.Data.Infrastructure.Interceptors;
using VirtoCommerce.OrderExtModule.Web.Migrations;
using VirtoCommerce.OrderModule.Data.Services;
using VirtoCommerce.OrderExtModule.Web.Services;
using VirtoCommerce.Domain.Order.Services;

namespace VirtoCommerce.OrderExtModule.Web
{
    public class Module : ModuleBase
    {
        private const string _connectionStringName = "VirtoCommerce";
        private readonly IUnityContainer _container;

        public Module(IUnityContainer container)
        {
            _container = container;
        }
        #region IModule Members

        public override void SetupDatabase()
        {
            using (var db = new OrderExtensionRepository(_connectionStringName, _container.Resolve<AuditableInterceptor>()))
            {
                var initializer = new SetupDatabaseInitializer<OrderExtensionRepository, Configuration>();
                initializer.InitializeDatabase(db);
            }

            
        }

        public override void Initialize()
        {
            base.Initialize();

            _container.RegisterType<IOrderRepository>(new InjectionFactory(c => new OrderExtensionRepository(_connectionStringName, _container.Resolve<AuditableInterceptor>(), new EntityPrimaryKeyGeneratorInterceptor())));
            //Override ICustomerOrderBuilder default implementation
            _container.RegisterType<ICustomerOrderBuilder, CustomerOrderBuilderExtImpl>();
            // _container.RegisterType<ICustomerOrderService, CustomerOrderServiceExtImpl>();

        }

        public override void PostInitialize()
        {
            base.PostInitialize();
            AbstractTypeFactory<IOperation>.OverrideType<CustomerOrder, CustomerOrderExtension>();
            AbstractTypeFactory<CustomerOrderEntity>.OverrideType<CustomerOrderEntity, CustomerOrderExtensionEntity>();
            AbstractTypeFactory<CustomerOrder>.OverrideType<CustomerOrder, CustomerOrderExtension>()
                                           .WithFactory(() => new CustomerOrderExtension { OperationType = "CustomerOrder" });

            AbstractTypeFactory<LineItem>.OverrideType<LineItem, OrderLineItemExtension>();
            AbstractTypeFactory<LineItemEntity>.OverrideType<LineItemEntity, OrderLineItemExtensionEntity>();

            AbstractTypeFactory<Shipment>.OverrideType<Shipment, ShipmentExtension>();
            AbstractTypeFactory<ShipmentEntity>.OverrideType<ShipmentEntity, ShipmentExtensionEntity>();

            //Thats need for PolymorphicOperationJsonConverter for API deserialization
            AbstractTypeFactory<IOperation>.RegisterType<Invoice>();
            AbstractTypeFactory<IOperation>.RegisterType<ShipmentExtension>();
        }
     
        #endregion
    }
}