package models

import "time"

// StudyPlan represents a daily study plan entry
type StudyPlan struct {
	ID             int       `json:"id"`
	SubjectID      int       `json:"subject_id"`
	SubjectName    string    `json:"subject_name,omitempty"`
	SubjectColor   string    `json:"subject_color,omitempty"`
	StudyDate      string    `json:"study_date"`
	HoursPlanned   float64   `json:"hours_planned"`
	HoursCompleted float64   `json:"hours_completed"`
	Notes          string    `json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
}

// CreateStudyPlanInput is the input for creating a study plan
type CreateStudyPlanInput struct {
	SubjectID    int     `json:"subject_id" binding:"required"`
	StudyDate    string  `json:"study_date" binding:"required"`
	HoursPlanned float64 `json:"hours_planned"`
	Notes        string  `json:"notes"`
}

// UpdateStudyPlanInput is the input for updating a study plan
type UpdateStudyPlanInput struct {
	HoursPlanned   *float64 `json:"hours_planned"`
	HoursCompleted *float64 `json:"hours_completed"`
	Notes          string   `json:"notes"`
}
