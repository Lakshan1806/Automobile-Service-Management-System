# Vehicle API Usage Guide

## Quick Start - Adding Your First Vehicle

### Step 1: Create a Test Customer (Development Only)

First, create a customer linked to an AuthUserId from the authentication service:

```http
POST http://localhost:5009/api/vehicles/test-customer
Content-Type: application/json

{
  "authUserId": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "+94701234567"
}
```

**Response:**
```json
{
  "message": "Test customer created successfully!",
  "customerId": 1,
  "authUserId": 1,
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

### Step 2: Add a Vehicle

Now you can add a vehicle for this customer:

```http
POST http://localhost:5009/api/vehicles/add
Content-Type: application/json

{
  "authUserId": 1,
  "noPlate": "CP ABC-123",
  "vehicleModel": "Corolla",
  "vehicleBrand": "Toyota",
  "vehicleType": "Car",
  "vehicleModelYear": 2020,
  "vehicleRegistrationYear": 2020,
  "chaseNo": "JT123456789",
  "millage": 50000,
  "customerEmail": "john.doe@example.com",
  "customerName": "John Doe",
  "customerPhone": "+94701234567"
}
```

**Response:**
```json
{
  "message": "Vehicle added successfully!",
  "vehicleId": "abc123-def456-ghi789",
  "customerId": 1
}
```

### Step 3: Retrieve Customer Vehicles

```http
GET http://localhost:5009/api/customers/1/vehicles
```

**Response:**
```json
[
  {
    "vehicleId": "abc123-def456-ghi789",
    "noPlate": "CP ABC-123",
    "vehicleBrand": "Toyota",
    "vehicleModel": "Corolla"
  }
]
```

### Step 4: Get Vehicle Appointment Details

```http
GET http://localhost:5009/api/vehicles/abc123-def456-ghi789/appointment-details
```

**Response:**
```json
{
  "vehicleId": "abc123-def456-ghi789",
  "noPlate": "CP ABC-123",
  "chaseNo": "JT123456789",
  "vehicleType": "Car",
  "vehicleBrand": "Toyota",
  "customerId": "1",
  "customerPhone": "+94701234567",
  "customerName": "John Doe",
  "millage": 50000,
  "lastServiceDate": "",
  "vehicleModelYear": 2020,
  "vehicleRegistrationYear": 2020
}
```

## Using with Authentication (Production)

In production, the service will:
1. Extract `AuthUserId` from the JWT token's `sub` claim
2. Automatically create/update the customer record
3. Link vehicles to that customer

Example with JWT:

```http
POST http://localhost:5009/api/vehicles/add
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "noPlate": "CP ABC-123",
  "vehicleModel": "Corolla",
  "vehicleBrand": "Toyota",
  "vehicleType": "Car",
  "vehicleModelYear": 2020,
  "vehicleRegistrationYear": 2020,
  "chaseNo": "JT123456789",
  "millage": 50000
}
```

The `AuthUserId` will be automatically extracted from your JWT token!

## Common Errors and Solutions

### Error: "Authentication required"

**Cause:** No `AuthUserId` provided and no valid JWT token

**Solution:** Either:
- Include `authUserId` in the request body (development)
- Provide a valid JWT token in the `Authorization` header (production)

### Error: "Failed to save vehicle"

**Cause:** Foreign key constraint - no customer exists with the provided `CustomerIdFk`

**Solution:** 
- Use the new `/api/vehicles/add` endpoint which automatically creates customers
- Or first create a customer using `/api/vehicles/test-customer`

### Error: "No vehicles found for customer"

**Cause:** Customer exists but has no vehicles

**Solution:** This is a valid response - add vehicles using the `/api/vehicles/add` endpoint

## Testing with cURL (Windows PowerShell)

### Create Customer:
```powershell
$body = @{
    authUserId = 1
    email = "test@example.com"
    name = "Test User"
    phone = "+94701234567"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5009/api/vehicles/test-customer" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Add Vehicle:
```powershell
$body = @{
    authUserId = 1
    noPlate = "CP ABC-123"
    vehicleModel = "Corolla"
    vehicleBrand = "Toyota"
    vehicleType = "Car"
    millage = 50000
    customerName = "Test User"
    customerEmail = "test@example.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5009/api/vehicles/add" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Get Vehicles:
```powershell
Invoke-WebRequest -Uri "http://localhost:5009/api/customers/1/vehicles"
```

## Notes

- The service is running on `http://localhost:5009`
- All dates are in ISO-8601 format: `YYYY-MM-DD`
- Vehicle IDs are auto-generated UUIDs
- Customer creation is idempotent - calling it multiple times with the same `AuthUserId` will update, not duplicate
