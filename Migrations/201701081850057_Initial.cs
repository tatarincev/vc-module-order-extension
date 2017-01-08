namespace VirtoCommerce.OrderExtModule.Web.Migrations {
    using System;
    using System.Data.Entity.Migrations;

    public partial class Initial : DbMigration {
        public override void Up() {
            CreateTable(
                "dbo.OrderShipmentExtension",
                c => new {
                    Id = c.String(nullable: false, maxLength: 128),
                    IsCommercial = c.Boolean(nullable: false),
                    HasLoadingDock = c.Boolean(nullable: false),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.OrderShipment", t => t.Id)
                .Index(t => t.Id);

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
                    CustomerId = c.String(nullable: false, maxLength: 128),
                    CustomerName = c.String(maxLength: 255),
                    EmployeeId = c.String(maxLength: 128),
                    EmployeeName = c.String(maxLength: 255),
                    OrganizationId = c.String(maxLength: 128),
                    OrganizationName = c.String(maxLength: 255),
                    CustomerOrderExtensionId = c.String(nullable: false, maxLength: 128),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.OrderOperation", t => t.Id)
                .ForeignKey("dbo.CustomerOrderExtension", t => t.CustomerOrderExtensionId)
                .Index(t => t.Id)
                .Index(t => t.CustomerOrderExtensionId);

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

            //Convert  all exist CustomerOrder records to CustomerOrder2
            Sql("INSERT INTO dbo.CustomerOrderExtension (Id) SELECT Id FROM dbo.CustomerOrder");
            //Convert  all exist LineItem records to lineItem2
            Sql("INSERT INTO dbo.OrderLineItemExtension (Id) SELECT Id FROM dbo.OrderLineItem");
        }

        public override void Down() {
            DropForeignKey("dbo.OrderLineItemExtension", "Id", "dbo.OrderLineItem");
            DropForeignKey("dbo.OrderInvoice", "CustomerOrderExtensionId", "dbo.CustomerOrderExtension");
            DropForeignKey("dbo.OrderInvoice", "Id", "dbo.OrderOperation");
            DropForeignKey("dbo.CustomerOrderExtension", "Id", "dbo.CustomerOrder");
            DropForeignKey("dbo.OrderShipmentExtension", "Id", "dbo.OrderShipment");
            DropIndex("dbo.OrderLineItemExtension", new[] { "Id" });
            DropIndex("dbo.OrderInvoice", new[] { "CustomerOrderExtensionId" });
            DropIndex("dbo.OrderInvoice", new[] { "Id" });
            DropIndex("dbo.CustomerOrderExtension", new[] { "Id" });
            DropIndex("dbo.OrderShipmentExtension", new[] { "Id" });
            DropTable("dbo.OrderLineItemExtension");
            DropTable("dbo.OrderInvoice");
            DropTable("dbo.CustomerOrderExtension");           
            DropTable("dbo.OrderShipmentExtension");
        }
    }
}
