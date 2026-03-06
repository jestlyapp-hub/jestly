-- Add design JSONB column to sites table (stores SiteDesign: designKey, backgroundPreset, cardStyle, etc.)
alter table public.sites add column if not exists design jsonb default null;
