const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// Typed helpers
const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });
const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

// --- Typed API Surface ---
export interface AuthUser { id: string; email: string; role: string; name?: string; }
export interface Driver {
  id: string;
  name: string;
  licenseType?: string;
  licenseExpiry?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  photoUrl?: string;
  licensePhotoUrl?: string;
  createdAt: string;
}
export interface Truck { id: string; unitNumber?: string; plate: string; make?: string; model: string; year?: number; photoUrl?: string; insuranceExpiry?: string; }
export interface Trip { id: string; truckId: string; driverId: string; grossAmount: number; date: string; settled: boolean; expenses: Expense[]; truck?: Truck; }
export interface Expense { id: string; tripId: string; category: string; amount: number; description?: string; date: string; }
export interface Settlement { id: string; date: string; totalGross: number; totalExpenses: number; netProfit: number; auditLog?: string; tripCount?: number; partnerBreakdown?: Record<string, unknown>; }
export interface Partner { id: string; name: string; phone?: string; razonSocial?: string; trucks?: { truck: Truck; percentage: number }[]; }
export interface WarehouseItem { id: string; name: string; partNumber?: string; description?: string; currentStock: number; minimumStock: number; categoryId?: string; category?: { name: string }; }
export interface ItemCategory { id: string; name: string; description?: string; _count?: { items: number }; }

