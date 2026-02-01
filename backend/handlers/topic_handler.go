package handlers

import (
	"exam-prep/database"
	"exam-prep/models"
	"exam-prep/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetTopicsBySubject returns all topics for a subject
func GetTopicsBySubject(c *gin.Context) {
	subjectID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid subject ID")
		return
	}

	rows, err := database.DB.Query(
		"SELECT id, subject_id, name, is_completed, is_weak, created_at FROM topics WHERE subject_id = $1 ORDER BY id",
		subjectID,
	)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var topics []models.Topic
	for rows.Next() {
		var t models.Topic
		err := rows.Scan(&t.ID, &t.SubjectID, &t.Name, &t.IsCompleted, &t.IsWeak, &t.CreatedAt)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		topics = append(topics, t)
	}

	utils.SuccessResponse(c, http.StatusOK, "Topics retrieved", topics)
}

// CreateTopic creates a new topic
func CreateTopic(c *gin.Context) {
	var input models.CreateTopicInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var id int
	err := database.DB.QueryRow(
		"INSERT INTO topics (subject_id, name) VALUES ($1, $2) RETURNING id",
		input.SubjectID, input.Name,
	).Scan(&id)

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Topic created", gin.H{"id": id})
}

// UpdateTopic updates a topic
func UpdateTopic(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid topic ID")
		return
	}

	var input models.UpdateTopicInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Build dynamic update query
	query := "UPDATE topics SET "
	args := []interface{}{}
	argIndex := 1

	if input.Name != "" {
		query += "name = $" + strconv.Itoa(argIndex) + ", "
		args = append(args, input.Name)
		argIndex++
	}
	if input.IsCompleted != nil {
		query += "is_completed = $" + strconv.Itoa(argIndex) + ", "
		args = append(args, *input.IsCompleted)
		argIndex++
	}
	if input.IsWeak != nil {
		query += "is_weak = $" + strconv.Itoa(argIndex) + ", "
		args = append(args, *input.IsWeak)
		argIndex++
	}

	// Remove trailing comma and space
	query = query[:len(query)-2]
	query += " WHERE id = $" + strconv.Itoa(argIndex)
	args = append(args, id)

	result, err := database.DB.Exec(query, args...)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Topic not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Topic updated", nil)
}

// ToggleTopicComplete toggles the completion status of a topic
func ToggleTopicComplete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid topic ID")
		return
	}

	result, err := database.DB.Exec(
		"UPDATE topics SET is_completed = NOT is_completed WHERE id = $1", id,
	)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Topic not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Topic completion toggled", nil)
}

// ToggleTopicWeak toggles the weak status of a topic
func ToggleTopicWeak(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid topic ID")
		return
	}

	result, err := database.DB.Exec(
		"UPDATE topics SET is_weak = NOT is_weak WHERE id = $1", id,
	)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Topic not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Topic weak status toggled", nil)
}

// DeleteTopic deletes a topic
func DeleteTopic(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid topic ID")
		return
	}

	result, err := database.DB.Exec("DELETE FROM topics WHERE id = $1", id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Topic not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Topic deleted", nil)
}
