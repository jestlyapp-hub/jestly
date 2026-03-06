-- Brief field mapping: store which fields were dispatched to order columns
ALTER TABLE order_brief_responses
  ADD COLUMN IF NOT EXISTS field_sources jsonb DEFAULT '{}'::jsonb;
