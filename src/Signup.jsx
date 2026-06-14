// Signup.jsx
import React, { useState } from 'react';
import './Signup.css';

const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (fullName.length < 3) {
      setError('Full name must be at least 3 characters');
      return;
    }
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          phoneNumber: phoneNumber,
          password: password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Show success message
        alert(`Account created successfully!\n\nWelcome ${fullName}!\nPlease login with your credentials.`);
        
        // Redirect to login page
        if (onSignupSuccess) {
          onSignupSuccess();
        }
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please check if backend server is running on port 5000');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        {/* Left Side - Brand Section */}
        <div className="signup-left">
          <div className="brand-content">
            <div className="logo-container">
              <div className="logo-icon">
                <svg className="logo-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="logo-text">SplitSmart</span>
            </div>
            
            <h2 className="brand-title">
              Join the smart<br />
              way to split expenses
            </h2>
            <p className="brand-description">
              Create your account and start managing shared expenses with friends and family.
            </p>
          </div>
          
          <div className="illustration-container">
            <div className="illustration-icons">
              <div className="icon-card">
                <div className="icon-emoji">✨</div>
                <div className="icon-label">Easy Tracking</div>
              </div>
              <div className="icon-card">
                <div className="icon-emoji">🤝</div>
                <div className="icon-label">Fair Splits</div>
              </div>
              <div className="icon-card">
                <div className="icon-emoji">💚</div>
                <div className="icon-label">No Conflicts</div>
              </div>
            </div>
            <p className="user-stats">Join 1M+ happy users</p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="signup-right">
          <div className="signup-form-container">
            <div className="form-header">
              <h3 className="form-title">Create an account</h3>
              <p className="form-subtitle">Get started with SplitSmart today</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {/* Full Name Field */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>

              {/* Phone Number Field */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="phone-input-wrapper">
                  <div className="country-code">+91</div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="phone-input"
                    placeholder="9876543210"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="password-input"
                    placeholder="Create a password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <svg className="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="input-hint">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="password-input"
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? (
                      <svg className="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Terms & Conditions */}
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="terms-checkbox"
                />
                <span className="terms-text">
                  I agree to the <button type="button" className="terms-link" onClick={() => alert("Terms & Conditions:\n\n1. You agree to use SplitSmart responsibly\n2. All expense splits are final\n3. Respect other users\n4. Have fun splitting!")}>Terms & Conditions</button>
                </span>
              </label>

              {/* Signup Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="signup-button"
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="login-link">
              Already have an account?{' '}
              <button 
                className="login-button-link" 
                onClick={onSwitchToLogin}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;