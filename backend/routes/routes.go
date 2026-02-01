package routes

import (
	"exam-prep/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine) {
	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api")
	{
		// Dashboard
		api.GET("/dashboard", handlers.GetDashboard)
		api.GET("/progress", handlers.GetProgress)

		// Subjects
		api.GET("/subjects", handlers.GetAllSubjects)
		api.GET("/subjects/:id", handlers.GetSubject)
		api.POST("/subjects", handlers.CreateSubject)
		api.PUT("/subjects/:id", handlers.UpdateSubject)
		api.DELETE("/subjects/:id", handlers.DeleteSubject)

		// Topics (nested under subjects for GET)
		api.GET("/subjects/:id/topics", handlers.GetTopicsBySubject)
		api.POST("/topics", handlers.CreateTopic)
		api.PUT("/topics/:id", handlers.UpdateTopic)
		api.PUT("/topics/:id/complete", handlers.ToggleTopicComplete)
		api.PUT("/topics/:id/weak", handlers.ToggleTopicWeak)
		api.DELETE("/topics/:id", handlers.DeleteTopic)

		// Notes
		api.GET("/notes", handlers.GetAllNotes)
		api.GET("/subjects/:id/notes", handlers.GetNotesBySubject)
		api.POST("/notes", handlers.CreateNote)
		api.PUT("/notes/:id", handlers.UpdateNote)
		api.DELETE("/notes/:id", handlers.DeleteNote)

		// Study Plan
		api.GET("/study-plan", handlers.GetAllStudyPlans)
		api.GET("/study-plan/today", handlers.GetTodayStudyPlan)
		api.POST("/study-plan", handlers.CreateStudyPlan)
		api.PUT("/study-plan/:id", handlers.UpdateStudyPlan)
		api.DELETE("/study-plan/:id", handlers.DeleteStudyPlan)
	}
}
