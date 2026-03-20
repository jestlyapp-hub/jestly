-- Allow clients to be created without an email address
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;
