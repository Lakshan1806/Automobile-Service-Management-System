# Refactoring Summary – customer-service trimmed to payments only

## Objectives
1. Remove every customer/vehicle/profile capability from the .NET service.
2. Keep only the payment workflow used by the web portal.
3. Simplify dependencies, DI registrations, and documentation to reflect the narrower scope.

## What changed
- Deleted controllers (`CustomersController`, `VehiclesController`, `ProfilesController`, `WeatherForecastController`) so the API surface now consists solely of `PaymentsController`.
- Removed supporting layers (DTOs, models, repositories, middleware, HttpContext extensions) that existed purely for vehicle/customer features.
- Simplified `AppDbContext` to a single `DbSet<Payment>`.
- Rebuilt `Program.cs` so it only wires controllers, EF Core, Swagger, and CORS—no repository or custom middleware registrations remain.
- Pruned sample REST requests, README, and API usage docs; they now describe only the payment endpoints and PayHere flow.
- Cleaned up `.http` file to contain a `POST /api/payments/create` example.

## Result
- Smaller deployable (`bin/` now contains only payment-related assets).
- EF schema + migrations still exist for historical tables, but runtime code no longer depends on them.
- The service is a focused payment façade that:
  1. accepts payment intents,
  2. renders a sandbox redirect page,
  3. processes PayHere notifications.

Any customer/vehicle features should now live in their dedicated services, keeping future maintenance and security reviews narrower.*** End Patch
