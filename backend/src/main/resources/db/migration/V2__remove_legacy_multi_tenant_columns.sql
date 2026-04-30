-- Removes leftover multi-tenant schema from legacy databases after the
-- single-tenant refactor. The migration is idempotent so it can run safely
-- on both fresh and legacy environments.

ALTER TABLE IF EXISTS app_user
    DROP CONSTRAINT IF EXISTS app_user_business_fk;

ALTER TABLE IF EXISTS employee
    DROP CONSTRAINT IF EXISTS employee_business_fk;

ALTER TABLE IF EXISTS fair_location
    DROP CONSTRAINT IF EXISTS fair_location_business_fk;

ALTER TABLE IF EXISTS cash_movement
    DROP CONSTRAINT IF EXISTS cash_movement_business_fk;

ALTER TABLE IF EXISTS employee_payment
    DROP CONSTRAINT IF EXISTS employee_payment_business_fk;

ALTER TABLE IF EXISTS employee_payment
    DROP CONSTRAINT IF EXISTS employee_payment_employee_same_business_fk;

ALTER TABLE IF EXISTS employee_payment
    DROP CONSTRAINT IF EXISTS employee_payment_cash_movement_same_business_fk;

ALTER TABLE IF EXISTS cash_movement
    DROP CONSTRAINT IF EXISTS cash_movement_fair_location_same_business_fk;

DROP INDEX IF EXISTS idx_app_user_business_id;
DROP INDEX IF EXISTS idx_employee_business_id;
DROP INDEX IF EXISTS idx_fair_location_business_id;
DROP INDEX IF EXISTS idx_cash_movement_business_id;
DROP INDEX IF EXISTS idx_employee_payment_business_id;

ALTER TABLE IF EXISTS app_user
    DROP COLUMN IF EXISTS business_id CASCADE;

ALTER TABLE IF EXISTS employee
    DROP COLUMN IF EXISTS business_id CASCADE;

ALTER TABLE IF EXISTS fair_location
    DROP COLUMN IF EXISTS business_id CASCADE;

ALTER TABLE IF EXISTS cash_movement
    DROP COLUMN IF EXISTS business_id CASCADE;

ALTER TABLE IF EXISTS employee_payment
    DROP COLUMN IF EXISTS business_id CASCADE;

DROP TABLE IF EXISTS business CASCADE;
