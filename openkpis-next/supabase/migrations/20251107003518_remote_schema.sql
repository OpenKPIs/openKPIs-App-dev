


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_contributor_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO contributors (github_login, name, avatar_url, first_contribution_at, last_contribution_at)
    VALUES (NEW.created_by, NEW.created_by, NULL, NOW(), NOW())
    ON CONFLICT (github_login) 
    DO UPDATE SET
      last_contribution_at = NOW(),
      updated_at = NOW();
    
    IF TG_TABLE_NAME = 'kpis' THEN
      UPDATE contributors SET total_kpis = total_kpis + 1 WHERE github_login = NEW.created_by;
    ELSIF TG_TABLE_NAME = 'events' THEN
      UPDATE contributors SET total_events = total_events + 1 WHERE github_login = NEW.created_by;
    ELSIF TG_TABLE_NAME = 'dimensions' THEN
      UPDATE contributors SET total_dimensions = total_dimensions + 1 WHERE github_login = NEW.created_by;
    ELSIF TG_TABLE_NAME = 'metrics' THEN
      UPDATE contributors SET total_metrics = total_metrics + 1 WHERE github_login = NEW.created_by;
    END IF;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.last_modified_by IS NOT NULL THEN
    UPDATE contributors 
    SET total_edits = total_edits + 1, 
        last_contribution_at = NOW(),
        updated_at = NOW()
    WHERE github_login = NEW.last_modified_by;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_contributor_stats"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "user_login" "text" NOT NULL,
    "user_name" "text",
    "user_email" "text",
    "user_avatar_url" "text",
    "changes" "jsonb",
    "github_commit_sha" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_log_action_check" CHECK (("action" = ANY (ARRAY['created'::"text", 'edited'::"text", 'approved'::"text", 'published'::"text", 'deleted'::"text"]))),
    CONSTRAINT "audit_log_table_name_check" CHECK (("table_name" = ANY (ARRAY['kpis'::"text", 'events'::"text", 'dimensions'::"text"])))
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_log" IS 'Complete audit trail of all changes';



CREATE TABLE IF NOT EXISTS "public"."contributors" (
    "github_login" "text" NOT NULL,
    "name" "text",
    "email" "text",
    "avatar_url" "text",
    "total_kpis" integer DEFAULT 0,
    "total_events" integer DEFAULT 0,
    "total_dimensions" integer DEFAULT 0,
    "total_edits" integer DEFAULT 0,
    "first_contribution_at" timestamp with time zone,
    "last_contribution_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "total_metrics" integer DEFAULT 0
);


ALTER TABLE "public"."contributors" OWNER TO "postgres";


COMMENT ON TABLE "public"."contributors" IS 'Aggregated statistics for all contributors';



CREATE TABLE IF NOT EXISTS "public"."dashboard_dimensions" (
    "dashboard_id" "uuid" NOT NULL,
    "dimension_id" "uuid" NOT NULL
);


ALTER TABLE "public"."dashboard_dimensions" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboard_dimensions" IS 'Junction table linking dashboards to dimensions';



CREATE TABLE IF NOT EXISTS "public"."dashboard_events" (
    "dashboard_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL
);


ALTER TABLE "public"."dashboard_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboard_events" IS 'Junction table linking dashboards to events';



CREATE TABLE IF NOT EXISTS "public"."dashboard_kpis" (
    "dashboard_id" "uuid" NOT NULL,
    "kpi_id" "uuid" NOT NULL
);


ALTER TABLE "public"."dashboard_kpis" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboard_kpis" IS 'Junction table linking dashboards to KPIs';



CREATE TABLE IF NOT EXISTS "public"."dashboard_metrics" (
    "dashboard_id" "uuid" NOT NULL,
    "metric_id" "uuid" NOT NULL
);


ALTER TABLE "public"."dashboard_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboard_metrics" IS 'Junction table linking dashboards to metrics';



CREATE TABLE IF NOT EXISTS "public"."dashboards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "dashboard_url" "text",
    "owner" "text",
    "screenshot_url" "text",
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_modified_by" "text",
    "last_modified_at" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text",
    "github_pr_number" integer,
    "github_pr_url" "text",
    "github_author" "text"
);


ALTER TABLE "public"."dashboards" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboards" IS 'Dashboards submitted by users, can reference KPIs, Dimensions, Metrics, and Events';



