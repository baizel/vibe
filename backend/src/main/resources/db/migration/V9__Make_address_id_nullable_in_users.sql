-- Make address_id nullable in users table to support authentication without addresses
ALTER TABLE users ALTER COLUMN address_id DROP NOT NULL;