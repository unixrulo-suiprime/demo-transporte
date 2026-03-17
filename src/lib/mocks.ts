import type { ScheduledTrip, Area, Park, Truck, Driver, RouteTemplate } from './api';

export const MOCK_AREAS: Area[] = [
  { id: '1', name: 'Zona Industrial Ramos Arizpe', description: 'Principal zona de maquiladoras' },
  { id: '2', name: 'Parque Industrial Saltillo', description: 'Zona sur de la ciudad' },
  { id: '3', name: 'Derramadero', description: 'Zona automotriz' },
];

export const MOCK_PARKS: Park[] = [
  { id: '1', areaId: '1', name: 'Parque Santa Maria', description: 'Ramos Arizpe' },
  { id: '2', areaId: '1', name: 'Parque PIVA', description: 'Ramos Arizpe' },
  { id: '3', areaId: '3', name: 'Parque Alianza', description: 'Derramadero' },
];

export const MOCK_TRUCKS: Truck[] = [
  { id: '1', unitNumber: '101', plate: 'ABC-123', model: 'International 2022' },
  { id: '2', unitNumber: '102', plate: 'DEF-456', model: 'Mercedes Benz 2023' },
  { id: '3', unitNumber: 'S-01', plate: 'GHI-789', model: 'Toyota Suburban 2021' },
  { id: '4', unitNumber: '201', plate: 'JKL-012', model: 'Volkswagen Crafter' },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: '1', name: 'Juan Perez Melendez', licenseExpiry: '2026-12-31', phone: '844-123-4567', createdAt: '2024-01-01' },
  { id: '2', name: 'Ricardo Treviño', licenseExpiry: '2025-06-30', phone: '844-987-6543', createdAt: '2024-01-01' },
  { id: '3', name: 'Roberto Gomez', licenseExpiry: '2027-01-15', phone: '844-555-0000', createdAt: '2024-01-01' },
];

export const MOCK_TEMPLATES: RouteTemplate[] = [
  { id: '1', areaId: '1', parkId: '1', name: 'Ruta 1 - Entrada GM', entryTime: '06:00', exitTime: '14:00', tripType: 'entry_only', truckId: '1', driverId: '1', active: true, workDays: '1,2,3,4,5', turno: '1' },
  { id: '2', areaId: '1', parkId: '1', name: 'Ruta 2 - Entrada GM', entryTime: '06:15', exitTime: '14:15', tripType: 'entry_only', truckId: '2', driverId: '2', active: true, workDays: '1,2,3,4,5', turno: '1' },
  { id: '3', areaId: '3', parkId: '3', name: 'Derramadero Nocturno', entryTime: '22:00', exitTime: '06:00', tripType: 'round', truckId: '3', driverId: '3', active: true, workDays: '1,2,3,4,5,6', turno: '3' },
];

export const MOCK_TRIPS: ScheduledTrip[] = [
  {
    id: 't1',
    routeTemplateId: '1',
    areaId: '1',
    date: new Date().toISOString().slice(0, 10),
    status: 'completed',
    serviceAmount: 2450,
    isSpecial: false,
    settled: false,
    plannedTruckId: '1',
    plannedDriverId: '1',
    truckId: '1',
    driverId: '1',
    routeTemplate: MOCK_TEMPLATES[0],
    truck: MOCK_TRUCKS[0],
    driver: MOCK_DRIVERS[0],
  },
  {
    id: 't2',
    routeTemplateId: '2',
    areaId: '1',
    date: new Date().toISOString().slice(0, 10),
    status: 'dispatched',
    serviceAmount: 2450,
    isSpecial: false,
    settled: false,
    plannedTruckId: '2',
    plannedDriverId: '2',
    truckId: '2',
    driverId: '2',
    routeTemplate: MOCK_TEMPLATES[1],
    truck: MOCK_TRUCKS[1],
    driver: MOCK_DRIVERS[1],
  },
  {
    id: 't3',
    routeTemplateId: '3',
    areaId: '3',
    date: new Date().toISOString().slice(0, 10),
    status: 'scheduled',
    serviceAmount: 2200,
    isSpecial: false,
    settled: false,
    plannedTruckId: '3',
    plannedDriverId: '3',
    truckId: '3',
    driverId: '3',
    routeTemplate: MOCK_TEMPLATES[2],
    truck: MOCK_TRUCKS[2],
    driver: MOCK_DRIVERS[2],
  }
];
