import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import type { RouteTemplate, Area, Park, Truck, Driver } from '../lib/api';
import { Plus, Trash2, Edit2, Clock, X, MapPin, TreePine, RotateCcw, ArrowRight, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

const INPUT = "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white";

const TRIP_TYPES = [
  { value: 'round', label: 'Redondo', icon: RotateCcw },
  { value: 'entry_only', label: 'Solo Entrada', icon: ArrowRight },
  { value: 'exit_only', label: 'Solo Salida', icon: ArrowLeft },
];

const DAY_LABELS = [
  { value: '1', short: 'L', label: 'Lunes' },
  { value: '2', short: 'M', label: 'Martes' },
  { value: '3', short: 'Mi', label: 'Miércoles' },
  { value: '4', short: 'J', label: 'Jueves' },
  { value: '5', short: 'V', label: 'Viernes' },
  { value: '6', short: 'S', label: 'Sábado' },
  { value: '7', short: 'D', label: 'Domingo' },
];

const TRIP_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  round: { label: 'Redondo', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  entry_only: { label: 'Entrada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  exit_only: { label: 'Salida', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

function TemplateModal({ template, areas, parks, trucks, drivers, allTemplates, onClose, onSaved }: {
  template?: RouteTemplate; areas: Area[]; parks: Park[]; trucks: Truck[]; drivers: Driver[];
  allTemplates: RouteTemplate[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: template?.name ?? '',
    areaId: template?.areaId ?? '',
    parkId: template?.parkId ?? '',
    turno: template?.turno ?? '1',
    entryTime: template?.entryTime ?? '06:40',
    exitTime: template?.exitTime ?? '14:40',
    truckId: template?.truckId ?? '',
    driverId: template?.driverId ?? '',
    tripType: template?.tripType ?? 'round',
    workDays: template?.workDays ?? '1,2,3,4,5',
  });
  const [saving, setSaving] = useState(false);

  // Filter parks by selected area
  const filteredParks = parks.filter(p => p.areaId === form.areaId);

  // Work days as Set for toggle
  const selectedDays = new Set(form.workDays.split(',').filter(Boolean));

  const toggleDay = (day: string) => {
    const next = new Set(selectedDays);
    if (next.has(day)) next.delete(day); else next.add(day);
    const sorted = Array.from(next).sort((a, b) => +a - +b);
    set('workDays', sorted.join(','));
  };

  // Auto-assign driver when truck changes
  const handleTruckChange = (truckId: string) => {
    set('truckId', truckId);
    if (!truckId) return;
    // Find existing template with this truck that has a driver assigned
    const match = allTemplates.find(t => t.truckId === truckId && t.driverId && t.id !== template?.id);
    if (match) set('driverId', match.driverId!);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        truckId: form.truckId || undefined,
        driverId: form.driverId || undefined,
        parkId: form.parkId || undefined,
      };
      if (template) await api.routeTemplates.update(template.id, data);
      else await api.routeTemplates.create(data as any);
      onSaved();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{template ? 'Editar' : 'Nueva'} Plantilla de Ruta</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nombre *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej: Turno Matutino Foxconn"
              className={INPUT} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Área *</label>
              <select value={form.areaId} onChange={e => { set('areaId', e.target.value); set('parkId', ''); }} required className={INPUT}>
                <option value="">Seleccionar...</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Parque</label>
              <select value={form.parkId} onChange={e => set('parkId', e.target.value)} className={INPUT} disabled={!form.areaId}>
                <option value="">Sin parque</option>
                {filteredParks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Turno */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Turno *</label>
            <input value={form.turno} onChange={e => set('turno', e.target.value)} required placeholder="Ej: 1, 2, A, B, C, D"
              className={INPUT} />
          </div>

          {/* Trip Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Tipo de Viaje</label>
            <div className="flex gap-2">
              {TRIP_TYPES.map(tt => (
                <button key={tt.value} type="button" onClick={() => set('tripType', tt.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                    form.tripType === tt.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}>
                  <tt.icon size={16} /> {tt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work Days */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Días de Trabajo</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map(d => (
                <button key={d.value} type="button" onClick={() => toggleDay(d.value)} title={d.label}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                    selectedDays.has(d.value)
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}>
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hora Entrada *</label>
              <input type="time" value={form.entryTime} onChange={e => set('entryTime', e.target.value)} required className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hora Salida *</label>
              <input type="time" value={form.exitTime} onChange={e => set('exitTime', e.target.value)} required className={INPUT} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Unidad por defecto</label>
            <select value={form.truckId} onChange={e => handleTruckChange(e.target.value)} className={INPUT}>
              <option value="">Sin asignar</option>
              {trucks.map(t => <option key={t.id} value={t.id}>{t.unitNumber || t.plate} — {t.make} {t.model}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Operador por defecto</label>
            <select value={form.driverId} onChange={e => set('driverId', e.target.value)} className={INPUT}>
              <option value="">Sin asignar</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- 3D Route Detail Carousel ---------- */
function RouteDetailCarousel({ route, routes, areas, parks, onClose, onEdit, onDelete, onToggle }: {
  route: RouteTemplate; routes: RouteTemplate[]; areas: Area[]; parks: Park[];
  onClose: () => void; onEdit: (r: RouteTemplate) => void;
  onDelete: (r: RouteTemplate) => void; onToggle: (r: RouteTemplate) => void;
}) {
  const [idx, setIdx] = useState(() => Math.max(0, routes.findIndex(r => r.id === route.id)));
  const [dir, setDir] = useState<'left' | 'right' | null>(null);
  const cur = routes[idx] || route;

  const go = (i: number) => {
    setDir(i > idx ? 'left' : 'right');
    setIdx(i);
    setTimeout(() => setDir(null), 350);
  };
  const prev = () => { if (idx > 0) go(idx - 1); };
  const next = () => { if (idx < routes.length - 1) go(idx + 1); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const badge = TRIP_TYPE_BADGE[cur.tripType || 'round'] ?? TRIP_TYPE_BADGE.round;
  const days = (cur.workDays || '1,2,3,4,5').split(',');
  const areaName = cur.area?.name ?? areas.find(a => a.id === cur.areaId)?.name ?? '—';
  const parkName = cur.park?.name ?? parks.find(p => p.id === cur.parkId)?.name ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        {/* 3D container */}
        <div style={{ perspective: '1200px' }}>
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              transform: dir === 'left' ? 'rotateY(-5deg) scale(0.97)' : dir === 'right' ? 'rotateY(5deg) scale(0.97)' : 'rotateY(0)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{cur.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">{badge.label}</span>
                    {cur.turno && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">Turno {cur.turno}</span>}
                    <span className="text-primary-100 text-sm">{areaName}{parkName ? ` · ${parkName}` : ''}</span>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white transition"><X size={22} /></button>
              </div>
              {routes.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {routes.map((_, i) => (
                    <button key={i} onClick={() => go(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-6' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Schedule + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Clock size={22} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">Horario</p>
                    <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{cur.entryTime} → {cur.exitTime}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cur.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {cur.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Turno</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{cur.turno || '—'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Unidad</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {cur.truck ? (cur.truck.unitNumber || cur.truck.plate) : <span className="text-slate-400 italic">Sin asignar</span>}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Operador</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {cur.driver ? cur.driver.name : <span className="text-slate-400 italic">Sin asignar</span>}
                  </p>
                </div>
              </div>

              {/* Work Days */}
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium mb-2">Días de Operación</p>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map(d => (
                    <span key={d.value}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold ${
                        days.includes(d.value) ? 'bg-primary-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600'
                      }`}>
                      {d.short}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => onEdit(cur)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-medium">
                  <Edit2 size={16} /> Editar
                </button>
                <button onClick={() => onToggle(cur)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition ${
                    cur.active
                      ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200'
                      : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200'
                  }`}>
                  {cur.active ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => onDelete(cur)}
                  className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Nav arrows */}
        {routes.length > 1 && (
          <>
            <button onClick={prev} disabled={idx === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ArrowLeft size={20} />
            </button>
            <button onClick={next} disabled={idx === routes.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ArrowRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function RouteTemplates() {
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<RouteTemplate | true | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<{ route: RouteTemplate; siblings: RouteTemplate[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [t, a, p, tr, dr] = await Promise.all([
      api.routeTemplates.getAll().catch(() => [] as RouteTemplate[]),
      api.areas.getAll().catch(() => [] as Area[]),
      api.areas.getParks().catch(() => [] as Park[]),
      api.trucks.getAll().catch(() => [] as Truck[]),
      api.drivers.getAll().catch(() => [] as Driver[]),
    ]);
    setTemplates(t); setAreas(a); setParks(p); setTrucks(tr); setDrivers(dr);
    // Auto-expand parks on first load
    const parkKeys = new Set(t.map(tpl => `p:${tpl.parkId || '__none__'}`));
    setExpanded(parkKeys);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (t: RouteTemplate) => {
    if (!confirm(`¿Eliminar plantilla "${t.name}"?`)) return;
    await api.routeTemplates.delete(t.id);
    setDetail(null);
    load();
  };

  const handleToggle = async (t: RouteTemplate) => {
    await api.routeTemplates.update(t.id, { active: !t.active });
    setDetail(null);
    load();
  };

  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  // ---------- Build hierarchy: Park → Area → Turno → Routes ----------
  const hierarchy = useMemo(() => {
    const pMap = new Map<string, { park: Park | null; aMap: Map<string, { area: Area | null; tMap: Map<string, RouteTemplate[]> }> }>();
    for (const tpl of templates) {
      const pk = tpl.parkId || '__none__';
      if (!pMap.has(pk)) pMap.set(pk, { park: tpl.parkId ? parks.find(p => p.id === tpl.parkId) ?? null : null, aMap: new Map() });
      const pe = pMap.get(pk)!;
      const ak = tpl.areaId || '__none__';
      if (!pe.aMap.has(ak)) pe.aMap.set(ak, { area: tpl.areaId ? areas.find(a => a.id === tpl.areaId) ?? null : null, tMap: new Map() });
      const ae = pe.aMap.get(ak)!;
      const tk = tpl.turno || '1';
      if (!ae.tMap.has(tk)) ae.tMap.set(tk, []);
      ae.tMap.get(tk)!.push(tpl);
    }
    return Array.from(pMap.entries())
      .sort((a, b) => a[0] === '__none__' ? 1 : b[0] === '__none__' ? -1 : (a[1].park?.name ?? '').localeCompare(b[1].park?.name ?? ''))
      .map(([pk, { park, aMap }]) => ({
        key: pk, park,
        areas: Array.from(aMap.entries())
          .sort((a, b) => (a[1].area?.name ?? '').localeCompare(b[1].area?.name ?? ''))
          .map(([ak, { area, tMap }]) => ({
            key: ak, area,
            turnos: Array.from(tMap.entries())
              .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
              .map(([turno, routes]) => ({ turno, routes })),
          })),
      }));
  }, [templates, areas, parks]);

  const parkCount = (p: typeof hierarchy[number]) => p.areas.reduce((s, a) => s + a.turnos.reduce((s2, t) => s2 + t.routes.length, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Plantillas de Rutas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Turnos fijos con horario, unidad y operador por defecto</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium">
          <Plus size={18} /> Nueva Plantilla
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No hay plantillas de ruta</p>
          <p className="text-sm text-slate-400">Primero crea áreas y parques, luego agrega plantillas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hierarchy.map(pg => {
            const pKey = `p:${pg.key}`;
            const pOpen = expanded.has(pKey);
            const cnt = parkCount(pg);
            return (
              <div key={pg.key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Level 1 — Park */}
                <button onClick={() => toggle(pKey)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center gap-3">
                    {pOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    <TreePine size={18} className="text-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-white text-base">{pg.park ? pg.park.name : 'Sin Parque'}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                      {cnt} ruta{cnt !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>

                {pOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-700">
                    {pg.areas.map(ag => {
                      const aKey = `${pKey}|a:${ag.key}`;
                      const aOpen = expanded.has(aKey);
                      const aCnt = ag.turnos.reduce((s, t) => s + t.routes.length, 0);
                      return (
                        <div key={ag.key}>
                          {/* Level 2 — Area */}
                          <button onClick={() => toggle(aKey)}
                            className="w-full flex items-center gap-3 px-5 pl-10 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border-t border-slate-50 dark:border-slate-700/50">
                            {aOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                            <MapPin size={16} className="text-primary-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{ag.area?.name ?? 'Sin Área'}</span>
                            <span className="text-xs text-slate-400">{aCnt}</span>
                          </button>

                          {aOpen && (
                            <div>
                              {ag.turnos.map(tg => {
                                const tKey = `${aKey}|t:${tg.turno}`;
                                const tOpen = expanded.has(tKey);
                                return (
                                  <div key={tg.turno}>
                                    {/* Level 3 — Turno */}
                                    <button onClick={() => toggle(tKey)}
                                      className="w-full flex items-center gap-3 px-5 pl-16 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                      {tOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">Turno {tg.turno}</span>
                                      <span className="text-xs text-slate-400">{tg.routes.length} ruta{tg.routes.length !== 1 ? 's' : ''}</span>
                                    </button>

                                    {/* Level 4 — Route items */}
                                    {tOpen && (
                                      <div className="ml-20 mr-4 mb-2 space-y-1">
                                        {tg.routes.map(r => {
                                          const rDays = (r.workDays || '1,2,3,4,5').split(',');
                                          const rBadge = TRIP_TYPE_BADGE[r.tripType || 'round'] ?? TRIP_TYPE_BADGE.round;
                                          return (
                                            <div key={r.id}
                                              onClick={() => setDetail({ route: r, siblings: tg.routes })}
                                              className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition
                                                hover:bg-primary-50 dark:hover:bg-primary-900/10 border border-transparent hover:border-primary-200 dark:hover:border-primary-800
                                                ${!r.active ? 'opacity-50' : ''}`}>
                                              <div className="flex items-center gap-3 min-w-0">
                                                <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{r.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${rBadge.color}`}>{rBadge.label}</span>
                                                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 shrink-0">{r.entryTime} → {r.exitTime}</span>
                                              </div>
                                              <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{r.truck ? (r.truck.unitNumber || r.truck.plate) : '—'}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{r.driver ? r.driver.name : '—'}</span>
                                                <div className="flex gap-0.5">
                                                  {DAY_LABELS.map(d => (
                                                    <span key={d.value}
                                                      className={`w-4 h-4 flex items-center justify-center rounded text-[8px] font-bold ${
                                                        rDays.includes(d.value)
                                                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                                          : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600'
                                                      }`}>
                                                      {d.short}
                                                    </span>
                                                  ))}
                                                </div>
                                                <span className={`w-2 h-2 rounded-full ${r.active ? 'bg-green-500' : 'bg-red-400'}`} />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail carousel */}
      {detail && (
        <RouteDetailCarousel
          route={detail.route} routes={detail.siblings}
          areas={areas} parks={parks}
          onClose={() => setDetail(null)}
          onEdit={r => { setDetail(null); setShowModal(r); }}
          onDelete={r => handleDelete(r)}
          onToggle={r => handleToggle(r)}
        />
      )}

      {/* Edit / Create modal */}
      {showModal && (
        <TemplateModal
          template={showModal === true ? undefined : showModal}
          areas={areas} parks={parks} trucks={trucks} drivers={drivers}
          allTemplates={templates}
          onClose={() => setShowModal(null)}
          onSaved={() => { setShowModal(null); load(); }}
        />
      )}
    </div>
  );
}
