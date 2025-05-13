

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






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."gender" AS ENUM (
    'masculino',
    'feminino'
);


ALTER TYPE "public"."gender" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_appointment"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.appointments (
    id,
    user_id,
    appointment_type,
    date,
    start_time,
    duration,
    status,
    reminder_type,
    reminder_time,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.user_id,
    new.raw_appointment_meta_data ->> 'appointment_type',
    (new.raw_appointment_meta_data ->> 'date')::date,
    (new.raw_appointment_meta_data ->> 'start_time')::time,
    (new.raw_appointment_meta_data ->> 'duration')::integer,
    COALESCE(new.raw_appointment_meta_data ->> 'status', 'scheduled'),
    new.raw_appointment_meta_data ->> 'reminder_type',
    (new.raw_appointment_meta_data ->> 'reminder_time')::timestamp,
    new.created_at,
    new.updated_at
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_appointment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$begin
  insert into public.users (
    id,
    name,
    email,
    cpf,
    phone,
    weight,
    height,
    avatar_url,
    created_at,
    birthdate
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.email,
    new.raw_user_meta_data ->> 'cpf',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'weight',
    new.raw_user_meta_data ->> 'height',
    new.raw_user_meta_data ->> 'avatar_url',
    new.created_at,
    (new.raw_user_meta_data ->> 'birthdate')::date
  );
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "appointment_type" character varying(255) NOT NULL,
    "date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "duration" integer NOT NULL,
    "status" character varying(50) DEFAULT 'scheduled'::character varying,
    "reminder_type" character varying(50),
    "reminder_time" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "email" "text",
    "cpf" "text",
    "phone" "text",
    "birthdate" "date",
    "weight" "text",
    "height" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "avatar_url" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "on_appointment_created" AFTER INSERT ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_appointment"();



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Enable read access for all users" ON "public"."appointments" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users" TO "authenticated" USING (true);



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."handle_new_appointment"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_appointment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_appointment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
