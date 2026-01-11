-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS questions_asked CASCADE;
DROP TABLE IF EXISTS competitive_mentions CASCADE;
DROP TABLE IF EXISTS objections CASCADE;
DROP TABLE IF EXISTS pain_points CASCADE;
DROP TABLE IF EXISTS transcripts CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;

-- Create meetings table with new schema matching CSV structure
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone_number VARCHAR(50),
  meeting_date DATE NOT NULL,
  sales_person VARCHAR(255) NOT NULL,
  closed BOOLEAN NOT NULL DEFAULT FALSE,
  transcript TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);

-- Create pain_points table
CREATE TABLE IF NOT EXISTS pain_points (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  pain_point TEXT NOT NULL,
  category VARCHAR(100),
  priority VARCHAR(20) CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create objections table
CREATE TABLE IF NOT EXISTS objections (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  objection TEXT NOT NULL,
  objection_type VARCHAR(100),
  resolution_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create competitive_mentions table
CREATE TABLE IF NOT EXISTS competitive_mentions (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  competitor_name VARCHAR(255) NOT NULL,
  mention_context TEXT,
  sentiment VARCHAR(50) CHECK (sentiment IN ('Positive', 'Negative', 'Neutral')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions_asked table
CREATE TABLE IF NOT EXISTS questions_asked (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category VARCHAR(100),
  answered BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance with new column names
CREATE INDEX IF NOT EXISTS idx_meetings_sales_person ON meetings(sales_person);
CREATE INDEX IF NOT EXISTS idx_meetings_closed ON meetings(closed);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_pain_points_meeting ON pain_points(meeting_id);
CREATE INDEX IF NOT EXISTS idx_objections_meeting ON objections(meeting_id);
CREATE INDEX IF NOT EXISTS idx_competitive_mentions_meeting ON competitive_mentions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_questions_meeting ON questions_asked(meeting_id);
