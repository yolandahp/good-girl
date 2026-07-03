ALTER TABLE "budget_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "budget_settlements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rewards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "budget_logs_owner" ON "budget_logs" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "budget_logs"."user_id") WITH CHECK ((select auth.uid()) = "budget_logs"."user_id");--> statement-breakpoint
CREATE POLICY "budget_settlements_owner" ON "budget_settlements" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "budget_settlements"."user_id") WITH CHECK ((select auth.uid()) = "budget_settlements"."user_id");--> statement-breakpoint
CREATE POLICY "budgets_owner" ON "budgets" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "budgets"."user_id") WITH CHECK ((select auth.uid()) = "budgets"."user_id");--> statement-breakpoint
CREATE POLICY "ledger_owner" ON "ledger" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "ledger"."user_id") WITH CHECK ((select auth.uid()) = "ledger"."user_id");--> statement-breakpoint
CREATE POLICY "rewards_owner" ON "rewards" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "rewards"."user_id") WITH CHECK ((select auth.uid()) = "rewards"."user_id");--> statement-breakpoint
CREATE POLICY "tasks_owner" ON "tasks" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "tasks"."user_id") WITH CHECK ((select auth.uid()) = "tasks"."user_id");