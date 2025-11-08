
import { mockDb, delay } from '../mocks/data';
import { User, Role, Employee, AdminEmployee, AdminEmployeeCreateInput, AdminBranch, AdminBranchCreateInput, AdminServiceCreateInput, AdminServiceItem, AdminProduct, AdminProductCreateInput, PaginatedResponse, ServiceAppointment, Technician, Branch, ServiceAppointmentStatus, Service, Product, AuditLog, RoadsideAppointment, Invoice, Customer, Vehicle, RoadsideAppointmentStatus, EmployeeStatus, InvoiceStatus, TechnicianAvailability } from '../types';

const USE_MOCK = (import.meta.env?.VITE_USE_MOCK_API ?? 'false') === 'true'; // Default to real auth unless explicitly mocked
const AUTH_API_BASE_URL = (import.meta.env?.VITE_AUTH_API_URL as string | undefined) || 'http://localhost:9000';
const AUTH_API_BASE = AUTH_API_BASE_URL.replace(/\/$/, '');
const ADMIN_API_BASE_URL = (import.meta.env?.VITE_ADMIN_API_URL as string | undefined) || 'http://localhost:8000';
const ADMIN_API_BASE = `${ADMIN_API_BASE_URL.replace(/\/$/, '')}/api`;

// --- MOCK API IMPLEMENTATION ---

