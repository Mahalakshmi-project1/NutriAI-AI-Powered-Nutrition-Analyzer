-- Add reply_sent column to track auto-reply status
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS reply_sent BOOLEAN DEFAULT false;
