-- 006_fix_handle_new_user.sql
-- Fix handle_new_user() trigger: idempotent upsert + subdomain collision retry + backfill

-- 1. Replace the trigger function with a robust version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  _full_name text;
  _business_name text;
  _subdomain text;
  _base_slug text;
BEGIN
  _full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  _business_name := new.raw_user_meta_data->>'business_name';
  _subdomain := new.raw_user_meta_data->>'subdomain';

  -- Generate a subdomain from business_name or email if none provided
  IF _subdomain IS NULL OR _subdomain = '' THEN
    _base_slug := lower(regexp_replace(
      COALESCE(_business_name, split_part(new.email, '@', 1)),
      '[^a-z0-9]+', '-', 'g'
    ));
    _base_slug := trim(both '-' from _base_slug);
    IF _base_slug = '' THEN
      _base_slug := 'user';
    END IF;
    _subdomain := _base_slug || '-' || substr(new.id::text, 1, 4);
  END IF;

  -- Idempotent upsert — ON CONFLICT on PK (id)
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, business_name, subdomain)
    VALUES (new.id, new.email, _full_name, _business_name, _subdomain)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
      business_name = COALESCE(EXCLUDED.business_name, public.profiles.business_name),
      subdomain = COALESCE(NULLIF(EXCLUDED.subdomain, ''), public.profiles.subdomain);
  EXCEPTION
    WHEN unique_violation THEN
      -- Subdomain collision — retry with longer random suffix
      _subdomain := _base_slug || '-' || substr(new.id::text, 1, 8);
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, business_name, subdomain)
        VALUES (new.id, new.email, _full_name, _business_name, _subdomain)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
          business_name = COALESCE(EXCLUDED.business_name, public.profiles.business_name),
          subdomain = COALESCE(NULLIF(EXCLUDED.subdomain, ''), public.profiles.subdomain);
      EXCEPTION
        WHEN unique_violation THEN
          -- Final fallback: full UUID as subdomain
          _subdomain := 'u-' || replace(new.id::text, '-', '');
          INSERT INTO public.profiles (id, email, full_name, business_name, subdomain)
          VALUES (new.id, new.email, _full_name, _business_name, _subdomain)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
            business_name = COALESCE(EXCLUDED.business_name, public.profiles.business_name),
            subdomain = COALESCE(NULLIF(EXCLUDED.subdomain, ''), public.profiles.subdomain);
      END;
  END;

  RETURN new;
END;
$$;

-- 2. Backfill: create profiles for any auth.users that don't have one
INSERT INTO public.profiles (id, email, full_name, subdomain)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9]+', '-', 'g')) || '-' || substr(u.id::text, 1, 4)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
