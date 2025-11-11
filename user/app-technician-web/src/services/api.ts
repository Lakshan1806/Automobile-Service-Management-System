import { mockDb, delay } from "../mocks/data";
import {
  User,
  Role,
  Employee,
  AdminEmployee,
  AdminEmployeeCreateInput,
  AdminBranch,
  AdminBranchCreateInput,
  AdminServiceCreateInput,
  AdminServiceItem,
  AdminProduct,
  AdminProductCreateInput,
  PaginatedResponse,
  ServiceAppointment,
  Technician,
  Branch,
  ServiceAppointmentStatus,
  Service,
  Product,
  AuditLog,
  RoadsideAppointment,
  Invoice,
  Customer,
  Vehicle,
  RoadsideAppointmentStatus,
  InvoiceStatus,
  TechnicianAvailability,
  AppointmentType,
  TechnicianStatus,
  TechnicianAppointedWork,
  TechnicianRoadAssistAssignment,
} from "../types";

const USE_MOCK = (import.meta.env?.VITE_USE_MOCK_API ?? "false") === "true"; // Default to real auth unless explicitly mocked
const AUTH_API_BASE_URL =
  (import.meta.env?.VITE_AUTH_API_URL as string | undefined) ||
  "http://localhost:9000";
const AUTH_API_BASE = AUTH_API_BASE_URL.replace(/\/$/, "");
const ADMIN_API_BASE_URL =
  (import.meta.env?.VITE_ADMIN_API_URL as string | undefined) ||
  "http://localhost:8000";
const ADMIN_API_BASE = `${ADMIN_API_BASE_URL.replace(/\/$/, "")}/api`;
const MANAGER_API_BASE_URL =
  (import.meta.env?.VITE_MANAGER_API_URL as string | undefined) ||
  "http://localhost:3002";
const MANAGER_API_BASE = `${MANAGER_API_BASE_URL.replace(/\/$/, "")}/api`;

// --- MOCK API IMPLEMENTATION ---

