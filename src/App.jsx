import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import GroupDetail from './GroupDetail';
import './App.css';
//App will check the token jwt if it exist then no need of login if not create login histoy
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setToken(localStorage.getItem('token'));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isLoggedIn ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Navigate to="/dashboard" />
          )
        } />
        <Route path="/signup" element={
          !isLoggedIn ? (
            <Signup onSignupSuccess={() => {}} />
          ) : (
            <Navigate to="/dashboard" />
          )
        } />
        <Route path="/dashboard" element={
          isLoggedIn ? (
            <Dashboard user={user} token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/groups/:groupId" element={
          isLoggedIn ? (
            <GroupDetail user={user} token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;