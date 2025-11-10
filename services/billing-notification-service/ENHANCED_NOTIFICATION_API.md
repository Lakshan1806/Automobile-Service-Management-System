# Enhanced Unified Notification API - Complete Guide

## Overview
The unified notification endpoint now supports three modes:
1. **Simple notifications** (OTP, alerts) - Just send text in body
2. **Bill details in body** - Send formatted bill information in email body (text or HTML)
3. **Bill with PDF attachment** - Generate and attach PDF invoice

## Endpoint
```
POST http://127.0.0.1:8000/api/notification/send/
```

## Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `to` | string (email) | ✅ Yes | - | Recipient email address |
| `subject` | string | ✅ Yes | - | Email subject line (max 200 chars) |
| `body` | string | ✅ Yes | - | Email content (can be bill details, OTP, or custom text) |
| `is_html` | boolean | ❌ No | `false` | Set to `true` if body contains HTML |
| `bill_id` | UUID | ❌ No | `null` | Bill ID to attach invoice PDF (optional) |
| `attach_invoice` | boolean | ❌ No | `false` | Generate and attach PDF invoice when `true` |

---

## Use Case 1: Send OTP (Simple Text)

### Request
```json
{
  "to": "customer@example.com",
  "subject": "Your Verification Code",
  "body": "Your OTP is: 123456. This code will expire in 10 minutes."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Email sent successfully",
  "to": "customer@example.com",
  "subject": "Your Verification Code"
}
```

### cURL Example
```bash
curl -X POST http://127.0.0.1:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Your Verification Code",
    "body": "Your OTP is: 123456. This code will expire in 10 minutes."
  }'
```

---

## Use Case 2: Send Bill Details in Body (Plain Text)

First, get the bill details and format them in the body.

### Python Example - Generate Bill and Send with Details in Body
```python
import requests

# Step 1: Generate the bill (existing endpoint - DO NOT CHANGE)
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
items = bill_data['items']

# Step 2: Format bill details for email body
body_text = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        AUTOMOBILE SERVICE INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Invoice ID: {bill_id}
Date: {bill_data['created_at']}
Customer: customer@example.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS & SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""

for item in items:
    body_text += f"""
{item['name']}
  Price: ${item['price']}
  Quantity: {item['quantity']}
  Total: ${item['total']}

"""

body_text += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL AMOUNT DUE: ${total_price}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your business!
"""

# Step 3: Send notification with bill details in body
notification_response = requests.post(
    'http://127.0.0.1:8000/api/notification/send/',
    json={
        "to": "customer@example.com",
        "subject": f"Service Invoice #{bill_id}",
        "body": body_text,
        "is_html": False
    }
)

print(notification_response.json())
```

### Request (Direct)
```json
{
  "to": "customer@example.com",
  "subject": "Service Invoice #12345",
  "body": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n        AUTOMOBILE SERVICE INVOICE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nInvoice ID: abc-123\nDate: 2024-01-15\n\nOil Change Service: $120.00\nEngine Oil (5L): $80.00 x 1 = $80.00\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTOTAL: $200.00\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  "is_html": false
}
```

---

## Use Case 3: Send Bill Details in Body (HTML)

### Request
```json
{
  "to": "customer@example.com",
  "subject": "Your Service Invoice",
  "body": "<html><body><h1>INVOICE</h1><div style='background:#f8f9fa;padding:20px;'><p><strong>Invoice ID:</strong> abc-123</p><p><strong>Date:</strong> Jan 15, 2024</p></div><table style='width:100%;border-collapse:collapse;margin-top:20px;'><thead><tr style='background:#667eea;color:white;'><th style='padding:12px;text-align:left;'>Item</th><th style='padding:12px;text-align:center;'>Price</th><th style='padding:12px;text-align:center;'>Qty</th><th style='padding:12px;text-align:right;'>Total</th></tr></thead><tbody><tr><td style='padding:12px;'>Oil Change</td><td style='padding:12px;text-align:center;'>$120.00</td><td style='padding:12px;text-align:center;'>1</td><td style='padding:12px;text-align:right;'>$120.00</td></tr></tbody></table><div style='margin-top:30px;background:#667eea;color:white;padding:25px;text-align:right;'><p style='font-size:16px;'>TOTAL AMOUNT</p><p style='font-size:36px;font-weight:bold;'>$200.00</p></div></body></html>",
  "is_html": true
}
```

