import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wallet, 
  Package, 
  Settings, 
  ChevronLeft,
  ChevronDown,
  LogOut,
  MapPin,
  Route,
  CalendarCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, collapsed, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" 
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-enterprise-text-light dark:hover:text-enterprise-text-dark"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active && "scale-110")} />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ collapsed, onToggle, activeTab, onTabChange }: SidebarProps) => {
  const { logout } = useAuth();
  const [opsOpen, setOpsOpen] = useState(
    ['operations', 'operations-config', 'route-templates'].includes(activeTab)
  );

  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'fleet', label: 'Gestión de Flota', icon: Truck },
    { id: 'drivers', label: 'Personal', icon: Users },
  ];

  const opsSubItems = [
    { id: 'operations', label: 'Despacho', icon: CalendarCheck },
    { id: 'route-templates', label: 'Plantillas de Ruta', icon: Route },
    { id: 'operations-config', label: 'Configuraciones', icon: MapPin },
  ];

  const bottomItems = [
    { id: 'settlements', label: 'Liquidaciones', icon: Wallet },
    { id: 'inventory', label: 'Inventario / Taller', icon: Package },
  ];

  const isOpsActive = opsSubItems.some(s => s.id === activeTab);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-enterprise-border-light dark:border-enterprise-border-dark transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between overflow-hidden">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">L</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">LogiCore</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mx-auto">L</div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} collapsed={collapsed} onClick={() => onTabChange(item.id)} />
        ))}

        {/* Operations group */}
        <button
          onClick={() => collapsed ? onTabChange('operations') : setOpsOpen(o => !o)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
            isOpsActive
              ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Navigation size={20} className="transition-transform group-hover:scale-110" />
          {!collapsed && (
            <>
              <span className="font-medium whitespace-nowrap flex-1 text-left">Operación</span>
              <ChevronDown size={16} className={cn("transition-transform", opsOpen && "rotate-180")} />
            </>
          )}
        </button>
        {!collapsed && opsOpen && (
          <div className="ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-1">
            {opsSubItems.map(s => (
              <NavItem key={s.id} icon={s.icon} label={s.label} active={activeTab === s.id} collapsed={false} onClick={() => onTabChange(s.id)} />
            ))}
          </div>
        )}

        {bottomItems.map((item) => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} collapsed={collapsed} onClick={() => onTabChange(item.id)} />
        ))}
      </nav>

      <div className="p-4 border-t border-enterprise-border-light dark:border-enterprise-border-dark space-y-2">
        {!collapsed && <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sistema</p>}
        <NavItem icon={Settings} label="Configuración" collapsed={collapsed} />
        <NavItem icon={LogOut} label="Cerrar Sesión" collapsed={collapsed} onClick={logout} />
        
        <button
          onClick={onToggle}
          className="w-full h-8 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-colors mt-4"
        >
          <ChevronLeft className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
};
