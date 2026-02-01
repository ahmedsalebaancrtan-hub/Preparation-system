import React, { useState, useEffect } from 'react';
import { getStudyPlans, getSubjects, createStudyPlan, updateStudyPlan, deleteStudyPlan } from '../services/api';

function StudyPlan() {
    const [plans, setPlans] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [planForm, setPlanForm] = useState({
        subject_id: '',
        study_date: new Date().toISOString().split('T')[0],
        hours_planned: 2,
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [plansRes, subjectsRes] = await Promise.all([
                getStudyPlans(),
                getSubjects()
            ]);
            setPlans(plansRes.data.data || []);
            setSubjects(subjectsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createStudyPlan({
                ...planForm,
                subject_id: parseInt(planForm.subject_id),
                hours_planned: parseFloat(planForm.hours_planned)
            });
            setShowModal(false);
            setPlanForm({
                subject_id: '',
                study_date: new Date().toISOString().split('T')[0],
                hours_planned: 2,
                notes: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error creating plan:', error);
        }
    };

    const handleUpdateHours = async (id, hours_completed) => {
        try {
            await updateStudyPlan(id, { hours_completed: parseFloat(hours_completed) });
            fetchData();
        } catch (error) {
            console.error('Error updating plan:', error);
        }
    };

    const handleDeletePlan = async (id) => {
        if (window.confirm('Delete this study plan?')) {
            try {
                await deleteStudyPlan(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting plan:', error);
            }
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const todayPlans = plans.filter(p => p.study_date === today);
    const upcomingPlans = plans.filter(p => p.study_date > today);
    const pastPlans = plans.filter(p => p.study_date < today);

    if (loading) {
        return <div className="loading">Loading study plans...</div>;
    }

    const renderPlanItem = (plan) => (
        <div key={plan.id} className="study-plan-item" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                    className="subject-badge"
                    style={{ background: plan.subject_color, color: '#fff' }}
                >
                    {plan.subject_name}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(plan.study_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span>📊 Planned: <strong>{plan.hours_planned}h</strong></span>
                <span>✅ Completed:
                    <input
                        type="number"
                        value={plan.hours_completed}
                        onChange={(e) => handleUpdateHours(plan.id, e.target.value)}
                        min="0"
                        max={plan.hours_planned}
                        step="0.5"
                        style={{
                            width: '60px',
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-dark)',
                            color: 'var(--text-primary)'
                        }}
                    />h
                </span>
            </div>

            {plan.notes && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    📝 {plan.notes}
                </p>
            )}

            <div style={{ marginTop: '0.75rem' }}>
                <div className="progress-container" style={{ height: '8px' }}>
                    <div
                        className="progress-bar"
                        style={{
                            width: `${plan.hours_planned > 0 ? (plan.hours_completed / plan.hours_planned) * 100 : 0}%`,
                            background: plan.subject_color
                        }}
                    ></div>
                </div>
            </div>

            <button
                className="btn btn-danger"
                style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => handleDeletePlan(plan.id)}
            >
                🗑️ Delete
            </button>
        </div>
    );

    return (
        <div className="study-plan-page">
            <div className="page-header">
                <h1>📅 Study Plan</h1>
                <p>Plan your daily study sessions</p>
            </div>

            <div className="action-bar">
                <h2>{plans.length} Planned Sessions</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Plan Study Session
                </button>
            </div>

            {/* Today's Plans */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🎯 Today ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })})
                </h3>
                {todayPlans.length > 0 ? (
                    <div className="study-plan-list">
                        {todayPlans.map(renderPlanItem)}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>No study sessions planned for today. Click "Plan Study Session" to add one!</p>
                )}
            </div>

            {/* Upcoming Plans */}
            {upcomingPlans.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📆 Upcoming</h3>
                    <div className="study-plan-list">
                        {upcomingPlans.map(renderPlanItem)}
                    </div>
                </div>
            )}

            {/* Past Plans */}
            {pastPlans.length > 0 && (
                <div className="card">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>📜 Past Sessions</h3>
                    <div className="study-plan-list">
                        {pastPlans.slice(0, 5).map(renderPlanItem)}
                    </div>
                    {pastPlans.length > 5 && (
                        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
                            ... and {pastPlans.length - 5} more past sessions
                        </p>
                    )}
                </div>
            )}

            {plans.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No study plans yet</h3>
                    <p>Create your first study plan to start tracking</p>
                </div>
            )}

            {/* Add Plan Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Plan Study Session</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Subject *</label>
                                <select
                                    value={planForm.subject_id}
                                    onChange={(e) => setPlanForm({ ...planForm, subject_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    value={planForm.study_date}
                                    onChange={(e) => setPlanForm({ ...planForm, study_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Hours Planned</label>
                                <input
                                    type="number"
                                    value={planForm.hours_planned}
                                    onChange={(e) => setPlanForm({ ...planForm, hours_planned: e.target.value })}
                                    min="0.5"
                                    max="12"
                                    step="0.5"
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={planForm.notes}
                                    onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                                    placeholder="What do you plan to cover?"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudyPlan;
