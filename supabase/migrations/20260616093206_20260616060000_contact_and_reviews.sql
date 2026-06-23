-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_review BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insert for contact form
CREATE POLICY "allow_public_insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Allow public to read approved reviews for testimonials
CREATE POLICY "allow_read_approved" ON contact_submissions
  FOR SELECT USING (is_approved = true);
  
-- Create index for approved reviews
CREATE INDEX idx_contact_submissions_approved ON contact_submissions(is_approved) WHERE is_approved = true;