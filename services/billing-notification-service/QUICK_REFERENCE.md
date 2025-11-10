# Quick Reference: Enhanced Notification API

## What Changed?

The unified notification endpoint (`/api/notification/send/`) now supports **PDF invoice attachment** in addition to sending bill details in the email body.

---

## Three Ways to Send Notifications

### 1️⃣ Simple Notifications (OTP, Alerts)
**Use When**: Sending OTP codes, alerts, simple messages

```json
POST http://127.0.0.1:8000/api/notification/send/
{
  "to": "customer@example.com",
  "subject": "Your OTP Code",
  "body": "Your OTP is: 123456"
}
```

---

### 2️⃣ Bill Details in Email Body
**Use When**: Customer wants to see bill details directly in email (quick view, mobile-friendly)

#### Option A: Plain Text
```json
{
  "to": "customer@example.com",
  "subject": "Service Invoice #INV-001",
  "body": "━━━━━━━━━━━━━━━━━━━━━━━\nINVOICE\n━━━━━━━━━━━━━━━━━━━━━━━\n\nOil Change: $120.00\nEngine Oil: $80.00\n\nTOTAL: $200.00",
  "is_html": false
}
```

#### Option B: HTML (Formatted)
```json
{
  "to": "customer@example.com",
  "subject": "Service Invoice #INV-001",
  "body": "<html><body><h1>INVOICE</h1><table>...</table><div>TOTAL: $200.00</div></body></html>",
  "is_html": true
}
```

**Note**: You can use the helper functions from `notification_service/utils/bill_formatter.py`:
- `format_bill_text(bill)` - Generates plain text format
- `format_bill_html(bill)` - Generates HTML format

---

### 3️⃣ Bill with PDF Invoice Attachment
**Use When**: Customer needs formal invoice for records, accounting, tax purposes

```json
{
  "to": "customer@example.com",
  "subject": "Service Invoice with PDF",
  "body": "Dear Customer,\n\nYour invoice is attached as PDF.\n\nBest regards,\nAutomobile Service Team",
  "bill_id": "abc-123-def-456-uuid",
  "attach_invoice": true
}
```

**Important**: 
- `bill_id` must be a valid UUID from an existing bill in the database
- PDF is generated on-the-fly when email is sent
- `attach_invoice` must be set to `true`

---

## Complete Workflow Example

```python
import requests

# Step 1: Generate the bill (EXISTING ENDPOINT - NO CHANGES)
bill_response = requests.post(
    'http://127.0.0.1:8000/api/notification/bill/generate/',
    json={
        "customer_email": "customer@example.com",
        "service_id": "service-uuid-here",
        "products": [
            {"product_id": "part-uuid-1", "quantity": 2},
            {"product_id": "part-uuid-2", "quantity": 1}
        ]
    }
)

bill_data = bill_response.json()
bill_id = bill_data['bill_id']
total_price = bill_data['total_price']

# Step 2: Choose how to send the notification

# Option A: Send bill details in email body (plain text)
from notification_service.utils import format_bill_text

bill_text = format_bill_text(bill)  # Get Bill object from database
requests.post(
    'http://127.0.0.1:8000/api/notification/send/',
    json={
        "to": "customer@example.com",
        "subject": f"Invoice #{bill_id}",
        "body": bill_text,
        "is_html": False
    }
)

# Option B: Send bill details in email body (HTML)
from notification_service.utils import format_bill_html

bill_html = format_bill_html(bill)  # Get Bill object from database
requests.post(
    'http://127.0.0.1:8000/api/notification/send/',
    json={
        "to": "customer@example.com",
        "subject": f"Invoice #{bill_id}",
        "body": bill_html,
        "is_html": True
    }
)

# Option C: Send with PDF attachment
requests.post(
    'http://127.0.0.1:8000/api/notification/send/',
    json={
        "to": "customer@example.com",
        "subject": f"Invoice #{bill_id} with PDF",
        "body": f"Dear Customer,\n\nYour invoice is attached.\n\nTotal: ${total_price}\n\nBest regards",
        "bill_id": bill_id,
        "attach_invoice": True
    }
)
```

---

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | email | ✅ | Recipient email address |
| `subject` | string | ✅ | Email subject (max 200 chars) |
| `body` | string | ✅ | Email content (OTP, bill details, or message) |
| `is_html` | boolean | ❌ | `true` if body is HTML (default: `false`) |
| `bill_id` | UUID | ❌ | Bill ID for PDF attachment (optional) |
| `attach_invoice` | boolean | ❌ | Generate & attach PDF (default: `false`) |

---

## Response Examples

### Success (No PDF)
```json
{
  "success": true,
  "message": "Email sent successfully",
  "to": "customer@example.com",
  "subject": "Your Invoice"
}
```

### Success (With PDF)
```json
{
  "success": true,
  "message": "Email with invoice sent successfully",
  "to": "customer@example.com",
  "subject": "Your Invoice with PDF",
  "invoice_attached": true,
  "bill_id": "abc-123-def-456"
}
```

### Error (Bill Not Found)
```json
{
  "error": "Bill with ID abc-123 not found"
}
```

---

## Key Points

✅ **DO:**
- Use plain text for OTPs
- Format bill details nicely when sending in body
- Attach PDF for formal invoices
- Include friendly message when attaching PDF

❌ **DON'T:**
- Don't change `/api/notification/bill/generate/` endpoint
- Don't attach PDF for every notification (increases email size)
- Don't forget `attach_invoice: true` when using `bill_id`
- Don't send empty body when attaching PDF

---

## Decision Tree

```
Need to send notification?
│
├─ OTP/Alert
│  └─ Use simple body text
│
├─ Bill notification
│  │
│  ├─ Customer needs PDF for records?
│  │  └─ Yes → Set attach_invoice: true + bill_id
│  │
│  └─ Customer wants quick view?
│     ├─ Plain text → Format bill details in body
│     └─ Nice format → Use HTML body (is_html: true)
```

---

## Files Modified

1. **notification_service/serializers.py**
   - Added `bill_id` (UUID, optional)
   - Added `attach_invoice` (boolean, optional)

2. **notification_service/views.py**
   - Enhanced `SendNotificationView.post()`
   - Added PDF generation logic
   - Added PDF attachment to email

3. **notification_service/utils/bill_formatter.py** (NEW)
   - `format_bill_text(bill)` - Plain text formatter
   - `format_bill_html(bill)` - HTML formatter

4. **notification_service/utils/__init__.py**
   - Exported formatting functions

---

## Testing

### Test OTP
```bash
curl -X POST http://127.0.0.1:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"OTP","body":"Your OTP: 123456"}'
```

### Test Bill in Body
```bash
curl -X POST http://127.0.0.1:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Invoice","body":"Total: $200","is_html":false}'
```

### Test PDF Attachment (requires valid bill_id)
```bash
curl -X POST http://127.0.0.1:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Invoice PDF","body":"See attached","bill_id":"your-bill-uuid","attach_invoice":true}'
```

---

## Summary

| Feature | Before | After |
|---------|--------|-------|
| Send OTP | ✅ Supported | ✅ Supported (unchanged) |
| Bill details in body | ❌ Not supported | ✅ **NEW**: Text or HTML |
| PDF attachment | ❌ Not supported | ✅ **NEW**: Optional with `bill_id` |
| Bill generation | ✅ `/bill/generate/` | ✅ Same (no changes) |

---

**Last Updated**: Enhanced version with PDF support
**Backward Compatible**: Yes - all existing functionality works the same
