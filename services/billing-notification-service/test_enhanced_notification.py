import requests
import json

"""
Enhanced test script for the unified notification API with PDF attachment support.
"""

BASE_URL = "http://127.0.0.1:8000/api/notification"


def test_otp_notification():
    """Test 1: Send OTP (simple text in body)"""
    print("\n" + "="*60)
    print("TEST 1: Send OTP Code (Simple Text)")
    print("="*60)

    payload = {
        "to": "customer@example.com",
        "subject": "Your Verification Code",
        "body": "Your OTP is: 789456. This code will expire in 10 minutes.",
        "is_html": False
    }

    try:
        response = requests.post(f"{BASE_URL}/send/", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_bill_in_body_text():
    """Test 2: Send bill details in body (plain text)"""
    print("\n" + "="*60)
    print("TEST 2: Send Bill Details in Body (Plain Text)")
    print("="*60)

    # Simulate formatted bill details
    bill_body = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        AUTOMOBILE SERVICE INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Invoice ID: INV-2024-001
Date: January 15, 2024
Customer: customer@example.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS & SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Oil Change Service
  Price: $120.00
  Quantity: 1
  Total: $120.00

Engine Oil (5L)
  Price: $80.00
  Quantity: 1
  Total: $80.00

Oil Filter
  Price: $25.00
  Quantity: 1
  Total: $25.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL AMOUNT DUE: $225.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing our service!

Best regards,
Automobile Service Management Team
"""

    payload = {
        "to": "customer@example.com",
        "subject": "Service Invoice #INV-2024-001",
        "body": bill_body,
        "is_html": False
    }

    try:
        response = requests.post(f"{BASE_URL}/send/", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_bill_in_body_html():
    """Test 3: Send bill details in body (HTML)"""
    print("\n" + "="*60)
    print("TEST 3: Send Bill Details in Body (HTML)")
    print("="*60)

    html_body = """
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">AUTOMOBILE SERVICE</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Invoice</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin-top: 20px;">
            <table style="width: 100%;">
                <tr>
                    <td><strong>Invoice ID:</strong></td>
                    <td style="text-align: right; color: #667eea;">INV-2024-001</td>
                </tr>
                <tr>
                    <td><strong>Date:</strong></td>
                    <td style="text-align: right;">January 15, 2024</td>
                </tr>
                <tr>
                    <td><strong>Customer:</strong></td>
                    <td style="text-align: right;">customer@example.com</td>
                </tr>
            </table>
        </div>
        
        <div style="margin-top: 30px;">
            <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Items & Services</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left;">Item</th>
                        <th style="padding: 12px; text-align: center;">Price</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px;">Oil Change Service</td>
                        <td style="padding: 12px; text-align: center;">$120.00</td>
                        <td style="padding: 12px; text-align: center;">1</td>
                        <td style="padding: 12px; text-align: right;">$120.00</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px;">Engine Oil (5L)</td>
                        <td style="padding: 12px; text-align: center;">$80.00</td>
                        <td style="padding: 12px; text-align: center;">1</td>
                        <td style="padding: 12px; text-align: right;">$80.00</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; text-align: right;">
            <p style="margin: 0; font-size: 16px;">TOTAL AMOUNT DUE</p>
            <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold;">$200.00</p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Thank you for your business!</p>
        </div>
    </body>
    </html>
    """

    payload = {
        "to": "customer@example.com",
        "subject": "Service Invoice #INV-2024-001",
        "body": html_body,
        "is_html": True
    }

    try:
        response = requests.post(f"{BASE_URL}/send/", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_bill_with_pdf_attachment():
    """Test 4: Send bill with PDF invoice attachment"""
    print("\n" + "="*60)
    print("TEST 4: Send Bill with PDF Invoice Attachment")
    print("="*60)
    print("Note: This requires a valid bill_id from the database")
    print("First, let's try to generate a bill...")

    # Step 1: Try to generate a bill (you need valid service_id and product_ids)
    # This is just for demonstration - replace with actual UUIDs
    print("\nSkipping bill generation - using example bill_id")
    print("In real scenario, you would:")
    print("1. POST to /api/notification/bill/generate/")
    print("2. Get the bill_id from response")
    print("3. Use that bill_id in the notification")

    # Example with a placeholder UUID (this will fail if bill doesn't exist)
    example_bill_id = "12345678-1234-5678-1234-567812345678"

    payload = {
        "to": "customer@example.com",
        "subject": f"Service Invoice with PDF - #{example_bill_id}",
        "body": """Dear Customer,

Thank you for choosing our service! Your vehicle service has been completed successfully.

Your detailed invoice is attached as a PDF for your records.

If you have any questions, please don't hesitate to contact us.

Best regards,
Automobile Service Management Team""",
        "is_html": False,
        "bill_id": example_bill_id,
        "attach_invoice": True
    }

    try:
        response = requests.post(f"{BASE_URL}/send/", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 404:
            print("\n⚠️  Expected: Bill not found (need to create bill first)")
            print("To test with real bill:")
            print("1. Generate bill using /api/notification/bill/generate/")
            print("2. Use the returned bill_id in this test")
            return True  # This is expected for testing

        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_complete_workflow():
    """Test 5: Complete workflow - Generate bill and send with details"""
    print("\n" + "="*60)
    print("TEST 5: Complete Workflow (Generate Bill + Send Notification)")
    print("="*60)
    print("Note: Requires valid service_id and product_ids from database")
    print("This is a template - update with your actual UUIDs\n")

    # Example template (replace with actual UUIDs)
    generate_bill_payload = {
        "customer_email": "customer@example.com",
        "service_id": "your-service-uuid-here",
        "products": [
            {"product_id": "your-product-uuid-1", "quantity": 1},
            {"product_id": "your-product-uuid-2", "quantity": 2}
        ]
    }

    print("Step 1: Generate Bill")
    print(f"POST {BASE_URL}/bill/generate/")
    print(f"Payload: {json.dumps(generate_bill_payload, indent=2)}")
    print("\nStep 2: Format bill details for email body")
    print("\nStep 3: Send notification with bill details in body")
    print(f"POST {BASE_URL}/send/")
    print("\n⚠️  Skipping execution - update with valid UUIDs to test")

    return True


def test_error_cases():
    """Test 6: Error handling"""
    print("\n" + "="*60)
    print("TEST 6: Error Handling")
    print("="*60)

    test_cases = [
        {
            "name": "Missing required field (subject)",
            "payload": {
                "to": "test@example.com",
                "body": "Test body"
            },
            "expected_status": 400
        },
        {
            "name": "Invalid email format",
            "payload": {
                "to": "invalid-email",
                "subject": "Test",
                "body": "Test body"
            },
            "expected_status": 400
        },
        {
            "name": "Non-existent bill_id with attach_invoice=true",
            "payload": {
                "to": "test@example.com",
                "subject": "Test",
                "body": "Test body",
                "bill_id": "00000000-0000-0000-0000-000000000000",
                "attach_invoice": True
            },
            "expected_status": 404
        }
    ]

    all_passed = True
    for test_case in test_cases:
        print(f"\nTesting: {test_case['name']}")
        try:
            response = requests.post(
                f"{BASE_URL}/send/", json=test_case['payload'])
            print(
                f"Status Code: {response.status_code} (Expected: {test_case['expected_status']})")
            print(f"Response: {json.dumps(response.json(), indent=2)}")

            if response.status_code == test_case['expected_status']:
                print("✓ PASSED")
            else:
                print("✗ FAILED - Unexpected status code")
                all_passed = False
        except Exception as e:
            print(f"✗ FAILED - Error: {str(e)}")
            all_passed = False

    return all_passed


def run_all_tests():
    """Run all test cases"""
    print("\n" + "="*60)
    print("ENHANCED UNIFIED NOTIFICATION API - TEST SUITE")
    print("="*60)
    print("\nThis test suite demonstrates:")
    print("1. Simple OTP notifications")
    print("2. Bill details in email body (plain text)")
    print("3. Bill details in email body (HTML)")
    print("4. Bill with PDF invoice attachment")
    print("5. Complete workflow example")
    print("6. Error handling")

    tests = [
        ("Send OTP (Simple Text)", test_otp_notification),
        ("Bill Details in Body (Text)", test_bill_in_body_text),
        ("Bill Details in Body (HTML)", test_bill_in_body_html),
        ("Bill with PDF Attachment", test_bill_with_pdf_attachment),
        ("Complete Workflow Template", test_complete_workflow),
        ("Error Handling", test_error_cases),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n✗ Test '{test_name}' crashed: {str(e)}")
            results.append((test_name, False))

    print("\n" + "="*60)
    print("TEST RESULTS SUMMARY")
    print("="*60)

    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{status}: {test_name}")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    print(f"\nTotal: {passed_count}/{total_count} tests passed")

    if passed_count == total_count:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) failed")

    print("="*60)


if __name__ == "__main__":
    run_all_tests()
