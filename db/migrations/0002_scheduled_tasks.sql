CREATE TABLE "scheduled_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"scheduled_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scheduled_tasks_task_date_unique" UNIQUE("task_id","scheduled_date")
);
--> statement-breakpoint
ALTER TABLE "scheduled_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "scheduled_tasks" ADD CONSTRAINT "scheduled_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scheduled_tasks_user_date_idx" ON "scheduled_tasks" USING btree ("user_id","scheduled_date");--> statement-breakpoint
CREATE POLICY "scheduled_tasks_owner" ON "scheduled_tasks" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "scheduled_tasks"."user_id") WITH CHECK ((select auth.uid()) = "scheduled_tasks"."user_id");