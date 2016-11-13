using System;
using VirtoCommerce.OrderModule.Data.Repositories;
using VirtoCommerce.OrderModule.Data.Services;
using VirtoCommerce.Domain.Customer.Model;
using VirtoCommerce.Platform.Core.DynamicProperties;
using VirtoCommerce.Platform.Core.Security;
using VirtoCommerce.OrderModule.Data.Model;
using System.Linq.Expressions;
using VirtoCommerce.Domain.Order.Services;
using VirtoCommerce.Platform.Core.Common;
using VirtoCommerce.Platform.Core.Events;
using VirtoCommerce.OrderExtModule.Web.Model;
using VirtoCommerce.Domain.Commerce.Services;
using VirtoCommerce.Domain.Common;
using VirtoCommerce.Domain.Order.Events;
using VirtoCommerce.Domain.Shipping.Services;
using VirtoCommerce.Domain.Payment.Services;
using VirtoCommerce.Domain.Store.Services;

namespace VirtoCommerce.OrderExtModule.Web.Services
{
    public class CustomerOrderService : CustomerOrderServiceImpl {
        public CustomerOrderService(Func<IOrderRepository> orderRepositoryFactory, IUniqueNumberGenerator uniqueNumberGenerator, IEventPublisher<OrderChangeEvent> eventPublisher,
                                       IDynamicPropertyService dynamicPropertyService, IShippingMethodsService shippingMethodsService, IPaymentMethodsService paymentMethodsService,
                                       IStoreService storeService)
            :base(orderRepositoryFactory, uniqueNumberGenerator, eventPublisher, dynamicPropertyService, shippingMethodsService, paymentMethodsService, storeService)
        {
        }
              

    }
}