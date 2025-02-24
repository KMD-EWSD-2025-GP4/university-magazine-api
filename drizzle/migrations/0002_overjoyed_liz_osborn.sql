ALTER TABLE "users" ADD COLUMN "name" text NOT NULL;
CREATE INDEX "academic_years_start_date_index" ON "academic_years" USING btree ("start_date");
CREATE INDEX "academic_years_end_date_index" ON "academic_years" USING btree ("end_date");
ALTER TABLE "users" DROP COLUMN "first_name";
ALTER TABLE "users" DROP COLUMN "last_name";
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_start_date_end_date_unique" UNIQUE("start_date","end_date");