package models

import "time"

// Topic represents a topic within a subject
type Topic struct {
	ID          int       `json:"id"`
	SubjectID   int       `json:"subject_id"`
	Name        string    `json:"name"`
	IsCompleted bool      `json:"is_completed"`
	IsWeak      bool      `json:"is_weak"`
	CreatedAt   time.Time `json:"created_at"`
}

// CreateTopicInput is the input for creating a topic
type CreateTopicInput struct {
	SubjectID int    `json:"subject_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
}

// UpdateTopicInput is the input for updating a topic
type UpdateTopicInput struct {
	Name        string `json:"name"`
	IsCompleted *bool  `json:"is_completed"`
	IsWeak      *bool  `json:"is_weak"`
}
