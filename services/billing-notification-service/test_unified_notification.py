import requests
import json

"""
Test script for the unified notification API endpoint.
"""

BASE_URL = "http://127.0.0.1:8000/api/notification/send/"


def test_plain_text_notification():
    """Test sending a plain text email notification."""
    print("\n=== Test 1: Plain Text Notification ===")

    payload = {
        "to": "customer@example.com",
        "subject": "Test Plain Text Email",
        "body": "This is a test notification from the unified API.",
        "is_html": False
    }

    try:
        response = requests.post(BASE_URL, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_html_notification():
    """Test sending an HTML email notification."""
    print("\n=== Test 2: HTML Notification ===")

    html_body = """
    <html>
        <body>
            <h1>Welcome to Automobile Service</h1>
            <p>Your service has been completed successfully.</p>
            <p><strong>Total Amount:</strong> $450.00</p>
            <p>Thank you for your business!</p>
        </body>
    </html>
    """

    payload = {
        "to": "customer@example.com",
        "subject": "Service Completed - Invoice",
        "body": html_body,
        "is_html": True
    }

    try:
        response = requests.post(BASE_URL, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_otp_notification():
    """Test sending an OTP notification (use case example)."""
    print("\n=== Test 3: OTP Notification ===")

    payload = {
        "to": "user@example.com",
        "subject": "Your OTP Code",
        "body": "Your OTP code is: 789456. This code will expire in 10 minutes.",
        "is_html": False
    }

    try:
        response = requests.post(BASE_URL, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_invalid_email():
    """Test with invalid email format."""
    print("\n=== Test 4: Invalid Email Format ===")

    payload = {
        "to": "invalid-email",
        "subject": "Test",
        "body": "This should fail",
        "is_html": False
    }

    try:
        response = requests.post(BASE_URL, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_missing_fields():
    """Test with missing required fields."""
    print("\n=== Test 5: Missing Required Fields ===")

    payload = {
        "to": "customer@example.com"
        # Missing subject and body
    }

    try:
        response = requests.post(BASE_URL, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_bill_notification():
    """Test sending a bill notification (use case example)."""
    print("\n=== Test 6: Bill Notification ===")

    bill_details = """
Dear Customer,

Your vehicle service has been completed. Here are the details:

Service: Oil Change & Filter Replacement
Service Cost: $120.00

Parts Used:
- Engine Oil (5L): $80.00 x 1 = $80.00
- Oil Filter: $25.00 x 1 = $25.00

Total Amount: $225.00

Payment Status: Pending

Thank you for choosing our service!

Best regards,
Automobile Service Team
    """

    payload = {
        "to": "customer@example.com",
        "subject": "Service Invoice #INV-12345",
        "body": bill_details,
        "is_html": False
    }

    try:
        response = requests.post(BASE_URL, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def run_all_tests():
    """Run all test cases."""
    print("=" * 60)
    print("UNIFIED NOTIFICATION API - TEST SUITE")
    print("=" * 60)

    tests = [
        ("Plain Text Notification", test_plain_text_notification),
        ("HTML Notification", test_html_notification),
        ("OTP Notification", test_otp_notification),
        ("Invalid Email Format", test_invalid_email),
        ("Missing Required Fields", test_missing_fields),
        ("Bill Notification", test_bill_notification),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"Test '{test_name}' crashed: {str(e)}")
            results.append((test_name, False))

    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)

    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{status}: {test_name}")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
