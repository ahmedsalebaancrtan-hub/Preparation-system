package main

import (
	"exam-prep/database"
	"exam-prep/routes"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Connect to database
	err = database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize tables
	err = database.InitTables()
	if err != nil {
		log.Fatalf("Failed to initialize tables: %v", err)
	}

	// Seed default subjects
	err = database.SeedSubjects()
	if err != nil {
		log.Printf("Warning: Failed to seed subjects: %v", err)
	}

	// Setup Gin router
	r := gin.Default()

	// Setup routes
	routes.SetupRoutes(r)

	// Get port from environment
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📚 Exam Preparation System API Ready!")
	log.Printf("📅 Exam Date: %s", os.Getenv("EXAM_DATE"))

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