CREATE TABLE IF NOT EXISTS "public"."dimensions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text",
    "github_commit_sha" "text",
    "github_file_path" "text",
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_modified_by" "text",
    "last_modified_at" timestamp with time zone,
    "approved_by" "text",
    "approved_at" timestamp with time zone,
    "search_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (("name" || ' '::"text") || COALESCE("description", ''::"text")))) STORED,
    "github_pr_number" integer,
    "github_pr_url" "text",
    CONSTRAINT "dimensions_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."dimensions" OWNER TO "postgres";


COMMENT ON TABLE "public"."dimensions" IS 'Analytics dimensions with metadata and GitHub sync';



CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text",
    "github_commit_sha" "text",
    "github_file_path" "text",
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_modified_by" "text",
    "last_modified_at" timestamp with time zone,
    "approved_by" "text",
    "approved_at" timestamp with time zone,
    "search_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (("name" || ' '::"text") || COALESCE("description", ''::"text")))) STORED,
    "github_pr_number" integer,
    "github_pr_url" "text",
    CONSTRAINT "events_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


COMMENT ON TABLE "public"."events" IS 'Analytics events with metadata and GitHub sync';



CREATE TABLE IF NOT EXISTS "public"."kpis" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "formula" "text",
    "description" "text",
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text",
    "github_commit_sha" "text",
    "github_file_path" "text",
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_modified_by" "text",
    "last_modified_at" timestamp with time zone,
    "approved_by" "text",
    "approved_at" timestamp with time zone,
    "search_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (((("name" || ' '::"text") || COALESCE("description", ''::"text")) || ' '::"text") || COALESCE("formula", ''::"text")))) STORED,
    "github_pr_number" integer,
    "github_pr_url" "text",
    "dashboards" "text"[],
    "related_dimensions" "text"[],
    "related_events" "text"[],
    "related_metrics" "text"[],
    "related_kpis" "text"[],
    "industry" "text",
    "priority" "text",
    "core_area" "text",
    "scope" "text",
    "kpi_type" "text",
    "measure" "text",
    "aggregation_window" "text",
    "ga4_implementation" "text",
    "adobe_implementation" "text",
    "amplitude_implementation" "text",
    "data_layer_mapping" "text",
    "xdm_mapping" "text",
    "dependencies" "text",
    "bi_source_system" "text",
    "report_attributes" "text",
    "dashboard_usage" "text",
    "segment_eligibility" "text",
    "sql_query" "text",
    "calculation_notes" "text",
    "details" "text",
    "validation_status" "text",
    "data_sensitivity" "text",
    "pii_flag" boolean DEFAULT false,
    CONSTRAINT "kpis_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."kpis" OWNER TO "postgres";


COMMENT ON TABLE "public"."kpis" IS 'Key Performance Indicators with metadata and GitHub sync';



COMMENT ON COLUMN "public"."kpis"."status" IS 'draft: not yet approved, published: live on site, archived: hidden';



COMMENT ON COLUMN "public"."kpis"."github_commit_sha" IS 'SHA of the last GitHub commit for this KPI';



COMMENT ON COLUMN "public"."kpis"."search_vector" IS 'Auto-generated full-text search vector';



CREATE TABLE IF NOT EXISTS "public"."metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "formula" "text",
    "description" "text",
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text",
    "github_commit_sha" "text",
    "github_file_path" "text",
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_modified_by" "text",
    "last_modified_at" timestamp with time zone,
    "approved_by" "text",
    "approved_at" timestamp with time zone,
    "search_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (((("name" || ' '::"text") || COALESCE("description", ''::"text")) || ' '::"text") || COALESCE("formula", ''::"text")))) STORED,
    "github_pr_number" integer,
    "github_pr_url" "text",
    "industry" "text",
    "priority" "text",
    "core_area" "text",
    "scope" "text",
    "metric_type" "text",
    "aggregation_window" "text",
    "ga4_implementation" "text",
    "adobe_implementation" "text",
    "amplitude_implementation" "text",
    "data_layer_mapping" "text",
    "xdm_mapping" "text",
    "dependencies" "text",
    "bi_source_system" "text",
    "report_attributes" "text",
    "dashboard_usage" "text",
    "segment_eligibility" "text",
    "related_metrics" "text"[],
    "sql_query" "text",
    "calculation_notes" "text",
    "details" "text",
    "validation_status" "text",
    "data_sensitivity" "text",
    "pii_flag" boolean DEFAULT false,
    "measure" "text",
    "github_author" "text",
    CONSTRAINT "metrics_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_analyses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "requirements" "text",
    "analytics_solution" "text",
    "platforms" "text"[],
    "ai_expanded" "jsonb",
    "selected_items" "jsonb",
    "selected_insights" "text"[],
    "dashboard_ids" "uuid"[],
    "analysis_data" "jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_analyses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_insights" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "insight_id" "text" NOT NULL,
    "group_name" "text",
    "title" "text" NOT NULL,
    "rationale" "text",
    "data_requirements" "jsonb",
    "chart_hint" "text",
    "signal_strength" "text",
    "insight_data" "jsonb" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_insights" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contributors"
    ADD CONSTRAINT "contributors_pkey" PRIMARY KEY ("github_login");