### Python Helper Function
```python
def format_bill_html(bill_data):
    """Format bill data as HTML for email"""
    items_html = ""
    for item in bill_data['items']:
        items_html += f"""
        <tr>
            <td style="padding:12px;">{item['name']}</td>
            <td style="padding:12px;text-align:center;">${item['price']}</td>
            <td style="padding:12px;text-align:center;">{item['quantity']}</td>
            <td style="padding:12px;text-align:right;">${item['total']}</td>
        </tr>
        """
    
    html = f"""
    <html>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#667eea;color:white;padding:30px;text-align:center;">
            <h1>AUTOMOBILE SERVICE INVOICE</h1>
        </div>
        <div style="background:#f8f9fa;padding:20px;margin-top:20px;">
            <p><strong>Invoice ID:</strong> {bill_data['bill_id']}</p>
            <p><strong>Date:</strong> {bill_data['created_at']}</p>
            <p><strong>Customer:</strong> {bill_data['customer_email']}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:30px;">
            <thead>
                <tr style="background:#667eea;color:white;">
                    <th style="padding:12px;text-align:left;">Item</th>
                    <th style="padding:12px;text-align:center;">Price</th>
                    <th style="padding:12px;text-align:center;">Qty</th>
                    <th style="padding:12px;text-align:right;">Total</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>
        <div style="margin-top:30px;background:#667eea;color:white;padding:25px;text-align:right;">
            <p style="font-size:16px;">TOTAL AMOUNT DUE</p>
            <p style="font-size:36px;font-weight:bold;">${bill_data['total_price']}</p>
        </div>
        <div style="margin-top:20px;text-align:center;color:#666;">
            <p>Thank you for your business!</p>
        </div>
    </body>
    </html>
    """
    return html

# Usage
html_body = format_bill_html(bill_data)
requests.post(
    'http://127.0.0.1:8000/api/notification/send/',
    json={
        "to": "customer@example.com",
        "subject": "Your Invoice",
        "body": html_body,
        "is_html": True
    }
)
```

---

## Use Case 4: Send Bill with PDF Invoice Attachment

When you want to attach the actual PDF invoice file to the email.

### Request
```json
{
  "to": "customer@example.com",
  "subject": "Your Service Invoice with PDF",
  "body": "Dear Customer,\n\nThank you for choosing our service. Please find your invoice attached as a PDF.\n\nBest regards,\nAutomobile Service Team",
  "is_html": false,
  "bill_id": "abc-123-def-456-uuid",
  "attach_invoice": true
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Email with invoice sent successfully",
  "to": "customer@example.com",
  "subject": "Your Service Invoice with PDF",
  "invoice_attached": true,
  "bill_id": "abc-123-def-456-uuid"
}
```

### Python Example - Complete Flow
```python
import requests

# Step 1: Generate the bill
bill_response = requests.post(
    'http://127.0.0.1:8000/api/notification/bill/generate/',
    json={
        "customer_email": "customer@example.com",
        "service_id": "service-uuid",
        "products": [
            {"product_id": "part-uuid-1", "quantity": 2}
        ]
    }
)

bill_data = bill_response.json()
bill_id = bill_data['bill_id']

# Step 2: Send email with PDF invoice attached
notification_response = requests.post(
    'http://127.0.0.1:8000/api/notification/send/',
    json={
        "to": "customer@example.com",
        "subject": f"Invoice #{bill_id} - Automobile Service",
        "body": "Dear Customer,\n\nYour vehicle service has been completed successfully. Please find your invoice attached as a PDF.\n\nTotal Amount: $" + str(bill_data['total_price']) + "\n\nThank you for your business!\n\nBest regards,\nAutomobile Service Team",
        "is_html": False,
        "bill_id": bill_id,
        "attach_invoice": True
    }
)

print(notification_response.json())
```

