import { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api, type Settlement, type Trip } from '../lib/api';
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, Calculator } from 'lucide-react';
import { cn } from '../lib/utils';

// ---- Partner Breakdown Card ----
function PartnerBreakdown({ auditLog }: { auditLog?: string }) {
  if (!auditLog) return null;
  let parsed: any = {};
  try { parsed = JSON.parse(auditLog); } catch { return null; }
  const breakdown = parsed.partnerBreakdown as Record<string, { name: string; totalShare: number; details: any[] }>;
  if (!breakdown) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribución por Socio</p>
      {Object.entries(breakdown).map(([id, partner]) => (
        <div key={id} className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-700">
          <span className="font-medium text-enterprise-text-light dark:text-enterprise-text-dark">{partner.name}</span>
          <span className="font-bold text-primary-500">${partner.totalShare.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Settlement Card ----
function SettlementCard({ settlement }: { settlement: Settlement }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-enterprise-border-light dark:border-enterprise-border-dark rounded-xl p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-enterprise-text-light dark:text-enterprise-text-dark">
            Liquidación — {new Date(settlement.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{settlement.tripCount ?? '—'} viajes incluidos</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-bold', settlement.netProfit >= 0 ? 'text-green-500' : 'text-red-500')}>
            {settlement.netProfit >= 0 ? '+' : ''}${settlement.netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Ocultar' : 'Desglose'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Ingresos brutos</p>
          <p className="font-bold text-slate-800 dark:text-white">${settlement.totalGross.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Costos operativos</p>
          <p className="font-bold text-red-400">${settlement.totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {expanded && <PartnerBreakdown auditLog={settlement.auditLog} />}
    </div>
  );
}

// ---- Calculate Modal ----
function CalculateModal({ onDone }: { onDone: () => void }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.trips.getUnsettled()
      .then(setTrips)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const calculate = async () => {
    if (selected.size === 0) { setError('Selecciona al menos un viaje'); return; }
    setCalculating(true);
    setError('');
    try {
      const data = await api.settlements.calculate([...selected]);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCalculating(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2 size={20} />
          <p className="font-semibold">¡Liquidación generada exitosamente!</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs">Bruto total</p>
            <p className="font-bold">${result.settlement.totalGross.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs">Gastos</p>
            <p className="font-bold text-red-500">${result.settlement.totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs">Utilidad neta</p>
            <p className={`font-bold ${result.settlement.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${result.settlement.netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <PartnerBreakdown auditLog={JSON.stringify({ partnerBreakdown: result.partnerBreakdown })} />
        <Button onClick={onDone} className="w-full">Ver historial de liquidaciones</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Selecciona los viajes sin liquidar para incluir en el cálculo:</p>
      {loading && <p className="text-sm text-slate-400">Cargando viajes...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {trips.map(trip => (
          <label key={trip.id} className="flex items-center gap-3 p-3 rounded-lg border border-enterprise-border-light dark:border-enterprise-border-dark cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={selected.has(trip.id)}
              onChange={() => toggle(trip.id)}
              className="w-4 h-4 rounded text-primary-500"
            />
            <div className="flex-1 text-sm">
              <p className="font-medium">{trip.truck?.plate ?? trip.truckId.slice(0, 8)}</p>
              <p className="text-xs text-slate-400">{new Date(trip.date).toLocaleDateString('es-MX')} — ${trip.grossAmount.toLocaleString()}</p>
            </div>
          </label>
        ))}
        {!loading && trips.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No hay viajes pendientes de liquidar.</p>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Button onClick={onDone} variant="secondary">Cancelar</Button>
        <Button onClick={calculate} disabled={calculating || selected.size === 0}>
          <Calculator size={16} className="mr-2" />
          {calculating ? 'Calculando...' : `Calcular (${selected.size} viajes)`}
        </Button>
      </div>
    </div>
  );
}

// ---- Main Settlements Page ----
export default function Settlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculate, setShowCalculate] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.settlements.getAll();
      setSettlements(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalNeto = settlements.reduce((s, l) => s + l.netProfit, 0);
  const totalBruto = settlements.reduce((s, l) => s + l.totalGross, 0);
  const totalGastos = settlements.reduce((s, l) => s + l.totalExpenses, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-text-light dark:text-enterprise-text-dark">Liquidaciones</h1>
          <p className="text-sm text-slate-500">Motor financiero — cálculo de utilidad neta y distribución por socios</p>
        </div>
        <Button onClick={() => setShowCalculate(!showCalculate)}>
          <Calculator size={18} className="mr-2" />
          Nueva Liquidación
        </Button>
      </div>

      {/* Calculate panel */}
      {showCalculate && (
        <Card title="Calcular Liquidación">
          <CalculateModal onDone={() => { setShowCalculate(false); load(); }} />
        </Card>
      )}

      {/* KPI summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500"><DollarSign size={22} /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Bruto acumulado</p>
              <p className="text-xl font-bold">${totalBruto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><TrendingDown size={22} /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Costos acumulados</p>
              <p className="text-xl font-bold text-red-500">${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', totalNeto >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Utilidad neta total</p>
              <p className={`text-xl font-bold ${totalNeto >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card title="Historial de Liquidaciones">
        {loading && <p className="text-sm text-slate-400 py-4 text-center">Cargando liquidaciones...</p>}
        {error && <p className="text-sm text-red-500 py-4 text-center">{error}</p>}
        {!loading && settlements.length === 0 && !error && (
          <p className="text-sm text-slate-400 py-8 text-center">
            No hay liquidaciones aún. Usa el botón "Nueva Liquidación" para calcular.
          </p>
        )}
        <div className="space-y-3">
          {settlements.map(s => <SettlementCard key={s.id} settlement={s} />)}
        </div>
      </Card>
    </div>
  );
}