const mockApi = {
  login: async (email: string, pass: string): Promise<User> => {
    await delay(500);
    if (email === 'admin@test.com' && pass === 'password') {
      return mockDb.users.find(u => u.role === Role.ADMIN)!;
    }
    if (email === 'manager@test.com' && pass === 'password') {
      return mockDb.users.find(u => u.role === Role.MANAGER)!;
    }
    if (email === 'tech@test.com' && pass === 'password') {
      return mockDb.users.find(u => u.role === Role.TECHNICIAN)!;
    }
    throw new Error('Invalid credentials');
  },

  getEmployees: async (page = 1, perPage = 10): Promise<PaginatedResponse<Employee>> => {
    await delay(800);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = mockDb.employees.slice(start, end);
    return {
      data: paginatedData,
      meta: {
        total: mockDb.employees.length,
        page,
        perPage,
        pages: Math.ceil(mockDb.employees.length / perPage),
      },
    };
  },

  addEmployee: async (employeeData: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> => {
    await delay(500);
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockDb.employees.unshift(newEmployee);
    return newEmployee;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockDb.employees.findIndex(e => e.id === id);
    if (index > -1) {
        mockDb.employees.splice(index, 1);
    } else {
        throw new Error("Employee not found");
    }
  },

  getBranches: async (page = 1, perPage = 10): Promise<PaginatedResponse<Branch>> => {
      await delay(600);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = mockDb.branches.slice(start, end);
      return {
          data: paginatedData,
          meta: {
              total: mockDb.branches.length,
              page,
              perPage,
              pages: Math.ceil(mockDb.branches.length / perPage),
          },
      };
  },

  addBranch: async (branchData: Omit<Branch, 'id' | 'manager' | 'techCount'>): Promise<Branch> => {
    await delay(500);
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
      manager: null,
      techCount: 0,
    };
    mockDb.branches.unshift(newBranch);
    return newBranch;
  },
  
  deleteBranch: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockDb.branches.findIndex(b => b.id === id);
    if (index > -1) {
        mockDb.branches.splice(index, 1);
    } else {
        throw new Error("Branch not found");
    }
  },

  getServiceAppointments: async (statuses: ServiceAppointmentStatus[], page = 1, perPage = 10): Promise<PaginatedResponse<ServiceAppointment>> => {
      await delay(700);
      const lowerCaseStatuses = statuses.map(s => s.toLowerCase());
      const filtered = mockDb.appointments.service.filter(a => lowerCaseStatuses.includes(a.status.toLowerCase()));
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = filtered.slice(start, end);
      return {
        data: paginatedData,
        meta: {
          total: filtered.length,
          page,
          perPage,
          pages: Math.ceil(filtered.length / perPage),
        },
      };
  },
  
  getRoadsideAppointments: async (statuses: string[], page = 1, perPage = 10): Promise<PaginatedResponse<RoadsideAppointment>> => {
      await delay(650);
      const lowerCaseStatuses = statuses.map(s => s.toLowerCase());
      const filtered = mockDb.appointments.road.filter(a => lowerCaseStatuses.includes(a.status.toLowerCase()));
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = filtered.slice(start, end);
      return {
        data: paginatedData,
        meta: {
          total: filtered.length,
          page,
          perPage,
          pages: Math.ceil(filtered.length / perPage),
        },
      };
  },

  getInvoices: async (page = 1, perPage = 10): Promise<PaginatedResponse<Invoice>> => {
      await delay(500);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = mockDb.invoices.slice(start, end);
      return {
          data: paginatedData,
          meta: {
              total: mockDb.invoices.length,
              page,
              perPage,
              pages: Math.ceil(mockDb.invoices.length / perPage),
          },
      };
  },
  
  updateInvoiceStatus: async (invoiceId: string, status: InvoiceStatus): Promise<Invoice> => {
    await delay(300);
    const invoice = mockDb.invoices.find(i => i.id === invoiceId);
    if (!invoice) {
        throw new Error("Invoice not found");
    }
    invoice.status = status;
    if (status === InvoiceStatus.SENT) {
        if (!invoice.sendHistory) {
            invoice.sendHistory = [];
        }
        invoice.sendHistory.push({ date: new Date().toISOString(), method: 'EMAIL' });
    }
    return {...invoice};
  },

  getCustomers: async (page = 1, perPage = 10): Promise<PaginatedResponse<Customer>> => {
      await delay(400);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = mockDb.customers.slice(start, end);
      return {
          data: paginatedData,
          meta: {
              total: mockDb.customers.length,
              page,
              perPage,
              pages: Math.ceil(mockDb.customers.length / perPage),
          },
      };
  },

  getVehicles: async (page = 1, perPage = 10): Promise<PaginatedResponse<Vehicle>> => {
      await delay(450);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = mockDb.vehicles.slice(start, end);
      return {
          data: paginatedData,
          meta: {
              total: mockDb.vehicles.length,
              page,
              perPage,
              pages: Math.ceil(mockDb.vehicles.length / perPage),
          },
      };
  },

  getTechnicians: async (page = 1, perPage = 10): Promise<PaginatedResponse<Technician>> => {
    await delay(500);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = mockDb.technicians.slice(start, end);
    return {
      data: paginatedData,
      meta: {
        total: mockDb.technicians.length,
        page,
        perPage,
        pages: Math.ceil(mockDb.technicians.length / perPage),
      },
    };
  },

  getTechniciansWithAvailability: async (): Promise<(Technician & { availability?: TechnicianAvailability })[]> => {
    await delay(500);
    return mockDb.technicians.map(tech => ({
        ...tech,
        availability: mockDb.technicianAvailabilities.find(avail => avail.technicianId === tech.id)
    }));
  },

  assignTechnician: async (appointmentId: string, techId: string): Promise<ServiceAppointment> => {
    await delay(1000);
    const appointment = mockDb.appointments.service.find(a => a.id === appointmentId);
    const tech = mockDb.technicians.find(t => t.id === techId);
    if (!appointment || !tech) {
      throw new Error('Appointment or Technician not found');
    }
    appointment.assignedTech = { id: tech.id, name: tech.name };
    appointment.status = ServiceAppointmentStatus.ASSIGNED;
    return { ...appointment };
  },

  getMyAppointments: async(techId: string, status: 'today' | 'upcoming' | 'completed'): Promise<ServiceAppointment[]> => {
    await delay(600);
    // This is a simplified mock. A real API would filter by date/status.
    const user = mockDb.users.find(u => u.id === techId);
    const employee = mockDb.employees.find(e => e.email === user?.email);
    return mockDb.appointments.service.filter(a => a.assignedTech?.name.includes(employee?.firstName || ''));
  },
  
  getServices: async (page = 1, perPage = 10): Promise<PaginatedResponse<Service>> => {
      await delay(400);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = mockDb.services.slice(start, end);
      return {
          data: paginatedData,
          meta: {
              total: mockDb.services.length,
              page,
              perPage,
              pages: Math.ceil(mockDb.services.length / perPage),
          },
      };
  },

  addService: async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
    await delay(500);
    const newService: Service = {
      ...serviceData,
      id: `svc-${Date.now()}`,
    };
    mockDb.services.unshift(newService);
    return newService;
  },

  deleteService: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockDb.services.findIndex(s => s.id === id);
    if (index > -1) {
        mockDb.services.splice(index, 1);
    } else {
        throw new Error("Service not found");
    }
  },

  getProducts: async (page = 1, perPage = 10): Promise<PaginatedResponse<Product>> => {
      await delay(550);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = mockDb.products.slice(start, end);
      return {
          data: paginatedData,
          meta: {
              total: mockDb.products.length,
              page,
              perPage,
              pages: Math.ceil(mockDb.products.length / perPage),
          },
      };
  },

  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await delay(500);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    mockDb.products.unshift(newProduct);
    return newProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockDb.products.findIndex(p => p.id === id);
    if (index > -1) {
        mockDb.products.splice(index, 1);
    } else {
        throw new Error("Product not found");
    }
  },
  
  getAuditLogs: async (page = 1, perPage = 10): Promise<PaginatedResponse<AuditLog>> => {
    await delay(300);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = mockDb.auditLogs.slice(start, end);
    return {
        data: paginatedData,
        meta: {
            total: mockDb.auditLogs.length,
            page,
            perPage,
            pages: Math.ceil(mockDb.auditLogs.length / perPage),
        },
    };
  },

  getServiceAppointmentById: async (id: string): Promise<ServiceAppointment> => {
    await delay(400);
    const appointment = mockDb.appointments.service.find(a => a.id === id);
    if (!appointment) {
        throw new Error('Appointment not found');
    }
    return { ...appointment };
  },

  updateServiceAppointmentStatus: async (id: string, status: ServiceAppointmentStatus): Promise<ServiceAppointment> => {
    await delay(500);
    const appointment = mockDb.appointments.service.find(a => a.id === id);
    if (!appointment) {
        throw new Error('Appointment not found');
    }
    appointment.status = status;
    return { ...appointment };
  },

  getRoadsideAppointmentsForTech: async (techId: string): Promise<RoadsideAppointment[]> => {
    await delay(600);
    const user = mockDb.users.find(u => u.id === techId);
    const employee = mockDb.employees.find(e => e.email === user?.email);
    return mockDb.appointments.road.filter(a => a.assignedTech?.name.includes(employee?.firstName || ''));
  },

  updateRoadsideAppointmentStatus: async (id: string, status: RoadsideAppointmentStatus): Promise<RoadsideAppointment> => {
    await delay(500);
    const appointment = mockDb.appointments.road.find(a => a.id === id);
    if (!appointment) {
        throw new Error('Roadside appointment not found');
    }
    appointment.status = status;
    return { ...appointment };
  },

  activateEmployeeAccount: async () => {
    await delay(300);
  },

};

