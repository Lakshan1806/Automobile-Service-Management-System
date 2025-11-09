
import { User, Role, Employee, EmployeeStatus, Branch, Technician, TechnicianStatus, Customer, Vehicle, Service, ServiceAppointment, AppointmentType, ServiceAppointmentStatus, Product, AuditLog, RoadsideAppointment, RoadsideAppointmentStatus, Invoice, InvoiceStatus, InvoiceItem, ServiceChecklistItem, WorkOrderPart, WorkOrderLabor, TechnicianAvailability } from '../types';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const users: User[] = [
  { id: 'user-1', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: Role.ADMIN, branches: [{id: 'branch-1', name: 'Downtown Auto'}, {id: 'branch-2', name: 'Uptown Motors'}] },
  { id: 'user-2', firstName: 'Manager', lastName: 'User', email: 'manager@test.com', role: Role.MANAGER, branches: [{id: 'branch-1', name: 'Downtown Auto'}] },
  { id: 'user-3', firstName: 'Charlie', lastName: 'Tech', email: 'tech@test.com', role: Role.TECHNICIAN, branches: [{id: 'branch-1', name: 'Downtown Auto'}] },
];

const employees: Employee[] = [
  { id: 'emp-1', firstName: 'Alice', lastName: 'Admin', email: 'admin@test.com', phone: '111-222-3333', role: Role.ADMIN, branches: [{id: 'branch-1', name: 'Downtown Auto'}], status: EmployeeStatus.ACTIVE, createdAt: '2023-01-10T10:00:00Z' },
  { id: 'emp-2', firstName: 'Bob', lastName: 'Manager', email: 'manager@test.com', phone: '222-333-4444', role: Role.MANAGER, branches: [{id: 'branch-1', name: 'Downtown Auto'}], status: EmployeeStatus.ACTIVE, createdAt: '2023-02-15T11:00:00Z' },
  { id: 'emp-3', firstName: 'Charlie', lastName: 'Tech', email: 'tech@test.com', phone: '333-444-5555', role: Role.TECHNICIAN, branches: [{id: 'branch-1', name: 'Downtown Auto'}], status: EmployeeStatus.ACTIVE, createdAt: '2023-03-20T12:00:00Z' },
  { id: 'emp-4', firstName: 'Diana', lastName: 'Tech', email: 'diana@test.com', phone: '444-555-6666', role: Role.TECHNICIAN, branches: [{id: 'branch-1', name: 'Downtown Auto'}], status: EmployeeStatus.ACTIVE, createdAt: '2023-04-25T13:00:00Z' },
  { id: 'emp-5', firstName: 'Ethan', lastName: 'Manager', email: 'ethan@test.com', phone: '555-666-7777', role: Role.MANAGER, branches: [{id: 'branch-2', name: 'Uptown Motors'}], status: EmployeeStatus.INACTIVE, createdAt: '2023-05-30T14:00:00Z' },
];

const branches: Branch[] = [
  { id: 'branch-1', name: 'Downtown Auto', code: 'DT-001', address: { street: '123 Main St', city: 'Metropolis', postal: '12345' }, phone: '555-0101', email: 'contact@downtownauto.com', manager: { id: 'emp-2', name: 'Bob Manager' }, techCount: 2, workingHours: 'Mon-Fri 8am-6pm', status: 'ACTIVE' },
  { id: 'branch-2', name: 'Uptown Motors', code: 'UP-002', address: { street: '456 Oak Ave', city: 'Metropolis', postal: '54321' }, phone: '555-0102', email: 'contact@uptownmotors.com', manager: { id: 'emp-5', name: 'Ethan Manager' }, techCount: 5, workingHours: 'Mon-Sat 7am-7pm', status: 'ACTIVE' },
];

