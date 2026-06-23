
-- Expand gender column to support all identity options
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_gender_check;

ALTER TABLE user_profiles
  ALTER COLUMN gender TYPE text;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_gender_check
    CHECK (gender IN ('male', 'female', 'transgender', 'non_binary', 'other'));
