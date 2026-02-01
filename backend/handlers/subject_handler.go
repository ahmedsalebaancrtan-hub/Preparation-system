package handlers

import (
	"exam-prep/database"
	"exam-prep/models"
	"exam-prep/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetAllSubjects returns all subjects with their progress
func GetAllSubjects(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT s.id, s.name, s.description, s.color, s.created_at,
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

	var subjects []models.SubjectWithProgress
	for rows.Next() {
		var s models.SubjectWithProgress
		err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Color, &s.CreatedAt,
			&s.TotalTopics, &s.CompletedTopics, &s.WeakTopics)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		if s.TotalTopics > 0 {
			s.Progress = float64(s.CompletedTopics) / float64(s.TotalTopics) * 100
		}
		subjects = append(subjects, s)
	}

	utils.SuccessResponse(c, http.StatusOK, "Subjects retrieved", subjects)
}

// GetSubject returns a single subject by ID
func GetSubject(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid subject ID")
		return
	}

	var s models.SubjectWithProgress
	err = database.DB.QueryRow(`
		SELECT s.id, s.name, s.description, s.color, s.created_at,
			   COALESCE(COUNT(t.id), 0) as total_topics,
			   COALESCE(SUM(CASE WHEN t.is_completed THEN 1 ELSE 0 END), 0) as completed_topics,
			   COALESCE(SUM(CASE WHEN t.is_weak THEN 1 ELSE 0 END), 0) as weak_topics
		FROM subjects s
		LEFT JOIN topics t ON s.id = t.subject_id
		WHERE s.id = $1
		GROUP BY s.id
	`, id).Scan(&s.ID, &s.Name, &s.Description, &s.Color, &s.CreatedAt,
		&s.TotalTopics, &s.CompletedTopics, &s.WeakTopics)

	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Subject not found")
		return
	}

	if s.TotalTopics > 0 {
		s.Progress = float64(s.CompletedTopics) / float64(s.TotalTopics) * 100
	}

	utils.SuccessResponse(c, http.StatusOK, "Subject retrieved", s)
}

// CreateSubject creates a new subject
func CreateSubject(c *gin.Context) {
	var input models.CreateSubjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if input.Color == "" {
		input.Color = "#3498db"
	}

	var id int
	err := database.DB.QueryRow(
		"INSERT INTO subjects (name, description, color) VALUES ($1, $2, $3) RETURNING id",
		input.Name, input.Description, input.Color,
	).Scan(&id)

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Subject created", gin.H{"id": id})
}

// UpdateSubject updates an existing subject
func UpdateSubject(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid subject ID")
		return
	}

	var input models.UpdateSubjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := database.DB.Exec(
		"UPDATE subjects SET name = COALESCE(NULLIF($1, ''), name), description = COALESCE(NULLIF($2, ''), description), color = COALESCE(NULLIF($3, ''), color) WHERE id = $4",
		input.Name, input.Description, input.Color, id,
	)

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Subject not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Subject updated", nil)
}

// DeleteSubject deletes a subject
func DeleteSubject(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid subject ID")
		return
	}

	result, err := database.DB.Exec("DELETE FROM subjects WHERE id = $1", id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Subject not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Subject deleted", nil)
}