const technicians: Technician[] = [
  { id: 'tech-1', name: 'Charlie Tech', photo: 'https://i.pravatar.cc/150?u=tech-1', skills: ['Engine Repair', 'Brakes', 'Diagnostics'], status: TechnicianStatus.AVAILABLE, todayLoad: 2, nextAvailable: 'Now', certifications: ['ASE Master'] },
  { id: 'tech-2', name: 'Diana Tech', photo: 'https://i.pravatar.cc/150?u=tech-2', skills: ['Transmission', 'Electrical', 'AC'], status: TechnicianStatus.BUSY, todayLoad: 4, nextAvailable: '3:00 PM', certifications: ['ASE Electrical'] },
  { id: 'tech-3', name: 'Frank Fixer', photo: 'https://i.pravatar.cc/150?u=tech-3', skills: ['Brakes', 'Tires'], status: TechnicianStatus.AVAILABLE, todayLoad: 1, nextAvailable: 'Now', certifications: [] },
];

const customers: Customer[] = [
  { id: 'cust-1', name: 'John Doe', phone: '123-456-7890', email: 'john.doe@email.com', address: { street: '111 Pine Ln', city: 'Metropolis', postal: '12345' }, preferredContactMethod: 'PHONE', visitCount: 5, outstandingBalance: 0 },
  { id: 'cust-2', name: 'Jane Smith', phone: '098-765-4321', email: 'jane.smith@email.com', address: { street: '222 Oak Rd', city: 'Metropolis', postal: '54321' }, preferredContactMethod: 'EMAIL', visitCount: 2, outstandingBalance: 150.75 },
  { id: 'cust-3', name: 'Sam Wilson', phone: '555-123-4567', email: 'sam.w@email.com', address: { street: '333 Maple Ave', city: 'Gotham', postal: '67890' }, preferredContactMethod: 'PHONE', visitCount: 8, outstandingBalance: 0 },
];

const vehicles: Vehicle[] = [
  { id: 'veh-1', customerId: 'cust-1', make: 'Toyota', model: 'Camry', year: 2020, plate: 'ABC-123', vin: 'VIN123456789', mileage: 45000, fuelType: 'Gasoline', transmission: 'Automatic' },
  { id: 'veh-2', customerId: 'cust-2', make: 'Honda', model: 'CR-V', year: 2022, plate: 'XYZ-789', vin: 'VIN987654321', mileage: 22000, fuelType: 'Gasoline', transmission: 'CVT' },
  { id: 'veh-3', customerId: 'cust-3', make: 'Ford', model: 'F-150', year: 2019, plate: 'TRK-LFE', vin: 'VIN543219876', mileage: 89000, fuelType: 'Diesel', transmission: 'Automatic' },
];

const services: Service[] = [
    {id: 'svc-1', name: 'Standard Oil Change', code: 'SVC-OIL-STD', category: 'Maintenance', description: 'Includes up to 5 quarts of conventional oil and a new filter.', standardDurationMin: 30, baseLaborCost: 25.00, status: 'ACTIVE'},
    {id: 'svc-2', name: 'Brake Inspection', code: 'SVC-BRK-INSP', category: 'Brakes', description: 'Visual inspection of brake pads, rotors, and calipers.', standardDurationMin: 20, baseLaborCost: 0.00, status: 'ACTIVE'},
    {id: 'svc-3', name: 'Tire Rotation', code: 'SVC-TIRE-ROT', category: 'Tires', description: 'Rotate tires to promote even wear.', standardDurationMin: 15, baseLaborCost: 15.00, status: 'ACTIVE'},
    {id: 'svc-4', name: 'Engine Diagnostic', code: 'SVC-ENG-DIAG', category: 'Diagnostics', description: 'Run computer diagnostics to identify engine issues.', standardDurationMin: 60, baseLaborCost: 95.00, status: 'INACTIVE'},
];

const products: Product[] = [
    { id: 'prod-1', sku: 'OIL-SYN-5W30', name: 'Synthetic Oil 5W-30 (Qt)', category: 'Fluids', unit: 'Qt', costPrice: 4.50, sellPrice: 8.99, tax: 0.08, stockByBranch: { 'branch-1': 50, 'branch-2': 75 }, reorderLevel: 20, supplier: 'Global Parts Inc.', status: 'ACTIVE' },
    { id: 'prod-2', sku: 'FILTER-OIL-STD', name: 'Standard Oil Filter', category: 'Filters', unit: 'Piece', costPrice: 3.00, sellPrice: 7.50, tax: 0.08, stockByBranch: { 'branch-1': 120, 'branch-2': 90 }, reorderLevel: 50, supplier: 'Filter Co.', status: 'ACTIVE' },
    { id: 'prod-3', sku: 'PAD-BRK-CERAM', name: 'Ceramic Brake Pads (Front)', category: 'Brakes', unit: 'Set', costPrice: 22.00, sellPrice: 49.99, tax: 0.08, stockByBranch: { 'branch-1': 15, 'branch-2': 10 }, reorderLevel: 5, supplier: 'BrakeStop', status: 'ACTIVE' },
];

