import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LogInWndw = ({ onLoginSuccess }) => {
  const location = useLocation();
  const message = location.state?.message;

  const [mode, setMode] = useState('signin'); // 'signin', 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [passwordChangeSession, setPasswordChangeSession] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Dodatkowa walidacja maila w username na froncie
    if (!username.includes('@')) {
      setError('Username must be a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();
      if (response.ok) {
        setNeedsConfirmation(true);
        setError('');
      } else {
        setError(data.error || 'Sign up failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, confirmationCode }),
      });

      if (response.ok) {
        await handleSignIn(e, true);
      } else {
        const data = await response.json();
        setError(data.error || 'Confirmation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e, skipPreventDefault = false) => {
    if (!skipPreventDefault) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess({
          idToken: data.idToken,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } else if (response.status === 403 && data.error === 'NEW_PASSWORD_REQUIRED') {
        setNeedsPasswordChange(true);
        setPasswordChangeSession(data.session);
      } else {
        setError(data.error || 'Sign in failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword, session: passwordChangeSession }),
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess({
          idToken: data.idToken,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMode('signin');
    setUsername('');
    setPassword('');
    setEmail('');
    setConfirmationCode('');
    setNeedsConfirmation(false);
    setNeedsPasswordChange(false);
    setError('');
  };

  // Widoki pomocnicze (Password Change i Confirmation)
  if (needsPasswordChange || needsConfirmation) {
    return (
      <div className="bg-cream rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 my-8 border-2 border-darkGreen/30">
        <h2 className="text-2xl font-serif font-bold text-vDarkGreen mb-4 text-center">
          {needsPasswordChange ? 'Set New Password' : 'Confirm Your Email'}
        </h2>
        <form 
          onSubmit={needsPasswordChange ? handlePasswordChange : handleConfirmSignUp} 
          className="space-y-4"
        >
          {needsPasswordChange ? (
            <>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg" placeholder="New password" required />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg" placeholder="Confirm password" required />
            </>
          ) : (
            <input type="text" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg" placeholder="Enter code" required />
          )}
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-darkGreen text-cream px-4 py-2 rounded-lg font-serif font-bold hover:bg-vDarkGreen transition-all">
            {loading ? 'Processing...' : 'Submit'}
          </button>
          <button type="button" onClick={resetForm} className="w-full text-vDarkGreen text-sm underline">Cancel</button>
        </form>
      </div>
    );
  }

  // GŁÓWNY WIDOK (LOG IN / SIGN UP)
  return (
    <div className="bg-cream rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 my-8 border-2 border-darkGreen/30">
      <h2 className="text-2xl font-serif font-bold text-vDarkGreen mb-4 text-center">
        {mode === 'signin' ? 'Log In' : 'Sign Up'}
      </h2>

      {message && (
        <div className="mb-4 p-3 bg-green/20 text-darkGreen rounded text-sm font-serif italic animate-pulse">
          {message}
        </div>
      )}

      <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-6">
        {/* Username field */}
        <div>
          <label className="block text-sm font-medium text-vDarkGreen mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
            placeholder={mode === 'signup' ? "example@email.com" : "Enter username"}
            required
          />
          {mode === 'signup' && (
            <p className="text-[10px] text-darkGreen/70 mt-1 ml-1">Username should be your email address.</p>
          )}
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
              placeholder="Enter email"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-vDarkGreen mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
            placeholder="Enter password"
            required
          />
          {mode === 'signup' && (
            <p className="text-[10px] text-darkGreen/70 mt-1 ml-1 leading-tight">
              Min. 8 chars: uppercase, lowercase, number and special char.
            </p>
          )}
        </div>

        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-darkGreen text-cream px-4 py-2 rounded-lg font-serif font-bold hover:bg-vDarkGreen transition-all disabled:opacity-50 shadow-md active:scale-95"
        >
          {loading ? 'Processing...' : mode === 'signin' ? 'Log In' : 'Sign Up'}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            className="text-sm text-darkGreen hover:text-vDarkGreen underline font-serif"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogInWndw;