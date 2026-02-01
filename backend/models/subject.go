package models

import "time"

// Subject represents a course/subject
type Subject struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Color       string    `json:"color"`
	CreatedAt   time.Time `json:"created_at"`
}

// SubjectWithProgress includes progress information
type SubjectWithProgress struct {
	Subject
	TotalTopics     int     `json:"total_topics"`
	CompletedTopics int     `json:"completed_topics"`
	WeakTopics      int     `json:"weak_topics"`
	Progress        float64 `json:"progress"`
}

// CreateSubjectInput is the input for creating a subject
type CreateSubjectInput struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Color       string `json:"color"`
}

// UpdateSubjectInput is the input for updating a subject
type UpdateSubjectInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
}