const mockApi = {
  login: async (email: string, pass: string): Promise<User> => {
    await delay(500);
    if (email === "admin@test.com" && pass === "password") {
      return mockDb.users.find((u) => u.role === Role.ADMIN)!;
    }
    if (email === "manager@test.com" && pass === "password") {
      return mockDb.users.find((u) => u.role === Role.MANAGER)!;
    }
    if (email === "tech@test.com" && pass === "password") {
      return mockDb.users.find((u) => u.role === Role.TECHNICIAN)!;
    }
    throw new Error("Invalid credentials");
  },

  getEmployees: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Employee>> => {
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

  addEmployee: async (
    employeeData: Omit<Employee, "id" | "createdAt">
  ): Promise<Employee> => {
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
    const index = mockDb.employees.findIndex((e) => e.id === id);
    if (index > -1) {
      mockDb.employees.splice(index, 1);
    } else {
      throw new Error("Employee not found");
    }
  },

  getBranches: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Branch>> => {
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

  addBranch: async (
    branchData: Omit<Branch, "id" | "manager" | "techCount">
  ): Promise<Branch> => {
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
    const index = mockDb.branches.findIndex((b) => b.id === id);
    if (index > -1) {
      mockDb.branches.splice(index, 1);
    } else {
      throw new Error("Branch not found");
    }
  },

  getServiceAppointments: async (
    statuses: ServiceAppointmentStatus[],
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<ServiceAppointment>> => {
    await delay(700);
    const lowerCaseStatuses = statuses.map((s) => s.toLowerCase());
    const filtered = mockDb.appointments.service.filter((a) =>
      lowerCaseStatuses.includes(a.status.toLowerCase())
    );
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

  getRoadsideAppointments: async (
    statuses: string[],
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<RoadsideAppointment>> => {
    await delay(650);
    const lowerCaseStatuses = statuses.map((s) => s.toLowerCase());
    const filtered = mockDb.appointments.road.filter((a) =>
      lowerCaseStatuses.includes(a.status.toLowerCase())
    );
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

  getInvoices: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Invoice>> => {
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

  updateInvoiceStatus: async (
    invoiceId: string,
    status: InvoiceStatus
  ): Promise<Invoice> => {
    await delay(300);
    const invoice = mockDb.invoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    invoice.status = status;
    if (status === InvoiceStatus.SENT) {
      if (!invoice.sendHistory) {
        invoice.sendHistory = [];
      }
      invoice.sendHistory.push({
        date: new Date().toISOString(),
        method: "EMAIL",
      });
    }
    return { ...invoice };
  },

  getCustomers: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Customer>> => {
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

  getVehicles: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Vehicle>> => {
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

  getTechnicians: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Technician>> => {
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

  getTechniciansWithAvailability: async (): Promise<
    (Technician & { availability?: TechnicianAvailability })[]
  > => {
    await delay(500);
    return mockDb.technicians.map((tech) => ({
      ...tech,
      availability: mockDb.technicianAvailabilities.find(
        (avail) => avail.technicianId === tech.id
      ),
    }));
  },

  assignTechnician: async (
    appointmentId: string,
    techId: string
  ): Promise<ServiceAppointment> => {
    await delay(1000);
    const appointment = mockDb.appointments.service.find(
      (a) => a.id === appointmentId
    );
    const tech = mockDb.technicians.find((t) => t.id === techId);
    if (!appointment || !tech) {
      throw new Error("Appointment or Technician not found");
    }
    appointment.assignedTech = { id: tech.id, name: tech.name };
    appointment.status = ServiceAppointmentStatus.ASSIGNED;
    return { ...appointment };
  },
  assignRoadsideTechnician: async (
    ticketNo: string,
    techId: string
  ): Promise<RoadsideAppointment> => {
    await delay(600);
    const roadAppt = mockDb.appointments.road.find(
      (a) => a.ticketNo === ticketNo || a.id === ticketNo
    );
    const tech = mockDb.technicians.find((t) => t.id === techId);
    if (!roadAppt || !tech) {
      throw new Error("Roadside appointment or Technician not found");
    }
    roadAppt.assignedTech = { id: tech.id, name: tech.name };
    roadAppt.status = RoadsideAppointmentStatus.ASSIGNED;
    tech.roadAssistAssignments = tech.roadAssistAssignments || [];
    tech.roadAssistAssignments.push({
      roadAssistId: roadAppt.ticketNo,
      assignedAt: new Date().toISOString(),
      status: "ASSIGNED",
    });
    return { ...roadAppt };
  },

  getMyAppointments: async (
    techId: string,
    _status: "today" | "upcoming" | "completed"
  ): Promise<ServiceAppointment[]> => {
    await delay(600);
    // This is a simplified mock. A real API would filter by date/status.
    const user = mockDb.users.find((u) => u.id === techId);
    const employee = mockDb.employees.find((e) => e.email === user?.email);
    return mockDb.appointments.service.filter((a) =>
      a.assignedTech?.name.includes(employee?.firstName || "")
    );
  },

  getServices: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Service>> => {
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

  addService: async (serviceData: Omit<Service, "id">): Promise<Service> => {
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
    const index = mockDb.services.findIndex((s) => s.id === id);
    if (index > -1) {
      mockDb.services.splice(index, 1);
    } else {
      throw new Error("Service not found");
    }
  },

  getProducts: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Product>> => {
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

  addProduct: async (productData: Omit<Product, "id">): Promise<Product> => {
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
    const index = mockDb.products.findIndex((p) => p.id === id);
    if (index > -1) {
      mockDb.products.splice(index, 1);
    } else {
      throw new Error("Product not found");
    }
  },

  getAuditLogs: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<AuditLog>> => {
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

  getServiceAppointmentById: async (
    id: string
  ): Promise<ServiceAppointment> => {
    await delay(400);
    const appointment = mockDb.appointments.service.find((a) => a.id === id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    return { ...appointment };
  },

  updateServiceAppointmentStatus: async (
    id: string,
    status: ServiceAppointmentStatus
  ): Promise<ServiceAppointment> => {
    await delay(500);
    const appointment = mockDb.appointments.service.find((a) => a.id === id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    appointment.status = status;
    return { ...appointment };
  },

  getRoadsideAppointmentsForTech: async (
    techId: string
  ): Promise<RoadsideAppointment[]> => {
    await delay(600);
    const user = mockDb.users.find((u) => u.id === techId);
    const employee = mockDb.employees.find((e) => e.email === user?.email);
    return mockDb.appointments.road.filter((a) =>
      a.assignedTech?.name.includes(employee?.firstName || "")
    );
  },

  updateRoadsideAppointmentStatus: async (
    id: string,
    status: RoadsideAppointmentStatus
  ): Promise<RoadsideAppointment> => {
    await delay(500);
    const appointment = mockDb.appointments.road.find((a) => a.id === id);
    if (!appointment) {
      throw new Error("Roadside appointment not found");
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
  [Role.ADMIN]: "Admin",
  [Role.MANAGER]: "Manager",
  [Role.TECHNICIAN]: "Technician",
};

const toBackendRole = (role: Role): string =>
  roleTitleMap[role] ?? "Technician";

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
    throw new Error(
      "Admin features require the real backend API. Set VITE_USE_MOCK_API=false to continue."
    );
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
  price: typeof dto.price === "string" ? Number(dto.price) : dto.price,
});

const mapProductDto = (dto: ProductDto): AdminProduct => ({
  id: dto.product_id,
  name: dto.name,
  description: dto.description,
  price: typeof dto.price === "string" ? Number(dto.price) : dto.price,
  stock: dto.stock,
  imageUrl: dto.image_url ?? undefined,
});

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem("user");
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
    throw new Error("You must be logged in to perform this action.");
  }
  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

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
    const response = await adminApiFetch("/employees/all/", {
      method: "GET",
    });
    const payload: AdminEmployeeDto[] = await response.json();
    return payload.map(mapAdminEmployeeDto);
  },
  addEmployee: async (input: AdminEmployeeCreateInput): Promise<void> => {
    await adminApiFetch("/employees/create/", {
      method: "POST",
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
      throw new Error("Invalid employee identifier");
    }
    await adminApiFetch(`/employees/${numericId}/delete/`, {
      method: "DELETE",
    });
  },
};

const realAdminBranchesApi = {
  getBranches: async (): Promise<AdminBranch[]> => {
    const response = await adminApiFetch("/branches/", { method: "GET" });
    const payload: BranchDto[] = await response.json();
    return payload.map(mapBranchDto);
  },
  addBranch: async (input: AdminBranchCreateInput): Promise<void> => {
    await adminApiFetch("/branches/create/", {
      method: "POST",
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
      throw new Error("Invalid branch identifier");
    }
    await adminApiFetch(`/branches/${numericId}/delete/`, {
      method: "DELETE",
    });
  },
};

const realAdminServicesApi = {
  getServices: async (): Promise<AdminServiceItem[]> => {
    const response = await adminApiFetch("/services/", { method: "GET" });
    const payload: ServiceDto[] = await response.json();
    return payload.map(mapServiceDto);
  },
  addService: async (input: AdminServiceCreateInput): Promise<void> => {
    await adminApiFetch("/services/create/", {
      method: "POST",
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
      throw new Error("Invalid service identifier");
    }
    await adminApiFetch(`/services/${numericId}/delete/`, {
      method: "DELETE",
    });
  },
};

const realAdminProductsApi = {
  getProducts: async (): Promise<AdminProduct[]> => {
    const response = await adminApiFetch("/products/", { method: "GET" });
    const payload: ProductDto[] = await response.json();
    return payload.map(mapProductDto);
  },
  addProduct: async (input: AdminProductCreateInput): Promise<void> => {
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("price", String(input.price));
    formData.append("stock", String(input.stock));
    if (input.imageFile) {
      formData.append("image", input.imageFile);
    }
    await adminApiFetch("/products/create/", {
      method: "POST",
      body: formData,
    });
  },
  deleteProduct: async (id: number | string): Promise<void> => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new Error("Invalid product identifier");
    }
    await adminApiFetch(`/products/${numericId}/delete/`, {
      method: "DELETE",
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
  const employee = payload?.employee;
  const email = employee?.email;
  if (!email) {
    throw new Error("Malformed login response from authentication service");
  }

  const firstName = email.split("@")[0] || "User";
  const expiresAt = payload.expiresIn
    ? Date.now() + payload.expiresIn * 1000
    : undefined;

  return {
    id: String(employee?.employeeId ?? employee?.id ?? email),
    firstName,
    lastName: "",
    email,
    role: normalizeRole(employee?.role),
    branches: [],
    accessToken: payload.accessToken,
    tokenExpiresAt: expiresAt,
  };
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (typeof data === "string") {
      return data;
    }
    return (
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

// --- REAL API HELPERS ---
const paginateResponse = <T>(
  items: T[],
  page = 1,
  perPage = 10
): PaginatedResponse<T> => {
  const total = items.length;
  const pages = total === 0 ? 0 : Math.max(1, Math.ceil(total / perPage));
  const currentPage = pages === 0 ? 0 : Math.min(Math.max(page, 1), pages);
  const start = pages === 0 ? 0 : (currentPage - 1) * perPage;
  const data = pages === 0 ? [] : items.slice(start, start + perPage);

  return {
    data,
    meta: {
      total,
      page: currentPage,
      perPage,
      pages,
    },
  };
};

const normalizeDate = (value?: string | number | Date): string => {
  const parsed = value ? new Date(value) : new Date();
  return isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
};

const normalizeDateOrNull = (value?: string | number | Date): string | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const mapAppointmentStatusFromApi = (
  status?: string
): ServiceAppointmentStatus => {
  switch ((status || "").toLowerCase()) {
    case "scheduled":
      return ServiceAppointmentStatus.ASSIGNED;
    case "inprocess":
    case "in-progress":
      return ServiceAppointmentStatus.IN_PROGRESS;
    case "finished":
    case "completed":
      return ServiceAppointmentStatus.COMPLETED;
    default:
      return ServiceAppointmentStatus.NEW;
  }
};

const mapTechnicianStatusFromApi = (status?: string): TechnicianStatus => {
  switch ((status || "").toLowerCase()) {
    case "busy":
    case "scheduled":
    case "inprocess":
      return TechnicianStatus.BUSY;
    case "inactive":
      return TechnicianStatus.OFF;
    default:
      return TechnicianStatus.AVAILABLE;
  }
};

const mapRoadsideStatusFromApi = (
  status?: string
): RoadsideAppointmentStatus => {
  switch ((status || "").toLowerCase()) {
    case "in-progress":
    case "assigned":
      return RoadsideAppointmentStatus.ASSIGNED;
    case "completed":
      return RoadsideAppointmentStatus.COMPLETED;
    default:
      return RoadsideAppointmentStatus.NEW;
  }
};

const createDefaultCustomer = (raw: any) => ({
  id: raw?.customerId || raw?.customer_id || "unknown",
  name: raw?.customerName || raw?.customer_name || "Customer",
  phone: raw?.customerPhone || "",
  email: raw?.customerEmail || "",
  address: {
    street: raw?.customerAddress || "",
    city: raw?.customerCity || "",
    postal: raw?.customerPostal || "",
  },
  preferredContactMethod: "PHONE" as const,
  visitCount: 0,
  outstandingBalance: 0,
});

const createDefaultVehicle = (raw: any) => ({
  id: raw?.vehicleId || raw?.vehicleNo || raw?._id || `veh-${Date.now()}`,
  make: raw?.brand || raw?.vehicleMake || "Vehicle",
  model: raw?.model || raw?.vehicleModel || raw?.type || "Model",
  year: Number(raw?.vehicleYear) || new Date().getFullYear(),
  plate: raw?.vehicleNo || "",
  vin: raw?.chaseNo || "",
  mileage: Number(raw?.millage) || 0,
  customerId: raw?.customerId || "unknown",
  fuelType: raw?.fuelType || "Gasoline",
  transmission: raw?.transmission || "Automatic",
});

const mapServiceAppointmentFromApi = (raw: any): ServiceAppointment => {
  const id = raw?._id?.toString() || raw?.appointmentId || `appt-${Date.now()}`;
  const preferredTime =
    raw?.suggested_started_date || raw?.startDate || raw?.createdAt;
  const plannedStart = normalizeDateOrNull(
    raw?.manual_starting_date || raw?.suggested_started_date || raw?.startDate
  );
  const plannedEndSource = normalizeDateOrNull(
    raw?.suggested_completed_date || raw?.endDate
  );
  const durationFromApi = Number(raw?.predicted_duration_date);
  const durationDays =
    Number.isFinite(durationFromApi) && durationFromApi > 0
      ? durationFromApi
      : plannedStart && plannedEndSource
      ? Math.max(
          1,
          Math.ceil(
            (new Date(plannedEndSource).getTime() -
              new Date(plannedStart).getTime()) /
              DAY_IN_MS
          )
        )
      : 1;
  const fallbackEnd =
    plannedStart !== null
      ? new Date(
          new Date(plannedStart).getTime() + durationDays * DAY_IN_MS
        ).toISOString()
      : null;
  const plannedEnd = plannedEndSource || fallbackEnd;

  return {
    id,
    ticketNo: raw?.appointmentId || raw?.vehicleNo || id,
    type: AppointmentType.SERVICE,
    branchId: raw?.branchId || "main",
    customer: createDefaultCustomer(raw),
    vehicle: createDefaultVehicle(raw),
    requestedServices: raw?.repair ? [{ id: "repair", name: raw.repair }] : [],
    preferredTime: normalizeDate(preferredTime),
    plannedStart,
    plannedEnd,
    durationDays,
    assignedTech: raw?.technicianId
      ? { id: raw.technicianId, name: raw.technicianName || raw.technicianId }
      : null,
    status: mapAppointmentStatusFromApi(raw?.status),
    notes: raw?.description || "",
    createdAt: normalizeDate(raw?.createdAt),
  };
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const isSameCalendarDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const formatDateRangeLabel = (start: Date, end: Date): string => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const startLabel = formatter.format(start);
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay ? startLabel : `${startLabel} - ${formatter.format(end)}`;
};

const mapAppointedWorksFromApi = (raw: any): TechnicianAppointedWork[] => {
  const tasks: any[] = raw?.assignedTasks || [];

  return tasks
    .map((task) => {
      if (!task?.startDate) {
        return null;
      }

      const startDate = new Date(task.startDate);
      if (Number.isNaN(startDate.getTime())) {
        return null;
      }

      const explicitDuration = Number(task.workDuration);
      const normalizedDuration =
        Number.isFinite(explicitDuration) && explicitDuration > 0
          ? explicitDuration
          : Math.max(
              1,
              Math.round(
                (new Date(task.endDate || task.startDate).getTime() -
                  startDate.getTime()) /
                  DAY_IN_MS || 1
              )
            );

      const endDate = task.endDate
        ? new Date(task.endDate)
        : new Date(startDate.getTime() + normalizedDuration * DAY_IN_MS);

      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: normalizedDuration,
        label: formatDateRangeLabel(startDate, endDate),
      } as TechnicianAppointedWork;
    })
    .filter((work): work is TechnicianAppointedWork => Boolean(work))
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
};

const mapRoadAssistAssignmentsFromApi = (
  raw: any
): TechnicianRoadAssistAssignment[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((assignment) => {
      const assignedAtDate = assignment?.assignedAt
        ? new Date(assignment.assignedAt)
        : null;
      const assignedAt =
        assignedAtDate && !Number.isNaN(assignedAtDate.getTime())
          ? assignedAtDate.toISOString()
          : new Date().toISOString();
      const roadAssistId =
        assignment?.roadAssistId ||
        assignment?.customId ||
        assignment?._id ||
        assignment?.id ||
        `roadassist-${Date.now()}`;

      return {
        roadAssistId,
        assignedAt,
        status: assignment?.status,
      } as TechnicianRoadAssistAssignment;
    })
    .filter((assignment) => Boolean(assignment.roadAssistId));
};

const countRoadAssistAssignmentsOnDay = (
  assignments: TechnicianRoadAssistAssignment[],
  day: Date
): number => {
  if (!assignments?.length) {
    return 0;
  }

  return assignments.reduce((count, assignment) => {
    const assignedAt = new Date(assignment.assignedAt);
    if (
      !Number.isNaN(assignedAt.getTime()) &&
      isSameCalendarDay(assignedAt, day)
    ) {
      return count + 1;
    }
    return count;
  }, 0);
};

const hasWorkScheduledToday = (
  works: TechnicianAppointedWork[]
): {
  isBusyToday: boolean;
  todaysCount: number;
} => {
  if (!works.length) {
    return { isBusyToday: false, todaysCount: 0 };
  }

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getTime() + DAY_IN_MS);

  let todaysCount = 0;
  const isBusyToday = works.some((work) => {
    const start = new Date(work.startDate);
    const end = new Date(work.endDate);

    const overlaps =
      start.getTime() < dayEnd.getTime() && end.getTime() > dayStart.getTime();

    if (overlaps) {
      todaysCount += 1;
    }

    return overlaps;
  });

  return { isBusyToday, todaysCount };
};

const mapTechnicianFromApi = (raw: any): Technician => {
  const id = raw?.technicianId || raw?._id || `tech-${Date.now()}`;
  const name = raw?.technicianName || "Technician";
  const activeTasks =
    raw?.assignedTasks?.filter((task: any) => task?.status !== "completed") ||
    [];
  const appointedWorks = mapAppointedWorksFromApi(raw);
  const roadAssistAssignments = mapRoadAssistAssignmentsFromApi(
    raw?.roadAssistAssignments
  );
  const { isBusyToday, todaysCount } = hasWorkScheduledToday(appointedWorks);
  const todaysRoadAssistCount = countRoadAssistAssignmentsOnDay(
    roadAssistAssignments,
    new Date()
  );
  const baseStatus = mapTechnicianStatusFromApi(
    raw?.status || (activeTasks.length > 0 ? "busy" : "available")
  );
  const status =
    baseStatus === TechnicianStatus.OFF
      ? TechnicianStatus.OFF
      : isBusyToday || todaysRoadAssistCount > 0
      ? TechnicianStatus.BUSY
      : TechnicianStatus.AVAILABLE;
  const todaysServiceLoad = todaysCount || activeTasks.length;

  return {
    id,
    name,
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random`,
    skills: raw?.skills || [],
    status,
    todayLoad: todaysServiceLoad + todaysRoadAssistCount,
    appointedWorks,
    roadAssistAssignments,
    certifications: raw?.certifications || [],
  };
};

const mapRoadsideAppointmentFromApi = (raw: any): RoadsideAppointment => ({
  id: raw?._id?.toString() || raw?.customId || `road-${Date.now()}`,
  ticketNo: raw?.customId || raw?._id?.toString() || "N/A",
  type: AppointmentType.ROAD,
  location: {
    lat: Number(raw?.latitude) || 0,
    lng: Number(raw?.longitude) || 0,
    address: raw?.currentLocation || "Unknown location",
  },
  issueType: raw?.description || raw?.serviceType || "Roadside assistance",
  customer: createDefaultCustomer({
    customerId: raw?.customerId,
    customerName: raw?.customerName,
    customerPhone: raw?.customerPhone,
  }),
  vehicle: createDefaultVehicle({
    vehicleId: raw?.vehicleId,
    vehicleNo: raw?.vehicleNo,
    brand: raw?.brand,
    model: raw?.model,
  }),
  assignedTech: raw?.assignedTechnician
    ? {
        id: raw.assignedTechnician,
        name: raw.assignedTechnicianName || raw.assignedTechnician,
      }
    : null,
  status: mapRoadsideStatusFromApi(raw?.status),
  photos: [],
  createdAt: normalizeDate(raw?.createdAt),
});

const fetchManagerApi = async <T>(
  path: string,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(`${MANAGER_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json() as Promise<T>;
};

// --- REAL API IMPLEMENTATION ---
const realApi = {
  ...mockApi,
  login: async (email: string, pass: string): Promise<User> => {
    const response = await fetch(`${AUTH_API_BASE}/api/employees/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password: pass }),
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }

    const payload: EmployeeAuthResponseDto = await response.json();
    return mapEmployeeAuthToUser(payload);
  },

  activateEmployeeAccount: async (
    inviteToken: string,
    password: string
  ): Promise<void> => {
    const response = await fetch(`${AUTH_API_BASE}/api/employees/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteToken, password }),
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }
  },
  getServiceAppointments: async (
    statuses: ServiceAppointmentStatus[],
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<ServiceAppointment>> => {
    const payload = await fetchManagerApi<{ success: boolean; data: any[] }>(
      "/appointments"
    );
    const mapped = (payload.data || []).map(mapServiceAppointmentFromApi);
    const filtered = statuses?.length
      ? mapped.filter((appt) => statuses.includes(appt.status))
      : mapped;
    return paginateResponse(filtered, page, perPage);
  },
  assignTechnician: async (
    appointmentId: string,
    technicianId: string
  ): Promise<ServiceAppointment> => {
    await fetchManagerApi<{ success: boolean }>("/appointments/assign", {
      method: "POST",
      body: JSON.stringify({ appointmentId, technicianId }),
    });
    const refreshed = await fetchManagerApi<{ success: boolean; data: any[] }>(
      "/appointments"
    );
    const updated = (refreshed.data || []).find(
      (appt: any) =>
        appt?._id?.toString() === appointmentId ||
        appt?.appointmentId === appointmentId
    );
    return updated
      ? mapServiceAppointmentFromApi(updated)
      : mapServiceAppointmentFromApi({ _id: appointmentId, technicianId });
  },
  assignRoadsideTechnician: async (
    customId: string,
    technicianId: string
  ): Promise<RoadsideAppointment> => {
    await fetchManagerApi<{ success: boolean }>(
      `/roadassists/by-custom-id/${encodeURIComponent(
        customId
      )}/assign-technician`,
      {
        method: "PUT",
        body: JSON.stringify({ technicianId }),
      }
    );
    const refreshed = await fetchManagerApi<{ success: boolean; data: any[] }>(
      "/roadassists"
    );
    const updated = (refreshed.data || []).find(
      (appt: any) =>
        appt?.customId === customId ||
        appt?.custom_id === customId ||
        appt?.ticketNo === customId
    );
    return updated
      ? mapRoadsideAppointmentFromApi(updated)
      : mapRoadsideAppointmentFromApi({
          customId,
          assignedTechnician: technicianId,
        });
  },
  getTechnicians: async (
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<Technician>> => {
    const payload = await fetchManagerApi<{ success: boolean; data: any[] }>(
      "/technicians"
    );
    const mapped = (payload.data || []).map(mapTechnicianFromApi);
    return paginateResponse(mapped, page, perPage);
  },
  getTechniciansWithAvailability: async (): Promise<
    (Technician & { availability?: TechnicianAvailability })[]
  > => {
    const payload = await fetchManagerApi<{ success: boolean; data: any[] }>(
      "/technicians"
    );
    return (payload.data || []).map(mapTechnicianFromApi);
  },
  getRoadsideAppointments: async (
    statuses: RoadsideAppointmentStatus[],
    page = 1,
    perPage = 10
  ): Promise<PaginatedResponse<RoadsideAppointment>> => {
    const payload = await fetchManagerApi<{ success: boolean; data: any[] }>(
      "/roadassists"
    );
    const mapped = (payload.data || []).map(mapRoadsideAppointmentFromApi);
    const filtered = statuses?.length
      ? mapped.filter((appt) => statuses.includes(appt.status))
      : mapped;
    return paginateResponse(filtered, page, perPage);
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
  assignRoadsideTechnician: api.assignRoadsideTechnician,
};

export const technicianService = {
  getMyAppointments: api.getMyAppointments,
  getServiceAppointmentById: api.getServiceAppointmentById,
  updateServiceAppointmentStatus: api.updateServiceAppointmentStatus,
  getRoadsideAppointments: api.getRoadsideAppointmentsForTech,
  updateRoadsideAppointmentStatus: api.updateRoadsideAppointmentStatus,
};
