
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN'
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum AppointmentType {
  SERVICE = 'SERVICE',
  ROAD = 'ROAD'
}

export enum ServiceAppointmentStatus {
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED'
}

export enum RoadsideAppointmentStatus {
    NEW = 'NEW',
    ASSIGNED = 'ASSIGNED',
    EN_ROUTE = 'EN_ROUTE',
    ON_SITE = 'ON_SITE',
    TOWING = 'TOWING',
    COMPLETED = 'COMPLETED',
}

export enum InvoiceStatus {
    READY = 'READY',
    SENT = 'SENT',
    PAID = 'PAID'
}

export enum TechnicianStatus {
    AVAILABLE = 'AVAILABLE',
    BUSY = 'BUSY',
    OFF = 'OFF'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  branches: { id: string, name: string }[];
  accessToken?: string;
  tokenExpiresAt?: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  branches: { id: string, name: string }[];
  status: EmployeeStatus;
  createdAt: string;
}

export interface AdminEmployee {
  id: number | string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
}

export interface AdminEmployeeCreateInput {
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
}

export interface AdminBranch {
  id: number | string;
  name: string;
  location: string;
  managerId?: number | null;
  managerName?: string;
  managerEmail?: string;
}

export interface AdminBranchCreateInput {
  name: string;
  location: string;
  managerId?: number | null;
}

export interface AdminServiceItem {
  id: number | string;
  name: string;
  description: string;
  price: number;
}

export interface AdminServiceCreateInput {
  name: string;
  description: string;
  price: number;
}

export interface AdminProduct {
  id: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface AdminProductCreateInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageFile?: File | null;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: { street: string; city: string; postal: string; };
  phone: string;
  email: string;
  manager: { id: string; name: string } | null;
  techCount: number;
  workingHours: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Technician {
  id: string;
  name: string;
  photo: string;
  skills: string[];
  status: TechnicianStatus;
  todayLoad: number;
  nextAvailable: string;
  certifications: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: { street: string; city: string; postal: string; };
  preferredContactMethod: 'EMAIL' | 'PHONE';
  visitCount: number;
  outstandingBalance: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  mileage: number;
  customerId: string;
  fuelType: string;
  transmission: string;
}

export interface Service {
    id: string;
    name: string;
    code: string;
    category: string;
    description: string;
    standardDurationMin: number;
    baseLaborCost: number;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  tax: number;
  stockByBranch: { [branchId: string]: number };
  reorderLevel: number;
  supplier: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AuditLog {
    id: string;
    user: { id: string, name: string };
    action: string;
    timestamp: string;
    details: string;
}

export interface ServiceChecklistItem {
    id: string;
    task: string;
    completed: boolean;
    notes: string;
}

export interface WorkOrderPart {
    id: string;
    productId: string;
    name: string;
    sku: string;
    quantity: number;
}

export interface WorkOrderLabor {
    id: string;
    description: string;
    hours: number;
}

export interface ServiceAppointment {
  id: string;
  ticketNo: string;
  type: AppointmentType.SERVICE;
  branchId: string;
  customer: Customer;
  vehicle: Vehicle;
  requestedServices: {id: string, name: string}[];
  preferredTime: string;
  assignedTech: { id: string, name: string } | null;
  status: ServiceAppointmentStatus;
  notes: string;
  createdAt: string;
  attachments?: { id: string; name: string; url: string }[];
  // Work Order Details
  checklist?: ServiceChecklistItem[];
  partsUsed?: WorkOrderPart[];
  laborEntries?: WorkOrderLabor[];
}

export interface RoadsideAppointment {
    id: string;
    ticketNo: string;
    type: AppointmentType.ROAD;
    location: { lat: number; lng: number; address: string; };
    issueType: string;
    customer: Customer;
    vehicle: Vehicle;
    assignedTech: { id: string, name: string } | null;
    status: RoadsideAppointmentStatus;
    photos: string[];
    createdAt: string;
}

export interface InvoiceItem {
    kind: 'LABOR' | 'PART';
    refId: string;
    name: string;
    qty: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    appointmentId: string;
    customer: Customer;
    vehicle: Vehicle;
    items: InvoiceItem[];
    tax: number;
    discount: number;
    total: number;
    status: InvoiceStatus;
    createdAt: string;
    sendHistory?: { date: string; method: 'EMAIL' }[];
}

export interface TechnicianAvailability {
    technicianId: string;
    shifts: { day: string; start: string; end: string }[];
    breaks: { day: string; start: string; end: string }[];
    timeOff: { start: string; end: string; reason: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    pages: number;
  };
}

export type Appointment = ServiceAppointment | RoadsideAppointment;
