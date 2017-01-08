namespace VirtoCommerce.OrderExtModule.Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ShipmentExtensionMigration : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.OrderShipmentExtension",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        IsCommercial = c.Boolean(nullable: false),
                        HasLoadingDock = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.OrderShipment", t => t.Id)
                .Index(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.OrderShipmentExtension", "Id", "dbo.OrderShipment");
            DropIndex("dbo.OrderShipmentExtension", new[] { "Id" });
            DropTable("dbo.OrderShipmentExtension");
        }
    }
}
