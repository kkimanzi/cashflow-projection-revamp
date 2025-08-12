CREATE TABLE "projected_recurring_transaction_override" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recurring_template_id" text NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "projected_recurring_transaction_override" ADD CONSTRAINT "projected_recurring_transaction_override_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projected_recurring_transaction_override" ADD CONSTRAINT "projected_recurring_transaction_override_recurring_template_id_recurring_transaction_template_id_fk" FOREIGN KEY ("recurring_template_id") REFERENCES "public"."recurring_transaction_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_projection_override" ON "projected_recurring_transaction_override" USING btree ("organization_id","recurring_template_id","date");