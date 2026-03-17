import React, { useEffect, useState } from 'react';
import { AdvancedTable } from '../components/common/AdvancedTable';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { ImageUpload } from '../components/common/ImageUpload';
import { Plus, Edit, Trash2, Truck, AlertTriangle, X, Shield, Calendar, Hash, Car } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import type { Truck as TruckType } from '../lib/api';

// ---- Detail View Modal (read-only) ----
function TruckDetailModal({ truck, onClose, onEdit }: { truck: TruckType; onClose: () => void; onEdit: () => void }) {
  const insuranceDays = truck.insuranceExpiry
    ? Math.floor((new Date(truck.insuranceExpiry).getTime() - Date.now()) / 86400000)
    : null;
  const insuranceStatus = insuranceDays === null ? null : insuranceDays < 0 ? 'expired' : insuranceDays <= 30 ? 'warning' : 'ok';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header with photo */}
        <div className="relative">
          {truck.photoUrl ? (
            <div className="relative h-56 w-full bg-slate-900">
              <img src={truck.photoUrl} alt={truck.plate} className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 z-10">
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-xl font-bold">{truck.unitNumber || truck.plate}</h2>
                <p className="text-white/80 text-sm">{truck.make ?? ''} {truck.model} {truck.year ? `· ${truck.year}` : ''}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-6 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <Truck size={32} className="text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{truck.unitNumber || truck.plate}</h2>
                  <p className="text-white/80 text-sm">{truck.make ?? ''} {truck.model} {truck.year ? `· ${truck.year}` : ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body info */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {truck.unitNumber && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><Hash size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">No. Unidad</p>
                  <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{truck.unitNumber}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><Car size={16} /></div>
              <div>
                <p className="text-xs text-slate-400">Placas</p>
                <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{truck.plate}</p>
              </div>
            </div>
            {truck.make && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><Truck size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">Marca / Modelo</p>
                  <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{truck.make} {truck.model}</p>
                </div>
              </div>
            )}
            {truck.year && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><Calendar size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">Año</p>
                  <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{truck.year}</p>
                </div>
              </div>
            )}
            {truck.insuranceExpiry && (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  insuranceStatus === 'expired' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                  insuranceStatus === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
                  'bg-green-100 dark:bg-green-900/30 text-green-500'
                }`}><Shield size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">Vigencia del Seguro</p>
                  <p className={`text-sm font-medium ${
                    insuranceStatus === 'expired' ? 'text-red-500' :
                    insuranceStatus === 'warning' ? 'text-amber-500' :
                    'text-enterprise-text-light dark:text-enterprise-text-dark'
                  }`}>
                    {new Date(truck.insuranceExpiry).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {insuranceStatus === 'expired' && ' (VENCIDO)'}
                    {insuranceStatus === 'warning' && ` (${insuranceDays} días)`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={onEdit}><Edit size={15} className="mr-1.5" /> Editar</Button>
        </div>
      </div>
    </div>
  );
}

// ---- Add/Edit Truck Modal ----
function TruckModal({
  truck,
  onSave,
  onClose,
}: {
  truck?: TruckType;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    unitNumber: truck?.unitNumber ?? '',
    plate: truck?.plate ?? '',
    make: truck?.make ?? '',
    model: truck?.model ?? '',
    year: truck?.year ? String(truck.year) : '',
    photoUrl: truck?.photoUrl ?? '',
    insuranceExpiry: truck?.insuranceExpiry ? truck.insuranceExpiry.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        unitNumber: form.unitNumber || undefined,
        plate: form.plate,
        make: form.make || undefined,
        model: form.model,
        year: form.year ? parseInt(form.year) : undefined,
        photoUrl: form.photoUrl || undefined,
        insuranceExpiry: form.insuranceExpiry || undefined,
      };
      if (truck) {
        await api.trucks.update(truck.id, payload);
      } else {
        await api.trucks.create(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4 text-enterprise-text-light dark:text-enterprise-text-dark">
          {truck ? 'Editar Unidad' : 'Nueva Unidad'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="No. de Unidad"
                placeholder="Ej: U-102"
                value={form.unitNumber}
                onChange={e => set('unitNumber', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Placas *"
                placeholder="Ej: ABC-1234"
                value={form.plate}
                onChange={e => set('plate', e.target.value)}
                required
              />
            </div>
            <Input
              label="Marca"
              placeholder="Ej: Kenworth"
              value={form.make}
              onChange={e => set('make', e.target.value)}
            />
            <Input
              label="Modelo *"
              placeholder="Ej: T680"
              value={form.model}
              onChange={e => set('model', e.target.value)}
              required
            />
            <div className="col-span-2">
              <Input
                label="Año"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 2022"
                value={form.year}
                onChange={e => set('year', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <ImageUpload
                label="Foto de la unidad"
                value={form.photoUrl}
                onDataUrl={url => set('photoUrl', url ?? '')}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Vigencia del seguro"
                type="date"
                value={form.insuranceExpiry}
                onChange={e => set('insuranceExpiry', e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : truck ? 'Actualizar' : 'Crear Unidad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Fleet Page ----
const Fleet = () => {
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState<TruckType | undefined>(undefined);
  const [viewingTruck, setViewingTruck] = useState<TruckType | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.trucks.getAll();
      setTrucks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta unidad? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      await api.trucks.delete(id);
      setTrucks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditingTruck(undefined);
    load();
  };

  const columns = [
    {
      header: '',
      accessor: (item: TruckType) => item.photoUrl ? (
        <img src={item.photoUrl} alt={item.plate} className="w-10 h-10 rounded-lg object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <Truck size={18} className="text-slate-400" />
        </div>
      ),
    },
    { header: 'No. Unidad', accessor: (item: TruckType) => item.unitNumber ?? '—' },
    { header: 'Placas', accessor: 'plate' as const, sortable: true },
    {
      header: 'Marca / Modelo',
      accessor: (item: TruckType) => `${item.make ?? '—'} ${item.model}`.trim(),
      sortable: false,
    },
    { header: 'Año', accessor: (item: TruckType) => item.year ?? '—' },
    {
      header: 'Seguro',
      accessor: (item: TruckType) => {
        if (!item.insuranceExpiry) return <span className="text-xs text-slate-400">—</span>;
        const days = Math.floor((new Date(item.insuranceExpiry).getTime() - Date.now()) / 86400000);
        if (days < 0) return <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><AlertTriangle size={12}/> Vencido</span>;
        if (days <= 30) return <span className="flex items-center gap-1 text-xs font-semibold text-amber-500"><AlertTriangle size={12}/> {days}d</span>;
        return <span className="text-xs text-green-500">{new Date(item.insuranceExpiry).toLocaleDateString('es-MX')}</span>;
      },
    },
    {
      header: 'Estado',
      accessor: (_item: TruckType) => (
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-semibold',
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        )}>
          Disponible
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (item: TruckType) => (
        <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => { setEditingTruck(item); setShowModal(true); }}
          >
            <Edit size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            onClick={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  const insuranceExpired = trucks.filter(t => {
    if (!t.insuranceExpiry) return false;
    return new Date(t.insuranceExpiry).getTime() < Date.now();
  });
  const insuranceWarning = trucks.filter(t => {
    if (!t.insuranceExpiry) return false;
    const days = Math.floor((new Date(t.insuranceExpiry).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 30;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-text-light dark:text-enterprise-text-dark">
            Gestión de Flota
          </h1>
          <p className="text-sm text-slate-500">Administra tus unidades y su estado operativo</p>
        </div>
        <Button onClick={() => { setEditingTruck(undefined); setShowModal(true); }}>
          <Plus size={18} className="mr-2" />
          Nueva Unidad
        </Button>
      </div>

      {(insuranceExpired.length > 0 || insuranceWarning.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {insuranceExpired.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertTriangle size={16} />
              {insuranceExpired.length} unidad{insuranceExpired.length > 1 ? 'es' : ''} con seguro VENCIDO
              {' '}({insuranceExpired.map(t => t.unitNumber || t.plate).join(', ')})
            </div>
          )}
          {insuranceWarning.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm font-medium">
              <AlertTriangle size={16} />
              {insuranceWarning.length} seguro{insuranceWarning.length > 1 ? 's' : ''} por vencer en 30 días
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center py-8">
          <div className="flex justify-center mb-2">
            <Truck size={28} className="text-primary-500" />
          </div>
          <p className="text-4xl font-bold text-primary-500">{trucks.length}</p>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-2">Total Unidades</p>
        </Card>
        <Card className="text-center py-8">
          <p className="text-4xl font-bold text-green-500">{trucks.length}</p>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-2">Registradas</p>
        </Card>
        <Card className="text-center py-8">
          <p className="text-4xl font-bold text-blue-500">0</p>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-2">En Ruta</p>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <p className="text-sm text-slate-400 py-8 text-center">Cargando unidades...</p>
        </Card>
      ) : (
        <AdvancedTable
          data={trucks}
          columns={columns as any}
          searchPlaceholder="Buscar por placas, marca o modelo..."
          onRowClick={(truck: TruckType) => setViewingTruck(truck)}
        />
      )}

      {viewingTruck && (
        <TruckDetailModal
          truck={viewingTruck}
          onClose={() => setViewingTruck(undefined)}
          onEdit={() => {
            setEditingTruck(viewingTruck);
            setShowModal(true);
            setViewingTruck(undefined);
          }}
        />
      )}

      {showModal && (
        <TruckModal
          truck={editingTruck}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTruck(undefined); }}
        />
      )}
    </div>
  );
};

export default Fleet;