ALTER TABLE ONLY "public"."dashboard_dimensions"
    ADD CONSTRAINT "dashboard_dimensions_pkey" PRIMARY KEY ("dashboard_id", "dimension_id");



ALTER TABLE ONLY "public"."dashboard_events"
    ADD CONSTRAINT "dashboard_events_pkey" PRIMARY KEY ("dashboard_id", "event_id");



ALTER TABLE ONLY "public"."dashboard_kpis"
    ADD CONSTRAINT "dashboard_kpis_pkey" PRIMARY KEY ("dashboard_id", "kpi_id");



ALTER TABLE ONLY "public"."dashboard_metrics"
    ADD CONSTRAINT "dashboard_metrics_pkey" PRIMARY KEY ("dashboard_id", "metric_id");



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."dimensions"
    ADD CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dimensions"
    ADD CONSTRAINT "dimensions_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."kpis"
    ADD CONSTRAINT "kpis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kpis"
    ADD CONSTRAINT "kpis_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."metrics"
    ADD CONSTRAINT "metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."metrics"
    ADD CONSTRAINT "metrics_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_analyses"
    ADD CONSTRAINT "user_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_insights"
    ADD CONSTRAINT "user_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_insights"
    ADD CONSTRAINT "user_insights_user_id_insight_id_key" UNIQUE ("user_id", "insight_id");



CREATE INDEX "idx_audit_log_created_at" ON "public"."audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_log_table_record" ON "public"."audit_log" USING "btree" ("table_name", "record_id");



CREATE INDEX "idx_audit_log_user" ON "public"."audit_log" USING "btree" ("user_login");



CREATE INDEX "idx_contributors_last_contribution" ON "public"."contributors" USING "btree" ("last_contribution_at" DESC);



CREATE INDEX "idx_dashboard_dimensions_dashboard" ON "public"."dashboard_dimensions" USING "btree" ("dashboard_id");



CREATE INDEX "idx_dashboard_dimensions_dimension" ON "public"."dashboard_dimensions" USING "btree" ("dimension_id");



CREATE INDEX "idx_dashboard_events_dashboard" ON "public"."dashboard_events" USING "btree" ("dashboard_id");



CREATE INDEX "idx_dashboard_events_event" ON "public"."dashboard_events" USING "btree" ("event_id");



CREATE INDEX "idx_dashboard_kpis_dashboard" ON "public"."dashboard_kpis" USING "btree" ("dashboard_id");



CREATE INDEX "idx_dashboard_kpis_kpi" ON "public"."dashboard_kpis" USING "btree" ("kpi_id");



CREATE INDEX "idx_dashboard_metrics_dashboard" ON "public"."dashboard_metrics" USING "btree" ("dashboard_id");



CREATE INDEX "idx_dashboard_metrics_metric" ON "public"."dashboard_metrics" USING "btree" ("metric_id");



CREATE INDEX "idx_dimensions_created_at" ON "public"."dimensions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_dimensions_created_by" ON "public"."dimensions" USING "btree" ("created_by");



CREATE INDEX "idx_dimensions_search" ON "public"."dimensions" USING "gin" ("search_vector");



CREATE INDEX "idx_dimensions_status" ON "public"."dimensions" USING "btree" ("status");



CREATE INDEX "idx_dimensions_tags" ON "public"."dimensions" USING "gin" ("tags");



CREATE INDEX "idx_events_created_at" ON "public"."events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_events_created_by" ON "public"."events" USING "btree" ("created_by");



CREATE INDEX "idx_events_search" ON "public"."events" USING "gin" ("search_vector");



CREATE INDEX "idx_events_status" ON "public"."events" USING "btree" ("status");



