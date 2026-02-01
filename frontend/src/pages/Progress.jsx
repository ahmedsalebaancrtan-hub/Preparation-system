import React, { useState, useEffect } from 'react';
import { getProgress } from '../services/api';

function Progress() {
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const response = await getProgress();
            setProgress(response.data.data || []);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading progress...</div>;
    }

    const totalTopics = progress.reduce((sum, s) => sum + s.total_topics, 0);
    const completedTopics = progress.reduce((sum, s) => sum + s.completed_topics, 0);
    const weakTopics = progress.reduce((sum, s) => sum + s.weak_topics, 0);
    const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    return (
        <div className="progress-page">
            <div className="page-header">
                <h1>📊 Progress Overview</h1>
                <p>Track your exam preparation progress</p>
            </div>

            {/* Overall Stats */}
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <div className="stat-icon">📈</div>
                    <div className="stat-value">{Math.round(overallProgress)}%</div>
                    <div className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Overall Progress</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{completedTopics}</div>
                    <div className="stat-label">Topics Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-value">{totalTopics}</div>
                    <div className="stat-label">Total Topics</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>{weakTopics}</div>
                    <div className="stat-label">Topics Need Review</div>
                </div>
            </div>

            {/* Subject Progress */}
            <h2 style={{ marginBottom: '1.5rem' }}>Subject Breakdown</h2>

            {progress.length > 0 ? (
                <div className="progress-grid">
                    {progress.map((subject) => (
                        <div key={subject.id} className="progress-card">
                            <h3>
                                <span
                                    style={{
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        background: subject.color,
                                        display: 'inline-block',
                                        marginRight: '0.5rem'
                                    }}
                                ></span>
                                {subject.name}
                            </h3>

                            <div className="progress-value" style={{ color: subject.color }}>
                                {Math.round(subject.progress)}%
                            </div>

                            <div className="progress-container" style={{ marginBottom: '1rem' }}>
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${subject.progress}%`,
                                        background: subject.color
                                    }}
                                ></div>
                            </div>

                            <div className="progress-details">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span>
                                        <strong style={{ color: '#10b981' }}>✅ Completed:</strong> {subject.completed_topics}
                                    </span>
                                    <span>
                                        <strong>📚 Total:</strong> {subject.total_topics}
                                    </span>
                                    {subject.weak_topics > 0 && (
                                        <span style={{ color: '#f59e0b' }}>
                                            <strong>⚠️ Weak:</strong> {subject.weak_topics}
                                        </span>
                                    )}
                                    <span>
                                        <strong style={{ color: '#64748b' }}>📝 Remaining:</strong> {subject.total_topics - subject.completed_topics}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No progress data</h3>
                    <p>Add topics to your subjects to track progress</p>
                </div>
            )}

            {/* Quick Summary */}
            {progress.length > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📋 Quick Summary</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Subject</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Progress</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Completed</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Remaining</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Weak</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progress.map((subject) => (
                                <tr key={subject.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: subject.color,
                                            display: 'inline-block',
                                            marginRight: '0.5rem'
                                        }}></span>
                                        {subject.name}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>
                                        {Math.round(subject.progress)}%
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '0.75rem', color: '#10b981' }}>
                                        {subject.completed_topics}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                                        {subject.total_topics - subject.completed_topics}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '0.75rem', color: subject.weak_topics > 0 ? '#f59e0b' : 'inherit' }}>
                                        {subject.weak_topics}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Progress;
