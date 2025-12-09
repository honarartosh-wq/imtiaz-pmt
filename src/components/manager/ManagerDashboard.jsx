import React from 'react';
import PropTypes from 'prop-types';

/**
 * Manager Dashboard Component
 * TODO: Extract from original App.jsx
 * This is a temporary stub - will be properly implemented
 */
function ManagerDashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Manager Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome, {user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">🚧 Under Development</h2>
          <p className="text-slate-300">
            The Manager Dashboard is being refactored into smaller, maintainable components.
          </p>
          <p className="text-slate-400 mt-2 text-sm">
            Original dashboard has been preserved. New modular version coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Branch Management</h3>
            <p className="text-slate-400 text-sm">Manage branches, admins, and configurations</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Liquidity Providers</h3>
            <p className="text-slate-400 text-sm">Configure LPs and routing rules</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-slate-400 text-sm">View system metrics and reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

ManagerDashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default ManagerDashboard;
