// Login.jsx
import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
//   const Navigate = useNavigate();
//   const openSignUp=()=>{
//     Navigate('/Signup');
//   }
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!phoneNumber) {
    setError('Phone number is required');
    return;
  }
  if (phoneNumber.length !== 10) {
    setError('Please enter a valid 10-digit phone number');
    return;
  }
  if (!password) {
    setError('Password is required');
    return;
  }
  
  setIsLoading(true);
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      }));
      
      // Pass the user data to parent
      if (onLoginSuccess) {
        onLoginSuccess({
          _id: data._id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
        });
      }
    } else {
      setError(data.message || 'Login failed');
    }
  } catch (error) {
    setError('Network error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Side - Brand Section */}
        <div className="login-left">
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
              Split expenses.<br />
              Stay friends.
            </h2>
            <p className="brand-description">
              Track shared expenses, split bills fairly, and settle balances effortlessly.
            </p>
          </div>
          
          <div className="illustration-container">
            <div className="illustration-icons">
              <div className="icon-card">
                <div className="icon-emoji">👥</div>
                <div className="icon-label">Groups</div>
              </div>
              <div className="icon-card">
                <div className="icon-emoji">💰</div>
                <div className="icon-label">Expenses</div>
              </div>
              <div className="icon-card">
                <div className="icon-emoji">📱</div>
                <div className="icon-label">Settle</div>
              </div>
            </div>
            <p className="user-stats">Join 1M+ users managing expenses smartly</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="form-header">
              <h3 className="form-title">Welcome back</h3>
              <p className="form-subtitle">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
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

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="password-input"
                    placeholder="Enter your password"
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
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="options-wrapper">
                
                <button 
                  type="button" 
                  onClick={() => alert('Password reset feature is coming soon!')}
                  className="forgot-link"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

            </form>

            {/* Sign Up Link */}
            <p className="signup-link">
              Don't have an account?{' '}
             <span
  onClick={onSwitchToSignup}
  style={{
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  Create free account
</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;