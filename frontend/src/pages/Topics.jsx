import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubject, getTopicsBySubject, createTopic, deleteTopic, toggleTopicComplete, toggleTopicWeak } from '../services/api';

function Topics() {
    const { id } = useParams();
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTopicName, setNewTopicName] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [subjectRes, topicsRes] = await Promise.all([
                getSubject(id),
                getTopicsBySubject(id)
            ]);
            setSubject(subjectRes.data.data);
            setTopics(topicsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!newTopicName.trim()) return;

        try {
            await createTopic({ subject_id: parseInt(id), name: newTopicName });
            setNewTopicName('');
            fetchData();
        } catch (error) {
            console.error('Error creating topic:', error);
        }
    };

    const handleToggleComplete = async (topicId) => {
        try {
            await toggleTopicComplete(topicId);
            fetchData();
        } catch (error) {
            console.error('Error toggling complete:', error);
        }
    };

    const handleToggleWeak = async (topicId) => {
        try {
            await toggleTopicWeak(topicId);
            fetchData();
        } catch (error) {
            console.error('Error toggling weak:', error);
        }
    };

    const handleDeleteTopic = async (topicId) => {
        if (window.confirm('Delete this topic?')) {
            try {
                await deleteTopic(topicId);
                fetchData();
            } catch (error) {
                console.error('Error deleting topic:', error);
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading topics...</div>;
    }

    if (!subject) {
        return <div className="loading">Subject not found</div>;
    }

    const completedCount = topics.filter(t => t.is_completed).length;
    const weakCount = topics.filter(t => t.is_weak).length;

    return (
        <div className="topics-page">
            <Link to="/subjects" className="back-btn">
                ← Back to Subjects
            </Link>

            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                        style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: subject.color
                        }}
                    ></span>
                    {subject.name}
                </h1>
                <p>{subject.description}</p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{topics.length}</div>
                    <div className="stat-label">Total Topics</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#10b981' }}>{completedCount}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#f59e0b' }}>{weakCount}</div>
                    <div className="stat-label">Need Review</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0}%</div>
                    <div className="stat-label">Progress</div>
                </div>
            </div>

            {/* Add Topic Form */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <form onSubmit={handleCreateTopic} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        placeholder="Enter new topic name..."
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-dark)',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <button type="submit" className="btn btn-primary">
                        + Add Topic
                    </button>
                </form>
            </div>

            {/* Topics List */}
            {topics.length > 0 ? (
                <div className="topics-list">
                    {topics.map((topic) => (
                        <div key={topic.id} className="topic-item">
                            <div className="topic-info">
                                <div
                                    className={`checkbox ${topic.is_completed ? 'completed' : ''}`}
                                    onClick={() => handleToggleComplete(topic.id)}
                                ></div>
                                <span className={`topic-name ${topic.is_completed ? 'completed' : ''}`}>
                                    {topic.name}
                                </span>
                            </div>
                            <div className="topic-actions">
                                <button
                                    className={`btn-weak ${topic.is_weak ? 'active' : ''}`}
                                    onClick={() => handleToggleWeak(topic.id)}
                                    title="Mark as weak/needs review"
                                >
                                    ⚠️ Weak
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteTopic(topic.id)}
                                    title="Delete topic"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No topics yet</h3>
                    <p>Add your first topic for this subject</p>
                </div>
            )}
        </div>
    );
}

export default Topics;
