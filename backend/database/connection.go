package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// Connect establishes a connection to the PostgreSQL database
func Connect() error {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}

	// Test the connection
	err = DB.Ping()
	if err != nil {
		return fmt.Errorf("error connecting to database: %v", err)
	}

	log.Println("✅ Connected to PostgreSQL database successfully!")
	return nil
}

// Close closes the database connection
func Close() {
	if DB != nil {
		DB.Close()
	}
}

// InitTables creates the database tables if they don't exist
func InitTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS subjects (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			color VARCHAR(7) DEFAULT '#3498db',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS topics (
			id SERIAL PRIMARY KEY,
			subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
			name VARCHAR(200) NOT NULL,
			is_completed BOOLEAN DEFAULT FALSE,
			is_weak BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS notes (
			id SERIAL PRIMARY KEY,
			subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
			topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
			title VARCHAR(200) NOT NULL,
			content TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS study_plan (
			id SERIAL PRIMARY KEY,
			subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
			study_date DATE NOT NULL,
			hours_planned DECIMAL(3,1) DEFAULT 1.0,
			hours_completed DECIMAL(3,1) DEFAULT 0.0,
			notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			return fmt.Errorf("error creating table: %v", err)
		}
	}

	log.Println("✅ Database tables initialized successfully!")
	return nil
}

// SeedSubjects inserts the default 5 subjects if they don't exist
func SeedSubjects() error {
	subjects := []struct {
		Name        string
		Description string
		Color       string
	}{
		{"Flutter", "Mobile app development with Flutter framework", "#02569B"},
		{"Research Methodology", "Research methods and academic writing", "#9C27B0"},
		{"Linux", "Linux operating system and administration", "#FCC624"},
		{"Oracle", "Oracle database management and SQL", "#F80000"},
		{"Microprocessor", "Microprocessor architecture and programming", "#00897B"},
	}

	for _, s := range subjects {
		// Check if subject already exists
		var count int
		err := DB.QueryRow("SELECT COUNT(*) FROM subjects WHERE name = $1", s.Name).Scan(&count)
		if err != nil {
			return err
		}

		if count == 0 {
			_, err = DB.Exec(
				"INSERT INTO subjects (name, description, color) VALUES ($1, $2, $3)",
				s.Name, s.Description, s.Color,
			)
			if err != nil {
				return err
			}
			log.Printf("✅ Added subject: %s", s.Name)
		}
	}

	return nil
}
