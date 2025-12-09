import React from 'react';
import PropTypes from 'prop-types';
import { Building2, Users, TrendingUp, DollarSign } from 'lucide-react';

/**
 * System Statistics Component
 * Displays system-wide metrics for manager
 */
export function SystemStats({ stats }) {
  const metrics = [
    {
      label: 'Total Branches',
      value: stats.totalBranches,
      icon: Building2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-600/20',
    },
    {
      label: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
    },
    {
      label: 'Total Volume',
      value: `$${(stats.totalVolume / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
    },
    {
      label: 'Total Commission',
      value: `$${stats.totalCommission.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-600/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon size={24} className={metric.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-slate-400">{metric.label}</div>
          </div>
        );
      })}
    </div>
  );
}

SystemStats.propTypes = {
  stats: PropTypes.shape({
    totalBranches: PropTypes.number.isRequired,
    totalClients: PropTypes.number.isRequired,
    totalVolume: PropTypes.number.isRequired,
    totalCommission: PropTypes.number.isRequired,
  }).isRequired,
};
