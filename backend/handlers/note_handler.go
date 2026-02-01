package handlers

import (
	"exam-prep/database"
	"exam-prep/models"
	"exam-prep/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetAllNotes returns all notes
func GetAllNotes(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT n.id, n.subject_id, n.topic_id, n.title, n.content, n.created_at, n.updated_at
		FROM notes n
		ORDER BY n.updated_at DESC
	`)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var notes []models.Note
	for rows.Next() {
		var n models.Note
		err := rows.Scan(&n.ID, &n.SubjectID, &n.TopicID, &n.Title, &n.Content, &n.CreatedAt, &n.UpdatedAt)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		notes = append(notes, n)
	}

	utils.SuccessResponse(c, http.StatusOK, "Notes retrieved", notes)
}

// GetNotesBySubject returns all notes for a subject
func GetNotesBySubject(c *gin.Context) {
	subjectID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid subject ID")
		return
	}

	rows, err := database.DB.Query(`
		SELECT id, subject_id, topic_id, title, content, created_at, updated_at
		FROM notes
		WHERE subject_id = $1
		ORDER BY updated_at DESC
	`, subjectID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var notes []models.Note
	for rows.Next() {
		var n models.Note
		err := rows.Scan(&n.ID, &n.SubjectID, &n.TopicID, &n.Title, &n.Content, &n.CreatedAt, &n.UpdatedAt)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		notes = append(notes, n)
	}

	utils.SuccessResponse(c, http.StatusOK, "Notes retrieved", notes)
}

// CreateNote creates a new note
func CreateNote(c *gin.Context) {
	var input models.CreateNoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var id int
	err := database.DB.QueryRow(
		"INSERT INTO notes (subject_id, topic_id, title, content) VALUES ($1, $2, $3, $4) RETURNING id",
		input.SubjectID, input.TopicID, input.Title, input.Content,
	).Scan(&id)

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Note created", gin.H{"id": id})
}

// UpdateNote updates a note
func UpdateNote(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid note ID")
		return
	}

	var input models.UpdateNoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := database.DB.Exec(
		"UPDATE notes SET title = COALESCE(NULLIF($1, ''), title), content = COALESCE($2, content), topic_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		input.Title, input.Content, input.TopicID, id,
	)

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Note not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Note updated", nil)
}

// DeleteNote deletes a note
func DeleteNote(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid note ID")
		return
	}

	result, err := database.DB.Exec("DELETE FROM notes WHERE id = $1", id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Note not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Note deleted", nil)
}
