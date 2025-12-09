import React from 'react';
import { useAuthStore } from './stores/authStore';
import { AuthPage } from './components/auth/AuthPage';

// Lazy load dashboards for better performance
const ManagerDashboard = React.lazy(() => import('./components/manager/ManagerDashboard'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const ClientDashboard = React.lazy(() => import('./components/client/ClientDashboard'));

/**
 * Main Application Component
 * Routes users based on authentication state and role
 */
function App() {
  const { user, isAuthenticated, logout } = useAuthStore();

  // Show auth page if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  // Route based on user role
  const getDashboard = () => {
    const userBranch = user.branch_id ? { id: user.branch_id } : null;

    switch (user.role) {
      case 'manager':
        return <ManagerDashboard user={user} onLogout={logout} />;
      case 'admin':
        return <AdminDashboard user={user} branch={userBranch} onLogout={logout} />;
      case 'client':
        return <ClientDashboard user={user} branch={userBranch} onLogout={logout} />;
      default:
        return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-white text-xl">Invalid user role</div>
          </div>
        );
    }
  };

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-emerald-400 text-2xl font-bold animate-pulse">Loading...</div>
        </div>
      }
    >
      {getDashboard()}
    </React.Suspense>
  );
}

export default App;
