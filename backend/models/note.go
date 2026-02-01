package models

import "time"

// Note represents a study note
type Note struct {
	ID        int       `json:"id"`
	SubjectID int       `json:"subject_id"`
	TopicID   *int      `json:"topic_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateNoteInput is the input for creating a note
type CreateNoteInput struct {
	SubjectID int    `json:"subject_id" binding:"required"`
	TopicID   *int   `json:"topic_id"`
	Title     string `json:"title" binding:"required"`
	Content   string `json:"content"`
}

// UpdateNoteInput is the input for updating a note
type UpdateNoteInput struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	TopicID *int   `json:"topic_id"`
}
