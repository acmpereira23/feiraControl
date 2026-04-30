-- WARNING:
-- This migration clears all application data so a local environment can start
-- from an empty operational state again. It keeps the schema and Flyway
-- history intact.

DELETE FROM employee_payment;
DELETE FROM app_user_role;
DELETE FROM cash_movement;
DELETE FROM employee;
DELETE FROM fair_location_operating_day;
DELETE FROM fair_location;
DELETE FROM app_user;
