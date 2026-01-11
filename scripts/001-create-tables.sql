-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  meeting_date DATE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  salesperson VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  deal_status VARCHAR(50) NOT NULL CHECK (deal_status IN ('Won', 'Lost', 'In Progress')),
  deal_value DECIMAL(12, 2),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_industry ON meetings(industry);
CREATE INDEX IF NOT EXISTS idx_meetings_salesperson ON meetings(salesperson);
CREATE INDEX IF NOT EXISTS idx_meetings_deal_status ON meetings(deal_status);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_pain_points_meeting ON pain_points(meeting_id);
CREATE INDEX IF NOT EXISTS idx_objections_meeting ON objections(meeting_id);
CREATE INDEX IF NOT EXISTS idx_competitive_mentions_meeting ON competitive_mentions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_questions_meeting ON questions_asked(meeting_id);
