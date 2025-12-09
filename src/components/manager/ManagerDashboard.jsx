import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LogOut, BarChart3, Building2, Server, Settings } from 'lucide-react';
import { SystemStats } from './SystemStats';
import { BranchesList } from './BranchesList';
import { LiquidityProviders } from './LiquidityProviders';
import { Button } from '../shared/Button';

function ManagerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  const [stats] = useState({
    totalBranches: 3,
    totalClients: 45,
    totalVolume: 2500000,
    totalCommission: 12500,
  });

  const [branches] = useState([
    {
      id: 1,
      name: 'Main Branch',
      code: 'MAIN-001',
      status: 'active',
      clientCount: 15,
      totalBalance: 750000,
      commission: 5.0,
      referralCode: 'MAIN001-REF',
    },
    {
      id: 2,
      name: 'Downtown Branch',
      code: 'DT-002',
      status: 'active',
      clientCount: 20,
      totalBalance: 1200000,
      commission: 5.0,
      referralCode: 'DT002-REF',
    },
    {
      id: 3,
      name: 'West Branch',
      code: 'WEST-003',
      status: 'active',
      clientCount: 10,
      totalBalance: 550000,
      commission: 5.0,
      referralCode: 'WEST003-REF',
    },
  ]);

  const [liquidityProviders] = useState([
    {
      id: 1,
      name: 'LP Alpha',
      server: 'lp-alpha.trading.com',
      status: 'connected',
      spread: 0.5,
      priority: 1,
      ping: 12,
    },
    {
      id: 2,
      name: 'LP Beta',
      server: 'lp-beta.trading.com',
      status: 'connected',
      spread: 0.8,
      priority: 2,
      ping: 18,
    },
    {
      id: 3,
      name: 'LP Gamma',
      server: 'lp-gamma.trading.com',
      status: 'connected',
      spread: 1.0,
      priority: 3,
      ping: 25,
    },
  ]);

  const handleViewBranch = (branch) => {
    alert(`Branch Details:\n\nName: ${branch.name}\nCode: ${branch.code}\nClients: ${branch.clientCount}\nBalance: $${branch.totalBalance.toLocaleString()}\nReferral: ${branch.referralCode}`);
  };

  const handleEditBranch = (branch) => {
    alert(`Edit functionality for ${branch.name} coming soon!`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'liquidity', label: 'Liquidity', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">Manager Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome, {user.name} - System Manager
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={onLogout}>
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex space-x-2 mb-6 bg-slate-800/50 rounded-xl p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div>
            <SystemStats stats={stats} />
            <div className="grid grid-cols-1 gap-6">
              <BranchesList
                branches={branches}
                onViewBranch={handleViewBranch}
                onEditBranch={handleEditBranch}
              />
              <LiquidityProviders providers={liquidityProviders} />
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div>
            <BranchesList
              branches={branches}
              onViewBranch={handleViewBranch}
              onEditBranch={handleEditBranch}
            />
          </div>
        )}

        {activeTab === 'liquidity' && (
          <div>
            <LiquidityProviders providers={liquidityProviders} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
            <Settings size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">System Settings</h3>
            <p className="text-slate-400 mb-4">
              Platform configuration and advanced settings
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Trading Settings</h4>
                <p className="text-slate-400 text-sm">Configure leverage, margins, and limits</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Commission Rules</h4>
                <p className="text-slate-400 text-sm">Set commission rates and structures</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Risk Management</h4>
                <p className="text-slate-400 text-sm">Configure risk limits and controls</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">API Integration</h4>
                <p className="text-slate-400 text-sm">Manage external API connections</p>
              </div>
            </div>
          </div>
        )}
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
