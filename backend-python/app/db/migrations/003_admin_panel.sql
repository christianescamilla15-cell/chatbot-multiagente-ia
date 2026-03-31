-- 003: Admin Panel — extended resident fields, sync conflicts, session enhancements

-- Extended resident fields
ALTER TABLE residents ADD COLUMN IF NOT EXISTS home_type VARCHAR(50) DEFAULT 'apartment';
ALTER TABLE residents ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 2;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 1;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS has_patio BOOLEAN DEFAULT false;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT true;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS multi_household BOOLEAN DEFAULT false;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS family_count INTEGER DEFAULT 1;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS occupants_count INTEGER DEFAULT 2;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS external_source_id VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'seed';
ALTER TABLE residents ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Session enhancements
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS active_intent VARCHAR(100);
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS assigned_agent VARCHAR(50);
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS session_status VARCHAR(20) DEFAULT 'active';

-- Sync conflicts table
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id SERIAL PRIMARY KEY,
    sync_run_id VARCHAR(100),
    resident_external_id VARCHAR(100),
    resident_id INTEGER REFERENCES residents(id),
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('duplicate_phone', 'duplicate_unit', 'missing_fields', 'external_id_mismatch', 'missing_in_source', 'pending_removal', 'data_mismatch')),
    source_value TEXT,
    database_value TEXT,
    field_name VARCHAR(100),
    resolution_status VARCHAR(20) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored', 'escalated')),
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(resolution_status);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_type ON sync_conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resident ON sync_conflicts(resident_id);

-- Dashboard summary view helper
CREATE OR REPLACE FUNCTION admin_dashboard_summary()
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
    SELECT json_build_object(
        'residents', json_build_object(
            'total', (SELECT COUNT(*) FROM residents),
            'active', (SELECT COUNT(*) FROM residents WHERE resident_status = 'active'),
            'inactive', (SELECT COUNT(*) FROM residents WHERE resident_status = 'inactive'),
            'multi_household', (SELECT COUNT(*) FROM residents WHERE multi_household = true)
        ),
        'sessions', json_build_object(
            'verified', (SELECT COUNT(*) FROM resident_sessions WHERE is_verified = true AND expires_at > NOW()),
            'pending', (SELECT COUNT(*) FROM resident_sessions WHERE is_verified = false AND expires_at > NOW()),
            'total_active', (SELECT COUNT(*) FROM resident_sessions WHERE expires_at > NOW())
        ),
        'tickets', json_build_object(
            'open', (SELECT COUNT(*) FROM tickets WHERE status = 'open'),
            'urgent', (SELECT COUNT(*) FROM tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed')),
            'escalated', (SELECT COUNT(*) FROM tickets WHERE status = 'escalated'),
            'total', (SELECT COUNT(*) FROM tickets)
        ),
        'payments', json_build_object(
            'overdue', (SELECT COUNT(*) FROM payments WHERE payment_status = 'overdue'),
            'total_outstanding', (SELECT COALESCE(SUM(current_balance), 0) FROM payments WHERE payment_status IN ('pending', 'overdue', 'partial')),
            'paid', (SELECT COUNT(*) FROM payments WHERE payment_status = 'paid'),
            'unpaid', (SELECT COUNT(*) FROM payments WHERE payment_status != 'paid')
        ),
        'sync', json_build_object(
            'pending_conflicts', (SELECT COUNT(*) FROM sync_conflicts WHERE resolution_status = 'pending'),
            'pending_removal', (SELECT COUNT(*) FROM residents WHERE resident_status = 'pending_removal')
        )
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
