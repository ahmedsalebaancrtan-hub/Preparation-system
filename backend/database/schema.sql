-- Exam Preparation System Database Schema
-- Run this in PostgreSQL to create the database tables

-- Subjects table (your 5 courses)
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3498db',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics table (topics within each subject)
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_weak BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table (short revision notes)
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study plan table (daily study schedule)
CREATE TABLE IF NOT EXISTS study_plan (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    study_date DATE NOT NULL,
    hours_planned DECIMAL(3,1) DEFAULT 1.0,
    hours_completed DECIMAL(3,1) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subjects for Semester 8
INSERT INTO subjects (name, description, color) VALUES
    ('Flutter', 'Mobile app development with Flutter framework', '#02569B'),
    ('Research Methodology', 'Research methods and academic writing', '#9C27B0'),
    ('Linux', 'Linux operating system and administration', '#FCC624'),
    ('Oracle', 'Oracle database management and SQL', '#F80000'),
    ('Microprocessor', 'Microprocessor architecture and programming', '#00897B')
ON CONFLICT DO NOTHING;
