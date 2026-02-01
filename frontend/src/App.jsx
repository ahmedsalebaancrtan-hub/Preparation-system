import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Topics from './pages/Topics';
import Notes from './pages/Notes';
import Progress from './pages/Progress';
import StudyPlan from './pages/StudyPlan';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                    <div className="nav-brand">
                        <span className="brand-icon">📚</span>
                        <span className="brand-text">Exam Prep</span>
                    </div>
                    <div className="nav-links">
                        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/subjects" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Subjects
                        </NavLink>
                        <NavLink to="/notes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Notes
                        </NavLink>
                        <NavLink to="/study-plan" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Study Plan
                        </NavLink>
                        <NavLink to="/progress" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Progress
                        </NavLink>
                    </div>
                </nav>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/subjects/:id/topics" element={<Topics />} />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/study-plan" element={<StudyPlan />} />
                        <Route path="/progress" element={<Progress />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
