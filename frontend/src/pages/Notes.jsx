import React, { useState, useEffect } from 'react';
import { getNotes, getSubjects, createNote, updateNote, deleteNote } from '../services/api';

function Notes() {
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [noteForm, setNoteForm] = useState({ subject_id: '', title: '', content: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [notesRes, subjectsRes] = await Promise.all([
                getNotes(),
                getSubjects()
            ]);
            setNotes(notesRes.data.data || []);
            setSubjects(subjectsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (note = null) => {
        if (note) {
            setEditingNote(note);
            setNoteForm({
                subject_id: note.subject_id,
                title: note.title,
                content: note.content
            });
        } else {
            setEditingNote(null);
            setNoteForm({ subject_id: subjects[0]?.id || '', title: '', content: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNote(null);
        setNoteForm({ subject_id: '', title: '', content: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...noteForm,
                subject_id: parseInt(noteForm.subject_id)
            };

            if (editingNote) {
                await updateNote(editingNote.id, data);
            } else {
                await createNote(data);
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Delete this note?')) {
            try {
                await deleteNote(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    const getSubjectName = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        return subject ? subject.name : 'Unknown';
    };

    const getSubjectColor = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        return subject ? subject.color : '#3498db';
    };

    if (loading) {
        return <div className="loading">Loading notes...</div>;
    }

    return (
        <div className="notes-page">
            <div className="page-header">
                <h1>📝 Notes</h1>
                <p>Quick revision notes for your subjects</p>
            </div>

            <div className="action-bar">
                <h2>{notes.length} Notes</h2>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    + Add Note
                </button>
            </div>

            {notes.length > 0 ? (
                <div className="notes-grid">
                    {notes.map((note) => (
                        <div key={note.id} className="note-card">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                            }}>
                                <span
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: getSubjectColor(note.subject_id),
                                        color: '#fff'
                                    }}
                                >
                                    {getSubjectName(note.subject_id)}
                                </span>
                            </div>
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                            <div className="note-meta">
                                <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        onClick={() => handleOpenModal(note)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        onClick={() => handleDeleteNote(note.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No notes yet</h3>
                    <p>Create your first note to start revising</p>
                </div>
            )}

            {/* Note Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Subject *</label>
                                <select
                                    value={noteForm.subject_id}
                                    onChange={(e) => setNoteForm({ ...noteForm, subject_id: e.target.value })}
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
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    placeholder="Note title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={noteForm.content}
                                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                    placeholder="Write your note here..."
                                    rows={6}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingNote ? 'Update' : 'Create'} Note
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notes;
