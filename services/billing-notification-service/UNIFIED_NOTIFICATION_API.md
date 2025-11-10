# Unified Notification API Documentation

## Overview
The unified notification endpoint provides a single API for sending all types of email notifications from the system. This simplifies integration for all microservices that need to send emails.

## Endpoint
```
POST /api/notification/send/
```

## Request Format

### Headers
```
Content-Type: application/json
```

### Body Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `to` | string (email) | Yes | - | Recipient email address |
| `subject` | string | Yes | - | Email subject line (max 200 characters) |
| `body` | string | Yes | - | Email content (text or HTML) |
| `is_html` | boolean | No | `false` | Set to `true` if body contains HTML |

### Request Example (Plain Text)
```json
{
  "to": "customer@example.com",
  "subject": "Your OTP Code",
  "body": "Your OTP code is: 123456. It will expire in 10 minutes.",
  "is_html": false
}
```

### Request Example (HTML)
```json
{
  "to": "customer@example.com",
  "subject": "Your Service Bill",
  "body": "<html><body><h1>Invoice</h1><p>Total: $500.00</p><p>Thank you for your business!</p></body></html>",
  "is_html": true
}
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Email sent successfully",
  "to": "customer@example.com",
  "subject": "Your OTP Code"
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Invalid request data",
  "details": {
    "to": ["Enter a valid email address."],
    "subject": ["This field is required."]
  }
}
```

### Error Response (500 Internal Server Error)
```json
{
  "error": "Failed to send notification",
  "details": "SMTP connection failed"
}
```

## Use Cases

### 1. Send OTP Code
```bash
curl -X POST http://localhost:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Your Verification Code",
    "body": "Your OTP is: 789456. Valid for 10 minutes."
  }'
```

### 2. Send Bill Notification
```bash
curl -X POST http://localhost:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Service Invoice #INV-123",
    "body": "Dear Customer,\n\nYour service has been completed.\nTotal Amount: $450.00\n\nThank you!",
    "is_html": false
  }'
```

### 3. Send HTML Formatted Email
```bash
curl -X POST http://localhost:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Appointment Confirmation",
    "body": "<html><body><h2>Appointment Confirmed</h2><p>Date: 2024-01-15</p><p>Time: 10:00 AM</p></body></html>",
    "is_html": true
  }'
```

### 4. Send Custom Notification
```bash
curl -X POST http://localhost:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "to": "technician@example.com",
    "subject": "New Service Assignment",
    "body": "You have been assigned to service request #SR-456."
  }'
```

## Integration Examples

### From Technician Service (Node.js/Express)
```javascript
const axios = require('axios');

async function sendNotification(to, subject, body, isHtml = false) {
  try {
    const response = await axios.post('http://localhost:8000/api/notification/send/', {
      to: to,
      subject: subject,
      body: body,
      is_html: isHtml
    });
    
    console.log('Email sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send email:', error.response?.data || error.message);
    throw error;
  }
}

// Usage examples
await sendNotification(
  'customer@example.com',
  'Service Completed',
  'Your vehicle service is ready for pickup.'
);
```

### From Customer Service (C#/.NET)
```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;

public class NotificationService
{
    private readonly HttpClient _httpClient;
    
    public NotificationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public async Task<bool> SendNotificationAsync(string to, string subject, string body, bool isHtml = false)
    {
        var request = new
        {
            to = to,
            subject = subject,
            body = body,
            is_html = isHtml
        };
        
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync(
            "http://localhost:8000/api/notification/send/",
            content
        );
        
        return response.IsSuccessStatusCode;
    }
}

// Usage
await notificationService.SendNotificationAsync(
    "customer@example.com",
    "Appointment Reminder",
    "Your appointment is tomorrow at 10 AM."
);
```

### From Java Services
```java
import java.net.http.*;
import java.net.URI;
import com.google.gson.Gson;

public class NotificationClient {
    private final HttpClient httpClient;
    private final Gson gson;
    
    public NotificationClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
    }
    
    public void sendNotification(String to, String subject, String body, boolean isHtml) throws Exception {
        var request = new NotificationRequest(to, subject, body, isHtml);
        String json = gson.toJson(request);
        
        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8000/api/notification/send/"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        
        HttpResponse<String> response = httpClient.send(
            httpRequest, 
            HttpResponse.BodyHandlers.ofString()
        );
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to send notification: " + response.body());
        }
    }
    
    private record NotificationRequest(String to, String subject, String body, boolean is_html) {}
}

// Usage
notificationClient.sendNotification(
    "customer@example.com",
    "Service Update",
    "Your service is in progress.",
    false
);
```

## Benefits

### 1. **Simplified Integration**
- Single endpoint for all notification types
- No need to learn multiple API endpoints
- Consistent request/response format

### 2. **Flexibility**
- Send any type of notification
- Support for both plain text and HTML
- Custom subject and body for each email

### 3. **Microservices Friendly**
- Easy to integrate from any service
- Language-agnostic REST API
- Clear error messages for debugging

### 4. **Maintainability**
- Single point of configuration for email settings
- Centralized logging and error handling
- Easy to add features (attachments, templates, etc.)

## Migration from Old Endpoints

### Old Way (Multiple Endpoints)
```javascript
// Sending OTP
POST /api/notification/otp/send-email/
{
  "email": "user@example.com",
  "otp": "123456"
}

// Sending Bill
POST /api/notification/bill/send/
{
  "customer_email": "user@example.com",
  "bill_id": "uuid-here"
}

// Sending Notification
POST /api/notification/bill/{bill_id}/notify/
```

### New Way (Unified Endpoint)
```javascript
// Sending OTP
POST /api/notification/send/
{
  "to": "user@example.com",
  "subject": "Your OTP",
  "body": "Your OTP is: 123456"
}

// Sending Bill
POST /api/notification/send/
{
  "to": "user@example.com",
  "subject": "Your Invoice",
  "body": "Bill details here..."
}

// Sending Any Notification
POST /api/notification/send/
{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "body": "Custom content"
}
```

## Environment Configuration

Make sure your `.env` file has the email settings:

```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

## Testing

### Test with curl
```bash
# Test plain text email
curl -X POST http://localhost:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Hello World"}'

# Test HTML email
curl -X POST http://localhost:8000/api/notification/send/ \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"HTML Test","body":"<h1>Hello</h1>","is_html":true}'
```

### Test with Python
```python
import requests

response = requests.post(
    'http://localhost:8000/api/notification/send/',
    json={
        'to': 'test@example.com',
        'subject': 'Test Email',
        'body': 'This is a test notification.',
        'is_html': False
    }
)

print(response.json())
```

## Error Handling

The API provides detailed error messages:

1. **Invalid email format**: Returns 400 with field validation errors
2. **Missing required fields**: Returns 400 with details about missing fields
3. **SMTP errors**: Returns 500 with error details
4. **Rate limiting** (if configured): Returns 429 Too Many Requests

## Future Enhancements

Potential features for future versions:
- Email templates support
- File attachments
- CC and BCC recipients
- Scheduled sending
- Retry logic for failed emails
- Email tracking and delivery status
- Rate limiting per sender
- Priority/urgent flag

## Support

For issues or questions:
1. Check the logs in `notification_service/logs/`
2. Verify email configuration in `.env`
3. Test SMTP connection separately
4. Check Django admin for error details
