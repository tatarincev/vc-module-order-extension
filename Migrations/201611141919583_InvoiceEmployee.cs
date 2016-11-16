namespace VirtoCommerce.OrderExtModule.Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InvoiceEmployee : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.OrderInvoice", "EmployeeId", c => c.String());
            AddColumn("dbo.OrderInvoice", "EmployeeName", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.OrderInvoice", "EmployeeName");
            DropColumn("dbo.OrderInvoice", "EmployeeId");
        }
    }
}