// --- Operations Module ---
export interface Area { id: string; name: string; description?: string; parks?: Park[]; }
export interface Park { id: string; name: string; areaId: string; description?: string; area?: Area; }
export interface ServiceCostRecord { id: string; areaId: string; parkId?: string; serviceType: string; amount: number; effectiveFrom: string; area?: Area; park?: Park; }
export interface RouteTemplate {
  id: string; name: string; areaId: string; entryTime: string; exitTime: string;
  truckId?: string; driverId?: string; parkId?: string; turno?: string; tripType?: string; workDays?: string;
  active: boolean;
  area?: Area; park?: Park; truck?: Truck; driver?: Driver;
}
export interface ScheduledTrip {
  id: string; date: string; routeTemplateId?: string; areaId: string; parkId?: string; tripType?: string;
  serviceAmount: number;
  plannedTruckId?: string; plannedDriverId?: string; plannedEntry?: string; plannedExit?: string;
  executedTruckId?: string; executedDriverId?: string; actualEntry?: string; actualExit?: string;
  odometer?: number; status: string; isSpecial: boolean; notes?: string;
  settled: boolean; settlementId?: string;
  // Campos para modo Demo Visual
  truckId?: string; driverId?: string; truck?: Truck; driver?: Driver;
  area?: Area; park?: Park; routeTemplate?: RouteTemplate;
  plannedTruck?: Truck; plannedDriver?: Driver;
  executedTruck?: Truck; executedDriver?: Driver;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      post<{ token: string; user: AuthUser }>('/auth/login', { email, password }),
    register: (email: string, password: string, role?: string, name?: string) =>
      post<{ token: string; user: AuthUser }>('/auth/register', { email, password, role, name }),
  },

  trucks: {
    getAll: () => get<Truck[]>('/trucks'),
    getById: (id: string) => get<Truck>(`/trucks/${id}`),
    create: (data: Omit<Truck, 'id'>) => post<Truck>('/trucks', data),
    update: (id: string, data: Partial<Truck>) => put<Truck>(`/trucks/${id}`, data),
    delete: (id: string) => del<void>(`/trucks/${id}`),
  },

  trips: {
    getAll: () => get<Trip[]>('/trips'),
    getUnsettled: () => get<Trip[]>('/trips/unsettled'),
    getById: (id: string) => get<Trip>(`/trips/${id}`),
    create: (data: Omit<Trip, 'id' | 'settled' | 'expenses'>) => post<Trip>('/trips', data),
    update: (id: string, data: Partial<Trip>) => put<Trip>(`/trips/${id}`, data),
    addExpense: (tripId: string, data: Omit<Expense, 'id' | 'tripId'>) =>
      post<Expense>(`/trips/${tripId}/expenses`, data),
  },

  settlements: {
    getAll: () => get<Settlement[]>('/settlements'),
    getById: (id: string) => get<Settlement>(`/settlements/${id}`),
    calculate: (tripIds: string[]) =>
      post<{ settlement: Settlement; tripCount: number; partnerBreakdown: Record<string, unknown> }>(
        '/settlements/calculate',
        { tripIds }
      ),
  },

  partners: {
    getAll: () => get<Partner[]>('/partners'),
    getById: (id: string) => get<Partner>(`/partners/${id}`),
    create: (data: { name: string; phone?: string; razonSocial?: string }) => post<Partner>('/partners', data),
    update: (id: string, data: { name?: string; phone?: string; razonSocial?: string }) => put<Partner>(`/partners/${id}`, data),
    delete: (id: string) => del<void>(`/partners/${id}`),
    assignTruck: (partnerId: string, truckId: string, percentage: number) =>
      post<unknown>(`/partners/${partnerId}/trucks`, { truckId, percentage }),
    removeTruck: (partnerId: string, truckId: string) =>
      del<void>(`/partners/${partnerId}/trucks/${truckId}`),
  },

  inventory: {
    getItems: () => get<WarehouseItem[]>('/inventory/items'),
    createItem: (data: Omit<WarehouseItem, 'id' | 'currentStock'>) =>
      post<WarehouseItem>('/inventory/items', data),
    getCategories: () => get<ItemCategory[]>('/inventory/categories'),
    createCategory: (data: { name: string; description?: string }) =>
      post<ItemCategory>('/inventory/categories', data),
    getByTruck: (truckId: string) => get<unknown[]>(`/inventory/trucks/${truckId}`),
    move: (data: unknown) => post<unknown>('/inventory/move', data),
    getTransactions: (instanceId?: string) =>
      get<unknown[]>(`/inventory/transactions${instanceId ? `?instanceId=${instanceId}` : ''}`),
    getActiveTools: () => get<unknown[]>('/inventory/tools/active'),
  },

  drivers: {
    getAll: () => get<Driver[]>('/drivers'),
    getById: (id: string) => get<Driver>(`/drivers/${id}`),
    create: (data: Omit<Driver, 'id' | 'createdAt'>) => post<Driver>('/drivers', data),
    update: (id: string, data: Partial<Omit<Driver, 'id' | 'createdAt'>>) => put<Driver>(`/drivers/${id}`, data),
    delete: (id: string) => del<void>(`/drivers/${id}`),
  },

  areas: {
    getAll: () => get<Area[]>('/areas'),
    getById: (id: string) => get<Area>(`/areas/${id}`),
    create: (data: { name: string; description?: string }) => post<Area>('/areas', data),
    update: (id: string, data: { name?: string; description?: string }) => put<Area>(`/areas/${id}`, data),
    delete: (id: string) => del<void>(`/areas/${id}`),
    getCosts: (areaId: string) => get<ServiceCostRecord[]>(`/areas/costs?areaId=${areaId}`),
    getAllCosts: () => get<ServiceCostRecord[]>('/areas/costs/all'),
    addCost: (data: { areaId: string; parkId?: string; serviceType?: string; amount: number; effectiveFrom?: string }) =>
      post<ServiceCostRecord>('/areas/costs', data),
    getParks: () => get<Park[]>('/areas/parks/all'),
    createPark: (data: { name: string; areaId: string; description?: string }) => post<Park>('/areas/parks', data),
    updatePark: (id: string, data: { name?: string; areaId?: string; description?: string }) => put<Park>(`/areas/parks/${id}`, data),
    deletePark: (id: string) => del<void>(`/areas/parks/${id}`),
  },

  routeTemplates: {
    getAll: () => get<RouteTemplate[]>('/route-templates'),
    getById: (id: string) => get<RouteTemplate>(`/route-templates/${id}`),
    create: (data: { name: string; areaId: string; entryTime: string; exitTime: string; truckId?: string; driverId?: string; parkId?: string; tripType?: string; workDays?: string }) =>
      post<RouteTemplate>('/route-templates', data),
    update: (id: string, data: Partial<RouteTemplate>) => put<RouteTemplate>(`/route-templates/${id}`, data),
    delete: (id: string) => del<void>(`/route-templates/${id}`),
  },

  scheduledTrips: {
    getAll: (filters?: { date?: string; status?: string; areaId?: string }) => {
      const params = new URLSearchParams();
      if (filters?.date) params.set('date', filters.date);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.areaId) params.set('areaId', filters.areaId);
      const qs = params.toString();
      return get<ScheduledTrip[]>(`/scheduled-trips${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => get<ScheduledTrip>(`/scheduled-trips/${id}`),
    generate: (date: string) => post<ScheduledTrip[]>('/scheduled-trips/generate', { date }),
    createSpecial: (data: {
      date: string; areaId: string; parkId?: string; tripType?: string; serviceAmount: number;
      plannedTruckId?: string; plannedDriverId?: string;
      plannedEntry?: string; plannedExit?: string; notes?: string;
    }) => post<ScheduledTrip>('/scheduled-trips/special', data),
    swap: (id: string, data: { truckId?: string; driverId?: string }) =>
      patch<ScheduledTrip>(`/scheduled-trips/${id}/swap`, data),
    dispatch: (id: string, data?: { odometer?: number }) =>
      patch<ScheduledTrip>(`/scheduled-trips/${id}/dispatch`, data ?? {}),
    complete: (id: string, data?: { odometer?: number }) =>
      patch<ScheduledTrip>(`/scheduled-trips/${id}/complete`, data ?? {}),
    cancel: (id: string) => patch<ScheduledTrip>(`/scheduled-trips/${id}/cancel`),
    getUnsettled: () => get<ScheduledTrip[]>('/scheduled-trips/unsettled'),
  },
};