CREATE INDEX "idx_events_tags" ON "public"."events" USING "gin" ("tags");



CREATE INDEX "idx_kpis_created_at" ON "public"."kpis" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_kpis_created_by" ON "public"."kpis" USING "btree" ("created_by");



CREATE INDEX "idx_kpis_search" ON "public"."kpis" USING "gin" ("search_vector");



CREATE INDEX "idx_kpis_status" ON "public"."kpis" USING "btree" ("status");



CREATE INDEX "idx_kpis_tags" ON "public"."kpis" USING "gin" ("tags");



CREATE INDEX "idx_metrics_created_at" ON "public"."metrics" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_metrics_created_by" ON "public"."metrics" USING "btree" ("created_by");



CREATE INDEX "idx_metrics_search" ON "public"."metrics" USING "gin" ("search_vector");



CREATE INDEX "idx_metrics_status" ON "public"."metrics" USING "btree" ("status");



CREATE INDEX "idx_metrics_tags" ON "public"."metrics" USING "gin" ("tags");



CREATE INDEX "idx_user_analyses_created" ON "public"."user_analyses" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_analyses_status" ON "public"."user_analyses" USING "btree" ("status");



CREATE INDEX "idx_user_analyses_user_id" ON "public"."user_analyses" USING "btree" ("user_id");



CREATE INDEX "idx_user_insights_created" ON "public"."user_insights" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_insights_group" ON "public"."user_insights" USING "btree" ("group_name");



CREATE INDEX "idx_user_insights_user_id" ON "public"."user_insights" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "dimensions_contributor_stats" AFTER INSERT OR UPDATE ON "public"."dimensions" FOR EACH ROW EXECUTE FUNCTION "public"."update_contributor_stats"();



CREATE OR REPLACE TRIGGER "events_contributor_stats" AFTER INSERT OR UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."update_contributor_stats"();



CREATE OR REPLACE TRIGGER "kpis_contributor_stats" AFTER INSERT OR UPDATE ON "public"."kpis" FOR EACH ROW EXECUTE FUNCTION "public"."update_contributor_stats"();



CREATE OR REPLACE TRIGGER "metrics_contributor_stats" AFTER INSERT OR UPDATE ON "public"."metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_contributor_stats"();



ALTER TABLE ONLY "public"."dashboard_dimensions"
    ADD CONSTRAINT "dashboard_dimensions_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboard_dimensions"
    ADD CONSTRAINT "dashboard_dimensions_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboard_events"
    ADD CONSTRAINT "dashboard_events_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboard_events"
    ADD CONSTRAINT "dashboard_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboard_kpis"
    ADD CONSTRAINT "dashboard_kpis_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboard_kpis"
    ADD CONSTRAINT "dashboard_kpis_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboard_metrics"
    ADD CONSTRAINT "dashboard_metrics_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboard_metrics"
    ADD CONSTRAINT "dashboard_metrics_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_analyses"
    ADD CONSTRAINT "user_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_insights"
    ADD CONSTRAINT "user_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can read audit log" ON "public"."audit_log" FOR SELECT USING (true);



CREATE POLICY "Anyone can read contributors" ON "public"."contributors" FOR SELECT USING (true);



CREATE POLICY "Anyone can read published dimensions" ON "public"."dimensions" FOR SELECT USING ((("status" = 'published'::"text") OR ("status" = 'draft'::"text")));



CREATE POLICY "Anyone can read published events" ON "public"."events" FOR SELECT USING ((("status" = 'published'::"text") OR ("status" = 'draft'::"text")));



CREATE POLICY "Anyone can read published kpis" ON "public"."kpis" FOR SELECT USING ((("status" = 'published'::"text") OR ("status" = 'draft'::"text")));



CREATE POLICY "Anyone can read published metrics" ON "public"."metrics" FOR SELECT USING ((("status" = 'published'::"text") OR ("status" = 'draft'::"text")));



CREATE POLICY "Authenticated users can insert audit log" ON "public"."audit_log" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert dimensions" ON "public"."dimensions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert events" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert kpis" ON "public"."kpis" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert metrics" ON "public"."metrics" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update contributors" ON "public"."contributors" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Users can delete their own analyses" ON "public"."user_analyses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own insights" ON "public"."user_insights" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own analyses" ON "public"."user_analyses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own insights" ON "public"."user_insights" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own analyses" ON "public"."user_analyses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own dimensions" ON "public"."dimensions" FOR UPDATE TO "authenticated" USING (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))) WITH CHECK (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text")));



