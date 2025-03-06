CREATE TYPE "public"."academic_year_status" AS ENUM('active', 'inactive');
CREATE TYPE "public"."faculty_status" AS ENUM('active', 'inactive');
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');
ALTER TABLE "academic_years" ADD COLUMN "status" "academic_year_status" DEFAULT 'active' NOT NULL;
ALTER TABLE "faculties" ADD COLUMN "status" "faculty_status" DEFAULT 'active' NOT NULL;
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;