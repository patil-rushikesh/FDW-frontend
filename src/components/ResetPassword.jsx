import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Add this import

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, // 0: none, 1: weak, 2: medium, 3: strong
    message: ''
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // Add this line to get the logout function

  useEffect(() => {
    // Get token from URL query parameters
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!tokenParam) {
      setError('Invalid reset link');
      return;
    }
    setToken(tokenParam);
  }, [location]);

  // Check password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, message: '' });
      return;
    }

    let score = 0;
    let message = '';

    // Length check
    if (newPassword.length >= 8) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(newPassword)) score += 0.5;
    if (/[a-z]/.test(newPassword)) score += 0.5;
    if (/[0-9]/.test(newPassword)) score += 0.5;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 0.5;

    // Convert to 0-3 scale
    const finalScore = Math.min(3, Math.floor(score));
    
    // Set message based on score
    if (finalScore === 1) message = 'Weak';
    else if (finalScore === 2) message = 'Medium';
    else if (finalScore === 3) message = 'Strong';

    setPasswordStrength({ score: finalScore, message });
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Logout the user before navigating
        setTimeout(() => {
          logout(); // Logout the user
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get color for password strength indicator
  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };
  
  // Get icon for password strength
  const getStrengthIcon = () => {
    switch (passwordStrength.score) {
      case 1: return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 2: return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 3: return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return null;
    }
  };

  if (error === 'Invalid reset link') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Invalid Reset Link</h2>
              <p className="mb-6 text-gray-600">The password reset link is invalid or has expired.</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Reset Your Password
          </h2>

          {success ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-semibold mb-2">Password reset successful!</p>
              <p className="text-gray-600 mb-2">
                Your password has been updated. You can now use your new password to sign in.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full animate-progress"></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        {getStrengthIcon()}
                        <span className={`ml-1 text-sm ${
                          passwordStrength.score === 1 ? 'text-red-500' :
                          passwordStrength.score === 2 ? 'text-yellow-500' :
                          passwordStrength.score === 3 ? 'text-green-500' :
                          'text-gray-500'
                        }`}>
                          {passwordStrength.message}
                        </span>
                      </div>
                      

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`${getStrengthColor()} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                        Include uppercase, lowercase, numbers and special characters
                      </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {/* Password match indicator */}
                {confirmPassword && (
                  <div className="flex items-center mt-1">
                    {confirmPassword === newPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="ml-1 text-xs text-green-500">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="ml-1 text-xs text-red-500">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </div>
                ) : 'Reset Password'}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;