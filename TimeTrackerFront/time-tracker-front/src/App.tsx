import React from 'react';
import AppNavbar from './Components/Navbar';
import AppContent from './Components/Content';
import './Custom.css';

function App() {
  return (
    <div className="App container-fluid p-0 h-100" data-bs-theme="dark">
      <AppContent />
    </div>
  );
}

export default App;
