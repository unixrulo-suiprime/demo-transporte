import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ImageUpload } from '../components/common/ImageUpload';
import { api } from '../lib/api';
import type { Driver, Partner, Truck } from '../lib/api';
import { Users, Plus, Truck as TruckIcon, Percent, UserPlus, Edit, Trash2, Phone, FileText, AlertTriangle, CheckCircle, X, MapPin, UserCheck, Image as ImageIcon, Shield } from 'lucide-react';

// Configurable license type suggestions - adapt per client
const LICENSE_SUGGESTIONS = ['A', 'B', 'C', 'D', 'E', 'BI', 'BII', 'BIII', 'Chofer', 'Operador', 'Foraneo'];

function expiryStatus(expiry?: string): 'expired' | 'warning' | 'ok' | null {
  if (!expiry) return null;
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 30) return 'warning';
  return 'ok';
}

// ---- Detail View Modal (read-only) ----
function DriverDetailModal({ driver, onClose, onEdit }: { driver: Driver; onClose: () => void; onEdit: () => void }) {
  const status = expiryStatus(driver.licenseExpiry);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header with photo */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
          <div className="flex items-center gap-5">
            {driver.photoUrl ? (
              <img src={driver.photoUrl} alt={driver.name} className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-3xl border-4 border-white/30">
                {driver.name[0].toUpperCase()}
              </div>
            )}
            <div className="text-white">
              <h2 className="text-xl font-bold">{driver.name}</h2>
              {driver.licenseType && (
                <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                  <FileText size={14} /> Licencia tipo {driver.licenseType}
                </p>
              )}
              {status && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-2 px-2 py-0.5 rounded-full ${
                  status === 'expired' ? 'bg-red-500/30 text-red-100' :
                  status === 'warning' ? 'bg-amber-500/30 text-amber-100' :
                  'bg-green-500/30 text-green-100'
                }`}>
                  {status === 'expired' ? <><AlertTriangle size={11} /> LICENCIA VENCIDA</> :
                   status === 'warning' ? <><AlertTriangle size={11} /> Vence pronto</> :
                   <><CheckCircle size={11} /> Vigente</>}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body info */}
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driver.phone && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><Phone size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">Celular</p>
                  <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{driver.phone}</p>
                </div>
              </div>
            )}
            {driver.emergencyContact && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><UserCheck size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">Contacto de Emergencia</p>
                  <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{driver.emergencyContact}</p>
                </div>
              </div>
            )}
            {driver.address && (
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><MapPin size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">Dirección</p>
                  <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{driver.address}</p>
                </div>
              </div>
            )}
            {driver.licenseExpiry && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><FileText size={16} /></div>
                <div>
                  <p className="text-xs text-slate-400">Vencimiento de Licencia</p>
                  <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">
                    {new Date(driver.licenseExpiry).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* License photo */}
          {driver.licensePhotoUrl && (
            <div>
              <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><ImageIcon size={12} /> Foto de la licencia</p>
              <img src={driver.licensePhotoUrl} alt="Licencia" className="w-full max-h-56 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
            </div>
          )}
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

function DriverCard({ driver, onEdit, onDelete, onClick }: { driver: Driver; onEdit: () => void; onDelete: () => void; onClick: () => void }) {
  const status = expiryStatus(driver.licenseExpiry);
  return (
    <div
      className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors rounded-lg px-2 -mx-2"
      onClick={onClick}
    >
      <div className="shrink-0">
        {driver.photoUrl ? (
          <img src={driver.photoUrl} alt={driver.name} className="w-11 h-11 rounded-full object-cover border-2 border-primary-500/30" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-lg">
            {driver.name[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-enterprise-text-light dark:text-enterprise-text-dark truncate">{driver.name}</p>
        <div className="flex flex-wrap gap-3 mt-0.5 items-center">
          {driver.licenseType && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <FileText size={11} />
              Lic. {driver.licenseType}
              {driver.licenseExpiry && ` - vence ${new Date(driver.licenseExpiry).toLocaleDateString('es-MX')}`}
            </span>
          )}
          {status === 'expired' && (
            <span className="text-xs text-red-500 flex items-center gap-1 font-semibold">
              <AlertTriangle size={11} /> LICENCIA VENCIDA
            </span>
          )}
          {status === 'warning' && (
            <span className="text-xs text-amber-500 flex items-center gap-1 font-semibold">
              <AlertTriangle size={11} /> Vence pronto
            </span>
          )}
          {status === 'ok' && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle size={11} /> Vigente
            </span>
          )}
          {driver.phone && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Phone size={11} /> {driver.phone}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit}><Edit size={14} /></Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={onDelete}><Trash2 size={14} /></Button>
      </div>
    </div>
  );
}

function DriverForm({ driver, onSaved, onCancel }: { driver?: Driver; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: driver?.name ?? '',
    licenseType: driver?.licenseType ?? '',
    licenseExpiry: driver?.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
    address: driver?.address ?? '',
    phone: driver?.phone ?? '',
    emergencyContact: driver?.emergencyContact ?? '',
    photoUrl: driver?.photoUrl ?? '',
    licensePhotoUrl: driver?.licensePhotoUrl ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        licenseType: form.licenseType || undefined,
        licenseExpiry: form.licenseExpiry || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        emergencyContact: form.emergencyContact || undefined,
        photoUrl: form.photoUrl || undefined,
        licensePhotoUrl: form.licensePhotoUrl || undefined,
      };
      if (driver) {
        await api.drivers.update(driver.id, payload);
      } else {
        await api.drivers.create(payload);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSaving(false);
    }
  };

  return (
    <Card title={driver ? 'Editar Operador' : 'Nuevo Operador'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Nombre completo *" placeholder="Ej: Juan Perez Garcia" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Tipo / Categoria de licencia
            </label>
            <input
              list="license-suggestions"
              value={form.licenseType}
              onChange={e => set('licenseType', e.target.value)}
              placeholder="Ej: A, B, Chofer..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-enterprise-text-light dark:text-enterprise-text-dark focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <datalist id="license-suggestions">
              {LICENSE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
          <Input label="Vencimiento de licencia" type="date" value={form.licenseExpiry} onChange={e => set('licenseExpiry', e.target.value)} />
          <Input label="Celular" placeholder="55 1234 5678" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Input label="Contacto de emergencia" placeholder="Nombre y telefono" value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} />
          <div className="md:col-span-2">
            <Input label="Direccion" placeholder="Calle, colonia, ciudad" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <ImageUpload
            label="Foto del operador"
            value={form.photoUrl}
            onDataUrl={url => set('photoUrl', url ?? '')}
          />
          <ImageUpload
            label="Foto de la licencia"
            value={form.licensePhotoUrl}
            onDataUrl={url => set('licensePhotoUrl', url ?? '')}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : driver ? 'Actualizar' : 'Registrar Operador'}</Button>
        </div>
      </form>
    </Card>
  );
}

function PartnerCard({
  partner, trucks, allAssignedTruckIds, onAssignTruck, onRemoveTruck, onEdit, onDelete,
}: {
  partner: Partner; trucks: Truck[]; allAssignedTruckIds: Set<string>;
  onAssignTruck: (partnerId: string, truckId: string, pct: number) => Promise<void>;
  onRemoveTruck: (partnerId: string, truckId: string) => Promise<void>;
  onEdit: () => void; onDelete: () => void;
}) {
  const [showAssign, setShowAssign] = useState(false);
  const [selTruck, setSelTruck] = useState('');
  const [selPct, setSelPct] = useState('100');
  const [saving, setSaving] = useState(false);

  const assignedIds = new Set(partner.trucks?.map(pt => pt.truck.id));
  const available = trucks.filter(t => !assignedIds.has(t.id) && !allAssignedTruckIds.has(t.id));

  const handleAssign = async () => {
    if (!selTruck || !selPct) return;
    setSaving(true);
    await onAssignTruck(partner.id, selTruck, parseFloat(selPct));
    setSelTruck(''); setSelPct('100'); setShowAssign(false); setSaving(false);
  };

  return (
    <div className="border border-enterprise-border-light dark:border-enterprise-border-dark rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-enterprise-text-light dark:text-enterprise-text-dark">{partner.name}</p>
          {partner.razonSocial && <p className="text-xs text-slate-400 mt-0.5">{partner.razonSocial}</p>}
          {partner.phone && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={11}/>{partner.phone}</p>}
          <p className="text-xs text-slate-400 mt-1">{partner.trucks?.length ?? 0} unidades asignadas</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}><Edit size={13}/></Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={onDelete}><Trash2 size={13}/></Button>
        </div>
      </div>
      {partner.trucks && partner.trucks.length > 0 && (
        <div className="space-y-1">
          {partner.trucks.map((pt) => (
            <div key={pt.truck.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-1.5">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <TruckIcon size={12}/>
                {pt.truck.unitNumber ? `${pt.truck.unitNumber} - ` : ''}{pt.truck.plate}
              </span>
              <div className="flex items-center gap-2">
                {pt.percentage < 100 && (
                  <span className="font-semibold text-primary-500">{pt.percentage}%</span>
                )}
                <button onClick={() => onRemoveTruck(partner.id, pt.truck.id)} className="text-red-400 hover:text-red-600 ml-1">x</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAssign ? (
        <div className="space-y-2 pt-1">
          {available.length > 0 ? (
            <>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Unidad a asignar</label>
                  <select value={selTruck} onChange={e => setSelTruck(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs px-2 py-1.5">
                    <option value="">Seleccionar unidad...</option>
                    {available.map(t => <option key={t.id} value={t.id}>{t.unitNumber ? `${t.unitNumber} - ` : ''}{t.plate}{t.make ? ` (${t.make})` : ''}</option>)}
                  </select>
                </div>
                <div className="w-28">
                  <label className="block text-xs text-slate-500 mb-1">% propiedad</label>
                  <input type="number" min="1" max="100" value={selPct} onChange={e => setSelPct(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs px-2 py-1.5 text-center"/>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAssign} disabled={saving || !selTruck || !selPct}>Asignar</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAssign(false)}>Cancelar</Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-500">No hay unidades disponibles. Todas ya están asignadas a un socio. Registra nuevas unidades en Gestión de Flota.</p>
              <Button size="sm" variant="outline" onClick={() => setShowAssign(false)}>Cerrar</Button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setShowAssign(true)}
          className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 mt-1">
          <Plus size={12}/> Asignar unidad a este socio
        </button>
      )}
    </div>
  );
}

function PartnerForm({ partner, onSaved, onCancel }: { partner?: Partner; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: partner?.name ?? '',
    phone: partner?.phone ?? '',
    razonSocial: partner?.razonSocial ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name: form.name, phone: form.phone || undefined, razonSocial: form.razonSocial || undefined };
      if (partner) {
        await api.partners.update(partner.id, payload);
      } else {
        await api.partners.create(payload);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSaving(false);
    }
  };

  return (
    <Card title={partner ? 'Editar Socio' : 'Nuevo Socio'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Nombre del socio *" placeholder="Ej: Carlos Mendoza" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <Input label="Telefono / Celular" placeholder="55 1234 5678" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Input label="Razon Social" placeholder="Ej: Transportes Mendoza SA de CV" value={form.razonSocial} onChange={e => set('razonSocial', e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : partner ? 'Actualizar' : 'Crear Socio'}</Button>
        </div>
      </form>
    </Card>
  );
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drivers' | 'partners' | 'users'>('drivers');
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();
  const [viewingDriver, setViewingDriver] = useState<Driver | undefined>();
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>();
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [driversData, partnersData, trucksData] = await Promise.all([
        api.drivers.getAll(),
        api.partners.getAll(),
        api.trucks.getAll(),
      ]);
      setDrivers(driversData);
      setPartners(partnersData);
      setTrucks(trucksData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const expiredCount = drivers.filter(d => expiryStatus(d.licenseExpiry) === 'expired').length;
  const warningCount = drivers.filter(d => expiryStatus(d.licenseExpiry) === 'warning').length;

  // All truck IDs already assigned to any partner (prevent duplicate assignment)
  const allAssignedTruckIds = new Set(
    partners.flatMap(p => p.trucks?.map(pt => pt.truck.id) ?? [])
  );

  const deleteDriver = async (id: string) => {
    if (!confirm('Eliminar este operador?')) return;
    await api.drivers.delete(id);
    load();
  };

  const deletePartner = async (id: string) => {
    if (!confirm('Eliminar este socio y sus asignaciones de unidades?')) return;
    await api.partners.delete(id);
    load();
  };

  const assignTruck = async (partnerId: string, truckId: string, pct: number) => {
    await api.partners.assignTruck(partnerId, truckId, pct);
    load();
  };

  const removeTruck = async (partnerId: string, truckId: string) => {
    await api.partners.removeTruck(partnerId, truckId);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-text-light dark:text-enterprise-text-dark">Personal</h1>
          <p className="text-sm text-slate-500">Operadores, socios y usuarios del sistema</p>
        </div>
        {activeTab === 'drivers' && !showDriverForm && !editingDriver && (
          <Button onClick={() => setShowDriverForm(true)}>
            <UserPlus size={18} className="mr-2" /> Nuevo Operador
          </Button>
        )}
        {activeTab === 'partners' && !showPartnerForm && !editingPartner && (
          <Button onClick={() => setShowPartnerForm(true)}>
            <Plus size={18} className="mr-2" /> Nuevo Socio
          </Button>
        )}
      </div>

      {(expiredCount > 0 || warningCount > 0) && activeTab === 'drivers' && (
        <div className="flex flex-wrap gap-3">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertTriangle size={16} />
              {expiredCount} licencia{expiredCount > 1 ? 's' : ''} VENCIDA{expiredCount > 1 ? 'S' : ''}
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm font-medium">
              <AlertTriangle size={16} />
              {warningCount} licencia{warningCount > 1 ? 's' : ''} por vencer (30 dias)
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setActiveTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drivers' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <Users size={16} /> Operadores ({drivers.length})
        </button>
        <button onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'partners' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <Percent size={16} /> Socios ({partners.length})
        </button>
        <button onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <Shield size={16} /> Usuarios
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      {activeTab === 'drivers' && (
        <>
          {(showDriverForm || editingDriver) && (
            <DriverForm
              driver={editingDriver}
              onSaved={() => { setShowDriverForm(false); setEditingDriver(undefined); load(); }}
              onCancel={() => { setShowDriverForm(false); setEditingDriver(undefined); }}
            />
          )}
          <Card title="Operadores Registrados">
            {loading && <p className="text-sm text-slate-400 py-4 text-center">Cargando...</p>}
            {!loading && drivers.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">No hay operadores registrados aun.</p>
            )}
            {drivers.map(d => (
              <DriverCard
                key={d.id}
                driver={d}
                onClick={() => setViewingDriver(d)}
                onEdit={() => { setEditingDriver(d); setShowDriverForm(false); }}
                onDelete={() => deleteDriver(d.id)}
              />
            ))}
          </Card>
          {viewingDriver && (
            <DriverDetailModal
              driver={viewingDriver}
              onClose={() => setViewingDriver(undefined)}
              onEdit={() => {
                setEditingDriver(viewingDriver);
                setShowDriverForm(false);
                setViewingDriver(undefined);
              }}
            />
          )}
        </>
      )}

      {activeTab === 'partners' && (
        <>
          {(showPartnerForm || editingPartner) && (
            <PartnerForm
              partner={editingPartner}
              onSaved={() => { setShowPartnerForm(false); setEditingPartner(undefined); load(); }}
              onCancel={() => { setShowPartnerForm(false); setEditingPartner(undefined); }}
            />
          )}
          {loading && <p className="text-sm text-slate-400 py-4 text-center">Cargando...</p>}
          {!loading && partners.length === 0 && !showPartnerForm && !editingPartner && (
            <Card>
              <p className="text-sm text-slate-400 py-8 text-center">No hay socios registrados aun.</p>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {partners.map(p => (
              <PartnerCard
                key={p.id}
                partner={p}
                trucks={trucks}
                allAssignedTruckIds={allAssignedTruckIds}
                onAssignTruck={assignTruck}
                onRemoveTruck={removeTruck}
                onEdit={() => { setEditingPartner(p); setShowPartnerForm(false); }}
                onDelete={() => deletePartner(p.id)}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <Card title="Usuarios del Sistema">
          <p className="text-sm text-slate-400 py-8 text-center">
            Los usuarios se administran desde el registro de autenticación. Próximamente podrás gestionar roles y permisos aquí.
          </p>
        </Card>
      )}
    </div>
  );
}
