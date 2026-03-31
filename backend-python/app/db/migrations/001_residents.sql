-- 001: Core tables for Resident Support System

-- Residents
CREATE TABLE IF NOT EXISTS residents (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(200),
    unit_number VARCHAR(20) NOT NULL,
    building VARCHAR(50) DEFAULT 'A',
    street VARCHAR(100),
    block VARCHAR(20),
    location VARCHAR(200),
    resident_status VARCHAR(20) DEFAULT 'active' CHECK (resident_status IN ('active', 'inactive', 'suspended')),
    verification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_residents_phone ON residents(phone);
CREATE INDEX IF NOT EXISTS idx_residents_unit ON residents(unit_number);

-- Sessions
CREATE TABLE IF NOT EXISTS resident_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id INTEGER REFERENCES residents(id),
    phone VARCHAR(20) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verification_level VARCHAR(20) DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'full')),
    current_agent VARCHAR(50),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes')
);

CREATE INDEX IF NOT EXISTS idx_sessions_phone ON resident_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_sessions_resident ON resident_sessions(resident_id);

-- Verification codes (OTP)
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER REFERENCES residents(id),
    session_id UUID REFERENCES resident_sessions(id),
    code VARCHAR(6) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes')
);

CREATE INDEX IF NOT EXISTS idx_verification_phone ON verification_codes(phone);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_ref VARCHAR(20) UNIQUE NOT NULL,
    resident_id INTEGER REFERENCES residents(id),
    session_id UUID REFERENCES resident_sessions(id),
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical_support', 'maintenance', 'billing', 'general', 'escalation')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'escalated', 'closed')),
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    assigned_agent VARCHAR(50),
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_resident ON tickets(resident_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_ref ON tickets(ticket_ref);

-- Ticket events (audit trail)
CREATE TABLE IF NOT EXISTS ticket_events (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    event_type VARCHAR(50) NOT NULL,
    agent VARCHAR(50),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_events_ticket ON ticket_events(ticket_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES resident_sessions(id),
    resident_id INTEGER REFERENCES residents(id),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    channel VARCHAR(20) DEFAULT 'whatsapp',
    agent VARCHAR(50),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_resident ON messages(resident_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER REFERENCES residents(id),
    concept VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) DEFAULT 0,
    due_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partial', 'overdue')),
    receipt_ref VARCHAR(50),
    last_payment_date DATE,
    last_payment_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_resident ON payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Knowledge documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('rules', 'schedule', 'payment_policy', 'maintenance', 'faq', 'general')),
    content TEXT NOT NULL,
    tags VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_documents(category);

-- Observability: agent runs
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES resident_sessions(id),
    resident_id INTEGER,
    ticket_id INTEGER,
    agent_path TEXT[],
    intent VARCHAR(100),
    verification_state VARCHAR(20),
    latency_ms INTEGER,
    total_tokens INTEGER,
    cost_usd DECIMAL(10,6),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_session ON agent_runs(session_id);
