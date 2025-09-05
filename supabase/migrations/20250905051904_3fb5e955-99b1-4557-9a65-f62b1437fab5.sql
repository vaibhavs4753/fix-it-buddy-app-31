-- Fix user roles by ensuring base role is always in available_roles
UPDATE profiles 
SET available_roles = array_append(available_roles, role)
WHERE NOT (role = ANY(available_roles));

-- Fix the specific user's roles to include both customer and technician
UPDATE profiles 
SET available_roles = ARRAY['customer', 'technician']
WHERE id = 'c62ecf4c-7dd3-416b-a318-aab4b0582d40';