namespace VirtoCommerce.OrderExtModule.Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InvoiceDataAnnotations : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.OrderInvoice", "CustomerId", c => c.String(nullable: false, maxLength: 128));
            AlterColumn("dbo.OrderInvoice", "CustomerName", c => c.String(maxLength: 255));
            AlterColumn("dbo.OrderInvoice", "EmployeeId", c => c.String(maxLength: 128));
            AlterColumn("dbo.OrderInvoice", "EmployeeName", c => c.String(maxLength: 255));
            AlterColumn("dbo.OrderInvoice", "OrganizationId", c => c.String(maxLength: 128));
            AlterColumn("dbo.OrderInvoice", "OrganizationName", c => c.String(maxLength: 255));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.OrderInvoice", "OrganizationName", c => c.String());
            AlterColumn("dbo.OrderInvoice", "OrganizationId", c => c.String());
            AlterColumn("dbo.OrderInvoice", "EmployeeName", c => c.String());
            AlterColumn("dbo.OrderInvoice", "EmployeeId", c => c.String());
            AlterColumn("dbo.OrderInvoice", "CustomerName", c => c.String());
            AlterColumn("dbo.OrderInvoice", "CustomerId", c => c.String());
        }
    }
}
