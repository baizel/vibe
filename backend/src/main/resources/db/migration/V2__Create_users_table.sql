-- Create users table (references addresses)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    google_id VARCHAR(255),
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
    address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    gdpr_consent BOOLEAN DEFAULT false,
    gdpr_consent_date TIMESTAMP WITHOUT TIME ZONE,
    
    CONSTRAINT chk_auth_provider CHECK (auth_provider IN ('EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE')),
    CONSTRAINT chk_role CHECK (role IN ('CUSTOMER', 'DRIVER', 'ADMIN'))
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_address_id ON users(address_id);
CREATE INDEX idx_users_created_at ON users(created_at);