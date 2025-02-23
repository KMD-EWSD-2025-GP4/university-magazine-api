CREATE TYPE "public"."user_browsers" AS ENUM('chrome', 'firefox', 'safari', 'edge', 'opera', 'other');
ALTER TABLE "contributions" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "users" ADD COLUMN "last_login" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN "total_logins" integer DEFAULT 0 NOT NULL;
ALTER TABLE "users" ADD COLUMN "browser" "user_browsers";