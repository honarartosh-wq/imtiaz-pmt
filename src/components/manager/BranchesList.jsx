import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, Users, DollarSign, Activity } from 'lucide-react';
import { Button } from '../shared/Button';

/**
 * Branches List Component
 * Displays list of branches with their statistics
 */
export function BranchesList({ branches, onViewBranch, onEditBranch }) {
  const getStatusColor = (status) => {
    return status === 'active' ? 'text-emerald-400' : 'text-slate-400';
  };

  if (!branches || branches.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Branches</h3>
        <div className="text-center py-8 text-slate-400">
          <p>No branches yet</p>
          <p className="text-sm mt-2">Create your first branch to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Branches ({branches.length})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-slate-900/50 rounded-lg p-5 hover:bg-slate-900 transition-colors border border-slate-700/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-white font-semibold text-lg">{branch.name}</h4>
                <p className="text-slate-400 text-sm font-mono">{branch.code}</p>
              </div>
              <span className={`capitalize text-sm ${getStatusColor(branch.status)}`}>
                {branch.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-400">
                  <Users size={14} className="mr-2" />
                  Clients
                </div>
                <span className="text-white font-semibold">{branch.clientCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-400">
                  <DollarSign size={14} className="mr-2" />
                  Balance
                </div>
                <span className="text-emerald-400 font-semibold">
                  ${branch.totalBalance?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-400">
                  <Activity size={14} className="mr-2" />
                  Commission
                </div>
                <span className="text-white font-semibold">
                  ${branch.commission?.toFixed(2) || 0}/lot
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => onViewBranch && onViewBranch(branch)}
              >
                View Details
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEditBranch && onEditBranch(branch)}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

BranchesList.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      status: PropTypes.string,
      clientCount: PropTypes.number,
      totalBalance: PropTypes.number,
      commission: PropTypes.number,
    })
  ).isRequired,
  onViewBranch: PropTypes.func,
  onEditBranch: PropTypes.func,
};
