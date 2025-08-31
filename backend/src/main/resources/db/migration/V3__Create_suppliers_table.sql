-- Create suppliers table (references addresses)
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_contact_email ON suppliers(contact_email);
CREATE INDEX idx_suppliers_address_id ON suppliers(address_id);
CREATE INDEX idx_suppliers_created_at ON suppliers(created_at);