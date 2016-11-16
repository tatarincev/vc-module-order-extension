using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using VirtoCommerce.OrderModule.Data.Model;

namespace VirtoCommerce.OrderExtModule.Web.Model
{
    public class InvoiceEntity : OperationEntity
    {
        [Required]
        [StringLength(128)]
        public string CustomerId { get; set; }

        [StringLength(255)]
        public string CustomerName { get; set; }

        [StringLength(128)]
        public string EmployeeId { get; set; }

        [StringLength(255)]
        public string EmployeeName { get; set; }

        [StringLength(128)]
        public string OrganizationId { get; set; }

        [StringLength(255)]
        public string OrganizationName { get; set; }

        [StringLength(128)]
        public string CustomerOrderExtensionId { get; set; }

        public CustomerOrderExtensionEntity CustomerOrderExtension { get; set; }

        public override void Patch(OperationEntity operation)
        {
            base.Patch(operation);

            var target = operation as InvoiceEntity;
            if (target == null)
                throw new NullReferenceException("target");

            target.CustomerId = this.CustomerId;
            target.CustomerName = this.CustomerName;
            target.EmployeeId = this.CustomerId;
            target.EmployeeName = this.CustomerName;
        }
    }
}