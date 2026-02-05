CREATE TABLE IF NOT EXISTS exhibitor_scanned_visitors (
  id BIGSERIAL PRIMARY KEY,
  exhibitor_id BIGINT REFERENCES exhibitors(id) ON DELETE SET NULL,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  visitor_id BIGINT REFERENCES visitors(id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL DEFAULT 'QR_SCAN', -- 'QR_SCAN' or 'OCR'
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  visitor_company TEXT,
  visitor_designation TEXT,
  visitor_unique_code TEXT,
  ocr_raw_text TEXT,
  notes TEXT,
  lead_status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Converted', 'Not Interested'
  interest_level INTEGER, -- 1-5 rating
  follow_up_date DATE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_esv_exhibitor_id ON exhibitor_scanned_visitors(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_esv_event_id ON exhibitor_scanned_visitors(event_id);
CREATE INDEX IF NOT EXISTS idx_esv_visitor_unique_code ON exhibitor_scanned_visitors(visitor_unique_code);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_exhibitor_scanned_visitors_updated_at ON exhibitor_scanned_visitors;
CREATE TRIGGER update_exhibitor_scanned_visitors_updated_at
    BEFORE UPDATE ON exhibitor_scanned_visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
