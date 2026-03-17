import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalAlerts } from './components/common/GlobalAlerts';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Login from './pages/Login';
import Trips from './pages/Trips';
import Settlements from './pages/Settlements';
import Inventory from './pages/Inventory';
import Drivers from './pages/Drivers';
import OperationsConfig from './pages/OperationsConfig';
import RouteTemplates from './pages/RouteTemplates';
import Operations from './pages/Operations';

type Tab = 'dashboard' | 'fleet' | 'drivers' | 'trips' | 'settlements' | 'inventory' | 'operations-config' | 'route-templates' | 'operations';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':          return <Dashboard />;
      case 'fleet':              return <Fleet />;
      case 'trips':              return <Trips />;
      case 'settlements':        return <Settlements />;
      case 'inventory':          return <Inventory />;
      case 'drivers':            return <Drivers />;
      case 'operations-config':  return <OperationsConfig />;
      case 'route-templates':    return <RouteTemplates />;
      case 'operations':         return <Operations />;
      default:                   return <Dashboard />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)}>
      <GlobalAlerts onNavigate={(tab) => setActiveTab(tab as Tab)} />
      {renderContent()}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