const auditLogs: AuditLog[] = [
    { id: 'log-1', user: { id: 'user-1', name: 'Admin User' }, action: 'Employee Updated', timestamp: '2024-08-15T10:05:00Z', details: 'Status for Ethan Manager set to INACTIVE.'},
    { id: 'log-2', user: { id: 'user-2', name: 'Manager User' }, action: 'Appointment Assigned', timestamp: '2024-08-15T09:30:00Z', details: 'Ticket TKT-003 assigned to Charlie Tech.'},
    { id: 'log-3', user: { id: 'user-1', name: 'Admin User' }, action: 'Branch Created', timestamp: '2024-08-14T14:20:00Z', details: 'New branch "Westside Auto" created.'},
];

const sampleChecklist: ServiceChecklistItem[] = [
    { id: 'cl-1', task: 'Check brake pad thickness', completed: false, notes: '' },
    { id: 'cl-2', task: 'Inspect rotors for wear', completed: false, notes: '' },
    { id: 'cl-3', task: 'Check brake fluid level and condition', completed: false, notes: '' },
    { id: 'cl-4', task: 'Test brake pedal feel', completed: false, notes: '' },
];
const sampleParts: WorkOrderPart[] = [
    { id: 'wop-1', productId: 'prod-3', name: 'Ceramic Brake Pads (Front)', sku: 'PAD-BRK-CERAM', quantity: 1 },
];
const sampleLabor: WorkOrderLabor[] = [
    { id: 'wol-1', description: 'Replace front brake pads', hours: 1.5 },
];


const serviceAppointments: ServiceAppointment[] = [
  { id: 'appt-1', ticketNo: 'TKT-001', type: AppointmentType.SERVICE, branchId: 'branch-1', customer: customers[0], vehicle: vehicles[0], requestedServices: [{id: services[0].id, name: services[0].name}, {id: services[1].id, name: services[1].name}], preferredTime: '2024-08-15T10:00:00Z', assignedTech: null, status: ServiceAppointmentStatus.NEW, notes: 'Customer reports grinding noise from front brakes.', createdAt: '2024-08-14T09:00:00Z', attachments: [{id: 'att-1', name: 'grinding-noise.mp3', url: '#'}] },
  { id: 'appt-2', ticketNo: 'TKT-002', type: AppointmentType.SERVICE, branchId: 'branch-1', customer: customers[1], vehicle: vehicles[1], requestedServices: [{id: services[2].id, name: services[2].name}], preferredTime: '2024-08-15T11:00:00Z', assignedTech: null, status: ServiceAppointmentStatus.NEW, notes: '', createdAt: '2024-08-14T09:30:00Z' },
  { id: 'appt-3', ticketNo: 'TKT-003', type: AppointmentType.SERVICE, branchId: 'branch-1', customer: customers[0], vehicle: vehicles[0], requestedServices: [{id: services[1].id, name: services[1].name}], preferredTime: '2024-08-15T14:00:00Z', assignedTech: { id: 'tech-1', name: 'Charlie Tech' }, status: ServiceAppointmentStatus.ASSIGNED, notes: '', createdAt: '2024-08-14T10:00:00Z', checklist: sampleChecklist, partsUsed: sampleParts, laborEntries: sampleLabor },
  { id: 'appt-4', ticketNo: 'TKT-004', type: AppointmentType.SERVICE, branchId: 'branch-1', customer: customers[2], vehicle: vehicles[2], requestedServices: [{id: services[0].id, name: services[0].name}], preferredTime: '2024-08-16T09:00:00Z', assignedTech: { id: 'tech-2', name: 'Diana Tech' }, status: ServiceAppointmentStatus.IN_PROGRESS, notes: 'Check for oil leak.', createdAt: '2024-08-15T11:00:00Z' },
  { id: 'appt-5', ticketNo: 'TKT-005', type: AppointmentType.SERVICE, branchId: 'branch-1', customer: customers[1], vehicle: vehicles[1], requestedServices: [{id: services[3].id, name: services[3].name}], preferredTime: '2024-08-16T10:30:00Z', assignedTech: { id: 'tech-1', name: 'Charlie Tech' }, status: ServiceAppointmentStatus.COMPLETED, notes: 'Replaced spark plugs.', createdAt: '2024-08-15T13:00:00Z' },
];

