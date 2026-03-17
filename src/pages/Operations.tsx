import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { MOCK_TRIPS, MOCK_TEMPLATES, MOCK_AREAS, MOCK_PARKS, MOCK_TRUCKS, MOCK_DRIVERS } from '../lib/mocks';
import type { ScheduledTrip, Area, Park, Truck, Driver, RouteTemplate } from '../lib/api';
import {
  Calendar, Plus, RefreshCw, ArrowRightLeft, Play, CheckCircle2,
  XCircle, Clock, Bus, UserCheck, MapPin, X, Star,
  TreePine, RotateCcw, ArrowRight, ArrowLeft, ChevronDown, ChevronRight,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled:  { label: 'Programado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  dispatched: { label: 'Despachado', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed:  { label: 'Completado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled:  { label: 'Cancelado',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const TRIP_TYPE_BADGE: Record<string, { label: string; color: string; Icon: typeof RotateCcw }> = {
  round:      { label: 'Redondo', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', Icon: RotateCcw },
  entry_only: { label: 'Entrada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', Icon: ArrowRight },
  exit_only:  { label: 'Salida',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', Icon: ArrowLeft },
};

const TRIP_TYPES = [
  { value: 'round', label: 'Redondo' },
  { value: 'entry_only', label: 'Solo Entrada' },
  { value: 'exit_only', label: 'Solo Salida' },
];

// ============ Swap Modal ============
function SwapModal({ trip, trucks, drivers, onClose, onSaved }: {
  trip: any; trucks: Truck[]; drivers: Driver[];
  onClose: () => void; onSaved: (data: { truckId: string; driverId: string }) => void;
}) {
  const [truckId, setTruckId] = useState(trip.truckId || '');
  const [driverId, setDriverId] = useState(trip.driverId || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      onSaved({ truckId, driverId });
      setSaving(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cambiar Unidad/Operador</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Unidad</label>
            <select value={truckId} onChange={e => setTruckId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Sin asignar</option>
              {trucks.map(t => <option key={t.id} value={t.id}>{t.unitNumber || t.plate} — {t.make} {t.model}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Operador</label>
            <select value={driverId} onChange={e => setDriverId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Sin asignar</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Confirmar Cambio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Special Trip Modal ============
function SpecialTripModal({ areas, parks, trucks, drivers, date, onClose, onSaved }: {
  areas: Area[]; parks: Park[]; trucks: Truck[]; drivers: Driver[]; date: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    areaId: '', parkId: '', tripType: 'round', serviceAmount: '', plannedTruckId: '', plannedDriverId: '',
    plannedEntry: '', plannedExit: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const filteredParks = parks.filter(p => p.areaId === form.areaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.scheduledTrips.createSpecial({
        date: new Date(date + 'T00:00:00').toISOString(),
        areaId: form.areaId,
        parkId: form.parkId || undefined,
        tripType: form.tripType,
        serviceAmount: parseFloat(form.serviceAmount),
        plannedTruckId: form.plannedTruckId || undefined,
        plannedDriverId: form.plannedDriverId || undefined,
        plannedEntry: form.plannedEntry || undefined,
        plannedExit: form.plannedExit || undefined,
        notes: form.notes || undefined,
      });
      onSaved();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Viaje Especial — {date}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Área *</label>
              <select value={form.areaId} onChange={e => { set('areaId', e.target.value); set('parkId', ''); }} required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                <option value="">Seleccionar...</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Parque</label>
              <select value={form.parkId} onChange={e => set('parkId', e.target.value)} disabled={!form.areaId}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                <option value="">Sin parque</option>
                {filteredParks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tipo de Viaje</label>
              <select value={form.tripType} onChange={e => set('tripType', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                {TRIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Costo del servicio *</label>
              <input type="number" step="0.01" min="0" value={form.serviceAmount} onChange={e => set('serviceAmount', e.target.value)} required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hora Entrada</label>
              <input type="time" value={form.plannedEntry} onChange={e => set('plannedEntry', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hora Salida</label>
              <input type="time" value={form.plannedExit} onChange={e => set('plannedExit', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Unidad</label>
              <select value={form.plannedTruckId} onChange={e => set('plannedTruckId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                <option value="">Sin asignar</option>
                {trucks.map(t => <option key={t.id} value={t.id}>{t.unitNumber || t.plate}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Operador</label>
              <select value={form.plannedDriverId} onChange={e => set('plannedDriverId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                <option value="">Sin asignar</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Notas</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Descripción del servicio especial..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear Viaje Especial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Dispatch Modal (Entry/Exit) ============
function DispatchModal({ trip, action, onClose, onDone }: {
  trip: any; action: 'dispatch' | 'complete'; onClose: () => void; onDone: () => void;
}) {
  const [odometer, setOdometer] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      onDone();
      setSaving(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {action === 'dispatch' ? 'Registrar Entrada' : 'Registrar Salida'}
          </h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm">
          <p className="text-slate-600 dark:text-slate-300"><strong>{trip.routeTemplate?.name || 'Viaje Especial'}</strong></p>
          <p className="text-slate-500 dark:text-slate-400">
            {trip.truck?.unitNumber || trip.truck?.plateNumber || '—'} • {trip.driver?.fullName || '—'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Odómetro (km)</label>
            <input type="number" min="0" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="Opcional"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <button type="submit" disabled={saving}
            className={`w-full py-2.5 rounded-lg text-white font-medium disabled:opacity-50 ${action === 'dispatch' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}>
            {saving ? 'Registrando...' : action === 'dispatch' ? 'Confirmar Entrada' : 'Confirmar Salida'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============ Trip Card ============
function TripCard({ trip, onSwap, onDispatch, onComplete, onCancel }: {
  trip: any;
  onSwap: () => void; onDispatch: () => void; onComplete: () => void; onCancel: () => void;
}) {
  const st = STATUS_LABELS[trip.status] ?? STATUS_LABELS.scheduled;
  const truck = trip.truck;
  const driver = trip.driver;
  const tt = TRIP_TYPE_BADGE[trip.tripType || 'round'] ?? TRIP_TYPE_BADGE.round;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border p-4 transition hover:shadow-md ${trip.status === 'cancelled' ? 'opacity-50 border-red-200 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tt.color}`}><tt.Icon size={10} /> {tt.label}</span>
          {trip.isSpecial && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Star size={10} /> Especial</span>}
        </div>
        <span className="text-lg font-bold text-green-600 dark:text-green-400">${trip.serviceAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="space-y-1 text-sm mb-3">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <MapPin size={14} className="text-primary-500" /> {trip.area?.name || '—'}
          {trip.park && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><TreePine size={12} /> {trip.park.name}</span>}
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock size={14} /> <span className="font-mono">{trip.plannedEntry || '—'}</span> → <span className="font-mono">{trip.plannedExit || '—'}</span>
          {trip.actualEntry && (
            <span className="text-xs text-green-600 dark:text-green-400 ml-1">
              (Real: {new Date(trip.actualEntry).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              {trip.actualExit && ` → ${new Date(trip.actualExit).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Bus size={14} /> {truck ? (truck.unitNumber || truck.plate) : <span className="italic text-slate-400">Sin unidad</span>}
          {trip.executedTruck && trip.plannedTruck && trip.executedTruckId !== trip.plannedTruckId && (
            <span className="text-xs text-amber-500">(cambio)</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <UserCheck size={14} /> {driver ? driver.name : <span className="italic text-slate-400">Sin operador</span>}
          {trip.executedDriver && trip.plannedDriver && trip.executedDriverId !== trip.plannedDriverId && (
            <span className="text-xs text-amber-500">(cambio)</span>
          )}
        </div>
        {trip.odometer != null && (
          <div className="text-xs text-slate-400">Odómetro: {trip.odometer.toLocaleString()} km</div>
        )}
        {trip.notes && <div className="text-xs text-slate-400 italic">{trip.notes}</div>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {trip.status === 'scheduled' && (
          <>
            <button onClick={onSwap} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
              <ArrowRightLeft size={12} /> Cambiar
            </button>
            <button onClick={onDispatch} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200">
              <Play size={12} /> Despachar
            </button>
            <button onClick={onCancel} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200">
              <XCircle size={12} /> Cancelar
            </button>
          </>
        )}
        {trip.status === 'dispatched' && (
          <>
            <button onClick={onSwap} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
              <ArrowRightLeft size={12} /> Cambiar
            </button>
            <button onClick={onComplete} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200">
              <CheckCircle2 size={12} /> Completar
            </button>
          </>
        )}
        {trip.status === 'completed' && trip.settled && (
          <span className="text-xs text-slate-400">Liquidado</span>
        )}
      </div>
    </div>
  );
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// ============ Main Page ============
export default function Operations() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [trips, setTrips] = useState<ScheduledTrip[]>([]);
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [swapTrip, setSwapTrip] = useState<ScheduledTrip | null>(null);
  const [specialModal, setSpecialModal] = useState(false);
  const [dispatchModal, setDispatchModal] = useState<{ trip: ScheduledTrip; action: 'dispatch' | 'complete' } | null>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    // Simulation of network delay para realismo
    await new Promise(r => setTimeout(r, 500));
    
    setTemplates(MOCK_TEMPLATES);
    setAreas(MOCK_AREAS); 
    setParks(MOCK_PARKS); 
    setTrucks(MOCK_TRUCKS); 
    setDrivers(MOCK_DRIVERS);

    // En modo Demo usamos los Mocks directamente
    const t = MOCK_TRIPS.filter(tr => tr.date === date);
    setTrips(t);

    // Auto-expand turno groups
    const turnoKeys = new Set<string>();
    for (const trip of t) {
      const turno = (trip as any).routeTemplate?.turno || '1';
      turnoKeys.add(`turno:${turno}`);
    }
    if (t.some(tr => tr.isSpecial)) turnoKeys.add('turno:__special__');
    setExpanded(turnoKeys);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (trip: ScheduledTrip) => {
    if (!confirm('¿Cancelar este viaje?')) return;
    setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: 'cancelled' } : t));
  };

  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  // Current date info
  const dateObj = new Date(date + 'T12:00:00');
  const jsDay = dateObj.getDay();
  const dayName = DAY_NAMES[jsDay];
  const isToday = date === todayStr;
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // Which ISO day for the selected date
  const isoDay = jsDay === 0 ? 7 : jsDay;

  // Templates that apply to this day
  const todayTemplates = templates.filter(t => {
    if (!t.active) return false;
    const days = (t.workDays || '1,2,3,4,5').split(',').map(Number);
    return days.includes(isoDay);
  });

  // Stats
  const scheduled = trips.filter(t => t.status === 'scheduled').length;
  const dispatched = trips.filter(t => t.status === 'dispatched').length;
  const completed = trips.filter(t => t.status === 'completed').length;
  const total = trips.length;

  // Group trips by turno
  const turnoGroups = useMemo(() => {
    const map = new Map<string, { label: string; trips: ScheduledTrip[] }>();
    for (const trip of trips) {
      if (trip.isSpecial) {
        if (!map.has('__special__')) map.set('__special__', { label: 'Especiales', trips: [] });
        map.get('__special__')!.trips.push(trip);
        continue;
      }
      const turno = (trip as any).routeTemplate?.turno || '1';
      if (!map.has(turno)) map.set(turno, { label: `Turno ${turno}`, trips: [] });
      map.get(turno)!.trips.push(trip);
    }
    return Array.from(map.entries())
      .sort((a, b) => {
        if (a[0] === '__special__') return 1;
        if (b[0] === '__special__') return -1;
        return a[0].localeCompare(b[0], undefined, { numeric: true });
      });
  }, [trips]);

  return (
    <div className="space-y-6">
      {/* Header with live info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Despacho</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {dayName} {dateObj.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {isToday && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                {timeStr}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {todayTemplates.length} plantilla{todayTemplates.length !== 1 ? 's' : ''} activa{todayTemplates.length !== 1 ? 's' : ''} para {dayName.toLowerCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
          <button onClick={() => setSpecialModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm">
            <Plus size={16} /> Especial
          </button>
          <button onClick={load} className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'text-slate-700 dark:text-slate-200', bg: 'bg-white dark:bg-slate-800' },
          { label: 'Programados', value: scheduled, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: 'Despachados', value: dispatched, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
          { label: 'Completados', value: completed, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trip groups by turno */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando viajes de {dayName.toLowerCase()}...</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Sin viajes para {dayName.toLowerCase()}</p>
          <p className="text-sm text-slate-400">No hay plantillas activas que corran este día</p>
        </div>
      ) : (
        <div className="space-y-3">
          {turnoGroups.map(([key, { label, trips: grpTrips }]) => {
            const tKey = `turno:${key}`;
            const isOpen = expanded.has(tKey);
            const grpScheduled = grpTrips.filter(t => t.status === 'scheduled').length;
            const grpDispatched = grpTrips.filter(t => t.status === 'dispatched').length;
            const grpCompleted = grpTrips.filter(t => t.status === 'completed').length;

            return (
              <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button onClick={() => toggle(tKey)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">{label}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{grpTrips.length} viaje{grpTrips.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {grpScheduled > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{grpScheduled} prog.</span>}
                    {grpDispatched > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{grpDispatched} desp.</span>}
                    {grpCompleted > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{grpCompleted} comp.</span>}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
                      {grpTrips.map(trip => (
                        <TripCard
                          key={trip.id}
                          trip={trip}
                          onSwap={() => setSwapTrip(trip)}
                          onDispatch={() => setDispatchModal({ trip, action: 'dispatch' })}
                          onComplete={() => setDispatchModal({ trip, action: 'complete' })}
                          onCancel={() => handleCancel(trip)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {swapTrip && (
        <SwapModal trip={swapTrip} trucks={trucks} drivers={drivers}
          onClose={() => setSwapTrip(null)}
          onSaved={(data) => {
            setTrips(prev => prev.map(t => t.id === swapTrip.id ? { 
              ...t, 
              truckId: data.truckId, 
              driverId: data.driverId,
              truck: MOCK_TRUCKS.find(m => m.id === data.truckId),
              driver: MOCK_DRIVERS.find(m => m.id === data.driverId)
            } : t));
            setSwapTrip(null);
          }} />
      )}
      {specialModal && (
        <SpecialTripModal areas={areas} parks={parks} trucks={trucks} drivers={drivers} date={date}
          onClose={() => setSpecialModal(false)}
          onSaved={() => {
            // En demo solo cerramos el modal, para no complicar el estado local por ahora
            alert('Viaje especial creado (Simulación Demo)');
            setSpecialModal(false);
          }} />
      )}
      {dispatchModal && (
        <DispatchModal trip={dispatchModal.trip} action={dispatchModal.action}
          onClose={() => setDispatchModal(null)}
          onDone={() => {
            setTrips(prev => prev.map(t => t.id === dispatchModal.trip.id ? { 
              ...t, 
              status: dispatchModal.action === 'dispatch' ? 'dispatched' : 'completed' 
            } : t));
            setDispatchModal(null);
          }} />
      )}
    </div>
  );
}
