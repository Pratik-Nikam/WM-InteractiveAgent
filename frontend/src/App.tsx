import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InteractiveAvatar from './components/InteractiveAvatar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<InteractiveAvatar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 