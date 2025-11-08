# Payment API Usage Guide

This guide shows the typical end-to-end flow for integrating the .NET payment service with PayHere.

## 1. Create a payment intent

```http
POST http://localhost:5009/api/payments/create
Content-Type: application/json

{
  "itemName": "Full Service Package",
  "amount": 7500.00,
  "firstName": "Ishan",
  "lastName": "Fernando",
  "email": "ishan@example.com",
  "phone": "0771234567",
  "address": "42 Flower Rd",
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
    "return_url": "http://localhost:5173/success",
    "cancel_url": "http://localhost:5173/cancel",
    "notify_url": "http://localhost:5009/api/payments/notify",
    "order_id": "ORDER-1731085600000",
    "items": "Full Service Package",
    "amount": "7500.00",
    "currency": "LKR",
    "first_name": "Ishan",
    "last_name": "Fernando",
    "email": "ishan@example.com",
    "phone": "0771234567",
    "address": "42 Flower Rd",
    "city": "Colombo",
    "country": "Sri Lanka",
    "hash": "F2F0E3..."
  },
  "referenceId": "b23a4b9b-e2dd-4d5e-a427-7f85021b848d"
}
```

The frontend posts `data` directly to `url`. The MD5 hash already satisfies PayHere’s requirements.

## 2. (Optional) Reopen the sandbox checkout

If QA needs to retry the payment UI for an existing order, browse to:

```
GET http://localhost:5009/api/payments/redirect/ORDER-1731085600000
```

An HTML page appears with a “Proceed” button that auto-submits the stored order fields to PayHere, including a reminder of sandbox card numbers.

## 3. Handle PayHere webhook notifications

Configure PayHere’s “Notify URL” to point at `/api/payments/notify`. A valid callback looks like:

```bash
curl -X POST http://localhost:5009/api/payments/notify \
  -F order_id=ORDER-1731085600000 \
  -F status=2 \
  -F payment_id=TEST123456 \
  -F currency=LKR \
  -F amount=7500.00 \
  -F md5sig=<computed signature>
```

Status codes follow PayHere’s documentation (2 = success, -1 = canceled, etc.). The service recomputes the MD5 signature using the shared secret and will reject mismatches with `401 Unauthorized`.

## Signature helper

Pseudo-code for reproducing PayHere’s required hash:

```csharp
var hashedSecret = MD5(merchantSecret).ToUpperInvariant();
var payloadHash = MD5(merchantId + orderId + amountFormatted + currency + hashedSecret).ToUpperInvariant();
```

This matches the logic inside `PaymentsController.CreatePayment`. Use `CultureInfo.InvariantCulture` when formatting decimals.

## Test cards

The redirect page lists sandbox cards, but the most common set is:

| Brand | Number | Expiry | CVV |
| ----- | ------ | ------ | --- |
| Visa | `4916 2175 0161 1292` | any future date | any 3 digits |
| MasterCard | `5307 7321 2553 1191` | any future date | any 3 digits |
| AMEX | `3467 8100 5510 225` | any future date | 4 digits |

## Error handling

- Invalid request payloads return `400` with ModelState errors.
- Database issues surface as `500` ProblemDetails responses.
- Missing order ids during redirect/notify return `404`.
- Signature mismatches return `401` with a descriptive message plus a `referenceId` for log correlation.

Keep these patterns in mind when wiring the frontend so you can present user-friendly error descriptions.
