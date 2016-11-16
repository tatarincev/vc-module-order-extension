using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VirtoCommerce.Domain.Order.Model;

namespace VirtoCommerce.OrderExtModule.Web.Model
{
    public class Invoice : OrderOperation
    {
        public string CustomerId { get; set; }

        public string CustomerName { get; set; }

        public string EmployeeId { get; set; }

        public string EmployeeName { get; set; }

        public string OrganizationId { get; set; }

        public string OrganizationName { get; set; }

    }
}