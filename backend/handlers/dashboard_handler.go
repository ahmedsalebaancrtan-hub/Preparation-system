package handlers

import (
	"exam-prep/database"
	"exam-prep/utils"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// DashboardData holds the dashboard information
type DashboardData struct {
	DaysUntilExam   int                   `json:"days_until_exam"`
	ExamDate        string                `json:"exam_date"`
	TotalSubjects   int                   `json:"total_subjects"`
	TotalTopics     int                   `json:"total_topics"`
	CompletedTopics int                   `json:"completed_topics"`
	WeakTopics      int                   `json:"weak_topics"`
	OverallProgress float64               `json:"overall_progress"`
	TodaysPlan      []TodayPlanItem       `json:"todays_plan"`
	SubjectProgress []SubjectProgressItem `json:"subject_progress"`
}

// TodayPlanItem represents a study plan item for today
type TodayPlanItem struct {
	SubjectID      int     `json:"subject_id"`
	SubjectName    string  `json:"subject_name"`
	SubjectColor   string  `json:"subject_color"`
	HoursPlanned   float64 `json:"hours_planned"`
	HoursCompleted float64 `json:"hours_completed"`
}

// SubjectProgressItem represents progress for a single subject
type SubjectProgressItem struct {
	ID              int     `json:"id"`
	Name            string  `json:"name"`
	Color           string  `json:"color"`
	TotalTopics     int     `json:"total_topics"`
	CompletedTopics int     `json:"completed_topics"`
	WeakTopics      int     `json:"weak_topics"`
	Progress        float64 `json:"progress"`
}

// GetDashboard returns dashboard data
func GetDashboard(c *gin.Context) {
	// Get exam date from env
	examDateStr := os.Getenv("EXAM_DATE")
	if examDateStr == "" {
		examDateStr = "2026-02-11"
	}

	examDate, err := time.Parse("2006-01-02", examDateStr)
	if err != nil {
		examDate = time.Date(2026, 2, 11, 0, 0, 0, 0, time.Local)
	}

	// Calculate days until exam
	now := time.Now()
	daysUntilExam := int(examDate.Sub(now).Hours() / 24)
	if daysUntilExam < 0 {
		daysUntilExam = 0
	}

	// Get total subjects
	var totalSubjects int
	database.DB.QueryRow("SELECT COUNT(*) FROM subjects").Scan(&totalSubjects)

	// Get topic statistics
	var totalTopics, completedTopics, weakTopics int
	database.DB.QueryRow("SELECT COUNT(*) FROM topics").Scan(&totalTopics)
	database.DB.QueryRow("SELECT COUNT(*) FROM topics WHERE is_completed = true").Scan(&completedTopics)
	database.DB.QueryRow("SELECT COUNT(*) FROM topics WHERE is_weak = true").Scan(&weakTopics)

	// Calculate overall progress
	var overallProgress float64
	if totalTopics > 0 {
		overallProgress = float64(completedTopics) / float64(totalTopics) * 100
	}

	// Get today's plan
	today := time.Now().Format("2006-01-02")
	todayRows, err := database.DB.Query(`
		SELECT sp.subject_id, s.name, s.color, sp.hours_planned, sp.hours_completed
		FROM study_plan sp
		JOIN subjects s ON sp.subject_id = s.id
		WHERE sp.study_date = $1
	`, today)

	var todaysPlan []TodayPlanItem
	if err == nil {
		defer todayRows.Close()
		for todayRows.Next() {
			var item TodayPlanItem
			todayRows.Scan(&item.SubjectID, &item.SubjectName, &item.SubjectColor, &item.HoursPlanned, &item.HoursCompleted)
			todaysPlan = append(todaysPlan, item)
		}
	}

	// Get subject progress
	progressRows, err := database.DB.Query(`
		SELECT s.id, s.name, s.color,
			   COALESCE(COUNT(t.id), 0) as total_topics,
			   COALESCE(SUM(CASE WHEN t.is_completed THEN 1 ELSE 0 END), 0) as completed_topics,
			   COALESCE(SUM(CASE WHEN t.is_weak THEN 1 ELSE 0 END), 0) as weak_topics
		FROM subjects s
		LEFT JOIN topics t ON s.id = t.subject_id
		GROUP BY s.id
		ORDER BY s.id
	`)

	var subjectProgress []SubjectProgressItem
	if err == nil {
		defer progressRows.Close()
		for progressRows.Next() {
			var item SubjectProgressItem
			progressRows.Scan(&item.ID, &item.Name, &item.Color, &item.TotalTopics, &item.CompletedTopics, &item.WeakTopics)
			if item.TotalTopics > 0 {
				item.Progress = float64(item.CompletedTopics) / float64(item.TotalTopics) * 100
			}
			subjectProgress = append(subjectProgress, item)
		}
	}

	dashboard := DashboardData{
		DaysUntilExam:   daysUntilExam,
		ExamDate:        examDateStr,
		TotalSubjects:   totalSubjects,
		TotalTopics:     totalTopics,
		CompletedTopics: completedTopics,
		WeakTopics:      weakTopics,
		OverallProgress: overallProgress,
		TodaysPlan:      todaysPlan,
		SubjectProgress: subjectProgress,
	}

	utils.SuccessResponse(c, http.StatusOK, "Dashboard data retrieved", dashboard)
}

// GetProgress returns overall progress data
func GetProgress(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT s.id, s.name, s.color,
			   COALESCE(COUNT(t.id), 0) as total_topics,
			   COALESCE(SUM(CASE WHEN t.is_completed THEN 1 ELSE 0 END), 0) as completed_topics,
			   COALESCE(SUM(CASE WHEN t.is_weak THEN 1 ELSE 0 END), 0) as weak_topics
		FROM subjects s
		LEFT JOIN topics t ON s.id = t.subject_id
		GROUP BY s.id
		ORDER BY s.id
	`)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var progress []SubjectProgressItem
	for rows.Next() {
		var item SubjectProgressItem
		err := rows.Scan(&item.ID, &item.Name, &item.Color, &item.TotalTopics, &item.CompletedTopics, &item.WeakTopics)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		if item.TotalTopics > 0 {
			item.Progress = float64(item.CompletedTopics) / float64(item.TotalTopics) * 100
		}
		progress = append(progress, item)
	}

	utils.SuccessResponse(c, http.StatusOK, "Progress data retrieved", progress)
}
