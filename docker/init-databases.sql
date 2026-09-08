-- Runs once, on an empty data volume. POSTGRES_DB has already created
-- siriinvest_dev; the end-to-end suite needs its own database because it
-- empties the users table between runs.
CREATE DATABASE siriinvest_test;
