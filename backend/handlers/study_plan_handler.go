package handlers

import (
	"exam-prep/database"
	"exam-prep/models"
	"exam-prep/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GetAllStudyPlans returns all study plans
func GetAllStudyPlans(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT sp.id, sp.subject_id, s.name, s.color, sp.study_date, sp.hours_planned, sp.hours_completed, COALESCE(sp.notes, ''), sp.created_at
		FROM study_plan sp
		JOIN subjects s ON sp.subject_id = s.id
		ORDER BY sp.study_date DESC
	`)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var plans []models.StudyPlan
	for rows.Next() {
		var sp models.StudyPlan
		var studyDate time.Time
		err := rows.Scan(&sp.ID, &sp.SubjectID, &sp.SubjectName, &sp.SubjectColor, &studyDate, &sp.HoursPlanned, &sp.HoursCompleted, &sp.Notes, &sp.CreatedAt)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		sp.StudyDate = studyDate.Format("2006-01-02")
		plans = append(plans, sp)
	}

	utils.SuccessResponse(c, http.StatusOK, "Study plans retrieved", plans)
}

// GetTodayStudyPlan returns today's study plan
func GetTodayStudyPlan(c *gin.Context) {
	today := time.Now().Format("2006-01-02")

	rows, err := database.DB.Query(`
		SELECT sp.id, sp.subject_id, s.name, s.color, sp.study_date, sp.hours_planned, sp.hours_completed, COALESCE(sp.notes, ''), sp.created_at
		FROM study_plan sp
		JOIN subjects s ON sp.subject_id = s.id
		WHERE sp.study_date = $1
		ORDER BY sp.id
	`, today)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var plans []models.StudyPlan
	for rows.Next() {
		var sp models.StudyPlan
		var studyDate time.Time
		err := rows.Scan(&sp.ID, &sp.SubjectID, &sp.SubjectName, &sp.SubjectColor, &studyDate, &sp.HoursPlanned, &sp.HoursCompleted, &sp.Notes, &sp.CreatedAt)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		sp.StudyDate = studyDate.Format("2006-01-02")
		plans = append(plans, sp)
	}

	utils.SuccessResponse(c, http.StatusOK, "Today's study plan retrieved", plans)
}

// CreateStudyPlan creates a new study plan entry
func CreateStudyPlan(c *gin.Context) {
	var input models.CreateStudyPlanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if input.HoursPlanned == 0 {
		input.HoursPlanned = 1.0
	}

	var id int
	err := database.DB.QueryRow(
		"INSERT INTO study_plan (subject_id, study_date, hours_planned, notes) VALUES ($1, $2, $3, $4) RETURNING id",
		input.SubjectID, input.StudyDate, input.HoursPlanned, input.Notes,
	).Scan(&id)

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Study plan created", gin.H{"id": id})
}

// UpdateStudyPlan updates a study plan
func UpdateStudyPlan(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid study plan ID")
		return
	}

	var input models.UpdateStudyPlanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Build dynamic update query
	query := "UPDATE study_plan SET "
	args := []interface{}{}
	argIndex := 1

	if input.HoursPlanned != nil {
		query += "hours_planned = $" + strconv.Itoa(argIndex) + ", "
		args = append(args, *input.HoursPlanned)
		argIndex++
	}
	if input.HoursCompleted != nil {
		query += "hours_completed = $" + strconv.Itoa(argIndex) + ", "
		args = append(args, *input.HoursCompleted)
		argIndex++
	}
	if input.Notes != "" {
		query += "notes = $" + strconv.Itoa(argIndex) + ", "
		args = append(args, input.Notes)
		argIndex++
	}

	if len(args) == 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "No fields to update")
		return
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
		utils.ErrorResponse(c, http.StatusNotFound, "Study plan not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Study plan updated", nil)
}

// DeleteStudyPlan deletes a study plan
func DeleteStudyPlan(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid study plan ID")
		return
	}

	result, err := database.DB.Exec("DELETE FROM study_plan WHERE id = $1", id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Study plan not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Study plan deleted", nil)
}
