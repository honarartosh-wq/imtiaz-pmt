import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

/**
 * Authentication Page Component
 * Handles login/register tab switching
 */
export function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Imtiaz Trading
          </div>
          <p className="text-slate-400">Professional Trading Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
          {/* Tab Buttons */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setShowRegister(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                showRegister ? 'bg-slate-700 text-slate-400' : 'bg-emerald-600 text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                showRegister ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          {showRegister ? (
            <RegisterForm onSuccess={() => setShowRegister(false)} />
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
}
