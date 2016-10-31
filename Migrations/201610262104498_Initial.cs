namespace VirtoCommerce.OrderExtModule.Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {           
            CreateTable(
                "dbo.CustomerOrderExtension",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.CustomerOrder", t => t.Id)
                .Index(t => t.Id);
            
            CreateTable(
                "dbo.OrderInvoice",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        CustomerId = c.String(),
                        CustomerName = c.String(),
                        CustomerOrderExtensionId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.OrderOperation", t => t.Id)
                .ForeignKey("dbo.CustomerOrderExtension", t => t.CustomerOrderExtensionId)
                .Index(t => t.Id)
                .Index(t => t.CustomerOrderExtensionId);            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.OrderInvoice", "CustomerOrderExtensionId", "dbo.CustomerOrderExtension");
            DropForeignKey("dbo.OrderInvoice", "Id", "dbo.OrderOperation");
            DropForeignKey("dbo.CustomerOrderExtension", "Id", "dbo.CustomerOrder");
            DropIndex("dbo.OrderInvoice", new[] { "CustomerOrderExtensionId" });
            DropIndex("dbo.OrderInvoice", new[] { "Id" });
            DropIndex("dbo.CustomerOrderExtension", new[] { "Id" });
            DropTable("dbo.OrderInvoice");
            DropTable("dbo.CustomerOrderExtension");
        }
    }
}
