import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:1337/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user) {
        alert("Login successful");
      } else {
        alert("Please check username and password");
      }

      // Success login
      console.log("Login successful:", data);
      localStorage.setItem("token", data.token); // Store token if JWT applies
      navigate("/dashboard"); // Redirect protect route
    } catch (err) {
      setError(err.message || "Invalid credentials");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={loginUser}>
        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading in ..." : "Login"}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Don't have an account? <a href="/register">Sign up</a>
        </p>
        <p>
          <a href="/forgot-password">Forgot password</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
