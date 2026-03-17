import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Area, Park, ServiceCostRecord } from '../lib/api';
import { Plus, Trash2, DollarSign, History, X, Settings, MapPin, TreePine, Pencil } from 'lucide-react';

const INPUT = "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white";
const BTN_PRIMARY = "px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50";
const BTN_CANCEL = "px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300";
const SERVICE_TYPES = [
  { value: 'camion', label: 'Camión' },
  { value: 'suburban', label: 'Suburban' },
  { value: 'taxi', label: 'Taxi' },
];

// ============ Area Form Modal ============
function AreaModal({ area, onClose, onSaved }: {
  area?: Area; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(area?.name ?? '');
  const [description, setDescription] = useState(area?.description ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (area) await api.areas.update(area.id, { name, description });
      else await api.areas.create({ name, description });
      onSaved();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{area ? 'Editar' : 'Nueva'} Área</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)} required className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Descripción</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className={INPUT} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className={BTN_CANCEL}>Cancelar</button>
            <button type="submit" disabled={saving} className={BTN_PRIMARY}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Park Form Modal ============
function ParkModal({ park, areas, existingParks, onClose, onSaved }: {
  park?: { name: string; description: string; areaIds: string[] }; areas: Area[]; existingParks: Park[]; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(park?.name ?? '');
  const [description, setDescription] = useState(park?.description ?? '');
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set(park?.areaIds ?? []));
  const [saving, setSaving] = useState(false);

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAreas.size === 0) { alert('Selecciona al menos un área'); return; }
    setSaving(true);
    try {
      if (park) {
        // Editing: find which areas to add/remove
        const oldAreas = new Set(park.areaIds);
        const toAdd = [...selectedAreas].filter(id => !oldAreas.has(id));
        const toRemove = [...oldAreas].filter(id => !selectedAreas.has(id));

        // Remove parks for unchecked areas
        for (const areaId of toRemove) {
          const existing = existingParks.find(p => p.name === park.name && p.areaId === areaId);
          if (existing) await api.areas.deletePark(existing.id);
        }
        // Add parks for newly checked areas
        for (const areaId of toAdd) {
          await api.areas.createPark({ name, areaId, description });
        }
        // Update name/description on remaining
        const remaining = existingParks.filter(p => p.name === park.name && selectedAreas.has(p.areaId));
        for (const p of remaining) {
          if (p.name !== name || (p.description ?? '') !== description) {
            await api.areas.updatePark(p.id, { name, description });
          }
        }
      } else {
        // Creating new: one record per selected area
        for (const areaId of selectedAreas) {
          await api.areas.createPark({ name, areaId, description });
        }
      }
      onSaved();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{park ? 'Editar' : 'Nuevo'} Parque</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Bellavista, Rocafuerte" className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Descripción</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Áreas donde aplica *</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-3">
              {areas.map(a => (
                <label key={a.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-1.5 -m-1.5 transition">
                  <input type="checkbox" checked={selectedAreas.has(a.id)} onChange={() => toggleArea(a.id)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                  <span className="text-sm text-slate-900 dark:text-white">{a.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedAreas.size} área(s) seleccionada(s)</p>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className={BTN_CANCEL}>Cancelar</button>
            <button type="submit" disabled={saving || selectedAreas.size === 0} className={BTN_PRIMARY}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Add Cost Modal ============
function AddCostModal({ areas, parks, onClose, onSaved }: {
  areas: Area[]; parks: Park[]; onClose: () => void; onSaved: () => void;
}) {
  const [areaId, setAreaId] = useState('');
  const [parkId, setParkId] = useState('');
  const [serviceType, setServiceType] = useState('camion');
  const [amount, setAmount] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const filteredParks = parks.filter(p => p.areaId === areaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.areas.addCost({
        areaId,
        parkId: parkId || undefined,
        serviceType,
        amount: parseFloat(amount),
        effectiveFrom: new Date(effectiveFrom + 'T00:00:00').toISOString(),
      });
      onSaved();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuevo Costo</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Área *</label>
            <select value={areaId} onChange={e => { setAreaId(e.target.value); setParkId(''); }} required className={INPUT}>
              <option value="">Seleccionar área...</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Parque</label>
            <select value={parkId} onChange={e => setParkId(e.target.value)} className={INPUT} disabled={!areaId}>
              <option value="">General (toda el área)</option>
              {filteredParks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tipo de Servicio</label>
            <div className="flex gap-2">
              {SERVICE_TYPES.map(st => (
                <button key={st.value} type="button" onClick={() => setServiceType(st.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    serviceType === st.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Monto *</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Vigente desde</label>
            <input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} className={INPUT} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className={BTN_CANCEL}>Cancelar</button>
            <button type="submit" disabled={saving || !areaId || !amount} className={BTN_PRIMARY}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Cost History Modal ============
function CostHistoryModal({ areaId, parkId, serviceType, areas, parks, onClose }: {
  areaId: string; parkId?: string; serviceType: string;
  areas: Area[]; parks: Park[];
  onClose: () => void;
}) {
  const [costs, setCosts] = useState<ServiceCostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const area = areas.find(a => a.id === areaId);
  const park = parkId ? parks.find(p => p.id === parkId) : null;
  const title = `${area?.name ?? ''}${park ? ' / ' + park.name : ''} / ${SERVICE_TYPES.find(s => s.value === serviceType)?.label ?? serviceType}`;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await api.areas.getAllCosts();
        const filtered = all.filter(c =>
          c.areaId === areaId &&
          c.serviceType === serviceType &&
          (parkId ? c.parkId === parkId : !c.parkId)
        ).sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
        setCosts(filtered);
      } catch { setCosts([]); }
      setLoading(false);
    };
    load();
  }, [areaId, parkId, serviceType]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historial — {title}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Cargando...</div>
        ) : costs.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Sin costos registrados</p>
        ) : (
          <div className="space-y-2">
            {costs.map((c, i) => (
              <div key={c.id} className={`flex justify-between items-center p-3 rounded-lg ${i === 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                <div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">${c.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  {i === 0 && <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">Vigente</span>}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Desde {new Date(c.effectiveFrom).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Tab: Áreas ============
function AreasTab({ areas, loading, onRefresh }: { areas: Area[]; loading: boolean; onRefresh: () => void }) {
  const [showAreaModal, setShowAreaModal] = useState<Area | true | null>(null);

  const handleDelete = async (area: Area) => {
    if (!confirm(`¿Eliminar área "${area.name}"? Se borrarán también sus costos y parques asociados.`)) return;
    await api.areas.delete(area.id);
    onRefresh();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Maquiladoras y zonas de servicio</p>
        <button onClick={() => setShowAreaModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium text-sm">
          <Plus size={16} /> Nueva Área
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : areas.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No hay áreas registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {areas.map(area => (
            <div key={area.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{area.name}</h3>
                  {area.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{area.description}</p>}
                  <p className="text-xs text-slate-400 mt-2">{area.parks?.length ?? 0} parque(s)</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setShowAreaModal(area)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-500" title="Editar">
                    <Settings size={16} />
                  </button>
                  <button onClick={() => handleDelete(area)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAreaModal && (
        <AreaModal area={showAreaModal === true ? undefined : showAreaModal} onClose={() => setShowAreaModal(null)} onSaved={() => { setShowAreaModal(null); onRefresh(); }} />
      )}
    </>
  );
}

// ============ Tab: Parques ============
function ParksTab({ areas, parks, loading, onRefresh }: { areas: Area[]; parks: Park[]; loading: boolean; onRefresh: () => void }) {
  const [showParkModal, setShowParkModal] = useState<{ name: string; description: string; areaIds: string[] } | true | null>(null);

  const handleDeleteParkGroup = async (parkName: string) => {
    if (!confirm(`¿Eliminar parque "${parkName}" de todas las áreas?`)) return;
    const toDelete = parks.filter(p => p.name === parkName);
    for (const p of toDelete) await api.areas.deletePark(p.id);
    onRefresh();
  };

  const handleRemoveArea = async (parkId: string, parkName: string, areaName: string) => {
    if (!confirm(`¿Quitar "${parkName}" del área "${areaName}"?`)) return;
    await api.areas.deletePark(parkId);
    onRefresh();
  };

  // Group parks by unique name
  const parkGroups = (() => {
    const map = new Map<string, Park[]>();
    for (const p of parks) {
      if (!map.has(p.name)) map.set(p.name, []);
      map.get(p.name)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  })();

  const handleEdit = (parkName: string) => {
    const group = parks.filter(p => p.name === parkName);
    setShowParkModal({
      name: parkName,
      description: group[0]?.description ?? '',
      areaIds: group.map(p => p.areaId),
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Registra parques y asígnalos a las áreas donde aplican</p>
        <button onClick={() => setShowParkModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium text-sm">
          <Plus size={16} /> Nuevo Parque
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : parkGroups.length === 0 ? (
        <div className="text-center py-12">
          <TreePine size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No hay parques registrados</p>
          <p className="text-sm text-slate-400">Primero crea áreas, luego agrega parques</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {parkGroups.map(([parkName, group]) => (
            <div key={parkName} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{parkName}</h3>
                  {group[0]?.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{group[0].description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(parkName)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-500" title="Editar">
                    <Settings size={16} />
                  </button>
                  <button onClick={() => handleDeleteParkGroup(parkName)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500" title="Eliminar todo">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-2">Áreas asignadas</p>
                <div className="flex flex-wrap gap-2">
                  {group.map(p => {
                    const areaName = areas.find(a => a.id === p.areaId)?.name ?? 'Desconocida';
                    return (
                      <span key={p.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                        <MapPin size={12} /> {areaName}
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveArea(p.id, parkName, areaName); }}
                          className="ml-0.5 hover:text-red-500 transition" title={`Quitar de ${areaName}`}>
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showParkModal && (
        <ParkModal
          park={showParkModal === true ? undefined : showParkModal}
          areas={areas} existingParks={parks}
          onClose={() => setShowParkModal(null)}
          onSaved={() => { setShowParkModal(null); onRefresh(); }}
        />
      )}
    </>
  );
}

// ============ Edit Cost Modal ============
function EditCostModal({ cost, areas, parks, onClose, onSaved }: {
  cost: ServiceCostRecord; areas: Area[]; parks: Park[]; onClose: () => void; onSaved: () => void;
}) {
  const [amount, setAmount] = useState(cost.amount.toString());
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const areaName = cost.area?.name ?? areas.find(a => a.id === cost.areaId)?.name ?? '';
  const parkName = cost.parkId ? (cost.park?.name ?? parks.find(p => p.id === cost.parkId)?.name ?? '') : 'General';
  const typeLabel = SERVICE_TYPES.find(s => s.value === cost.serviceType)?.label ?? cost.serviceType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.areas.addCost({
        areaId: cost.areaId,
        parkId: cost.parkId || undefined,
        serviceType: cost.serviceType,
        amount: parseFloat(amount),
        effectiveFrom: new Date(effectiveFrom + 'T00:00:00').toISOString(),
      });
      onSaved();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Actualizar Costo</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Área</span>
            <span className="font-medium text-slate-900 dark:text-white">{areaName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Parque</span>
            <span className="font-medium text-slate-900 dark:text-white">{parkName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Tipo</span>
            <span className="font-medium text-slate-900 dark:text-white">{typeLabel}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-600 pt-1 mt-1">
            <span className="text-slate-500 dark:text-slate-400">Costo actual</span>
            <span className="font-bold text-slate-900 dark:text-white">${cost.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nuevo monto *</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Vigente desde</label>
            <input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} className={INPUT} />
          </div>
          <p className="text-xs text-slate-400">El costo anterior se conservará en el historial como referencia.</p>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className={BTN_CANCEL}>Cancelar</button>
            <button type="submit" disabled={saving || !amount} className={BTN_PRIMARY}>{saving ? 'Guardando...' : 'Actualizar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Tab: Costos ============
function CostsTab({ areas, parks, costs, loading, onRefresh }: {
  areas: Area[]; parks: Park[]; costs: ServiceCostRecord[]; loading: boolean; onRefresh: () => void;
}) {
  const [showAddCost, setShowAddCost] = useState(false);
  const [showEditCost, setShowEditCost] = useState<ServiceCostRecord | null>(null);
  const [showHistory, setShowHistory] = useState<{ areaId: string; parkId?: string; serviceType: string } | null>(null);
  const [filterArea, setFilterArea] = useState('');
  const [filterType, setFilterType] = useState('');

  // Group costs to get latest per combination (areaId + parkId + serviceType)
  const latestCosts = (() => {
    const map = new Map<string, ServiceCostRecord>();
    const sorted = [...costs].sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
    for (const c of sorted) {
      const key = `${c.areaId}|${c.parkId || ''}|${c.serviceType}`;
      if (!map.has(key)) map.set(key, c);
    }
    return Array.from(map.values());
  })();

  const filtered = latestCosts.filter(c => {
    if (filterArea && c.areaId !== filterArea) return false;
    if (filterType && c.serviceType !== filterType) return false;
    return true;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
            <option value="">Todos los tipos</option>
            {SERVICE_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
          </select>
        </div>
        <button onClick={() => setShowAddCost(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium text-sm">
          <Plus size={16} /> Nuevo Costo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No hay costos registrados</p>
          <p className="text-sm text-slate-400">Agrega costos por área, parque y tipo de servicio</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Área</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Parque</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Tipo</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Costo Vigente</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Desde</th>
                <th className="text-center py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const areaName = c.area?.name ?? areas.find(a => a.id === c.areaId)?.name ?? '—';
                const parkName = c.parkId ? (c.park?.name ?? parks.find(p => p.id === c.parkId)?.name ?? '—') : 'General';
                const typeLabel = SERVICE_TYPES.find(s => s.value === c.serviceType)?.label ?? c.serviceType;
                const typeBg = c.serviceType === 'camion' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : c.serviceType === 'suburban' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';

                return (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{areaName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{parkName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeBg}`}>{typeLabel}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600 dark:text-green-400 text-base">
                      ${c.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">
                      {new Date(c.effectiveFrom).toLocaleDateString('es-MX')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setShowEditCost(c)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-500" title="Actualizar costo">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setShowHistory({ areaId: c.areaId, parkId: c.parkId || undefined, serviceType: c.serviceType })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-500" title="Historial">
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddCost && (
        <AddCostModal areas={areas} parks={parks} onClose={() => setShowAddCost(false)} onSaved={() => { setShowAddCost(false); onRefresh(); }} />
      )}
      {showEditCost && (
        <EditCostModal cost={showEditCost} areas={areas} parks={parks} onClose={() => setShowEditCost(null)} onSaved={() => { setShowEditCost(null); onRefresh(); }} />
      )}
      {showHistory && (
        <CostHistoryModal
          areaId={showHistory.areaId} parkId={showHistory.parkId} serviceType={showHistory.serviceType}
          areas={areas} parks={parks}
          onClose={() => setShowHistory(null)}
        />
      )}
    </>
  );
}

// ============ Main Page ============
const TABS = [
  { id: 'areas', label: 'Áreas', icon: MapPin },
  { id: 'parks', label: 'Parques', icon: TreePine },
  { id: 'costs', label: 'Costos', icon: DollarSign },
] as const;

export default function OperationsConfig() {
  const [tab, setTab] = useState<string>('areas');
  const [areas, setAreas] = useState<Area[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [costs, setCosts] = useState<ServiceCostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [a, p, c] = await Promise.all([
        api.areas.getAll().catch(() => [] as Area[]),
        api.areas.getParks().catch(() => [] as Park[]),
        api.areas.getAllCosts().catch(() => [] as ServiceCostRecord[]),
      ]);
      setAreas(a);
      setParks(p);
      setCosts(c);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configuraciones de Viajes</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Áreas, parques industriales y costos de servicio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'areas' && <AreasTab areas={areas} loading={loading} onRefresh={loadData} />}
      {tab === 'parks' && <ParksTab areas={areas} parks={parks} loading={loading} onRefresh={loadData} />}
      {tab === 'costs' && <CostsTab areas={areas} parks={parks} costs={costs} loading={loading} onRefresh={loadData} />}
    </div>
  );
}
