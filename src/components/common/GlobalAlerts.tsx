import { useEffect, useState } from 'react';
import { AlertTriangle, X, ChevronRight, Shield, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import type { Driver, Truck } from '../../lib/api';

interface GlobalAlertsProps {
  onNavigate?: (tab: string) => void;
}

interface AlertItem {
  type: 'expired' | 'warning';
  category: 'license' | 'insurance';
  label: string;
  detail: string;
  daysLeft?: number;
}

export const GlobalAlerts = ({ onNavigate }: GlobalAlertsProps) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [drivers, trucks] = await Promise.all([
          api.drivers.getAll(),
          api.trucks.getAll(),
        ]);
        const items: AlertItem[] = [];

        drivers.forEach((d: Driver) => {
          if (!d.licenseExpiry) return;
          const days = Math.floor((new Date(d.licenseExpiry).getTime() - Date.now()) / 86400000);
          if (days < 0) {
            items.push({ type: 'expired', category: 'license', label: d.name, detail: `Licencia vencida hace ${Math.abs(days)} días`, daysLeft: days });
          } else if (days <= 30) {
            items.push({ type: 'warning', category: 'license', label: d.name, detail: `Licencia vence en ${days} día${days !== 1 ? 's' : ''}`, daysLeft: days });
          }
        });

        trucks.forEach((t: Truck) => {
          if (!t.insuranceExpiry) return;
          const days = Math.floor((new Date(t.insuranceExpiry).getTime() - Date.now()) / 86400000);
          const name = t.unitNumber || t.plate;
          if (days < 0) {
            items.push({ type: 'expired', category: 'insurance', label: name, detail: `Seguro vencido hace ${Math.abs(days)} días`, daysLeft: days });
          } else if (days <= 30) {
            items.push({ type: 'warning', category: 'insurance', label: name, detail: `Seguro vence en ${days} día${days !== 1 ? 's' : ''}`, daysLeft: days });
          }
        });

        // Sort: expired first, then by days left ascending
        items.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'expired' ? -1 : 1;
          return (a.daysLeft ?? 0) - (b.daysLeft ?? 0);
        });

        setAlerts(items);
      } catch {
        // silently ignore - alerts are not critical
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!loaded || dismissed || alerts.length === 0) return null;

  const expiredCount = alerts.filter(a => a.type === 'expired').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <AlertTriangle size={24} />
            <div>
              <h2 className="font-bold text-lg">Alertas del Sistema</h2>
              <p className="text-sm text-white/80">
                {expiredCount > 0 && `${expiredCount} vencido${expiredCount > 1 ? 's' : ''}`}
                {expiredCount > 0 && warningCount > 0 && ' · '}
                {warningCount > 0 && `${warningCount} por vencer`}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alert list */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              onClick={() => {
                handleDismiss();
                onNavigate?.(alert.category === 'license' ? 'drivers' : 'fleet');
              }}
            >
              <div className={`shrink-0 p-2 rounded-lg ${
                alert.type === 'expired'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
              }`}>
                {alert.category === 'license' ? <FileText size={16} /> : <Shield size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark truncate">
                  {alert.label}
                </p>
                <p className={`text-xs ${alert.type === 'expired' ? 'text-red-500 font-semibold' : 'text-amber-500'}`}>
                  {alert.detail}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={handleDismiss}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Entendido, cerrar alertas
          </button>
        </div>
      </div>
    </div>
  );
};
