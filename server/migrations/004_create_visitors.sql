-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    mobile TEXT,
    gender TEXT,
    age_group TEXT,
    organization TEXT,
    designation TEXT,
    event_id INTEGER,
    visitor_category TEXT,
    valid_dates TEXT,
    communication JSONB,
    created_at TIMESTAMP DEFAULT now()
);
