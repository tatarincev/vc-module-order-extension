using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Model;

namespace VirtoCommerce.OrderExtModule.Web.Model
{
    public class CustomerOrderExtension : CustomerOrder
    {
        public CustomerOrderExtension()
        {
            Invoices = new List<Invoice>();
        }

        public ICollection<Invoice> Invoices { get; set; }
    }
}