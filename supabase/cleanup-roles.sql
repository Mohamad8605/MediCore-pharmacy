-- Remove "patient" role from users who also have "admin" or "pharmacist"
DELETE FROM user_roles
WHERE role = 'patient'
  AND user_id IN (
    SELECT user_id FROM user_roles
    WHERE role IN ('admin', 'pharmacist')
  );
