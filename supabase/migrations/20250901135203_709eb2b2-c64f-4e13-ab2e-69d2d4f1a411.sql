-- Fix search path security warning for new functions
CREATE OR REPLACE FUNCTION validate_active_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT (NEW.active_role = ANY(NEW.available_roles)) THEN
    RAISE EXCEPTION 'Active role must be one of the available roles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;