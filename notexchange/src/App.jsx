import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Signup from './components/SignupDialog';
import Login from './components/LoginDialog';
import Dashboard from './components/Dashboard';
import SharedNotes from './components/SharedNotes';
import UploadedNotes from './components/UploadedNotes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/shared-notes" element={<SharedNotes />} />
        <Route path="/UploadedNotes" element={<UploadedNotes />} />
        {/* Removed UploadPage because it's not a page */}
      </Routes>
    </Router>
  );
}

export default App;