### Node.js Example (Technician Service)
```javascript
const axios = require('axios');

async function sendBillWithPDF(customerEmail, billId, totalPrice) {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/notification/send/', {
      to: customerEmail,
      subject: `Invoice #${billId} - Service Completed`,
      body: `Dear Customer,

Your vehicle service has been completed successfully.

Total Amount: $${totalPrice}

Please find your detailed invoice attached as a PDF.

Thank you for choosing our service!

Best regards,
Automobile Service Management Team`,
      is_html: false,
      bill_id: billId,
      attach_invoice: true
    });
    
    console.log('Email with PDF sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send email:', error.response?.data || error.message);
    throw error;
  }
}

// Usage after generating bill
const billData = await generateBill(customerEmail, serviceId, products);
await sendBillWithPDF(customerEmail, billData.bill_id, billData.total_price);
```

---

## Complete Integration Example

### Scenario: Technician completes service and sends invoice

```python
import requests

BASE_URL = "http://127.0.0.1:8000/api/notification"

def complete_service_and_notify(customer_email, service_id, products, send_pdf=False):
    """
    Complete service workflow: Generate bill and send notification
    
    Args:
        customer_email: Customer's email
        service_id: UUID of service performed
        products: List of {"product_id": "uuid", "quantity": int}
        send_pdf: If True, attach PDF invoice; otherwise send details in body
    """
    
    # Step 1: Generate the bill
    print("Generating bill...")
    bill_response = requests.post(
        f'{BASE_URL}/bill/generate/',
        json={
            "customer_email": customer_email,
            "service_id": service_id,
            "products": products
        }
    )
    
    if bill_response.status_code != 201:
        print(f"Failed to generate bill: {bill_response.json()}")
        return None
    
    bill_data = bill_response.json()
    bill_id = bill_data['bill_id']
    total_price = bill_data['total_price']
    items = bill_data['items']
    
    print(f"Bill generated: {bill_id}, Total: ${total_price}")
    
    # Step 2: Prepare notification
    if send_pdf:
        # Option A: Send with PDF attachment
        print("Sending email with PDF invoice...")
        
        notification_data = {
            "to": customer_email,
            "subject": f"Service Invoice #{bill_id}",
            "body": f"""Dear Customer,

Your vehicle service has been completed successfully!

Total Amount: ${total_price}

Your detailed invoice is attached as a PDF for your records.

Thank you for choosing our service!

Best regards,
Automobile Service Management Team""",
            "is_html": False,
            "bill_id": bill_id,
            "attach_invoice": True
        }
    else:
        # Option B: Send with bill details in body (text)
        print("Sending email with bill details in body...")
        
        # Format bill details as text
        body_text = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        AUTOMOBILE SERVICE INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Invoice ID: {bill_id}
