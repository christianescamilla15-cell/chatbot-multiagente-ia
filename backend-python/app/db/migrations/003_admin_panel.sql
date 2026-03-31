-- 003: Admin Panel — extended resident fields, sync conflicts

-- Extended resident fields (safe ALTERs — skip if column exists)
DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN home_type VARCHAR(50) DEFAULT 'apartment';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN bedrooms INTEGER DEFAULT 2;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN bathrooms INTEGER DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN has_patio BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN has_parking BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN multi_household BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN family_count INTEGER DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN occupants_count INTEGER DEFAULT 2;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN notes TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN external_source_id VARCHAR(100);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN source VARCHAR(50) DEFAULT 'seed';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN last_sync_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE residents ADD COLUMN deleted_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Session enhancements
DO $$ BEGIN
  ALTER TABLE resident_sessions ADD COLUMN active_intent VARCHAR(100);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE resident_sessions ADD COLUMN assigned_agent VARCHAR(50);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE resident_sessions ADD COLUMN escalation_level INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE resident_sessions ADD COLUMN last_message_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE resident_sessions ADD COLUMN session_status VARCHAR(20) DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Sync conflicts table
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id SERIAL PRIMARY KEY,
    sync_run_id VARCHAR(100),
    resident_external_id VARCHAR(100),
    resident_id INTEGER REFERENCES residents(id),
    conflict_type VARCHAR(50) NOT NULL,
    source_value TEXT,
    database_value TEXT,
    field_name VARCHAR(100),
    resolution_status VARCHAR(20) DEFAULT 'pending',
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(resolution_status);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_type ON sync_conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resident ON sync_conflicts(resident_id);
