import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  LoaderCircle,
  Shield,
  Users,
  KeyRound,
  MoreVertical,
  CircleDot,
} from 'lucide-react';
import BrandWordmark from '../components/BrandWordmark';
import './DeveloperLoginPage.css';

function DeveloperLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRequestAccess, setIsRequestAccess] = useState(false);
  const [isPanelSwitching, setIsPanelSwitching] = useState(false);
  const [switchDirection, setSwitchDirection] = useState('');
  const [requestValues, setRequestValues] = useState({ fullName: '', workEmail: '', primaryRole: '' });
  const [requestSent, setRequestSent] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email must have a valid format.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Temporary frontend demo login
    if (email === 'developer@varlexa.ai' && password === 'varlexa123') {
      setTimeout(() => {
        login({ name: 'Demo User', role: 'Developer' }, 'demo-token');
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => navigate('/developer-dashboard'), 1000);
      }, 1500);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        login(user, token);
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => navigate('/developer-dashboard'), 1000);
      } else {
        const errorData = await response.json();
        setErrors({ form: errorData.message || 'Login failed. Please try again.' });
        setIsLoading(false);
      }
    } catch {
      setErrors({ form: 'An error occurred. Please try again later.' });
      setIsLoading(false);
    }
  };

  function switchMode(nextMode) {
    if (isRequestAccess === nextMode || isPanelSwitching) return;

    setSwitchDirection(nextMode ? 'to-request' : 'to-login');
    setIsPanelSwitching(true);
    setErrors({});
    setRequestSent(false);
    window.setTimeout(() => {
      setIsRequestAccess(nextMode);
    }, 520);
    window.setTimeout(() => {
      setIsPanelSwitching(false);
      setSwitchDirection('');
    }, 1080);
  }

  function updateRequestField(event) {
    const { name, value } = event.target;
    setRequestValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function submitAccessRequest(event) {
    event.preventDefault();
    setRequestSent(true);
    setRequestValues({ fullName: '', workEmail: '', primaryRole: '' });
  }

  return (
    <div className="login-page">
      <div className="login-background-grid"></div>
      <div className="login-aurora"></div>

      <div className={`login-stage ${isRequestAccess ? 'request-mode' : 'login-mode'} ${isPanelSwitching ? 'is-switching' : ''} ${switchDirection}`}>
        <div className="diagonal-wipe" aria-hidden="true"></div>

        <section className="login-dark-panel">
          <div className="login-form-shell">
            <div className="login-brand-header">
              <BrandWordmark alt="VARLEXA AI" />
              <div className="secure-label">
                <Shield size={14} />
                <span>SECURE DEVELOPER ACCESS</span>
              </div>
            </div>

            {!isRequestAccess ? (
              <div className={`login-card ${isSuccess ? 'fade-out' : ''}`}>
                <h1>Developer Sign In</h1>
                <p>Enter your workspace credentials to continue.</p>
                <div className="accent-line"></div>
                <form onSubmit={handleLogin} noValidate>
                  <div className="input-group">
                    <Mail size={20} />
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <MoreVertical size={20} className="input-options-icon" />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  <div className="input-group">
                    <Lock size={20} />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>
                  <div className="login-options">
                    <label className="remember-me">
                      <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                      Remember me
                    </label>
                    <a href="#" className="forgot-password">Forgot password?</a>
                  </div>
                  <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="spinner" /> : <>Sign In to Workspace <ArrowRight size={20} /></>}
                  </button>
                  {errors.form && <span className="error-message form-error">{errors.form}</span>}
                </form>
                <p className="contact-admin">Need access? Contact your <a href="#">workspace administrator.</a></p>
                <button className="request-access-link" type="button" onClick={() => switchMode(true)}>
                  Need access? Request Developer Access
                </button>
                <div className="secure-badge">
                  <ShieldCheck size={17} />
                  <div>
                    <strong>Protected Developer Workspace</strong>
                    <p>Your data. Your code. Secure by design.</p>
                  </div>
                </div>
                {isSuccess && (
                  <div className="success-state">
                    <ShieldCheck size={44} />
                    <p>Login Successful</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="request-card">
                <h1>Request Developer Access</h1>
                <p>Enter your details so the workspace administrator can review your access request.</p>
                <div className="accent-line"></div>
                <form onSubmit={submitAccessRequest}>
                  <div className="input-group">
                    <Users size={20} />
                    <input name="fullName" placeholder="Full Name" value={requestValues.fullName} onChange={updateRequestField} required />
                  </div>
                  <div className="input-group">
                    <Mail size={20} />
                    <input name="workEmail" type="email" placeholder="Work Email" value={requestValues.workEmail} onChange={updateRequestField} required />
                  </div>
                  <div className="input-group">
                    <KeyRound size={20} />
                    <input name="primaryRole" placeholder="Primary Role" value={requestValues.primaryRole} onChange={updateRequestField} required />
                  </div>
                  <button type="submit" className="login-button">Request Workspace Access <ArrowRight size={20} /></button>
                </form>
                {requestSent && <p className="request-success">Access request received for review.</p>}
                <button className="request-access-link" type="button" onClick={() => switchMode(false)}>
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="login-cyan-panel">
          <div className="cyan-panel-content">
            <span>VARLEXA AI CORE</span>
            <h2>
              Build.
              <br />
              Connect.
              <br />
              Deliver.
            </h2>
            <p>Secure collaboration for projects, teams, clients, and intelligent systems.</p>
            <div className="status-panel">
              <CircleDot className="status-dot-active" size={12} />
              <div>
                <p>NETWORK STATUS</p>
                <strong>All Systems Operational</strong>
              </div>
            </div>
            <div className="network-mesh" aria-hidden="true">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="meshLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#56e8d9" />
                    <stop offset="52%" stopColor="#2f7bff" />
                    <stop offset="100%" stopColor="#a661ff" />
                  </linearGradient>
                </defs>
                <line x1="7%" y1="76%" x2="27%" y2="52%" className="network-line line-pulse-one" />
                <line x1="27%" y1="52%" x2="51%" y2="68%" className="network-line line-pulse-two" />
                <line x1="37%" y1="30%" x2="27%" y2="52%" className="network-line line-pulse-three" />
                <line x1="51%" y1="68%" x2="74%" y2="52%" className="network-line line-pulse-four" />
                <line x1="74%" y1="52%" x2="92%" y2="25%" className="network-line line-pulse-five" />
                <line x1="62%" y1="86%" x2="74%" y2="52%" className="network-line line-pulse-six" />
                <circle cx="7%" cy="76%" r="3.5" className="network-node node-cyan node-delay-one" />
                <circle cx="27%" cy="52%" r="6.5" className="network-node node-blue active-node node-delay-two" />
                <circle cx="51%" cy="68%" r="4.5" className="network-node node-violet node-delay-three" />
                <circle cx="37%" cy="30%" r="3" className="network-node node-cyan node-delay-four" />
                <circle cx="74%" cy="52%" r="5.5" className="network-node node-blue active-node node-delay-five" />
                <circle cx="92%" cy="25%" r="3.8" className="network-node node-violet node-delay-six" />
                <circle cx="62%" cy="86%" r="2.8" className="network-node node-cyan node-delay-seven" />
              </svg>
              <span className="mesh-particle particle-one"></span>
              <span className="mesh-particle particle-two"></span>
              <span className="mesh-particle particle-three"></span>
              <span className="mesh-particle particle-four"></span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DeveloperLoginPage;
