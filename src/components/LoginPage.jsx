import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot password states
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Enter userId, 2: Enter OTP, 3: Reset Password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Add password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: userId,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Logged in successfully!");
        console.log(data);
        login(data);

        // Wait for 1.5 seconds to show the success message before redirecting
        setTimeout(() => {
          // Check if user is admin and redirect to admin dashboard
          if (data.role === "Admin" || userId === "admin2025") {
            navigate("/admin");
          } else if (data.role === "external") {
            navigate("/dashboard");
          } else {
            navigate("/dashboard"); // Regular users
          }
        }, 1500);
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!userId.trim()) {
      setError("Please enter your User ID");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("OTP has been sent to your registered email address");
        setForgotPasswordStep(2); // Move to OTP verification step
      } else {
        setError(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!otp.trim()) {
      setError("Please enter the OTP received in your email");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("OTP verified successfully");
        setResetToken(data.token);
        setForgotPasswordStep(3); // Move to password reset step
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please enter both new password and confirmation");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Basic password strength validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/reset-user-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Password has been reset successfully. You can now login with your new password.");
        // Reset everything after 3 seconds
        setTimeout(() => {
          setForgotPasswordMode(false);
          setForgotPasswordStep(1);
          setNewPassword("");
          setConfirmPassword("");
          setOtp("");
          setResetToken("");
          setSuccess("");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForgotPassword = () => {
    setForgotPasswordMode(false);
    setForgotPasswordStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setError("");
    setSuccess("");
  };

  // Function to check password strength
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, label: "", color: "" });
      return;
    }

    // Calculate password strength
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Map score to label and color
    let label, color;
    switch (true) {
      case (score <= 2):
        label = "Weak";
        color = "text-red-500";
        break;
      case (score <= 4):
        label = "Medium";
        color = "text-yellow-500";
        break;
      default:
        label = "Strong";
        color = "text-green-500";
        break;
    }

    setPasswordStrength({ score, label, color });
  };

  // Update password check when new password changes
  const handleNewPasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    checkPasswordStrength(newPass);
  };

  // Render forgot password request form (Step 1)
  const renderForgotPasswordRequest = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaUser className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="Enter your User ID"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 font-medium disabled:bg-indigo-400 transform hover:scale-[1.02]"
      >
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </button>
    </form>
  );

  // Enhance OTP verification with a more modern UI
  const renderOTPVerification = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter OTP
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-center tracking-widest text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            required
            placeholder="••••••"
            disabled={isLoading}
            maxLength={6}
          />
        </div>
        <p className="mt-2 text-xs text-gray-600">
          We've sent a 6-digit OTP to your registered email address. The OTP is valid for 15 minutes.
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-[1.02]"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
        
        <button
          type="button"
          onClick={handleSendOTP}
          disabled={isLoading}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
        >
          Didn't receive the OTP? Resend
        </button>
      </div>
    </form>
  );

  // Render password reset form (Step 3)
  const renderPasswordReset = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaLock className="text-gray-500" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
            placeholder="Enter new password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        
        {/* Password strength indicator */}
        {newPassword && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Password Strength:</span>
              <span className={passwordStrength.color + " font-medium"}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  passwordStrength.score <= 2 ? "bg-red-500" : 
                  passwordStrength.score <= 4 ? "bg-yellow-500" : "bg-green-500"
                } transition-all duration-300`}
                style={{ width: `${Math.min(100, (passwordStrength.score / 5) * 100)}%` }}
              ></div>
            </div>
            
            {/* Password requirements */}
            <ul className="text-xs mt-2 space-y-1 text-gray-600">
              <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>
                • At least one uppercase letter
              </li>
              <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>
                • At least one number
              </li>
              <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600" : ""}>
                • At least one special character
              </li>
              <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
                • Minimum 8 characters
              </li>
            </ul>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaLock className="text-gray-500" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
            disabled={isLoading}
          />
        </div>
        
        {/* Password match indicator */}
        {confirmPassword && (
          <div className="mt-2 text-xs font-medium">
            {newPassword === confirmPassword ? (
              <span className="text-green-600">✓ Passwords match</span>
            ) : (
              <span className="text-red-600">✗ Passwords do not match</span>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || (newPassword !== confirmPassword) || passwordStrength.score < 2}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-[1.02]"
      >
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </button>
    </form>
  );

  // Normal login form
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaUser className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="Enter your User ID"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaLock className="text-gray-500" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 font-medium disabled:bg-indigo-400 transform hover:scale-[1.02]"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      <div className="text-center">
        <button
          type="button"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          onClick={() => setForgotPasswordMode(true)}
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="College Logo"
            className="w-32 h-32 mb-4 hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Faculty Portal
          </h1>
          <p className="text-gray-600 mt-2">
            {forgotPasswordMode
              ? "Reset your password"
              : "Welcome back! Please login to continue."}
          </p>
        </div>

        {forgotPasswordMode && (
          <div className="mb-4 flex items-center">
            <button
              type="button"
              onClick={resetForgotPassword}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <FaArrowLeft className="mr-1" /> Back to Login
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-300 animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm border border-green-300 animate-pulse">
            {success}
          </div>
        )}

        {forgotPasswordMode ? (
          <div className="space-y-6">
            {forgotPasswordStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Recovery</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Please enter your User ID to receive a one-time password on your registered email.
                </p>
                {renderForgotPasswordRequest()}
              </div>
            )}

            {forgotPasswordStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify OTP</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Please enter the OTP sent to your registered email address.
                </p>
                {renderOTPVerification()}
              </div>
            )}

            {forgotPasswordStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Reset Password</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Please create a new password for your account.
                </p>
                {renderPasswordReset()}
              </div>
            )}
          </div>
        ) : (
          renderLoginForm()
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 PCCOE. All rights reserved by team AANSH</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;