const roadsideAppointments: RoadsideAppointment[] = [
    { id: 'road-1', ticketNo: 'RDT-001', type: AppointmentType.ROAD, location: { lat: 34.0522, lng: -118.2437, address: '123 Freeway Ln' }, issueType: 'Flat Tire', customer: customers[2], vehicle: vehicles[2], assignedTech: null, status: RoadsideAppointmentStatus.NEW, photos: [], createdAt: '2024-08-16T11:00:00Z' },
    { id: 'road-2', ticketNo: 'RDT-002', type: AppointmentType.ROAD, location: { lat: 34.0522, lng: -118.2437, address: '456 Highway Ave' }, issueType: 'Battery Jump', customer: customers[0], vehicle: vehicles[0], assignedTech: { id: 'tech-1', name: 'Charlie Tech' }, status: RoadsideAppointmentStatus.ASSIGNED, photos: [], createdAt: '2024-08-16T11:30:00Z' },
];

const invoices: Invoice[] = [
    { id: 'inv-1', invoiceNo: 'INV-2024-001', appointmentId: 'appt-5', customer: customers[1], vehicle: vehicles[1], items: [
        { kind: 'LABOR', refId: 'svc-3', name: 'Engine Diagnostic', qty: 1, unitPrice: 95.00, total: 95.00 },
        { kind: 'PART', refId: 'prod-4', name: 'Spark Plug (x4)', qty: 4, unitPrice: 8.50, total: 34.00 },
    ], tax: 10.32, discount: 0, total: 139.32, status: InvoiceStatus.READY, createdAt: '2024-08-16T12:00:00Z' },
    { id: 'inv-2', invoiceNo: 'INV-2024-002', appointmentId: 'appt-3', customer: customers[0], vehicle: vehicles[0], items: [
        { kind: 'LABOR', refId: 'svc-2', name: 'Brake Inspection', qty: 1, unitPrice: 0.00, total: 0.00 },
    ], tax: 0, discount: 0, total: 0.00, status: InvoiceStatus.PAID, createdAt: '2024-08-15T15:00:00Z', sendHistory: [{ date: '2024-08-15T15:05:00Z', method: 'EMAIL' }] },
];

const technicianAvailabilities: TechnicianAvailability[] = [
    {
        technicianId: 'tech-1',
        shifts: [
            { day: 'Monday', start: '08:00', end: '17:00' },
            { day: 'Tuesday', start: '08:00', end: '17:00' },
            { day: 'Wednesday', start: '08:00', end: '17:00' },
        ],
        breaks: [ { day: 'Monday', start: '12:00', end: '13:00' } ],
        timeOff: [ { start: '2024-09-01', end: '2024-09-03', reason: 'Vacation' } ],
    },
    {
        technicianId: 'tech-2',
        shifts: [
            { day: 'Wednesday', start: '09:00', end: '18:00' },
            { day: 'Thursday', start: '09:00', end: '18:00' },
            { day: 'Friday', start: '09:00', end: '18:00' },
        ],
        breaks: [],
        timeOff: [],
    },
     {
        technicianId: 'tech-3',
        shifts: [
            { day: 'Monday', start: '10:00', end: '19:00' },
            { day: 'Tuesday', start: '10:00', end: '19:00' },
        ],
        breaks: [],
        timeOff: [ { start: '2024-08-20', end: '2024-08-20', reason: 'Appointment' } ],
    },
];

export const mockDb = {
  users,
  employees,
  branches,
  technicians,
  customers,
  vehicles,
  services,
  products,
  auditLogs,
  invoices,
  technicianAvailabilities,
  appointments: {
    service: serviceAppointments,
    road: roadsideAppointments,
  },
};
