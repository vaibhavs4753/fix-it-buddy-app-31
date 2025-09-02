-- Update handle_new_user function to properly map userType from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  -- Map userType to proper role
  user_role := CASE 
    WHEN NEW.raw_user_meta_data ->> 'userType' = 'client' THEN 'customer'
    WHEN NEW.raw_user_meta_data ->> 'userType' = 'technician' THEN 'technician'
    ELSE 'customer'
  END;

  INSERT INTO public.profiles (id, name, phone, role, email, active_role, available_roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone',
    user_role,
    NEW.email,
    user_role,
    ARRAY[user_role]
  );
  RETURN NEW;
END;
$function$;