# Customer Service API

.NET 8 microservice for managing customer profiles and vehicles in the Automobile Service Management System.

## Overview

This service handles:
- Customer profile management (synchronized with Authentication Service)
- Vehicle registration and management
- Vehicle data retrieval for appointments
- Cross-service data integration using AuthUserId from Spring Boot Authentication Service

## Architecture

### Data Model

- **Customer**: Stores customer information keyed by `AuthUserId` (from Auth Service)
  - `AuthUserId` (long): Primary identifier from authentication-service
  - `Email`, `Name`, `Phone`: Customer details
  - One-to-many relationship with Vehicles

- **Vehicle**: Stores vehicle information
  - Linked to Customer via foreign key
  - Fields: NoPlate, VehicleModel, VehicleBrand, VehicleType, ChaseNo, Millage, etc.

### Authentication Flow

The service accepts user identity via two methods:

1. **JWT Bearer Token** (from Authorization header)
   - Extracts `sub` claim as `AuthUserId`
   - Example: `Authorization: Bearer <JWT>`

2. **Gateway Header** (X-Auth-User-Id)
   - Direct AuthUserId passed by API Gateway
   - Example: `X-Auth-User-Id: 123`

## API Endpoints

### Get Customer Vehicles

Retrieve all vehicles owned by a customer.

```http
GET /api/customers/{customerId}/vehicles
```

**Parameters:**
- `customerId` (path, required): The AuthUserId from authentication-service

**Response:** `200 OK`
```json
[
  {
    "vehicleId": "v-uuid-12345",
    "noPlate": "CP  ABC-123",
    "vehicleBrand": "Toyota",
    "vehicleModel": "Corolla"
  },
  {
    "vehicleId": "v-uuid-67890",
    "noPlate": "WP XYZ-789",
    "vehicleBrand": "Honda",
    "vehicleModel": "Civic"
  }
]
```

**Error Responses:**
- `404 Not Found`: Customer has no vehicles

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/customers/1/vehicles" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get Vehicle Appointment Details

Retrieve combined vehicle and customer information for appointment scheduling.

```http
GET /api/vehicles/{vehicleId}/appointment-details
```

**Parameters:**
- `vehicleId` (path, required): The unique vehicle identifier

**Response:** `200 OK`
```json
{
  "vehicleId": "v-uuid-12345",
  "noPlate": "CP  ABC-123",
  "chaseNo": "JT123456789",
  "vehicleType": "Car",
  "vehicleBrand": "Toyota",
  "customerId": "1",
  "customerPhone": "+947052333414",
  "customerName": "Nivethan Rajendran",
  "millage": 75000,
  "lastServiceDate": "2025-01-15",
  "vehicleModelYear": 2018,
  "vehicleRegistrationYear": 2018
}
```

**Error Responses:**
- `404 Not Found`: Vehicle not found

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/vehicles/v-uuid-12345/appointment-details"
```

## Configuration

### Environment Variables

Add these to `appsettings.json` or `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CustomerServiceDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Authentication": {
    "UseJwtValidation": true,
    "AuthServiceUrl": "http://localhost:8080"
  }
}
```

### Database Setup

1. **Update Connection String** in `appsettings.json`

2. **Apply Migrations:**
   ```powershell
   dotnet ef database update
   ```

3. **Verify Tables:**
   - Customers (with unique index on AuthUserId)
   - Vehicles (with FK to Customers)

## Running the Service

### Prerequisites

- .NET 8 SDK
- SQL Server (or SQL Server Express)
- Authentication Service running (for JWT validation)

### Development

```powershell
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the service
dotnet run
```

The service will start on `http://localhost:5000` (or port specified in launchSettings.json).

### Running with Docker

```dockerfile
# Build image
docker build -t customer-service .

# Run container
docker run -p 5000:8080 \
  -e ConnectionStrings__DefaultConnection="<connection_string>" \
  customer-service
```

## Testing

### Run Unit Tests

```powershell
dotnet test
```

### Test DTO Contracts

The `DtoContractTests` class verifies that JSON serialization matches the exact API contract:

```powershell
dotnet test --filter FullyQualifiedName~DtoContractTests
```

### Manual API Testing

**Test Vehicle List:**
```powershell
# With customer ID 1 (assuming exists in auth service)
curl -X GET "http://localhost:5000/api/customers/1/vehicles"
```

**Test Appointment Details:**
```powershell
# With actual vehicle ID from your database
curl -X GET "http://localhost:5000/api/vehicles/{vehicleId}/appointment-details"
```

## Integration with Other Services

### Authentication Service (Spring Boot)

- **Location:** `services/authentication-service`
- **Purpose:** Manages user signup/login, issues JWT tokens
- **Integration:** This service uses `AuthUserId` (the `id` column) as the customer identifier

### Appointment Service (Spring Boot)

- **Consumes:**
  - `GET /api/customers/{customerId}/vehicles` - To list customer vehicles
  - `GET /api/vehicles/{vehicleId}/appointment-details` - To get vehicle + owner info

## Development Notes

### Idempotent Customer Creation

When a user first interacts with this service:
- The service creates/updates a Customer record using `AuthUserId`
- Customer data is synchronized from the authentication service
- No duplicate customer IDs are generated

### Foreign Key Strategy

- **Internal PK:** `Customer.Id` (int, auto-increment)
- **External Key:** `Customer.AuthUserId` (long, unique, indexed)
- **Lookups:** All external API calls use `AuthUserId`

This approach avoids primary key changes while maintaining referential integrity.

## Troubleshooting

### "Customer not found" Error

- Verify the customer exists in the authentication-service with that AuthUserId
- Check if customer data has been synchronized to this service

### "No vehicles found" Response

- Customer exists but has no registered vehicles
- Verify Vehicle.CustomerIdFk references correct Customer.Id

### JWT Validation Errors

- Ensure authentication-service is running and accessible
- Verify JWT token is valid and not expired
- Check that `sub` claim contains the correct AuthUserId

## Migration History

- `AddCustomerAndRefactorVehicles`: Adds Customer table with AuthUserId unique index, refactors Vehicle schema

## License

Internal project - Automobile Service Management System

## Support

For issues or questions, contact the development team.