CREATE POLICY "Users can update their own events" ON "public"."events" FOR UPDATE TO "authenticated" USING (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))) WITH CHECK (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text")));



CREATE POLICY "Users can update their own insights" ON "public"."user_insights" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own kpis" ON "public"."kpis" FOR UPDATE TO "authenticated" USING (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))) WITH CHECK (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text")));



CREATE POLICY "Users can update their own metrics" ON "public"."metrics" FOR UPDATE TO "authenticated" USING (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))) WITH CHECK (("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text")));



CREATE POLICY "Users can view their own analyses" ON "public"."user_analyses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own insights" ON "public"."user_insights" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_log_insert_authenticated" ON "public"."audit_log" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "audit_log_select_all" ON "public"."audit_log" FOR SELECT USING (true);



ALTER TABLE "public"."contributors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dashboard_dimensions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dashboard_dimensions_delete" ON "public"."dashboard_dimensions" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_dimensions_insert" ON "public"."dashboard_dimensions" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_dimensions_select" ON "public"."dashboard_dimensions" FOR SELECT USING (true);



ALTER TABLE "public"."dashboard_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dashboard_events_delete" ON "public"."dashboard_events" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_events_insert" ON "public"."dashboard_events" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_events_select" ON "public"."dashboard_events" FOR SELECT USING (true);



ALTER TABLE "public"."dashboard_kpis" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dashboard_kpis_delete" ON "public"."dashboard_kpis" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_kpis_insert" ON "public"."dashboard_kpis" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_kpis_select" ON "public"."dashboard_kpis" FOR SELECT USING (true);



ALTER TABLE "public"."dashboard_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dashboard_metrics_delete" ON "public"."dashboard_metrics" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_metrics_insert" ON "public"."dashboard_metrics" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboard_metrics_select" ON "public"."dashboard_metrics" FOR SELECT USING (true);



ALTER TABLE "public"."dashboards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dashboards_insert_authenticated" ON "public"."dashboards" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dashboards_select_all" ON "public"."dashboards" FOR SELECT USING (true);



CREATE POLICY "dashboards_update_own" ON "public"."dashboards" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND ("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))));



ALTER TABLE "public"."dimensions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dimensions_insert_authenticated" ON "public"."dimensions" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dimensions_select_all" ON "public"."dimensions" FOR SELECT USING (true);



CREATE POLICY "dimensions_update_own" ON "public"."dimensions" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND ("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_insert_authenticated" ON "public"."events" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "events_select_all" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "events_update_own" ON "public"."events" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND ("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))));



ALTER TABLE "public"."kpis" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "kpis_insert_authenticated" ON "public"."kpis" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "kpis_select_all" ON "public"."kpis" FOR SELECT USING (true);



CREATE POLICY "kpis_select_published" ON "public"."kpis" FOR SELECT USING (true);



CREATE POLICY "kpis_update_own" ON "public"."kpis" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND ("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))));



ALTER TABLE "public"."metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "metrics_insert_authenticated" ON "public"."metrics" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "metrics_select_all" ON "public"."metrics" FOR SELECT USING (true);



CREATE POLICY "metrics_update_own" ON "public"."metrics" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND ("created_by" = (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'user_name'::"text"))));



ALTER TABLE "public"."user_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_insights" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_contributor_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_contributor_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_contributor_stats"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."contributors" TO "anon";
GRANT ALL ON TABLE "public"."contributors" TO "authenticated";
GRANT ALL ON TABLE "public"."contributors" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_dimensions" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_dimensions" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_events" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_events" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_events" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_kpis" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_metrics" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."dashboards" TO "anon";
GRANT ALL ON TABLE "public"."dashboards" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboards" TO "service_role";



GRANT ALL ON TABLE "public"."dimensions" TO "anon";
GRANT ALL ON TABLE "public"."dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."dimensions" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."kpis" TO "anon";
GRANT ALL ON TABLE "public"."kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."kpis" TO "service_role";



GRANT ALL ON TABLE "public"."metrics" TO "anon";
GRANT ALL ON TABLE "public"."metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."metrics" TO "service_role";



GRANT ALL ON TABLE "public"."user_analyses" TO "anon";
GRANT ALL ON TABLE "public"."user_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."user_insights" TO "anon";
GRANT ALL ON TABLE "public"."user_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."user_insights" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


