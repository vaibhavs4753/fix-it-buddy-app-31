-- Fix function security issues detected by linter

-- 1. Fix search path for all functions to prevent SQL injection
ALTER FUNCTION public.prevent_role_escalation() SET search_path = public;
ALTER FUNCTION public.get_available_technicians_for_service(text, numeric, numeric, numeric) SET search_path = public;
ALTER FUNCTION public.create_payment_record(uuid, uuid, uuid, numeric, text, text) SET search_path = public;