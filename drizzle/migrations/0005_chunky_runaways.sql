CREATE TABLE "login_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"login_time" timestamp with time zone NOT NULL
);

ALTER TABLE "login_audit_logs" ADD CONSTRAINT "login_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "login_audit_logs_user_id_index" ON "login_audit_logs" USING btree ("user_id");
ALTER TABLE "public"."users" ALTER COLUMN "browser" SET DATA TYPE text;
DROP TYPE "public"."user_browsers";
CREATE TYPE "public"."user_browsers" AS ENUM('chrome', 'firefox', 'safari', 'brave', 'opera', 'other');
ALTER TABLE "public"."users" ALTER COLUMN "browser" SET DATA TYPE "public"."user_browsers" USING "browser"::"public"."user_browsers";