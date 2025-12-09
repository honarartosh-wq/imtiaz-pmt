import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { login as apiLogin } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

/**
 * Login Form Component
 * Handles user authentication
 */
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiLogin(email, password);
      login(response.user, response.access_token, response.refresh_token);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        required
      />
      {error && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4 text-xs text-slate-300">
        <div className="font-semibold mb-2">🔐 Demo Accounts Available</div>
        <div className="text-slate-400">
          Contact your branch admin for demo credentials or register for a new account.
        </div>
        <div className="mt-2 text-slate-500">
          Note: All authentication is secured via backend API with JWT tokens.
        </div>
      </div>
    </form>
  );
}

LoginForm.propTypes = {};
