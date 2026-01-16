import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LogInWndw = ({ onLoginSuccess }) => {
  const location = useLocation();
  const message = location.state?.message;

  const [mode, setMode] = useState('signin'); // 'signin', 'signup', or 'change-password'
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
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Sign up error:', err);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, confirmationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // After confirmation, automatically sign in
        await handleSignIn(e, true);
      } else {
        setError(data.error || 'Confirmation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Confirmation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e, skipPreventDefault = false) => {
    if (!skipPreventDefault) {
      e.preventDefault();
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Call onLoginSuccess with tokens
        onLoginSuccess({
          idToken: data.idToken,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } else if (response.status === 403 && data.error === 'NEW_PASSWORD_REQUIRED') {
        // User needs to set a new password
        setNeedsPasswordChange(true);
        setPasswordChangeSession(data.session);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Sign in failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Sign in error:', err);
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

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          newPassword,
          session: passwordChangeSession,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Password changed successfully, log in the user
        onLoginSuccess({
          idToken: data.idToken,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Password change error:', err);
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
    setNewPassword('');
    setConfirmPassword('');
    setNeedsConfirmation(false);
    setNeedsPasswordChange(false);
    setPasswordChangeSession('');
    setError('');
  };

  if (needsPasswordChange) {
    return (
      <div className="bg-cream rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-darkGreen/30">
        <h2 className="text-2xl font-serif font-bold text-vDarkGreen mb-4 text-center">
          Set New Password
        </h2>
        <p className="text-sm text-gray-700 mb-4 text-center">
          Your password has expired. Please set a new password to continue.
        </p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
              placeholder="Confirm new password"
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-darkGreen text-cream px-4 py-2 rounded-lg font-serif font-bold hover:bg-vDarkGreen transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-full px-4 py-2 border border-darkGreen/30 text-vDarkGreen rounded-lg font-serif hover:bg-darkGreen/10 transition-all"
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  if (needsConfirmation) {
    return (
      <div className="bg-cream rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-darkGreen/30">
        <h2 className="text-2xl font-serif font-bold text-vDarkGreen mb-4 text-center">
          Confirm Your Email
        </h2>
        {message && (
          <div className="mb-4 p-3 bg-green/20 text-darkGreen rounded text-sm">
            {message}
          </div>
        )}
        <p className="text-sm text-gray-700 mb-4 text-center">
          Please check your email for the confirmation code and enter it below.
        </p>
        <form onSubmit={handleConfirmSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-1">
              Confirmation Code
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
              placeholder="Enter confirmation code"
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-darkGreen text-cream px-4 py-2 rounded-lg font-serif font-bold hover:bg-vDarkGreen transition-all disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-darkGreen/30 text-vDarkGreen rounded-lg font-serif hover:bg-darkGreen/10 transition-all"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-darkGreen/30">
      <h2 className="text-2xl font-serif font-bold text-vDarkGreen mb-4 text-center">
        {mode === 'signin' ? 'Log In' : 'Sign Up'}
      </h2>
      {message && (
        <div className="mb-4 p-3 bg-green/20 text-darkGreen rounded text-sm">
          {message}
        </div>
      )}
      <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-vDarkGreen mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
            placeholder="Enter username"
            required
          />
        </div>
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-1">
              Email
            </label>
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
          <label className="block text-sm font-medium text-vDarkGreen mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
            placeholder="Enter password"
            required
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-darkGreen text-cream px-4 py-2 rounded-lg font-serif font-bold hover:bg-vDarkGreen transition-all disabled:opacity-50"
        >
          {loading
            ? mode === 'signin'
              ? 'Signing in...'
              : 'Signing up...'
            : mode === 'signin'
            ? 'Log In'
            : 'Sign Up'}
        </button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
            className="text-sm text-darkGreen hover:text-vDarkGreen underline font-serif"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogInWndw;
