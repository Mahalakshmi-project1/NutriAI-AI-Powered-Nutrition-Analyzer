-- Remove non_binary from the allowed gender values
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_gender_check;

-- Update any existing non_binary rows to 'other' to avoid orphan data
UPDATE user_profiles SET gender = 'other' WHERE gender = 'non_binary';

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_gender_check
    CHECK (gender IN ('male', 'female', 'transgender', 'other'));