Date: {bill_data['created_at']}
Customer: {customer_email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS & SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
        for item in items:
            body_text += f"""
{item['name']}
  Price: ${item['price']}
  Quantity: {item['quantity']}
  Total: ${item['total']}

"""
        
        body_text += f"""━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL AMOUNT DUE: ${total_price}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing our service!

For any queries, please contact us with your invoice ID.

Best regards,
Automobile Service Management Team
"""
        
        notification_data = {
            "to": customer_email,
            "subject": f"Service Invoice #{bill_id}",
            "body": body_text,
            "is_html": False
        }
    
    # Step 3: Send notification
    notification_response = requests.post(
        f'{BASE_URL}/send/',
        json=notification_data
    )
    
    if notification_response.status_code == 200:
        print("✓ Email sent successfully!")
        return {
            'bill': bill_data,
            'notification': notification_response.json()
        }
    else:
        print(f"✗ Failed to send email: {notification_response.json()}")
        return None


# Example usage
if __name__ == "__main__":
    # Test 1: Send bill details in email body
    print("\n=== Test 1: Bill details in body ===")
    result1 = complete_service_and_notify(
        customer_email="customer@example.com",
        service_id="service-uuid-here",
        products=[
            {"product_id": "part-uuid-1", "quantity": 2},
            {"product_id": "part-uuid-2", "quantity": 1}
        ],
        send_pdf=False  # Details in body
    )
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Send with PDF attachment
    print("\n=== Test 2: Bill with PDF attachment ===")
    result2 = complete_service_and_notify(
        customer_email="customer@example.com",
        service_id="service-uuid-here",
        products=[
            {"product_id": "part-uuid-1", "quantity": 1}
        ],
        send_pdf=True  # Attach PDF invoice
    )
```

---

## Error Responses

### Missing Required Fields (400)
```json
{
  "error": "Invalid request data",
  "details": {
    "to": ["This field is required."],
    "subject": ["This field is required."]
  }
}
```

### Invalid Email (400)
```json
{
  "error": "Invalid request data",
  "details": {
    "to": ["Enter a valid email address."]
  }
}
```

### Bill Not Found (404)
```json
{
  "error": "Bill with ID abc-123 not found"
}
```

### PDF Generation Failed (500)
```json
{
  "error": "Failed to generate or attach invoice PDF",
  "details": "Error message here"
}
```

---

## Decision Tree: When to Use Each Mode

```
┌─────────────────────────────────────────┐
│   What type of notification?            │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    OTP/Alert          Bill/Invoice
        │                   │
        v                   v
  ┌─────────┐      ┌────────────────┐
  │  Simple │      │ Need PDF file? │
  │  body   │      └────────────────┘
  │  text   │               │
  └─────────┘     ┌─────────┴─────────┐
        │         │                   │
        │        Yes                  No
        │         │                   │
        │         v                   v
        │   ┌──────────┐      ┌─────────────┐
        │   │ attach_  │      │ Format bill │
        │   │ invoice: │      │ details in  │
        │   │   true   │      │   body      │
        │   │ + bill_id│      │ (text/HTML) │
        │   └──────────┘      └─────────────┘
        │         │                   │
        └─────────┴───────────────────┘
                  │
                  v
        ┌──────────────────┐
        │  POST /api/      │
        │  notification/   │
        │  send/           │
        └──────────────────┘
```

### Quick Decision Guide

| Scenario | attach_invoice | bill_id | body content |
|----------|----------------|---------|--------------|
| Send OTP code | `false` | - | "Your OTP is: 123456" |
| Send bill summary | `false` | - | Formatted bill text/HTML |
| Send formal invoice | `true` | ✅ Required | Simple message |
| Send alert | `false` | - | Alert message |

---

## Summary

### Key Points

1. **Bill generation endpoint remains unchanged**: `/api/notification/bill/generate/`
2. **Unified notification endpoint**: `/api/notification/send/`
3. **Three modes of operation**:
   - Simple text (OTP, alerts)
   - Bill details in body (formatted text or HTML)
   - Bill with PDF attachment (professional invoice)

4. **When to attach PDF**:
   - Customer needs formal invoice for records
   - Required for accounting/tax purposes
   - Customer specifically requests PDF

5. **When to send details in body**:
   - Quick notification needed
   - Customer prefers email format
   - Reduce email size
   - Better mobile viewing experience

### Best Practices

✅ **DO:**
- Use plain text for OTPs and simple alerts
- Format bill details nicely in body for quick viewing
- Attach PDF for formal invoices and records
- Include friendly message even when attaching PDF
- Use HTML format for better-looking bill details

❌ **DON'T:**
- Don't change the bill generation endpoint
- Don't send PDF for every notification (increases email size)
- Don't forget to set `attach_invoice: true` when using `bill_id`
- Don't send empty body when attaching PDF (include friendly message)

---

## Testing Commands

```bash
# Test 1: Simple OTP
curl -X POST http://127.0.0.1:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"OTP Code","body":"Your OTP: 123456"}'

# Test 2: Bill details in body (you need to generate bill first and format it)
curl -X POST http://127.0.0.1:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Invoice","body":"Invoice ID: abc\nTotal: $200","is_html":false}'

# Test 3: Bill with PDF (requires existing bill_id)
curl -X POST http://127.0.0.1:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Invoice PDF","body":"See attached PDF","bill_id":"your-bill-uuid","attach_invoice":true}'
```

---

**Last Updated**: Current implementation
**API Version**: 2.0 (Enhanced with PDF attachment support)
