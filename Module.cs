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

         
        }

        public override void PostInitialize()
        {
            base.Initialize();
            AbstractTypeFactory<IOperation>.OverrideType<CustomerOrder, CustomerOrderExtension>();
            AbstractTypeFactory<CustomerOrderEntity>.OverrideType<CustomerOrderEntity, CustomerOrderExtensionEntity>();
            AbstractTypeFactory<CustomerOrder>.OverrideType<CustomerOrder, CustomerOrderExtension>()
                                           .WithFactory(() => new CustomerOrderExtension { OperationType = "CustomerOrder" });
            //Thats need for PolymorphicOperationJsonConverter for API deserialization
            AbstractTypeFactory<IOperation>.RegisterType<Invoice>();
        }
     
        #endregion
    }
}