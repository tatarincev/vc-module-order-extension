namespace VirtoCommerce.OrderExtModule.Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InvoiceOrganization : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.OrderInvoice", "OrganizationId", c => c.String());
            AddColumn("dbo.OrderInvoice", "OrganizationName", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.OrderInvoice", "OrganizationName");
            DropColumn("dbo.OrderInvoice", "OrganizationId");
        }
    }
}
