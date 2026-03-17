import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MainLayout = ({ children, activeTab, onTabChange }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const pageTitles: Record<string, string> = {
    dashboard: 'Panel de Control',
    fleet: 'Administración de Flota',
    drivers: 'Personal',
    trips: 'Control Operativo de Viajes',
    settlements: 'Liquidaciones de Socios',
    inventory: 'Inventario y Taller',
    'operations': 'Despacho de Operación',
    'operations-config': 'Configuraciones de Viajes',
    'route-templates': 'Plantillas de Rutas',
  };

  return (
    <div className="min-h-screen bg-enterprise-bg-light dark:bg-enterprise-bg-dark transition-colors duration-200 font-sans">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      
      <div 
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          sidebarCollapsed ? "pl-20" : "pl-64"
        )}
      >
        <Header 
          darkMode={darkMode} 
          toggleDarkMode={() => setDarkMode(!darkMode)}
          title={pageTitles[activeTab] || 'LogiCore TMS'}
        />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        <footer className="p-6 border-t border-enterprise-border-light dark:border-enterprise-border-dark text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} LogiCore TMS - Powered by Nexura Solutions
        </footer>
      </div>
    </div>
  );
};
