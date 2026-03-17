
import { Bell, Search, Moon, Sun, User } from 'lucide-react';
import { Input } from '../common/Input';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  title: string;
}

export const Header = ({ darkMode, toggleDarkMode, title }: HeaderProps) => {
  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-enterprise-border-light dark:border-enterprise-border-dark px-6 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-semibold text-enterprise-text-light dark:text-enterprise-text-dark">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <Input 
            placeholder="Búsqueda global..." 
            icon={<Search size={18} />} 
            className="w-64 h-9 bg-slate-100 dark:bg-slate-800 border-none"
          />
        </div>

        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-enterprise-text-light dark:text-enterprise-text-dark">Admin Usuario</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-white">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
