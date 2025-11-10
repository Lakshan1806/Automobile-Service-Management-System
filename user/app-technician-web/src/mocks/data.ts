import {
  User,
  Role,
  Employee,
  Branch,
  Technician,
  Customer,
  Vehicle,
  Service,
  ServiceAppointment,
  Product,
  AuditLog,
  RoadsideAppointment,
  Invoice,
  TechnicianAvailability,
} from '../types';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const users: User[] = [
  {
    id: 'user-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    role: Role.ADMIN,
    branches: [],
  },
  {
    id: 'user-2',
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@test.com',
    role: Role.MANAGER,
    branches: [],
  },
  {
    id: 'user-3',
    firstName: 'Charlie',
    lastName: 'Tech',
    email: 'tech@test.com',
    role: Role.TECHNICIAN,
    branches: [],
  },
];

const employees: Employee[] = [];
const branches: Branch[] = [];
const technicians: Technician[] = [];
const customers: Customer[] = [];
const vehicles: Vehicle[] = [];
const services: Service[] = [];
const products: Product[] = [];
const auditLogs: AuditLog[] = [];
const invoices: Invoice[] = [];
const technicianAvailabilities: TechnicianAvailability[] = [];
const serviceAppointments: ServiceAppointment[] = [];
const roadsideAppointments: RoadsideAppointment[] = [];

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
