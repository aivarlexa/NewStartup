import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
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
  BriefcaseBusiness,
  MoreVertical,
  CircleDot,
} from 'lucide-react';
import BrandWordmark from '../components/BrandWordmark';
import PasswordInput from '../components/PasswordInput';
import api, { getApiErrorMessage } from '../services/api';
import './DeveloperLoginPage.css';

const ROLE_OPTIONS = [
  'Client',
  'Business Owner',
  'Project Manager',
  'Designer',
  'Developer',
  'Other',
];

function DeveloperLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [isFormSwitching, setIsFormSwitching] = useState(false);
  const [switchDirection, setSwitchDirection] = useState('idle');
  const [signupValues, setSignupValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signinNotice, setSigninNotice] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email must be valid.';
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
      const { data } = await api.post('/auth/login', { email, password });

      if (data.success) {
        const { user, token } = data;
        login(user, token);
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => navigate('/developer-dashboard'), 1000);
      } else {
        setErrors({ form: 'Invalid email or password.' });
        setIsLoading(false);
      }
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, 'An error occurred. Please try again later.') });
      setIsLoading(false);
    }
  };

  function switchMode(nextMode) {
    if (authMode === nextMode || isFormSwitching) return;

    setSwitchDirection(nextMode === 'signup' ? 'to-signup' : 'to-signin');
    setIsFormSwitching(true);
    setErrors({});
    setSignupSuccess('');
    setSigninNotice('');
    window.setTimeout(() => {
      setAuthMode(nextMode);
    }, 260);
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

    if (!trimmedName) {
      newErrors.name = 'Full Name is required.';
    }
    if (!trimmedEmail) {
      newErrors.signupEmail = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      newErrors.signupEmail = 'Email must be valid.';
    }
    if (!signupValues.password) {
      newErrors.signupPassword = 'Password is required.';
    } else if (signupValues.password.length < 8) {
      newErrors.signupPassword = 'Password must be at least 8 characters.';
    }
    if (signupValues.confirmPassword !== signupValues.password) {
      newErrors.confirmPassword = 'Confirm Password must match Password.';
    }
    if (!signupValues.role) {
      newErrors.role = 'Role is required.';
    }

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
        role: signupValues.role,
      });

      if (data.success) {
        const registeredEmail = signupValues.email.trim();
        setSignupSuccess('Account created successfully.');
        setSignupValues({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
        });
        window.setTimeout(() => {
          setEmail(registeredEmail);
          setPassword('');
          setSigninNotice('Your account is ready. Please sign in to continue.');
          setAuthMode('signin');
          setSignupSuccess('');
          setErrors({});
        }, 1100);
      } else {
        setErrors({ form: data.message || 'Unable to create account. Please try again.' });
      }
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, 'An error occurred. Please try again later.') });
    } finally {
      setIsRegistering(false);
    }
  }
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      if (data.success) {
        login(data.user, data.token);
        navigate("/developer-dashboard");
      }
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Google Login Failed'));
    }
  };


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
                <span>{authMode === 'signup' ? 'GET STARTED' : 'SECURE ACCESS'}</span>
              </div>
            </div>

            <div className={`form-transition ${isFormSwitching ? 'is-switching' : ''} ${switchDirection}`}>
              {authMode === 'signin' ? (
                <div className={`login-card ${isSuccess ? 'fade-out' : ''}`}>
                  <h1>Sign in</h1>
                  <p>Enter your workspace credentials to continue.</p>
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
                      <a href="#" className="forgot-password">Forgot password?</a>
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
                  <h1>Create your workspace</h1>
                  <p>Set up your account and start working with your team.</p>
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
                    <div className="input-group role-group">
                      <BriefcaseBusiness size={20} />
                      <select name="role" value={signupValues.role} onChange={updateSignupField} aria-label="Select your role" className={signupValues.role ? '' : 'is-placeholder'}>
                        <option value="" disabled hidden>Select your role</option>
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <span className="select-label">Select your role</span>
                      {errors.role && <span className="error-message">{errors.role}</span>}
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
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log("Login Failed")}
                  />
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
            <h2>
              Everything.
              <br />
              In one place.
            </h2>
            <p>Collaborate with your team, manage<br />projects, and move work forward.</p>
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
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="meshLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#31E6E6" />
                    <stop offset="48%" stopColor="#2E8BFF" />
                    <stop offset="100%" stopColor="#CC3DFF" />
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




