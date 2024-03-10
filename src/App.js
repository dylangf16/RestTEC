import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginForm } from './Components/LoginForm/LoginForm';
import ChefPage from './Components/ChefPage/ChefPage';
import AdminPage from './Components/AdminPage/AdminPage';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/chef" element={<ChefPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;