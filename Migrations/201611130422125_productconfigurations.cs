namespace VirtoCommerce.OrderExtModule.Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class productconfigurations : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.OrderLineItemExtension",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        ProductConfigurationRequestId = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.OrderLineItem", t => t.Id)
                .Index(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.OrderLineItemExtension", "Id", "dbo.OrderLineItem");
            DropIndex("dbo.OrderLineItemExtension", new[] { "Id" });
            DropTable("dbo.OrderLineItemExtension");
        }
    }
}
