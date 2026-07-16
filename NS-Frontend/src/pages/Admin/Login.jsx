import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import { ArrowRight, BarChart3, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/admin/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      login(
        data.user,
        data.token,
        formData.remember
      );

      navigate("/admin/dashboard");

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Login Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-glow" />
      <div className="admin-login-shell">
        <section className="admin-login-showcase">
          <div className="admin-login-showcase-top">
            <div className="admin-login-brand">
              <div className="admin-login-brand-icon">
                <Sparkles size={22} />
              </div>
              <div>
                <h1>Varlexa Admin</h1>
                <p>Operations command center</p>
              </div>
            </div>

            <div className="admin-login-copy">
              <p>Secure Workspace</p>
              <h2>
                Manage clients, projects, teams, and invoices from one cockpit.
              </h2>
              <span>
                Track project requests, assign developers, monitor milestones, review payments, and keep every action audit-ready.
              </span>
            </div>
          </div>

          <div className="admin-login-stats">
            {[
              { label: "Active Projects", value: "18", icon: BarChart3 },
              { label: "Role Access", value: "5", icon: ShieldCheck },
              { label: "Avg Response", value: "12m", icon: Lock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="admin-login-stat">
                <Icon size={22} />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-login-panel-wrap">
          <div className="admin-login-panel-inner">
            <div className="admin-login-mobile-brand">
              <div>
                <Sparkles />
              </div>
              <h1>Varlexa Admin</h1>
              <p>Operations command center</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-login-form"
            >
              <div className="admin-login-form-heading">
                <p>Admin Login</p>
                <h2>Welcome back</h2>
                <span>Sign in to continue managing your workspace.</span>
              </div>

              {error && (
                <div className="admin-login-error">
                  {error}
                </div>
              )}

              <div className="admin-login-fields">
                <label>
                  <span>Email address</span>
                  <div className="admin-login-input">
                    <Mail size={18} />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      placeholder="admin@varlexa.com"
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Password</span>
                  <div className="admin-login-input">
                    <Lock size={18} />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      placeholder="Enter your password"
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="admin-login-options">
                <label>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  Remember me
                </label>
                <span>Secure access</span>
              </div>

              <button
                disabled={loading}
                className="admin-login-submit"
              >
                {loading ? "Signing in..." : "Login to Dashboard"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
