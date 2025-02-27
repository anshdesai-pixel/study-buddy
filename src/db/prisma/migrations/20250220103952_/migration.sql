-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "neon_auth";

-- CreateTable
CREATE TABLE "neon_auth"."users_sync" (
    "raw_json" JSONB NOT NULL,
    "id" TEXT NOT NULL DEFAULT (raw_json ->> 'id'::text),
    "name" TEXT DEFAULT (raw_json ->> 'display_name'::text),
    "email" TEXT DEFAULT (raw_json ->> 'primary_email'::text),
    "created_at" TIMESTAMPTZ(6) DEFAULT to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision)),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_sync_deleted_at_idx" ON "neon_auth"."users_sync"("deleted_at");
