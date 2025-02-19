CREATE TYPE "public"."contribution_asset_type" AS ENUM('article', 'image');
CREATE TYPE "public"."contribution_status" AS ENUM('pending', 'selected', 'rejected');
CREATE TYPE "public"."user_roles" AS ENUM('guest', 'student', 'marketing_coordinator', 'marketing_manager', 'admin');
CREATE TABLE "academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"new_closure_date" timestamp with time zone NOT NULL,
	"final_closure_date" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contribution_id" uuid NOT NULL,
	"content" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"student_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"faculty_id" uuid NOT NULL,
	"submission_date" timestamp with time zone NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now(),
	"status" "contribution_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "contribution_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contribution_id" uuid NOT NULL,
	"type" "contribution_asset_type" NOT NULL,
	"file_path" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "faculties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" "user_roles" DEFAULT 'guest' NOT NULL,
	"faculty_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

ALTER TABLE "comments" ADD CONSTRAINT "comments_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contribution_assets" ADD CONSTRAINT "contribution_assets_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "comments_contribution_id_index" ON "comments" USING btree ("contribution_id");
CREATE INDEX "comments_user_id_index" ON "comments" USING btree ("user_id");
CREATE INDEX "contributions_student_id_index" ON "contributions" USING btree ("student_id");
CREATE INDEX "contributions_academic_year_id_index" ON "contributions" USING btree ("academic_year_id");
CREATE INDEX "contributions_faculty_id_index" ON "contributions" USING btree ("faculty_id");
CREATE INDEX "contribution_assets_contribution_id_index" ON "contribution_assets" USING btree ("contribution_id");
CREATE INDEX "faculties_name_index" ON "faculties" USING btree ("name");
CREATE INDEX "users_email_index" ON "users" USING btree ("email");
CREATE INDEX "users_faculty_id_index" ON "users" USING btree ("faculty_id");