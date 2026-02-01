import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await getDashboard();
            setDashboard(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setError(error.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
        return (
            <div className="loading" style={{ color: '#ef4444', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '1.2rem' }}>Failed to load dashboard</div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{error}</div>
                <button
                    onClick={fetchDashboard}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!dashboard) {
        return <div className="loading">No dashboard data available</div>;
    }

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1>📚 Exam Preparation Dashboard</h1>
                <p>Semester 8 - Final Exams</p>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-grid">
                {/* Countdown Card */}
                <div className="stat-card countdown">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-value">{dashboard.days_until_exam}</div>
                    <div className="stat-label">Days Until Exam ({dashboard.exam_date})</div>
                </div>

                {/* Subjects Card */}
                <div className="stat-card">
                    <div className="stat-icon">📖</div>
                    <div className="stat-value">{dashboard.total_subjects}</div>
                    <div className="stat-label">Total Subjects</div>
                </div>

                {/* Topics Progress */}
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{dashboard.completed_topics}/{dashboard.total_topics}</div>
                    <div className="stat-label">Topics Completed</div>
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${dashboard.overall_progress}%`,
                                background: 'linear-gradient(90deg, #10b981, #34d399)'
                            }}
                        ></div>
                    </div>
                </div>

                {/* Weak Topics */}
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-value">{dashboard.weak_topics}</div>
                    <div className="stat-label">Weak Topics to Review</div>
                </div>
            </div>

            {/* Today's Plan */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>📅 Today's Study Plan</h2>
                {dashboard.todays_plan && dashboard.todays_plan.length > 0 ? (
                    <div className="study-plan-list">
                        {dashboard.todays_plan.map((item, index) => (
                            <div key={index} className="study-plan-item">
                                <span
                                    className="subject-badge"
                                    style={{ background: item.subject_color, color: '#fff' }}
                                >
                                    {item.subject_name}
                                </span>
                                <div className="hours">
                                    <span>📊 Planned: {item.hours_planned}h</span>
                                    <span>✓ Completed: {item.hours_completed}h</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <p>No study plan for today. <Link to="/study-plan">Create one now!</Link></p>
                    </div>
                )}
            </div>

            {/* Subject Progress */}
            <div className="card">
                <h2 style={{ marginBottom: '1rem' }}>📊 Subject Progress</h2>
                {dashboard.subject_progress && dashboard.subject_progress.length > 0 ? (
                    <div className="progress-grid">
                        {dashboard.subject_progress.map((subject) => (
                            <Link
                                key={subject.id}
                                to={`/subjects/${subject.id}/topics`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="progress-card">
                                    <h3>
                                        <span
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: subject.color,
                                                display: 'inline-block'
                                            }}
                                        ></span>
                                        {subject.name}
                                    </h3>
                                    <div className="progress-value">{Math.round(subject.progress)}%</div>
                                    <div className="progress-container">
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${subject.progress}%`,
                                                background: subject.color
                                            }}
                                        ></div>
                                    </div>
                                    <div className="progress-details">
                                        <span>✅ {subject.completed_topics}/{subject.total_topics} topics</span>
                                        {subject.weak_topics > 0 && (
                                            <span style={{ color: '#f59e0b' }}>⚠️ {subject.weak_topics} weak</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <p>No subjects found. <Link to="/subjects">Add subjects first!</Link></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
