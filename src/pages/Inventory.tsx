import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { api, type WarehouseItem, type ItemCategory } from '../lib/api';
import { Package, Plus, AlertCircle, Wrench } from 'lucide-react';
import { cn } from '../lib/utils';

// ---- Stock Badge ----
function StockBadge({ current, minimum }: { current: number; minimum: number }) {
  const isLow = current <= minimum;
  return (
    <span className={cn(
      'text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1',
      isLow
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    )}>
      {isLow && <AlertCircle size={11} />}
      {current} uds.
    </span>
  );
}

// ---- New Item Form ----
function NewItemForm({ categories, onCreated }: { categories: ItemCategory[]; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [minimumStock, setMinimumStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { setError('El nombre es requerido'); return; }
    setSaving(true);
    setError('');
    try {
      await api.inventory.createItem({
        name,
        partNumber: partNumber || undefined,
        description: description || undefined,
        minimumStock: parseInt(minimumStock) || 0,
        categoryId: categoryId || undefined,
      } as any);
      onCreated();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre del artículo *" placeholder="Ej: Llanta 11R22.5" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Número de parte / SKU" placeholder="Ej: LLT-001" value={partNumber} onChange={e => setPartNumber(e.target.value)} />
        <Input label="Descripción" placeholder="Opcional" value={description} onChange={e => setDescription(e.target.value)} />
        <Input label="Stock mínimo" type="number" placeholder="0" value={minimumStock} onChange={e => setMinimumStock(e.target.value)} />
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Categoría</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-enterprise-border-light dark:border-enterprise-border-dark bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          >
            <option value="">Sin categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={saving}>
          <Plus size={16} className="mr-2" />
          {saving ? 'Guardando...' : 'Agregar Artículo'}
        </Button>
      </div>
    </form>
  );
}

// ---- Active Tool Assignments ----
function ActiveTools() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.inventory.getActiveTools()
      .then(setTools)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Cargando asignaciones...</p>;
  if (tools.length === 0) return <p className="text-sm text-slate-400">No hay herramientas prestadas actualmente.</p>;

  return (
    <div className="space-y-2">
      {tools.map((a: any) => (
        <div key={a.id} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-slate-700">
          <div>
            <p className="font-medium">{a.warehouseItemId?.slice(0, 8) ?? '—'}</p>
            <p className="text-xs text-slate-400">Mecánico: {a.mechanic?.name ?? a.mechanicId?.slice(0, 8)}</p>
          </div>
          <p className="text-xs text-slate-400">{new Date(a.assignedAt).toLocaleDateString('es-MX')}</p>
        </div>
      ))}
    </div>
  );
}

// ---- Main Inventory Page ----
export default function Inventory() {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'tools'>('items');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        api.inventory.getItems(),
        api.inventory.getCategories(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const lowStockCount = items.filter(i => i.currentStock <= i.minimumStock).length;
  const totalItems = items.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-text-light dark:text-enterprise-text-dark">Inventario / Taller</h1>
          <p className="text-sm text-slate-500">Control de almacén, llantas y herramientas — Agente D</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center py-6">
          <p className="text-3xl font-bold text-primary-500">{totalItems}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Artículos en catálogo</p>
        </Card>
        <Card className="text-center py-6">
          <p className="text-3xl font-bold text-amber-500">{lowStockCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Bajo stock mínimo</p>
        </Card>
        <Card className="text-center py-6">
          <p className="text-3xl font-bold text-blue-500">{categories.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Categorías</p>
        </Card>
      </div>

      {/* New item form */}
      {showForm && (
        <Card title="Nuevo Artículo de Almacén">
          <NewItemForm categories={categories} onCreated={() => { setShowForm(false); load(); }} />
        </Card>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('items')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'items' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Package size={16} /> Almacén
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'tools' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Wrench size={16} /> Herramientas en préstamo
        </button>
      </div>

      {/* Content */}
      {activeTab === 'items' && (
        <Card title="Artículos en Almacén">
          {loading && <p className="text-sm text-slate-400 py-4 text-center">Cargando inventario...</p>}
          {error && <p className="text-sm text-red-500 py-4 text-center">{error}</p>}
          {!loading && items.length === 0 && !error && (
            <p className="text-sm text-slate-400 py-8 text-center">No hay artículos registrados.</p>
          )}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm text-enterprise-text-light dark:text-enterprise-text-dark">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {item.category?.name ?? 'Sin categoría'}{item.partNumber ? ` · SKU: ${item.partNumber}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Mín: {item.minimumStock}</span>
                  <StockBadge current={item.currentStock} minimum={item.minimumStock} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'tools' && (
        <Card title="Herramientas Prestadas">
          <ActiveTools />
        </Card>
      )}
    </div>
  );
}
