import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Visibility, VisibilityOff, LocalHospital } from "@mui/icons-material";
import { loginUser } from "../api/auth";
import "./Login.scss";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setMessage("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginUser(email, password);

      console.log("Login API Response:", response);

      if (response.status === "success") {
        const { user, accessToken, refreshToken } = response.data;

        // Save authentication data to localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("Tokens saved to localStorage");
        console.log("Access Token:", accessToken);
        console.log("User:", user);

        // Small delay to ensure state updates
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          navigate("/", { replace: true });
        }, 300);
      } else {
        setMessage(response.message || "Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Section */}
      <div className="login-brand-section">
        <div className="brand-content">
          <div className="brand-icon">
            <LocalHospital />
          </div>

          <h1>Hospital Management System</h1>

          <p>
            A smarter way to manage hospital operations,
            patients, doctors and appointments.
          </p>

          <div className="brand-features">
            <div className="feature">
              <span>✓</span>
              <p>Manage doctors and patients</p>
            </div>

            <div className="feature">
              <span>✓</span>
              <p>Schedule and manage appointments</p>
            </div>

            <div className="feature">
              <span>✓</span>
              <p>Streamline hospital operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="login-form-section">
        <div className="login-card">
          <div className="mobile-brand-icon">
            <LocalHospital />
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>Sign in to access your hospital dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  if (errors.email) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));
                  }
                }}
                className={errors.email ? "input-error" : ""}
              />

              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }
                  }}
                  className={errors.password ? "input-error" : ""}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>

              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  setMessage("Please contact your administrator.")
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className="login-message">
                {message}
              </div>
            )}

            {/* Login Button */}
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="login-footer">
            <span>© 2026 Hospital Management System</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;