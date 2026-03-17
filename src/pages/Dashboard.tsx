import { AreaChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { 
  Bus, Users, Calendar, AlertTriangle, TrendingUp, 
  Clock, CheckCircle2, ChevronRight, Filter
} from 'lucide-react';

const MOCK_STATS = [
  { label: 'Viajes Hoy', value: '42', change: '+12%', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Unidades Activas', value: '18/20', change: '90%', icon: Bus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Operadores', value: '22', change: '4 Libres', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Alertas', value: '3', change: 'Críticas', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const WEEKLY_DATA = [
  { name: 'Lun', viajes: 38, puntualidad: 95 },
  { name: 'Mar', viajes: 42, puntualidad: 92 },
  { name: 'Mie', viajes: 45, puntualidad: 98 },
  { name: 'Jue', viajes: 40, puntualidad: 94 },
  { name: 'Vie', viajes: 48, puntualidad: 100 },
  { name: 'Sab', viajes: 20, puntualidad: 90 },
  { name: 'Dom', viajes: 15, puntualidad: 95 },
];

const AREA_DISTRIBUTION = [
  { name: 'Ramos Arizpe', value: 45 },
  { name: 'Saltillo Sur', value: 30 },
  { name: 'Derramadero', value: 25 },
];

const RECENT_TRIPS = [
  { id: '1', route: 'Ruta 102 - GM', status: 'completed', time: '06:00', driver: 'Juan Perez' },
  { id: '2', route: 'Ruta 201 - Stellantis', status: 'dispatched', time: '06:45', driver: 'Ricardo Treviño' },
  { id: '3', route: 'Especial - Personal Administrativo', status: 'scheduled', time: '08:30', driver: 'Roberto Gomez' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Control</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Resumen operativo avanzado - Vista Demo</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            <Filter size={16} /> Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-500" />
              Viajes por Semana
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DATA}>
                <defs>
                  <linearGradient id="colorViajes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="viajes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViajes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Cumplimiento (%)
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="puntualidad" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Monitoreo en Tiempo Real</h3>
          <div className="space-y-4">
            {RECENT_TRIPS.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    trip.status === 'completed' ? 'bg-green-100 text-green-600' : 
                    trip.status === 'dispatched' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {trip.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{trip.route}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.driver} • Sale: {trip.time}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors">
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Distribución por Zona</h3>
          <div className="space-y-6">
            {AREA_DISTRIBUTION.map((area) => (
              <div key={area.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{area.name}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{area.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${area.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
