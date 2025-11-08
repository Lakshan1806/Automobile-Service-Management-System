# Payment Service

`services/payment-service` now focuses exclusively on payment orchestration for the Automobile Service Management System. It exposes a compact HTTP API that creates PayHere checkout sessions, renders a one-click redirect experience for existing orders, and processes asynchronous gateway notifications.

## Features
- Stores local `Payment` records via EF Core + SQL Server.
- Generates PayHere-compliant payloads (hashing, amount formatting, URLs) for the React web client.
- Serves a lightweight HTML redirect page so QA teams can re-open the sandbox checkout for any order.
- Validates PayHere webhook signatures before persisting gateway status and transaction ids.

## Endpoints

| Method | Route | Description |
| ------ | ----- | ----------- |
| `POST` | `/api/payments/create` | Validates user-provided billing data, creates a `Payment` row, and returns the PayHere checkout URL plus the signed payload that the frontend submits. |
| `GET`  | `/api/payments/redirect/{orderId}` | Builds an auto-submitting HTML page so testers can resend an existing order to the PayHere sandbox. |
| `POST` | `/api/payments/notify` | PayHere webhook callback that verifies the MD5 signature and updates the corresponding `Payment` status/transaction info. |

Every response uses ProblemDetails for unexpected failures so observability tooling can correlate errors easily.

## Configuration

`appsettings.json` carries the defaults:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Payments;User Id=sa;Password=123asd;TrustServerCertificate=True;"
  },
  "PayHere": {
    "MerchantId": "1232662",
    "MerchantSecret": "<sandbox-secret>",
    "SandboxUrl": "https://sandbox.payhere.lk/pay/checkout",
    "NotifyUrl": "http://localhost:5009/api/payments/notify",
    "ReturnUrl": "http://localhost:5173/success",
    "CancelUrl": "http://localhost:5173/cancel"
  }
}
```

Override them per environment with `/appsettings.Development.json` or environment variables (`PayHere__MerchantId`, `ConnectionStrings__DefaultConnection`, etc.).

## Local Development

```powershell
cd services/payment-service
dotnet restore
dotnet ef database update    # optional, creates the Payments table
dotnet run --urls http://localhost:5009
```

Swagger is available at the root (`/`) in development for quick manual testing.

## Sample create request

```http
POST http://localhost:5009/api/payments/create
Content-Type: application/json

{
  "itemName": "Roadside subscription",
  "amount": 2500.50,
  "firstName": "Alex",
  "lastName": "Perera",
  "email": "alex@example.com",
  "phone": "0771234567",
  "address": "123 Beacon St",
  "city": "Colombo",
  "country": "Sri Lanka"
}
```

Response:

```json
{
  "url": "https://sandbox.payhere.lk/pay/checkout",
  "data": {
    "merchant_id": "1232662",
    "order_id": "ORDER-1731000000000",
    "amount": "2500.50",
    "currency": "LKR",
    "...": "..."
  },
  "referenceId": "a9bb01f3-..."
}
```

Frontends post the `data` payload directly to the returned `url`.

## Testing the notify endpoint

Use the PayHere sandbox dashboard to configure the `Notify URL` or emulate the callback manually:

```bash
curl -X POST http://localhost:5009/api/payments/notify \
  -F order_id=ORDER-1731000000000 \
  -F status=2 \
  -F payment_id=TEST123 \
  -F currency=LKR \
  -F amount=2500.50 \
  -F md5sig=<calculated signature>
```

Only requests with a valid `md5sig` matching the shared secret will be persisted.

## Folder layout

```
Controllers/PaymentsController.cs   -> API surface
Data/AppDbContext.cs                -> EF Core context (Payments DbSet only)
Dtos/CreatePaymentDto.cs            -> request contract
Models/Payment.cs                   -> EF entity definition
payment-service.http                -> VS Code/REST Client sample request
```

Historical artifacts for customer/vehicle management were removed so this service can focus strictly on payment processing and reporting.