interface AdminEmployeeDto {
  employee_id: number;
  email: string;
  name: string;
  role: string;
  phone_number?: string | null;
}

const roleTitleMap: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.TECHNICIAN]: 'Technician',
};

const toBackendRole = (role: Role): string => roleTitleMap[role] ?? 'Technician';

const fromBackendRole = (roleLabel?: string): Role => {
  const normalized = roleLabel?.toUpperCase();
  if (normalized && Object.values(Role).includes(normalized as Role)) {
    return normalized as Role;
  }
  return Role.TECHNICIAN;
};

const mapAdminEmployeeDto = (dto: AdminEmployeeDto): AdminEmployee => ({
  id: dto.employee_id,
  name: dto.name,
  email: dto.email,
  role: fromBackendRole(dto.role),
  phoneNumber: dto.phone_number ?? undefined,
});

const assertRealAdminApi = () => {
  if (USE_MOCK) {
    throw new Error('Admin features require the real backend API. Set VITE_USE_MOCK_API=false to continue.');
  }
};

const mapBranchDto = (dto: BranchDto): AdminBranch => ({
  id: dto.branch_id,
  name: dto.name,
  location: dto.location,
  managerId: dto.manager ?? undefined,
  managerName: dto.manager_name ?? undefined,
  managerEmail: dto.manager_email ?? undefined,
});

const mapServiceDto = (dto: ServiceDto): AdminServiceItem => ({
  id: dto.service_id,
  name: dto.name,
  description: dto.description,
  price: typeof dto.price === 'string' ? Number(dto.price) : dto.price,
});

