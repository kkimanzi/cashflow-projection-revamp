ALTER TABLE "projected_recurring_transaction_override" ALTER COLUMN "amount" SET DATA TYPE numeric(19, 2);--> statement-breakpoint
ALTER TABLE "reconciliation" ALTER COLUMN "balance" SET DATA TYPE numeric(19, 2);--> statement-breakpoint
ALTER TABLE "recurring_transaction_template" ALTER COLUMN "amount" SET DATA TYPE numeric(19, 2);--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "amount" SET DATA TYPE numeric(19, 2);--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;