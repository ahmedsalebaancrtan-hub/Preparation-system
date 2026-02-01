import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSubjects, createSubject, deleteSubject } from '../services/api';

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', description: '', color: '#3498db' });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await getSubjects();
            setSubjects(response.data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            await createSubject(newSubject);
            setNewSubject({ name: '', description: '', color: '#3498db' });
            setShowModal(false);
            fetchSubjects();
        } catch (error) {
            console.error('Error creating subject:', error);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await deleteSubject(id);
                fetchSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading subjects...</div>;
    }

    return (
        <div className="subjects-page">
            <div className="page-header">
                <h1>📖 Subjects</h1>
                <p>Manage your semester courses</p>
            </div>

            <div className="action-bar">
                <h2>{subjects.length} Subjects</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Subject
                </button>
            </div>

            {subjects.length > 0 ? (
                <div className="subjects-grid">
                    {subjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="subject-card"
                            style={{ '--subject-color': subject.color }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                background: subject.color
                            }}></div>
                            <Link
                                to={`/subjects/${subject.id}/topics`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <h3>{subject.name}</h3>
                                <p>{subject.description || 'No description'}</p>
                                <div className="subject-stats">
                                    <span>✅ {subject.completed_topics}/{subject.total_topics} topics</span>
                                    {subject.weak_topics > 0 && (
                                        <span style={{ color: '#f59e0b' }}>⚠️ {subject.weak_topics} weak</span>
                                    )}
                                </div>
                                <div className="progress-container">
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${subject.progress}%`,
                                            background: subject.color
                                        }}
                                    ></div>
                                </div>
                            </Link>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <Link
                                    to={`/subjects/${subject.id}/topics`}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    View Topics
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteSubject(subject.id)}
                                    style={{ padding: '0.75rem' }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📖</div>
                    <h3>No subjects yet</h3>
                    <p>Add your first subject to get started</p>
                </div>
            )}

            {/* Add Subject Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Add New Subject</h2>
                        <form onSubmit={handleCreateSubject}>
                            <div className="form-group">
                                <label>Subject Name *</label>
                                <input
                                    type="text"
                                    value={newSubject.name}
                                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    placeholder="e.g., Flutter"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newSubject.description}
                                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                                    placeholder="Brief description of the subject"
                                />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input
                                    type="color"
                                    value={newSubject.color}
                                    onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                                    style={{ height: '50px', cursor: 'pointer' }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Subject
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Subjects;