const mapProductDto = (dto: ProductDto): AdminProduct => ({
  id: dto.product_id,
  name: dto.name,
  description: dto.description,
  price: typeof dto.price === 'string' ? Number(dto.price) : dto.price,
  stock: dto.stock,
  imageUrl: dto.image_url ?? undefined,
});

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem('user');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getAccessToken = () => getStoredUser()?.accessToken ?? null;

const adminApiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to perform this action.');
  }
  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response;
};

const realAdminEmployeesApi = {
  getEmployees: async (): Promise<AdminEmployee[]> => {
    const response = await adminApiFetch('/employees/all/', {
      method: 'GET',
    });
    const payload: AdminEmployeeDto[] = await response.json();
    return payload.map(mapAdminEmployeeDto);
  },
  addEmployee: async (input: AdminEmployeeCreateInput): Promise<void> => {
    await adminApiFetch('/employees/create/', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        name: input.name,
        role: toBackendRole(input.role),
        phone_number: input.phoneNumber ?? null,
      }),
    });
  },
  deleteEmployee: async (id: number | string): Promise<void> => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid employee identifier');
    }
    await adminApiFetch(`/employees/${numericId}/delete/`, {
      method: 'DELETE',
    });
  },
};

const realAdminBranchesApi = {
  getBranches: async (): Promise<AdminBranch[]> => {
    const response = await adminApiFetch('/branches/', { method: 'GET' });
    const payload: BranchDto[] = await response.json();
    return payload.map(mapBranchDto);
  },
  addBranch: async (input: AdminBranchCreateInput): Promise<void> => {
    await adminApiFetch('/branches/create/', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        location: input.location,
        manager: input.managerId ?? null,
      }),
    });
  },
  deleteBranch: async (id: number | string): Promise<void> => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid branch identifier');
    }
    await adminApiFetch(`/branches/${numericId}/delete/`, {
      method: 'DELETE',
    });
  },
};

const realAdminServicesApi = {
  getServices: async (): Promise<AdminServiceItem[]> => {
    const response = await adminApiFetch('/services/', { method: 'GET' });
    const payload: ServiceDto[] = await response.json();
    return payload.map(mapServiceDto);
  },
  addService: async (input: AdminServiceCreateInput): Promise<void> => {
    await adminApiFetch('/services/create/', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        price: input.price,
      }),
    });
  },
  deleteService: async (id: number | string): Promise<void> => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid service identifier');
    }
    await adminApiFetch(`/services/${numericId}/delete/`, {
      method: 'DELETE',
    });
  },
};

const realAdminProductsApi = {
  getProducts: async (): Promise<AdminProduct[]> => {
    const response = await adminApiFetch('/products/', { method: 'GET' });
    const payload: ProductDto[] = await response.json();
    return payload.map(mapProductDto);
  },
  addProduct: async (input: AdminProductCreateInput): Promise<void> => {
    const formData = new FormData();
    formData.append('name', input.name);
    formData.append('description', input.description);
    formData.append('price', String(input.price));
    formData.append('stock', String(input.stock));
    if (input.imageFile) {
      formData.append('image', input.imageFile);
    }
    await adminApiFetch('/products/create/', {
      method: 'POST',
      body: formData,
    });
  },
  deleteProduct: async (id: number | string): Promise<void> => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid product identifier');
    }
    await adminApiFetch(`/products/${numericId}/delete/`, {
      method: 'DELETE',
    });
  },
};

interface EmployeeProfileResponseDto {
  id?: number;
  employeeId?: number;
  email?: string;
  role?: string;
  activatedAt?: string;
}

interface EmployeeAuthResponseDto {
  employee: EmployeeProfileResponseDto;
  accessToken?: string;
  expiresIn?: number;
  realm?: string;
  roles?: string[];
}

interface BranchDto {
  branch_id: number;
  name: string;
  location: string;
  manager: number | null;
  manager_name?: string | null;
  manager_email?: string | null;
}

interface ServiceDto {
  service_id: number;
  name: string;
  description: string;
  price: string | number;
}

interface ProductDto {
  product_id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  image_url?: string | null;
}

const normalizeRole = (role?: string): Role => {
  const normalized = role?.toUpperCase();
  if (normalized && Object.values(Role).includes(normalized as Role)) {
    return normalized as Role;
  }
  return Role.TECHNICIAN;
};

