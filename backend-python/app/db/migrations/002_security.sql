-- 002: Security — audit logs, session hardening, OTP lockout

-- Audit log for all resident data changes
CREATE TABLE IF NOT EXISTS resident_change_log (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER,
    external_source_id VARCHAR(100),
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('create', 'update', 'mark_inactive', 'restore', 'verify', 'otp_send', 'otp_verify', 'otp_fail', 'session_create', 'session_expire', 'ticket_create', 'ticket_update', 'escalation')),
    field_changed VARCHAR(100),
    previous_value TEXT,
    new_value TEXT,
    source VARCHAR(50) DEFAULT 'system',
    ip_address VARCHAR(45),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_resident ON resident_change_log(resident_id);
CREATE INDEX IF NOT EXISTS idx_audit_type ON resident_change_log(change_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON resident_change_log(created_at);

-- OTP lockout tracking
ALTER TABLE residents ADD COLUMN IF NOT EXISTS otp_locked_until TIMESTAMPTZ;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS otp_failed_attempts INTEGER DEFAULT 0;

-- Session security fields
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE resident_sessions ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    action VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(phone, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_phone ON rate_limits(phone);
