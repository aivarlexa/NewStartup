import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getDashboardPath } from '../context/authRoutes';
import { GoogleLogin } from "@react-oauth/google";
import {
  ArrowLeft,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  LoaderCircle,
  Shield,
  User,
  MoreVertical,
  CircleDot,
} from 'lucide-react';
import BrandWordmark from '../components/BrandWordmark';
import PasswordInput from '../components/PasswordInput';
import api, { getApiErrorMessage } from '../services/api';
import './DeveloperLoginPage.css';

function DeveloperLoginPage({ role = 'Developer' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [isFormSwitching, setIsFormSwitching] = useState(false);
  const [switchDirection, setSwitchDirection] = useState('idle');
  const [signupValues, setSignupValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signinNotice, setSigninNotice] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const dashboardPath = getDashboardPath(role);
  const roleLabel = role.toLowerCase();

  useEffect(() => {
    if (!isSuccess && token && user?.role) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [isSuccess, navigate, token, user?.role]);

  function handleBack() {
    navigate('/');
  }

  function validateForm() {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email must be valid.';
    if (!password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    if (role === 'Developer' && email === 'developer@varlexa.ai' && password === 'varlexa123') {
      window.setTimeout(() => {
        login({ name: 'Demo User', email, role: 'Developer' }, 'demo-token', rememberMe);
        setIsLoading(false);
        setIsSuccess(true);
        window.setTimeout(() => navigate(dashboardPath, { replace: true }), 1000);
      }, 900);
      return;
    }

    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      if (!data.success) throw new Error(data.message || 'Invalid email or password.');
      login(data.user, data.token, rememberMe);
      setIsSuccess(true);
      window.setTimeout(() => navigate(getDashboardPath(data.user.role), { replace: true }), 700);
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, error.message || 'An error occurred. Please try again later.') });
    } finally {
      setIsLoading(false);
    }
  }

  function switchMode(nextMode) {
    if (authMode === nextMode || isFormSwitching) return;

    setSwitchDirection(nextMode === 'signup' ? 'to-signup' : 'to-signin');
    setIsFormSwitching(true);
    setErrors({});
    setSignupSuccess('');
    setSigninNotice('');
    window.setTimeout(() => setAuthMode(nextMode), 260);
    window.setTimeout(() => {
      setIsFormSwitching(false);
      setSwitchDirection('idle');
    }, 560);
  }

  function updateSignupField(event) {
    const { name, value } = event.target;
    setSignupValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function validateSignupForm() {
    const newErrors = {};
    const trimmedName = signupValues.name.trim();
    const trimmedEmail = signupValues.email.trim();

    if (!trimmedName) newErrors.name = 'Full Name is required.';
    if (!trimmedEmail) newErrors.signupEmail = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.signupEmail = 'Email must be valid.';
    if (!signupValues.password) newErrors.signupPassword = 'Password is required.';
    else if (signupValues.password.length < 8) newErrors.signupPassword = 'Password must be at least 8 characters.';
    if (signupValues.confirmPassword !== signupValues.password) newErrors.confirmPassword = 'Confirm Password must match Password.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignup(event) {
    event.preventDefault();
    if (!validateSignupForm()) return;

    setIsRegistering(true);
    setSignupSuccess('');

    try {
      const { data } = await api.post('/auth/register', {
        name: signupValues.name.trim(),
        email: signupValues.email.trim(),
        password: signupValues.password,
        role,
      });

      if (!data.success) throw new Error(data.message || 'Unable to create account. Please try again.');
      const registeredEmail = signupValues.email.trim();
      setSignupSuccess('Account created successfully.');
      setSignupValues({ name: '', email: '', password: '', confirmPassword: '' });
      window.setTimeout(() => {
        setEmail(registeredEmail);
        setPassword('');
        setSigninNotice('Your account is ready. Please sign in to continue.');
        setAuthMode('signin');
        setSignupSuccess('');
        setErrors({});
      }, 900);
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, error.message || 'An error occurred. Please try again later.') });
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setErrors({ email: 'Enter your email first.' });
      return;
    }

    try {
      const { data } = await api.post('/auth/forgot-password', { email, role });
      setSigninNotice(data.message || 'Password reset instructions will be sent if the account exists.');
      setErrors({});
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, 'Unable to start password reset.') });
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      const { data } = await api.post('/auth/google', { token: credentialResponse.credential, role });
      if (data.success) {
        login(data.user, data.token, rememberMe);
        navigate(getDashboardPath(data.user.role), { replace: true });
      }
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, 'Google Login Failed') });
    }
  }

  return (
    <div className="login-page">
      <div className="login-background-grid"></div>
      <div className="login-aurora"></div>
      <button className="login-back-button" type="button" onClick={handleBack}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className={`login-stage ${authMode === 'signup' ? 'signup-mode' : ''}`}>
        <div className="diagonal-wipe" aria-hidden="true"></div>

        <section className="login-dark-panel">
          <div className="login-form-shell">
            <div className="login-brand-header">
              <BrandWordmark alt="VARLEXA AI" />
              <div className="secure-label">
                <Shield size={14} />
                <span>{authMode === 'signup' ? `${role.toUpperCase()} ACCESS` : 'SECURE ACCESS'}</span>
              </div>
            </div>

            <div className={`form-transition ${isFormSwitching ? 'is-switching' : ''} ${switchDirection}`}>
              {authMode === 'signin' ? (
                <div className={`login-card ${isSuccess ? 'fade-out' : ''}`}>
                  <h1>Sign in</h1>
                  <p>Enter your {roleLabel} workspace credentials to continue.</p>
                  {signinNotice && <p className="auth-notice">{signinNotice}</p>}
                  <div className="accent-line"></div>
                  <form onSubmit={handleLogin} noValidate>
                    <div className="input-group">
                      <Mail size={20} />
                      <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <MoreVertical size={20} className="input-options-icon" />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="input-group">
                      <Lock size={20} />
                      <PasswordInput placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>
                    <div className="login-options">
                      <label className="remember-me">
                        <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                        Remember me
                      </label>
                      <button className="forgot-password" type="button" onClick={handleForgotPassword}>Forgot password?</button>
                    </div>
                    <button type="submit" className="login-button" disabled={isLoading}>
                      {isLoading ? <LoaderCircle className="spinner" /> : <>Sign in to Workspace <ArrowRight size={20} /></>}
                    </button>
                    {errors.form && <span className="error-message form-error">{errors.form}</span>}
                  </form>
                  <p className="auth-switch-text">
                    New here?{' '}
                    <button className="inline-auth-link" type="button" onClick={() => switchMode('signup')}>
                      Create account
                    </button>
                  </p>
                  <div className="secure-badge">
                    <ShieldCheck size={17} />
                    <div>
                      <strong>Your workspace is secure</strong>
                      <p>Your information stays protected with Varlexa AI.</p>
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
                <div className="signup-card">
                  <h1>Create your {roleLabel} workspace</h1>
                  <p>Set up your {roleLabel} account and start working securely.</p>
                  <div className="accent-line"></div>
                  <form onSubmit={handleSignup} noValidate>
                    <div className="input-group">
                      <User size={20} />
                      <input name="name" placeholder="Full Name" value={signupValues.name} onChange={updateSignupField} />
                      {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>
                    <div className="input-group">
                      <Mail size={20} />
                      <input name="email" type="email" placeholder="Email Address" value={signupValues.email} onChange={updateSignupField} />
                      {errors.signupEmail && <span className="error-message">{errors.signupEmail}</span>}
                    </div>
                    <div className="input-group">
                      <Lock size={20} />
                      <PasswordInput name="password" placeholder="Create Password" value={signupValues.password} onChange={updateSignupField} />
                      {errors.signupPassword && <span className="error-message">{errors.signupPassword}</span>}
                    </div>
                    <div className="input-group">
                      <Lock size={20} />
                      <PasswordInput name="confirmPassword" placeholder="Confirm Password" value={signupValues.confirmPassword} onChange={updateSignupField} />
                      {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>
                    <button type="submit" className="login-button" disabled={isRegistering}>
                      {isRegistering ? <LoaderCircle className="spinner" /> : <>Continue <ArrowRight size={20} /></>}
                    </button>
                    {errors.form && <span className="error-message form-error">{errors.form}</span>}
                  </form>
                  {signupSuccess && <p className="request-success">{signupSuccess}</p>}
                  <p className="auth-switch-text">
                    Already have an account?{' '}
                    <button className="inline-auth-link" type="button" onClick={() => switchMode('signin')}>
                      Sign in
                    </button>
                  </p>
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setErrors({ form: 'Google Login Failed' })} />
                  <div className="secure-badge">
                    <ShieldCheck size={17} />
                    <div>
                      <strong>Your workspace is secure</strong>
                      <p>Your information stays protected with Varlexa AI.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="login-cyan-panel">
          <div className="cyan-panel-content">
            <span>VARLEXA AI</span>
            <h2>{role === 'Client' ? 'Hire.' : 'Build.'}<br />{role === 'Client' ? 'Manage. Grow.' : 'Ship. Grow.'}</h2>
            <p>{role === 'Client' ? 'Create requirements, schedule meetings, and collaborate with developers.' : 'Collaborate with clients, manage projects, and move work forward.'}</p>
            <div className="status-panel">
              <CircleDot className="status-dot-active" size={12} />
              <div>
                <p>WORKSPACE STATUS</p>
                <strong>Ready to get started</strong>
              </div>
            </div>
            <div className="network-mesh" aria-hidden="true">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <linearGradient id="meshLineGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#31E6E6" /><stop offset="48%" stopColor="#2E8BFF" /><stop offset="100%" stopColor="#CC3DFF" /></linearGradient>
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
                <circle cx="92%" cy="25%" r="3.8" className="network-node node-pink node-delay-six" />
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
