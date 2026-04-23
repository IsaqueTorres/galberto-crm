ALTER TABLE "customers" RENAME COLUMN "company_name" TO "legal_name";
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "person_type" text DEFAULT 'pf' NOT NULL;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "trade_name" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "secondary_document" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "postal_code" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "street" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "number" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "complement" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "neighborhood" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "city" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "state" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "status" text DEFAULT 'lead' NOT NULL;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "source" text;
