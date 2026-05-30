-- Fix log_audit_action() to use JSONB access for record fields
-- This prevents errors when trigger is used on tables without title/full_name/name columns
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS \$\$
DECLARE
  v_action TEXT;
  v_action_type TEXT;
  v_target_type TEXT;
  v_target_id UUID;
  v_target_name TEXT;
  v_actor_id UUID;
  v_actor_email TEXT;
  v_details JSONB;
BEGIN
  v_actor_id := COALESCE(auth.uid(), NEW.id, OLD.id);
  v_actor_email := (SELECT email FROM auth.users WHERE id = v_actor_id);

  IF TG_OP = 'INSERT' THEN
    v_action := TG_TABLE_NAME || ' created';
    v_action_type := TG_TABLE_NAME || '.created';
    v_target_id := NEW.id;
    v_target_name := COALESCE(
      to_jsonb(NEW) ->> 'title',
      to_jsonb(NEW) ->> 'full_name',
      to_jsonb(NEW) ->> 'name',
      NEW.id::TEXT
    );
    v_details := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := TG_TABLE_NAME || ' updated';
    v_action_type := TG_TABLE_NAME || '.updated';
    v_target_id := NEW.id;
    v_target_name := COALESCE(
      to_jsonb(NEW) ->> 'title',
      to_jsonb(NEW) ->> 'full_name',
      to_jsonb(NEW) ->> 'name',
      NEW.id::TEXT
    );
    v_details := jsonb_build_object('changes', (
      SELECT jsonb_object_agg(key, jsonb_build_object('old', OLD.value, 'new', NEW.value))
      FROM jsonb_each(to_jsonb(OLD) - 'updated_at' - 'created_at')
      JOIN jsonb_each(to_jsonb(NEW) - 'updated_at' - 'created_at') USING (key)
      WHERE OLD.value IS DISTINCT FROM NEW.value
    ));
  ELSIF TG_OP = 'DELETE' THEN
    v_action := TG_TABLE_NAME || ' deleted';
    v_action_type := TG_TABLE_NAME || '.deleted';
    v_target_id := OLD.id;
    v_target_name := COALESCE(
      to_jsonb(OLD) ->> 'title',
      to_jsonb(OLD) ->> 'full_name',
      to_jsonb(OLD) ->> 'name',
      OLD.id::TEXT
    );
    v_details := to_jsonb(OLD);
  END IF;

  v_target_type := TG_TABLE_NAME;

  INSERT INTO public.audit_logs (action, actor_id, actor_email, action_type, target_type, target_id, target_name, details)
  VALUES (v_action, v_actor_id, v_actor_email, v_action_type, v_target_type, v_target_id, v_target_name, v_details);

  RETURN COALESCE(NEW, OLD);
END;
\$\$;
