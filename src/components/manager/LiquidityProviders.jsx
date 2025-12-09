import React from 'react';
import PropTypes from 'prop-types';
import { Server, TrendingUp, Activity, Clock } from 'lucide-react';

/**
 * Liquidity Providers Component
 * Displays list of configured liquidity providers
 */
export function LiquidityProviders({ providers }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-emerald-400';
      case 'disconnected':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-400';
      case 'disconnected':
        return 'bg-red-400';
      default:
        return 'bg-slate-400';
    }
  };

  if (!providers || providers.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Liquidity Providers</h3>
        <div className="text-center py-8 text-slate-400">
          <Server size={48} className="mx-auto mb-3 opacity-50" />
          <p>No liquidity providers configured</p>
          <p className="text-sm mt-2">Add LPs to start routing trades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Liquidity Providers ({providers.length})
      </h3>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-800 rounded-lg">
                <Server size={20} className="text-blue-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-semibold">{provider.name}</h4>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(provider.status)}`} />
                    <span className={`text-xs capitalize ${getStatusColor(provider.status)}`}>
                      {provider.status}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-1">{provider.server}</p>
              </div>
            </div>
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="flex items-center text-slate-400 mb-1">
                  <TrendingUp size={14} className="mr-1" />
                  <span>Spread</span>
                </div>
                <div className="text-white font-semibold">+{provider.spread} pips</div>
              </div>
              <div className="text-center">
                <div className="flex items-center text-slate-400 mb-1">
                  <Activity size={14} className="mr-1" />
                  <span>Priority</span>
                </div>
                <div className="text-white font-semibold">{provider.priority}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center text-slate-400 mb-1">
                  <Clock size={14} className="mr-1" />
                  <span>Ping</span>
                </div>
                <div className="text-emerald-400 font-semibold">{provider.ping}ms</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

LiquidityProviders.propTypes = {
  providers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      server: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['connected', 'disconnected']).isRequired,
      spread: PropTypes.number.isRequired,
      priority: PropTypes.number.isRequired,
      ping: PropTypes.number.isRequired,
    })
  ).isRequired,
};
