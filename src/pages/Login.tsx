import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { UsernameNotAllowedError } from '../lib/thoughtspot';
import { Eye, EyeOff } from 'lucide-react';
import JpmorganChaseLogo from '../components/JpmorganChaseLogo';
import { CONTENT } from '../content';

export default function Login() {
  const [username, setUsername] = useState('hadley.vaca@thoughtspot.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(
        err instanceof UsernameNotAllowedError
          ? "This username isn't allowed. Please use an approved demo user."
          : 'Failed to sign in. Please check your credentials.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <JpmorganChaseLogo className="login-logo" size={34} />
        <div className="login-hero-content">
          <h1 className="login-hero-title" dangerouslySetInnerHTML={{ __html: CONTENT.loginTitleHtml }} />
          <p className="login-hero-subtitle">{CONTENT.loginSubtitle}</p>
          <div className="login-stats">
            <div className="login-stat">
              <span className="login-stat-value">{CONTENT.loginStats[0].value}</span>
              <span className="login-stat-label">{CONTENT.loginStats[0].label}</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">{CONTENT.loginStats[1].value}</span>
              <span className="login-stat-label">{CONTENT.loginStats[1].label}</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">{CONTENT.loginStats[2].value}</span>
              <span className="login-stat-label">{CONTENT.loginStats[2].label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Sign in</h2>
            <p className="login-card-subtitle">{CONTENT.loginCardSubtitle}</p>
          </div>


          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="login-input"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="login-input login-input-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? <span className="login-spinner" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
