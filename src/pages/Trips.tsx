import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ImageUpload } from '../components/common/ImageUpload';
import { Save, Plus } from 'lucide-react';
import { api, type Trip } from '../lib/api';

// ---- Expense Form ----
function ExpenseForm({ tripId, onAdded }: { tripId: string; onAdded: () => void }) {
  const [category, setCategory] = useState('DIESEL');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setSaving(true);
    setError('');
    try {
      await api.trips.addExpense(tripId, {
        category,
        amount: parseFloat(amount),
        description: description || undefined,
        date: new Date().toISOString(),
      });
      setAmount('');
      setDescription('');
      onAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2 items-end flex-wrap">
      <div className="flex-1 min-w-[120px]">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Categoría</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full rounded-lg border border-enterprise-border-light dark:border-enterprise-border-dark bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          {['DIESEL', 'TOLL', 'VIATICOS', 'MAINTENANCE', 'OTHER'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[100px]">
        <Input label="Monto" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div className="flex-1 min-w-[140px]">
        <Input label="Descripción" placeholder="Opcional" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <Button type="submit" size="sm" disabled={saving}>
        <Plus size={14} className="mr-1" />{saving ? 'Guardando...' : 'Agregar'}
      </Button>
      {error && <p className="text-xs text-red-500 w-full">{error}</p>}
    </form>
  );
}

// ---- Trip Detail Panel ----
function TripDetail({ trip, onRefresh }: { trip: Trip; onRefresh: () => void }) {
  const totalExpenses = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = trip.grossAmount - totalExpenses;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs">Flete bruto</p>
          <p className="font-bold text-slate-800 dark:text-white">${trip.grossAmount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs">Gastos</p>
          <p className="font-bold text-red-500">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs">Neto</p>
          <p className={`font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {trip.expenses.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastos registrados</p>
          {trip.expenses.map(exp => (
            <div key={exp.id} className="flex justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">{exp.category} {exp.description ? `— ${exp.description}` : ''}</span>
              <span className="font-medium text-red-400">-${exp.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {!trip.settled && (
        <ExpenseForm tripId={trip.id} onAdded={onRefresh} />
      )}
    </div>
  );
}

// ---- Main Trips Page ----
export default function Trips() {
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTrip, setSelectedTrip] = React.useState<Trip | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.trips.getAll();
      setTrips(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const totalFletes = trips.reduce((s, t) => s + t.grossAmount, 0);
  const unsettled = trips.filter(t => !t.settled).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-text-light dark:text-enterprise-text-dark">Operación — Viajes</h1>
          <p className="text-sm text-slate-500">Registro de viajes, gastos y evidencia</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="mr-2" />
          Nuevo Viaje
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center py-6">
          <p className="text-3xl font-bold text-primary-500">{trips.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Viajes</p>
        </Card>
        <Card className="text-center py-6">
          <p className="text-3xl font-bold text-amber-500">{unsettled}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Sin Liquidar</p>
        </Card>
        <Card className="text-center py-6">
          <p className="text-3xl font-bold text-green-500">${totalFletes.toLocaleString()}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Fletes Totales</p>
        </Card>
      </div>

      {/* New trip form */}
      {showForm && <NewTripForm onCreated={() => { setShowForm(false); load(); }} />}

      {/* Trips list */}
      <Card title="Historial de Viajes">
        {loading && <p className="text-sm text-slate-400 py-4 text-center">Cargando viajes...</p>}
        {error && <p className="text-sm text-red-500 py-4 text-center">{error}</p>}
        {!loading && trips.length === 0 && (
          <p className="text-sm text-slate-400 py-8 text-center">No hay viajes registrados aún.</p>
        )}
        <div className="space-y-3">
          {trips.map(trip => (
            <div
              key={trip.id}
              className="border border-enterprise-border-light dark:border-enterprise-border-dark rounded-xl p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-enterprise-text-light dark:text-enterprise-text-dark">
                    Unidad: {trip.truck?.plate ?? trip.truckId.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(trip.date).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${trip.settled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                    {trip.settled ? 'Liquidado' : 'Pendiente'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}>
                    {selectedTrip?.id === trip.id ? 'Cerrar' : 'Detalle'}
                  </Button>
                </div>
              </div>
              {selectedTrip?.id === trip.id && <TripDetail trip={trip} onRefresh={load} />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---- New Trip Form ----
function NewTripForm({ onCreated }: { onCreated: () => void }) {
  const [truckId, setTruckId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckId || !driverId || !grossAmount) { setError('Todos los campos son requeridos'); return; }
    setSaving(true);
    setError('');
    try {
      await api.trips.create({
        truckId,
        driverId,
        grossAmount: parseFloat(grossAmount),
        date: new Date().toISOString(),
      });
      onCreated();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Card title="Nuevo Registro de Viaje" subtitle="Ingresa los detalles operativos del servicio">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="ID Unidad (UUID)" placeholder="uuid del camión" value={truckId} onChange={e => setTruckId(e.target.value)} />
          <Input label="ID Chofer (UUID)" placeholder="uuid del chofer" value={driverId} onChange={e => setDriverId(e.target.value)} />
          <Input label="Tarifa Flete ($)" placeholder="0.00" type="number" value={grossAmount} onChange={e => setGrossAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Evidencia (PDF/Imagen)</label>
          <ImageUpload />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? 'Guardando...' : 'Guardar Viaje'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