const mapEmployeeAuthToUser = (payload: EmployeeAuthResponseDto): User => {
  if (!payload?.employee?.email) {
    throw new Error('Malformed login response from authentication service');
  }

  const { employee } = payload;
  const firstName = employee.email.split('@')[0] || 'User';
  const expiresAt = payload.expiresIn ? Date.now() + payload.expiresIn * 1000 : undefined;

  return {
    id: String(employee.employeeId ?? employee.id ?? employee.email),
    firstName,
    lastName: '',
    email: employee.email,
    role: normalizeRole(employee.role),
    branches: [],
    accessToken: payload.accessToken,
    tokenExpiresAt: expiresAt,
  };
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (typeof data === 'string') {
      return data;
    }
    return data?.message || data?.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

// --- REAL API IMPLEMENTATION ---
const realApi = {
    ...mockApi,
    login: async (email: string, pass: string): Promise<User> => {
      const response = await fetch(`${AUTH_API_BASE}/api/employees/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password: pass }),
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      const payload: EmployeeAuthResponseDto = await response.json();
      return mapEmployeeAuthToUser(payload);
    },

    activateEmployeeAccount: async (inviteToken: string, password: string): Promise<void> => {
      const response = await fetch(`${AUTH_API_BASE}/api/employees/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteToken, password }),
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }
    },
};


// --- EXPORTED SERVICES ---
const api = USE_MOCK ? mockApi : realApi;

export const authService = {
  login: api.login,
  activateEmployeeAccount: api.activateEmployeeAccount,
};

export const adminService = {
  getEmployees: async (): Promise<AdminEmployee[]> => {
    assertRealAdminApi();
    return realAdminEmployeesApi.getEmployees();
  },
  addEmployee: async (input: AdminEmployeeCreateInput): Promise<void> => {
    assertRealAdminApi();
    return realAdminEmployeesApi.addEmployee(input);
  },
  deleteEmployee: async (id: number | string): Promise<void> => {
    assertRealAdminApi();
    return realAdminEmployeesApi.deleteEmployee(id);
  },
  getBranches: async (): Promise<AdminBranch[]> => {
    assertRealAdminApi();
    return realAdminBranchesApi.getBranches();
  },
  addBranch: async (input: AdminBranchCreateInput): Promise<void> => {
    assertRealAdminApi();
    return realAdminBranchesApi.addBranch(input);
  },
  deleteBranch: async (id: number | string): Promise<void> => {
    assertRealAdminApi();
    return realAdminBranchesApi.deleteBranch(id);
  },
  getServices: async (): Promise<AdminServiceItem[]> => {
    assertRealAdminApi();
    return realAdminServicesApi.getServices();
  },
  addService: async (input: AdminServiceCreateInput): Promise<void> => {
    assertRealAdminApi();
    return realAdminServicesApi.addService(input);
  },
  deleteService: async (id: number | string): Promise<void> => {
    assertRealAdminApi();
    return realAdminServicesApi.deleteService(id);
  },
  getProducts: async (): Promise<AdminProduct[]> => {
    assertRealAdminApi();
    return realAdminProductsApi.getProducts();
  },
  addProduct: async (input: AdminProductCreateInput): Promise<void> => {
    assertRealAdminApi();
    return realAdminProductsApi.addProduct(input);
  },
  deleteProduct: async (id: number | string): Promise<void> => {
    assertRealAdminApi();
    return realAdminProductsApi.deleteProduct(id);
  },
  getAuditLogs: api.getAuditLogs,
};

export const managerService = {
    getServiceAppointments: api.getServiceAppointments,
    getRoadsideAppointments: api.getRoadsideAppointments,
    getInvoices: api.getInvoices,
    updateInvoiceStatus: api.updateInvoiceStatus,
    getCustomers: api.getCustomers,
    getVehicles: api.getVehicles,
    getTechnicians: api.getTechnicians,
    getTechniciansWithAvailability: api.getTechniciansWithAvailability,
    assignTechnician: api.assignTechnician,
};

export const technicianService = {
    getMyAppointments: api.getMyAppointments,
    getServiceAppointmentById: api.getServiceAppointmentById,
    updateServiceAppointmentStatus: api.updateServiceAppointmentStatus,
    getRoadsideAppointments: api.getRoadsideAppointmentsForTech,
    updateRoadsideAppointmentStatus: api.updateRoadsideAppointmentStatus,
};
