ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_student_class_unique";--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "schedules" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "enrollments_student_class_unique" ON "enrollments" USING btree ("student_id","class_id");